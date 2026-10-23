
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { generatePlan } from "../controllers/planController.js";

import {
  getPlanHistory,
  getPlanById,
} from "../controllers/planHistoryController.js";
const router = Router();

router.post(
  "/generate",
  authenticateToken,
  authorizeRole("admin", "dispatcher"),
  generatePlan
);

router.get(
  "/history",
  authenticateToken,
  authorizeRole("admin", "dispatcher"),
  getPlanHistory
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRole("admin", "dispatcher"),
  getPlanById
);

export default router;
