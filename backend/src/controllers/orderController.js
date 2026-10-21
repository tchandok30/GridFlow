
import pool from "../../db.js";

const isValidId = (id) =>
  typeof id === "string" && /^[1-9]\d*$/.test(id);

const handleDatabaseError = (error, res, action) => {
  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Order number already exists",
    });
  }

  console.error(`${action} error:`, error.message);

  return res.status(500).json({
    success: false,
    message: action,
  });
};

// GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const allowedStatuses = [
      "pending",
      "assigned",
      "in_transit",
      "delivered",
      "cancelled",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status filter",
      });
    }

    const result = status
      ? await pool.query(
          `SELECT * FROM orders
           WHERE status = $1
           ORDER BY created_at DESC`,
          [status]
        )
      : await pool.query(
          `SELECT * FROM orders ORDER BY created_at DESC`
        );

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const result = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      order_number,
      delivery_address,
      latitude,
      longitude,
      package_weight_kg,
      deadline,
    } = req.validatedBody;

    const result = await pool.query(
      `INSERT INTO orders (
        order_number,
        delivery_address,
        latitude,
        longitude,
        package_weight_kg,
        deadline
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        order_number,
        delivery_address,
        latitude ?? null,
        longitude ?? null,
        package_weight_kg,
        deadline,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return handleDatabaseError(
      error,
      res,
      "Failed to create order"
    );
  }
};

// PATCH /api/orders/:id
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const fields = req.validatedBody;

    const columnMap = {
      order_number: "order_number",
      delivery_address: "delivery_address",
      latitude: "latitude",
      longitude: "longitude",
      package_weight_kg: "package_weight_kg",
      deadline: "deadline",
      status: "status",
    };

    const entries = Object.entries(fields);

    const setClause = entries
      .map(([key], index) => `${columnMap[key]} = $${index + 1}`)
      .concat("updated_at = NOW()")
      .join(", ");

    const values = entries.map(([, value]) => value);
    values.push(id);

    const result = await pool.query(
      `UPDATE orders
       SET ${setClause}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return handleDatabaseError(
      error,
      res,
      "Failed to update order"
    );
  }
};

// DELETE /api/orders/:id
// Soft cancellation: the order record remains in the database.
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
         AND status NOT IN ('delivered', 'cancelled')
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      const existing = await pool.query(
        `SELECT status FROM orders WHERE id = $1`,
        [id]
      );

      if (existing.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Delivered or already cancelled orders cannot be cancelled",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Cancel order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};
