import express from "express";
import {
  analyzeSymptoms,
  getNearbyCare,
  getPlatformProviders,
} from "../controllers/PatientController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { createRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("patient"));

router.get("/me/providers", getPlatformProviders);
router.get("/me/nearby-care", getNearbyCare);
router.post(
  "/me/symptom-check",
  createRateLimiter({
    windowMs: 60 * 1000,
    max: 8,
    message: "Too many symptom checks. Please wait a minute.",
  }),
  analyzeSymptoms
);

export default router;
