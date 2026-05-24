import express from "express";
import {
  getDoctorAppointments,
  getPatientAppointments,
  payAppointment,
  requestAppointment,
  updateAppointmentStatus,
  updateZoomLink,
} from "../controllers/AppointmentController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("patient"), requestAppointment);
router.get("/my", protect, authorizeRoles("patient"), getPatientAppointments);
router.patch("/:id/pay", protect, authorizeRoles("patient"), payAppointment);

router.get("/doctor", protect, authorizeRoles("doctor"), getDoctorAppointments);
router.patch("/:id/status", protect, authorizeRoles("doctor"), updateAppointmentStatus);
router.patch("/:id/zoom", protect, authorizeRoles("doctor"), updateZoomLink);

export default router;
