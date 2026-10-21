
import jwt from "jsonwebtoken";
import pool from "../../db.js";
import { createHash } from "node:crypto";

const hashToken = (token) =>
  createHash("sha256").update(token).digest("hex");

export const authenticateToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const token = header.slice(7);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const revoked = await pool.query(
      `SELECT 1 FROM revoked_tokens WHERE token_hash = $1`,
      [hashToken(token)]
    );

    if (revoked.rowCount > 0) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please log in again.",
      });
    }

    req.token = token;
    req.user = {
      id: Number(decoded.sub),
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    console.error("Authentication error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
