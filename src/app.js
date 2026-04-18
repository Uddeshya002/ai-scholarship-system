import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import db from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ DATABASE
db.connect((err) => {
  if (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
  console.log("✅ Database connected");
});

// 🔥 THIS LINE FIXES YOUR PROBLEM
app.use("/api/auth", authRoutes);

// serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});