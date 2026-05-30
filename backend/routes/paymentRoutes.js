import express from "express";
import { createCheckoutSession, verifyPayment, handleWebhook } from "../controllers/PaymentController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Webhook must use raw body — add before json middleware
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Protected routes
router.post(
  "/create-checkout-session",
  protect,
  authorizeRoles("doctor", "ambulance_driver"),
  createCheckoutSession
);

router.get(
  "/verify",
  protect,
  verifyPayment
);

export default router;