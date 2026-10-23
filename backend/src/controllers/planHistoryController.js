
import pool from "../../db.js";

export const getPlanHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        summary,
        assignments,
        unassigned,
        routes,
        missing_coordinates,
        route_warning,
        distance_note,
        created_at
      FROM delivery_plans
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      plans: result.rows,
    });
  } catch (error) {
    console.error("Get plan history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch plan history",
    });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id) || Number(id) < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        summary,
        assignments,
        unassigned,
        routes,
        missing_coordinates,
        route_warning,
        distance_note,
        created_at
       FROM delivery_plans
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      plan: result.rows[0],
    });
  } catch (error) {
    console.error("Get plan by ID error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch plan",
    });
  }
};
