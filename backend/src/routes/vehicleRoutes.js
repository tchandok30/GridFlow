import { authorizeRole } from "../middleware/authorizeRole.js";
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
} from "../controllers/vehicleController.js";

import {
  createVehicleSchema,
  updateVehicleSchema,
  validateBody,
} from "../validators/vehicleValidator.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  authorizeRole("admin", "dispatcher", "driver"),
  getVehicles
);

router.post(
  "/",
  authenticateToken,
  validateBody(createVehicleSchema),
  createVehicle
);

router.patch(
  "/:id",
  authenticateToken,
  validateBody(updateVehicleSchema),
  updateVehicle
);

export default router;
