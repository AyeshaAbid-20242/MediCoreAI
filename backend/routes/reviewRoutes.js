import express from "express";
import {
  createAmbulanceReview,
  createReview,
  getDriverReviews,
  getDoctorReviews,
  getPublicDoctorReviews,
  getPublicDriverReviews,
} from "../controllers/ReviewController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("patient"), createReview);
router.post("/ambulance", protect, authorizeRoles("patient"), createAmbulanceReview);
router.get("/me", protect, authorizeRoles("doctor"), getDoctorReviews);
router.get("/doctor/me", protect, authorizeRoles("doctor"), getDoctorReviews);
router.get("/driver/me", protect, authorizeRoles("ambulance_driver"), getDriverReviews);
router.get("/doctors/:doctorId", getPublicDoctorReviews);
router.get("/doctor/:doctorId", getPublicDoctorReviews);
router.get("/drivers/:driverId", getPublicDriverReviews);
router.get("/driver/:driverId", getPublicDriverReviews);

export default router;
