import { z } from "zod";

export const createSalesOrderSchema = z.object({
  customer_id: z.string().uuid("Invalid customer ID"),

  order_date: z
    .string()
    .date("Invalid order date"),

  items: z
    .array(
      z.object({
        product_id: z.string().uuid("Invalid product ID"),

        quantity: z
          .number()
          .positive("Quantity must be greater than 0"),

        unit_price: z
          .number()
          .nonnegative("Unit price cannot be negative"),

        tax_id: z
          .string()
          .uuid("Invalid tax ID")
          .optional()
          .nullable()
      })
    )
    .min(1, "At least one product is required")
});

export const updateSalesOrderSchema = z.object({
  customer_id: z.string().uuid().optional(),

  order_date: z
    .string()
    .date()
    .optional(),

  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),

        quantity: z
          .number()
          .positive(),

        unit_price: z
          .number()
          .nonnegative(),

        tax_id: z
          .string()
          .uuid()
          .optional()
          .nullable()
      })
    )
    .min(1)
    .optional()
});