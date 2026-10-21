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
    const { registration_number, name, capacity_kg } = req.validatedBody;

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

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate vehicle ID
    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    // 2. Get validated data
    const data = req.validatedBody;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    // 3. Allow only supported fields
    const allowedFields = [
      "registration_number",
      "name",
      "capacity_kg",
    ];

    const fields = Object.keys(data);

    if (fields.some((field) => !allowedFields.includes(field))) {
      return res.status(400).json({
        success: false,
        message: "Invalid update field",
      });
    }

    // 4. Build parameterized UPDATE query
    const values = [];
    const setClause = fields
      .map((field, index) => {
        values.push(
          field === "capacity_kg"
            ? Number(data[field])
            : data[field].trim()
        );

        return `${field} = $${index + 1}`;
      })
      .join(", ");

    values.push(Number(id));

    const query = `
      UPDATE vehicles
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    // 5. Check if vehicle exists
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    // 6. Duplicate registration number
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Registration number already exists",
      });
    }

    console.error("Update vehicle error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle",
    });
  }
};
