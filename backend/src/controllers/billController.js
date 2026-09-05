import * as billService from "../services/billService.js";
import asyncHandler from "../utils/asyncHandler.js";
import successResponse from "../utils/response.js";

export const createBillFromPurchaseOrder = asyncHandler(async (req, res) => {
  const { due_date } = req.body;

  const bill = await billService.createBillFromPurchaseOrder(
    req.params.purchaseOrderId,
    due_date,
    req.user.id
  );

  return successResponse(
    res,
    bill,
    201,
    "Vendor bill created successfully"
  );
});

export const getBills = asyncHandler(async (req, res) => {
  const bills = await billService.getBills();

  return successResponse(res, bills);
});

export const getBillById = asyncHandler(async (req, res) => {
  const bill = await billService.getBillById(req.params.id);

  return successResponse(res, bill);
});
