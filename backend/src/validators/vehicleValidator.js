
import { z } from "zod";

const positiveCapacity = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() !== ""
      ? Number(value)
      : value,
  z.number().finite().positive(
    "Capacity must be greater than zero"
  )
);

export const createVehicleSchema = z
  .object({
    registration_number: z
      .string()
      .trim()
      .min(1, "Registration number is required"),

    name: z
      .string()
      .trim()
      .min(1, "Vehicle name is required"),

    capacity_kg: positiveCapacity,
  })
  .strict();

export const updateVehicleSchema = z
  .object({
    registration_number: z
      .string()
      .trim()
      .min(1, "Registration number cannot be empty")
      .optional(),

    name: z
      .string()
      .trim()
      .min(1, "Vehicle name cannot be empty")
      .optional(),

    capacity_kg: positiveCapacity.optional(),

    status: z
      .enum(["available", "in_use", "maintenance"])
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const validateBody = (schema) => (req, res, next) => {
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
