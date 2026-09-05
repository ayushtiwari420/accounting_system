import express from "express";

import {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById
} from "../controllers/salesController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// Create Sales Order
router.post(
  "/",
  authMiddleware,
  createSalesOrder
);


// Get all Sales Orders
router.get(
  "/",
  authMiddleware,
  getSalesOrders
);


// Get Sales Order by ID
router.get(
  "/:id",
  authMiddleware,
  getSalesOrderById
);


export default router;