import express from "express";
import {
  approveUser,
  blockUnblockUser,
  broadcastEmail,
  cancelAppointment,
  changeAdminPassword,
  deleteReview,
  deleteUser,
  editUser,
  getAdminStats,
  getAllAppointments,
  getAllPayments,
  getAllReviews,
  getAllSubscriptions,
  getAllUsers,
  getDoctorRatings,
  getPendingUsers,
  getRevenueStats,
  getSubscriptionPlans,
  rejectUser,
  resendTempPassword,
  resetPatientAiUsage,
  sendEmailToUser,
  updateSubscription,
  updateSubscriptionPlans,
} from "../controllers/AdminController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/stats", getAdminStats);

router.get("/users", getAllUsers);
router.get("/users/pending", getPendingUsers);
router.put("/users/:id", editUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/approve", approveUser);
router.patch("/users/:id/reject", rejectUser);
router.patch("/users/:id/block", blockUnblockUser);
router.post("/users/:id/password", resendTempPassword);
router.post("/users/:id/emails", sendEmailToUser);
router.post("/users/:id/ai-usage/reset", resetPatientAiUsage);

router.post("/emails/broadcast", broadcastEmail);

router.get("/subscriptions", getAllSubscriptions);
router.patch("/subscriptions/:id", updateSubscription);

router.get("/subscription-plans", getSubscriptionPlans);
router.put("/subscription-plans", updateSubscriptionPlans);

router.get("/appointments", getAllAppointments);
router.patch("/appointments/:id/cancel", cancelAppointment);

router.get("/payments", getAllPayments);

router.get("/analytics/revenue", getRevenueStats);
router.get("/analytics/doctor-ratings", getDoctorRatings);

router.put("/settings/password", changeAdminPassword);

router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

export default router;
