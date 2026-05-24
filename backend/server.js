import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./Data/MongoDb.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
  quiet: true,
});

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Loaded" : "Missing");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded" : "Missing");

app.use("/api/auth", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
