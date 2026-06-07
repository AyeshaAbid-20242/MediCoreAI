import express from "express";
import {
  forgotPassword,
  getMe,
  login,
  register,
  resetPassword,
  verifyOTP,
} from "../controllers/AuthController.js";
import { protect } from "../middleware/authMiddleware.js";
import { blockOnTooManyLoginFailures } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", blockOnTooManyLoginFailures, login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
