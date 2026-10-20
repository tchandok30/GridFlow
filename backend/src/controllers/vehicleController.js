import pool from "../../db.js";

export const getVehicles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM vehicles ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get vehicles error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles",
    });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { registration_number, name, capacity_kg } = req.body;

    if (
      typeof registration_number !== "string" ||
      !registration_number.trim() ||
      typeof name !== "string" ||
      !name.trim() ||
      capacity_kg === undefined ||
      capacity_kg === null ||
      !Number.isFinite(Number(capacity_kg)) ||
      Number(capacity_kg) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid registration_number, name and positive capacity_kg are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO vehicles (registration_number, name, capacity_kg)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [registration_number.trim(), name.trim(), Number(capacity_kg)]
    );

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Registration number already exists",
      });
    }

    console.error("Create vehicle error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create vehicle",
    });
  }
};