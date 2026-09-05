import express from "express";
import {
  getProfitAndLoss,
  getBalanceSheet,
  getBudgetPerformanceReport,
} from "../controllers/reportController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/profit-loss", getProfitAndLoss);
router.get("/balance-sheet", getBalanceSheet);
router.get("/budget-performance", getBudgetPerformanceReport);

export default router;
