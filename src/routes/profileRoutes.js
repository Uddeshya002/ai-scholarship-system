const express = require("express");
const {
  getProfile,
  updateProfile,
  updatePassword,
  updateSecurityQuestion,
} = require("../controllers/profileController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    await getProfile(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/", authenticate, async (req, res, next) => {
  try {
    await updateProfile(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/password", authenticate, async (req, res, next) => {
  try {
    await updatePassword(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/security-question", authenticate, async (req, res, next) => {
  try {
    await updateSecurityQuestion(req, res);
  } catch (error) {
    next(error);
  }
});



