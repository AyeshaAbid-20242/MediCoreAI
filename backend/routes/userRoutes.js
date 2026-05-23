import express from "express";

import {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/AuthController.js";

import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  deleteUser,
} from "../controllers/AdminController.js";

import { getPlatformProviders } from "../controllers/PatientController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// Public Routes
// ==========================================
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// ==========================================
// Patient Routes
// ==========================================
router.get(
  "/patient/providers",
  protect,
  authorizeRoles("patient"),
  getPlatformProviders
);

// ==========================================
// Admin Routes
// ==========================================
router.get(
  "/admin/pending",
  protect,
  authorizeRoles("admin"),
  getPendingUsers
);

router.put(
  "/admin/approve/:id",
  protect,
  authorizeRoles("admin"),
  approveUser
);

router.put(
  "/admin/reject/:id",
  protect,
  authorizeRoles("admin"),
  rejectUser
);

router.get(
  "/admin/all-users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

router.delete(
  "/admin/delete/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);

export default router;
