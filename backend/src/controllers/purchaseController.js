import * as purchaseService from "../services/purchaseService.js";
import asyncHandler from "../utils/asyncHandler.js";
import successResponse from "../utils/response.js";

export const createPurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await purchaseService.createPurchaseOrder(
    req.body,
    req.user.id
  );

  return successResponse(
    res,
    purchaseOrder,
    201,
    "Purchase order created successfully"
  );
});

export const getPurchaseOrders = asyncHandler(async (req, res) => {
  const purchaseOrders = await purchaseService.getPurchaseOrders();

  return successResponse(res, purchaseOrders);
});

export const getPurchaseOrderById = asyncHandler(async (req, res) => {
  const purchaseOrder = await purchaseService.getPurchaseOrderById(
    req.params.id
  );

  return successResponse(res, purchaseOrder);
});
