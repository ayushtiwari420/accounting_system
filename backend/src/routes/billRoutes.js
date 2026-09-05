import express from "express";
import {
  createBillFromPurchaseOrder,
  getBills,
  getBillById,
} from "../controllers/billController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import { createBillFromPOSchema } from "../validators/billValidator.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/from-purchase-order/:purchaseOrderId",
  roleMiddleware("ADMIN", "ACCOUNTANT"),
  validateMiddleware(createBillFromPOSchema),
  createBillFromPurchaseOrder
);

router.get("/", getBills);

router.get("/:id", getBillById);

export default router;
