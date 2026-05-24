import express from "express";
import {
  activateDoctorSubscription,
  getDoctorDashboard,
  getDoctorMe,
  getPublicDoctors,
  updateDoctorProfile,
} from "../controllers/DoctorController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public", getPublicDoctors);

router.get("/me", protect, authorizeRoles("doctor"), getDoctorMe);
router.put("/me/profile", protect, authorizeRoles("doctor"), updateDoctorProfile);
router.post("/me/subscription", protect, authorizeRoles("doctor"), activateDoctorSubscription);
router.get("/dashboard", protect, authorizeRoles("doctor"), getDoctorDashboard);

export default router;
