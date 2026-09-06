import * as invoiceService from "../services/invoiceService.js";
import asyncHandler from "../utils/asyncHandler.js";
import successResponse from "../utils/response.js";

export const createInvoiceFromSalesOrder = asyncHandler(async (req, res) => {
  const { due_date } = req.body;

  const invoice = await invoiceService.createInvoiceFromSalesOrder(
    req.params.salesOrderId,
    due_date,
    req.user.id
  );

  return successResponse(
    res,
    invoice,
    201,
    "Customer invoice created successfully"
  );
});

export const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await invoiceService.getInvoices(req.user);

  return successResponse(res, invoices);
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);

  return successResponse(res, invoice);
});