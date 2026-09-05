import * as reportService from "../services/reportService.js";
import asyncHandler from "../utils/asyncHandler.js";
import successResponse from "../utils/response.js";

export const getProfitAndLoss = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const report = await reportService.getProfitAndLoss(start_date, end_date);
  return successResponse(res, report);
});

export const getBalanceSheet = asyncHandler(async (req, res) => {
  const { as_of_date } = req.query;
  const report = await reportService.getBalanceSheet(as_of_date);
  return successResponse(res, report);
});

export const getBudgetPerformanceReport = asyncHandler(async (req, res) => {
  const report = await reportService.getBudgetPerformanceReport();
  return successResponse(res, report);
});
