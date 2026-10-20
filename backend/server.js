import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to GridFlow API");
});

const PORT = process.env.PORT || 5000;

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      message: "GridFlow API and database are running",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});
async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected successfully!");

    app.listen(PORT, () => {
      console.log(`🚀 GridFlow running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();