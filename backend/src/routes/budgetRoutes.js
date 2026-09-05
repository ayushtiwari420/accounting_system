import express from "express";
import {
  createAnalyticAccount,
  getAnalyticAccounts,
  createBudget,
  getBudgets,
  getBudgetById,
} from "../controllers/budgetController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import {
  createAnalyticAccountSchema,
  createBudgetSchema,
} from "../validators/budgetValidator.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/analytic-accounts",
  roleMiddleware("ADMIN", "ACCOUNTANT"),
  validateMiddleware(createAnalyticAccountSchema),
  createAnalyticAccount
);

router.get("/analytic-accounts", getAnalyticAccounts);

router.post(
  "/",
  roleMiddleware("ADMIN", "ACCOUNTANT"),
  validateMiddleware(createBudgetSchema),
  createBudget
);

router.get("/", getBudgets);

router.get("/:id", getBudgetById);

export default router;
