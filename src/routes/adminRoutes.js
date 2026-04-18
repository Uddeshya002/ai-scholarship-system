const express = require("express");
const {
  getDashboard,
  listStudents,
  listApplications,
  createScholarship,
  verifyStudent,
  updateApplicationStatus,
} = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    await getDashboard(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/students", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    await listStudents(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/applications", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    await listApplications(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/scholarships", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    await createScholarship(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch("/students/:id/verify", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    await verifyStudent(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/applications/:id/status",
  authenticate,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      await updateApplicationStatus(req, res);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

