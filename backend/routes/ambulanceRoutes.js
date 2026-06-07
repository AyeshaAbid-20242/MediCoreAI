import express from "express";
import {
  getDriverJobs,
  getDriverMe,
  getDriverDashboard,
  getPatientAmbulanceJobs,
  requestAmbulance,
  updateDriverJobLocation,
  updateDriverJobStatus,
  updateDriverProfile,
  activateDriverSubscription,
} from "../controllers/AmbulanceController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/requests", protect, authorizeRoles("patient"), requestAmbulance);
router.get("/requests/me", protect, authorizeRoles("patient"), getPatientAmbulanceJobs);

router.get("/me", protect, authorizeRoles("ambulance_driver"), getDriverMe);
router.get("/dashboard", protect, authorizeRoles("ambulance_driver"), getDriverDashboard);
router.get("/jobs", protect, authorizeRoles("ambulance_driver"), getDriverJobs);
router.patch("/jobs/:id/status", protect, authorizeRoles("ambulance_driver"), updateDriverJobStatus);
router.patch("/jobs/:id/location", protect, authorizeRoles("ambulance_driver"), updateDriverJobLocation);
router.put("/me/profile", protect, authorizeRoles("ambulance_driver"), updateDriverProfile);
router.post("/me/subscription", protect, authorizeRoles("ambulance_driver"), activateDriverSubscription);
router.put("/profile", protect, authorizeRoles("ambulance_driver"), updateDriverProfile);
router.post("/subscription", protect, authorizeRoles("ambulance_driver"), activateDriverSubscription);

export default router;
