import express from "express";
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
} from "../controllers/purchaseController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import { createPurchaseOrderSchema } from "../validators/purchaseValidator.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("ADMIN", "ACCOUNTANT"),
  validateMiddleware(createPurchaseOrderSchema),
  createPurchaseOrder
);

router.get("/", getPurchaseOrders);

router.get("/:id", getPurchaseOrderById);

export default router;
