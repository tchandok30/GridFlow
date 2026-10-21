
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

const router = Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);

router.post(
  "/",
  validateBody(createOrderSchema),
  createOrder
);

router.patch(
  "/:id",
  validateBody(updateOrderSchema),
  updateOrder
);

router.delete("/:id", cancelOrder);

export default router;
