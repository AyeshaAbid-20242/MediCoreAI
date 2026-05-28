import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createTransporter } from "../helper/emailHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
  quiet: true,
});

try {
  const transporter = createTransporter();
  await transporter.verify();
  console.log("SMTP verified. Email credentials are working.");
} catch (error) {
  console.error("SMTP verification failed:", error.message);
  process.exit(1);
}
