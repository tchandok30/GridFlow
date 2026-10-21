
import { z } from "zod";

const requiredText = (message) =>
  z.string().trim().min(1, message);

const positiveNumber = (message) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : value,
    z.number().finite().positive(message)
  );

const optionalCoordinate = (min, max) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : value,
    z.number().finite().min(min).max(max).nullable().optional()
  );

const deadlineSchema = z.string().datetime({
  offset: true,
  message: "Deadline must be an ISO datetime with a timezone",
});

const coordinatePair = (data, ctx) => {
  const hasLatitude =
    data.latitude !== undefined && data.latitude !== null;

  const hasLongitude =
    data.longitude !== undefined && data.longitude !== null;

  if (hasLatitude !== hasLongitude) {
    ctx.addIssue({
      code: "custom",
      path: ["latitude"],
      message: "Latitude and longitude must be provided together",
    });
  }
};

export const createOrderSchema = z
  .object({
    order_number: requiredText("Order number is required"),
    delivery_address: requiredText("Delivery address is required"),
    latitude: optionalCoordinate(-90, 90),
    longitude: optionalCoordinate(-180, 180),
    package_weight_kg: positiveNumber(
      "Package weight must be greater than zero"
    ),
    deadline: deadlineSchema,
  })
  .strict()
  .superRefine(coordinatePair);

export const updateOrderSchema = z
  .object({
    order_number: requiredText("Order number cannot be empty").optional(),
    delivery_address: requiredText(
      "Delivery address cannot be empty"
    ).optional(),
    latitude: optionalCoordinate(-90, 90),
    longitude: optionalCoordinate(-180, 180),
    package_weight_kg: positiveNumber(
      "Package weight must be greater than zero"
    ).optional(),
    deadline: deadlineSchema.optional(),
    status: z
      .enum([
        "pending",
        "assigned",
        "in_transit",
        "delivered",
        "cancelled",
      ])
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Provide at least one field to update",
      });
    }

    coordinatePair(data, ctx);
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
