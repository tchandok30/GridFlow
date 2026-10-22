
import { Router } from "express";

import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
} from "../controllers/orderController.js";

import {
  createOrderSchema,
  updateOrderSchema,
  validateBody,
} from "../validators/orderValidator.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = Router();

// Read orders: authenticated admin, dispatcher, or driver
router.get(
  "/",
  authenticateToken,
  authorizeRole("admin", "dispatcher", "driver"),
  getOrders
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRole("admin", "dispatcher", "driver"),
  getOrderById
);

// Create orders: admin or dispatcher
router.post(
  "/",
  authenticateToken,
  authorizeRole("admin", "dispatcher"),
  validateBody(createOrderSchema),
  createOrder
);

// Update orders: admin or dispatcher
router.patch(
  "/:id",
  authenticateToken,
  authorizeRole("admin", "dispatcher"),
  validateBody(updateOrderSchema),
  updateOrder
);

// Cancel orders: admin or dispatcher
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin", "dispatcher"),
  cancelOrder
);

export default router;
