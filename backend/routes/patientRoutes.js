import express from "express";
import {
  analyzeSymptoms,
  getAIModels,
  getNearbyCare,
  getPlatformProviders,
} from "../controllers/PatientController.js";
import {
  createMedicalRecord,
  createPatientVital,
  createPrescription,
  deleteMedicalRecord,
  deletePatientVital,
  deletePrescription,
  getMedicalRecords,
  getPatientHealthSummary,
  getPatientVitals,
  getPrescriptions,
  updateMedicalRecord,
  updatePatientVital,
  updatePrescription,
} from "../controllers/PatientHealthController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { createRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("patient"));

router.get("/me/providers", getPlatformProviders);
router.get("/me/nearby-care", getNearbyCare);
router.get("/me/ai-models", getAIModels);
router.get("/me/health-summary", getPatientHealthSummary);

router
  .route("/me/vitals")
  .get(getPatientVitals)
  .post(createPatientVital);

router
  .route("/me/vitals/:id")
  .put(updatePatientVital)
  .delete(deletePatientVital);

router
  .route("/me/prescriptions")
  .get(getPrescriptions)
  .post(createPrescription);

router
  .route("/me/prescriptions/:id")
  .put(updatePrescription)
  .delete(deletePrescription);

router
  .route("/me/medical-records")
  .get(getMedicalRecords)
  .post(createMedicalRecord);

router
  .route("/me/medical-records/:id")
  .put(updateMedicalRecord)
  .delete(deleteMedicalRecord);

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
