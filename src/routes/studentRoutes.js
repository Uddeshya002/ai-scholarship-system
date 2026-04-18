import express from "express";
import upload from "../utils/upload.js";
import {
  getDashboard,
  getScholarships,
  getScholarshipById,
  submitApplication,
  getMyApplications,
} from "../controllers/studentController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", authenticate, requireRole("student"), getDashboard);
router.get("/scholarships", authenticate, getScholarships);
router.get("/scholarships/:id", authenticate, getScholarshipById);
router.post(
  "/applications",
  authenticate,
  requireRole("student"),
  upload.single("document"),
  submitApplication
);
router.get("/applications", authenticate, requireRole("student"), getMyApplications);

export default router;