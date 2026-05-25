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
  getAdminStats,
  getAllSubscriptions,
  updateSubscription,
  getAllAppointments,
  cancelAppointment,
  getAllPayments,
  editUser,
  blockUnblockUser,
  resendTempPassword,
  getRevenueStats,
  getDoctorRatings,
  sendEmailToUser,
  broadcastEmail,
  getSubscriptionPlans,
  updateSubscriptionPlans,
  changeAdminPassword,
  getAllReviews,
  deleteReview,
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
router.get(
  "/admin/stats",
  protect,
  authorizeRoles("admin"),
  getAdminStats
);
// ==========================================
// Admin Subscription Routes
// ==========================================
router.get(
  "/admin/subscriptions",
  protect,
  authorizeRoles("admin"),
  getAllSubscriptions
);

router.put(
  "/admin/subscriptions/:id",
  protect,
  authorizeRoles("admin"),
  updateSubscription
);

// ==========================================
// Admin Appointment Routes
// ==========================================
router.get(
  "/admin/appointments",
  protect,
  authorizeRoles("admin"),
  getAllAppointments
);

router.put(
  "/admin/appointments/cancel/:id",
  protect,
  authorizeRoles("admin"),
  cancelAppointment
);

// ==========================================
// Admin Payment Routes
// ==========================================
router.get(
  "/admin/payments",
  protect,
  authorizeRoles("admin"),
  getAllPayments
);
// ==========================================
// User Management Routes
// ==========================================
router.put(
  "/admin/edit-user/:id",
  protect,
  authorizeRoles("admin"),
  editUser
);

router.put(
  "/admin/block-unblock/:id",
  protect,
  authorizeRoles("admin"),
  blockUnblockUser
);

router.post(
  "/admin/resend-password/:id",
  protect,
  authorizeRoles("admin"),
  resendTempPassword
);

// ==========================================
// Analytics Routes
// ==========================================
router.get(
  "/admin/revenue-stats",
  protect,
  authorizeRoles("admin"),
  getRevenueStats
);

router.get(
  "/admin/doctor-ratings",
  protect,
  authorizeRoles("admin"),
  getDoctorRatings
);

// ==========================================
// Email Routes
// ==========================================
router.post(
  "/admin/send-email/:id",
  protect,
  authorizeRoles("admin"),
  sendEmailToUser
);

router.post(
  "/admin/broadcast-email",
  protect,
  authorizeRoles("admin"),
  broadcastEmail
);

// ==========================================
// Subscription Plans Routes
// ==========================================
router.get(
  "/admin/subscription-plans",
  protect,
  authorizeRoles("admin"),
  getSubscriptionPlans
);

router.put(
  "/admin/subscription-plans",
  protect,
  authorizeRoles("admin"),
  updateSubscriptionPlans
);

// ==========================================
// Admin Settings Routes
// ==========================================
router.put(
  "/admin/change-password",
  protect,
  authorizeRoles("admin"),
  changeAdminPassword
);

// ==========================================
// Reviews Routes
// ==========================================
router.get(
  "/admin/reviews",
  protect,
  authorizeRoles("admin"),
  getAllReviews
);

router.delete(
  "/admin/reviews/:id",
  protect,
  authorizeRoles("admin"),
  deleteReview
);

export default router;
