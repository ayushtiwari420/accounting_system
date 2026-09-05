import  z  from "zod";

export const createInvoiceFromSalesOrderSchema = z.object({
  due_date: z
    .string()
    .date("Invalid due date")
});