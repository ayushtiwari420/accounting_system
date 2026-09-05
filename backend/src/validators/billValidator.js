import z from "zod";

export const createBillFromPOSchema = z.object({
  due_date: z.string().min(1, "Due date is required"),
});
