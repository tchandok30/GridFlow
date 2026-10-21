
import { Router } from "express";

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

router.get("/", getVehicles);

router.post(
  "/",
  validateBody(createVehicleSchema),
  createVehicle
);

router.patch(
  "/:id",
  validateBody(updateVehicleSchema),
  updateVehicle
);

export default router;
