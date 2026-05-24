import express from "express";
import {
  createReview,
  getDoctorReviews,
  getPublicDoctorReviews,
} from "../controllers/ReviewController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("patient"), createReview);
router.get("/doctor/me", protect, authorizeRoles("doctor"), getDoctorReviews);
router.get("/doctor/:doctorId", getPublicDoctorReviews);

export default router;
