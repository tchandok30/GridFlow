
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import pool from "./db.js";
import vehicleRoutes from "./src/routes/vehicleRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/vehicles", vehicleRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to GridFlow API");
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      message: "GridFlow API and database are running",
    });
  } catch (error) {
    console.error("Health check error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

async function startServer() {
  try {
    // Automatically create missing database tables.
    const schema = await readFile(
      new URL("./database/schema.sql", import.meta.url),
      "utf8"
    );

    await pool.query(schema);
    console.log("✅ Database schema initialized");

    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected successfully!");

    app.listen(PORT, () => {
      console.log(`🚀 GridFlow running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup failed:", error.message);
    process.exitCode = 1;
  }
}

startServer();
