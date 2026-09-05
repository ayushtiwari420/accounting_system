import z from "zod";

export const customerPaymentSchema = z.object({
  invoice_id: z.string().uuid("Invalid invoice ID"),
  amount: z.number().positive("Payment amount must be greater than 0"),
  payment_method: z.enum(["CASH", "BANK"]),
  payment_date: z.string().optional(),
  journal_id: z.string().uuid().optional(),
  reference: z.string().optional(),
});

export const vendorPaymentSchema = z.object({
  bill_id: z.string().uuid("Invalid bill ID"),
  amount: z.number().positive("Payment amount must be greater than 0"),
  payment_method: z.enum(["CASH", "BANK"]),
  payment_date: z.string().optional(),
  journal_id: z.string().uuid().optional(),
  reference: z.string().optional(),
});
