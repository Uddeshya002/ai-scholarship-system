import express from "express";
import { register } from "../controllers/authController.js";

console.log("✅ AUTH ROUTES LOADED");

const router = express.Router();

router.post("/register", register);

export default router;