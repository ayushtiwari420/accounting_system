import z from "zod";

export const createPurchaseOrderSchema = z.object({
  vendor_id: z.string().uuid("Invalid vendor ID"),
  order_date: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid("Invalid product ID"),
        quantity: z.number().positive("Quantity must be greater than 0"),
        unit_price: z.number().min(0, "Unit price cannot be negative"),
        tax_id: z.string().uuid().optional().nullable(),
      })
    )
    .min(1, "Purchase order must contain at least one item"),
});
