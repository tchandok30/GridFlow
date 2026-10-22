
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { generatePlan } from "../controllers/planController.js";

const router = Router();

router.post(
  "/generate",
  authenticateToken,
  authorizeRole("admin", "dispatcher"),
  generatePlan
);

export default router;
