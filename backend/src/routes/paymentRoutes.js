import express from "express";
import {
  createCustomerPayment,
  createVendorPayment,
  getPayments,
  getPaymentById,
} from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import {
  customerPaymentSchema,
  vendorPaymentSchema,
} from "../validators/paymentValidator.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/customer",
  roleMiddleware("ADMIN", "ACCOUNTANT"),
  validateMiddleware(customerPaymentSchema),
  createCustomerPayment
);

router.post(
  "/vendor",
  roleMiddleware("ADMIN", "ACCOUNTANT"),
  validateMiddleware(vendorPaymentSchema),
  createVendorPayment
);

router.get("/", getPayments);

router.get("/:id", getPaymentById);

export default router;
