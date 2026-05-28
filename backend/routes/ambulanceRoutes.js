import express from "express";
import {
  getDriverMe,
  getDriverDashboard,
  updateDriverProfile,
  activateDriverSubscription,
} from "../controllers/AmbulanceController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, authorizeRoles("ambulance_driver"), getDriverMe);
router.get("/dashboard", protect, authorizeRoles("ambulance_driver"), getDriverDashboard);
router.put("/profile", protect, authorizeRoles("ambulance_driver"), updateDriverProfile);
router.post("/subscription", protect, authorizeRoles("ambulance_driver"), activateDriverSubscription);

export default router;