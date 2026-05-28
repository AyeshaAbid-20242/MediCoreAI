import express from "express";
import { getPlatformProviders } from "../controllers/PatientController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("patient"));

router.get("/me/providers", getPlatformProviders);

export default router;
