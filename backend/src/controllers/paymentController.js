import * as paymentService from "../services/paymentService.js";
import asyncHandler from "../utils/asyncHandler.js";
import successResponse from "../utils/response.js";

export const createCustomerPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createCustomerPayment(
    req.body,
    req.user.id
  );

  return successResponse(
    res,
    payment,
    201,
    "Customer payment processed successfully"
  );
});

export const createVendorPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createVendorPayment(
    req.body,
    req.user.id
  );

  return successResponse(
    res,
    payment,
    201,
    "Vendor payment processed successfully"
  );
});

export const getPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPayments();

  return successResponse(res, payments);
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id);

  return successResponse(res, payment);
});
