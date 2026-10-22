
import pool from "../../db.js";
import { optimizeRoute } from "../utils/routeOptimizer.js";

export const generatePlan = async (req, res) => {
  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    await client.query(
      "LOCK TABLE orders IN SHARE ROW EXCLUSIVE MODE"
    );

    // 1. Get pending orders by earliest deadline
    const ordersResult = await client.query(`
      SELECT id, order_number, delivery_address,
             latitude, longitude, package_weight_kg, deadline
      FROM orders
      WHERE status = 'pending'
      ORDER BY deadline ASC, created_at ASC
      FOR UPDATE
    `);

    // 2. Get available vehicles
    const vehiclesResult = await client.query(`
      SELECT id, name, registration_number, capacity_kg
      FROM vehicles
      WHERE status = 'available'
      ORDER BY capacity_kg ASC
      FOR UPDATE
    `);

    const orders = ordersResult.rows;
    const vehicles = vehiclesResult.rows;

    const remainingCapacity = new Map(
      vehicles.map((v) => [
        String(v.id),
        Number(v.capacity_kg),
      ])
    );

    const assignments = [];
    const unassigned = [];

    // 3. Greedy best-fit assignment
    for (const order of orders) {
      const weight = Number(order.package_weight_kg);

      const vehicle = vehicles
        .filter(
          (v) =>
            remainingCapacity.get(String(v.id)) >= weight
        )
        .sort(
          (a, b) =>
            remainingCapacity.get(String(a.id)) -
            remainingCapacity.get(String(b.id))
        )[0];

      if (!vehicle) {
        unassigned.push({
          order_id: order.id,
          order_number: order.order_number,
          reason: "No available vehicle has sufficient capacity",
        });
        continue;
      }

      await client.query(
        `UPDATE orders
         SET assigned_vehicle_id = $1,
             status = 'assigned',
             updated_at = NOW()
         WHERE id = $2 AND status = 'pending'`,
        [vehicle.id, order.id]
      );

      const remaining =
        remainingCapacity.get(String(vehicle.id)) - weight;

      remainingCapacity.set(String(vehicle.id), remaining);

      assignments.push({
        order_id: order.id,
        order_number: order.order_number,
        vehicle_id: vehicle.id,
        vehicle_name: vehicle.name,
        package_weight_kg: weight,
        remaining_capacity_kg: remaining,
      });
    }

    // 4. Fetch ALL currently assigned orders,
    // including orders assigned during earlier requests
    const assignedResult = await client.query(`
      SELECT
        o.id AS order_id,
        o.order_number,
        o.delivery_address,
        o.latitude,
        o.longitude,
        o.assigned_vehicle_id AS vehicle_id,
        v.name AS vehicle_name
      FROM orders o
      JOIN vehicles v ON v.id = o.assigned_vehicle_id
      WHERE o.status = 'assigned'
      ORDER BY o.created_at ASC
    `);

    // 5. Group delivery stops by vehicle
    const vehicleRoutes = new Map();
    const missingCoordinates = [];

    for (const order of assignedResult.rows) {
      const hasCoordinates =
        order.latitude !== null &&
        order.longitude !== null;

      if (!hasCoordinates) {
        missingCoordinates.push({
          order_id: order.order_id,
          order_number: order.order_number,
          reason: "Delivery coordinates are missing",
        });
        continue;
      }

      const key = String(order.vehicle_id);

      if (!vehicleRoutes.has(key)) {
        vehicleRoutes.set(key, {
          vehicle_id: order.vehicle_id,
          vehicle_name: order.vehicle_name,
          orders: [],
        });
      }

      vehicleRoutes.get(key).orders.push(order);
    }

    // 6. Optimize each vehicle's delivery sequence
    const depot = {
      latitude: Number(process.env.DEPOT_LATITUDE),
      longitude: Number(process.env.DEPOT_LONGITUDE),
    };

    const validDepot =
      Number.isFinite(depot.latitude) &&
      Number.isFinite(depot.longitude) &&
      Math.abs(depot.latitude) <= 90 &&
      Math.abs(depot.longitude) <= 180;

    const routes = [];

    if (validDepot) {
      for (const route of vehicleRoutes.values()) {
        const optimized = optimizeRoute(
          route.orders,
          depot
        );

        routes.push({
          vehicle_id: route.vehicle_id,
          vehicle_name: route.vehicle_name,
          stops: optimized.stops,
          total_distance_km: optimized.totalDistanceKm,
        return_to_depot_km: optimized.returnToDepotKm,
        });
      }
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Plan generated successfully",
      summary: {
        total_pending_orders: orders.length,
        assigned_orders: assignments.length,
        unassigned_orders: unassigned.length,
        total_active_assigned_orders: assignedResult.rowCount,
      },
      assignments,
      unassigned,
      routes,
      missing_coordinates: missingCoordinates,
      route_warning: validDepot
        ? null
        : "Configure valid DEPOT_LATITUDE and DEPOT_LONGITUDE values in .env",
      distance_note:
        "Distances are straight-line estimates, not road distances.",
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Generate plan error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate plan",
    });
  } finally {
    client?.release();
  }
};
