
import { Router } from "express";

import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/authController.js";

import {
  registerSchema,
  loginSchema,
} from "../validators/authValidator.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  req.validatedBody = result.data;
  next();
};

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getMe);

export default router;
