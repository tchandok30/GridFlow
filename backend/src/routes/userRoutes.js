
import { Router } from "express";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

import {
  validateRoleBody,
  updateUserRoleSchema,
} from "../validators/userValidator.js";

import { updateUserRole } from "../controllers/userController.js";

const router = Router();

router.patch(
  "/:id/role",
  authenticateToken,
  authorizeRole("admin"),
  validateRoleBody(updateUserRoleSchema),
  updateUserRole
);

export default router;
