import * as budgetService from "../services/budgetService.js";
import asyncHandler from "../utils/asyncHandler.js";
import successResponse from "../utils/response.js";

export const createAnalyticAccount = asyncHandler(async (req, res) => {
  const account = await budgetService.createAnalyticAccount(req.body);
  return successResponse(
    res,
    account,
    201,
    "Analytic account created successfully"
  );
});

export const getAnalyticAccounts = asyncHandler(async (req, res) => {
  const accounts = await budgetService.getAnalyticAccounts();
  return successResponse(res, accounts);
});

export const createBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.createBudget(req.body, req.user.id);
  return successResponse(res, budget, 201, "Budget created successfully");
});

export const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await budgetService.getBudgets();
  return successResponse(res, budgets);
});

export const getBudgetById = asyncHandler(async (req, res) => {
  const budget = await budgetService.getBudgetById(req.params.id);
  return successResponse(res, budget);
});
