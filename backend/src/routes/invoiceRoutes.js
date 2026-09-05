import express from "express";
import {
  createInvoiceFromSalesOrder,
  getInvoices,
  getInvoiceById,
} from "../controllers/invoiceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/from-sales-order/:salesOrderId",
  roleMiddleware("ADMIN", "ACCOUNTANT"),
  createInvoiceFromSalesOrder
);

router.get("/", getInvoices);

router.get("/:id", getInvoiceById);

export default router;