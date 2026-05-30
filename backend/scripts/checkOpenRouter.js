import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import getOpenRouter from "../config/openRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
  quiet: true,
});

try {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing in backend/.env.");
  }

  const openRouter = getOpenRouter();
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const response = await openRouter.chat.completions.create({
    model,
    messages: [{ role: "user", content: "Reply with: OpenRouter ready" }],
    max_tokens: 20,
  });

  console.log(response.choices?.[0]?.message?.content || "OpenRouter responded.");
} catch (error) {
  console.error("OpenRouter check failed:", error.message);
  process.exit(1);
}
