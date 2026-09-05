import z from "zod";

export const createAnalyticAccountSchema = z.object({
  name: z.string().min(2, "Name must contain at least 2 characters"),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export const createBudgetSchema = z.object({
  name: z.string().min(2, "Name must contain at least 2 characters"),
  analytic_account_id: z.string().uuid("Invalid analytic account ID"),
  responsible_user_id: z.string().uuid().optional().nullable(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  planned_amount: z.number().min(0, "Planned amount cannot be negative"),
});
