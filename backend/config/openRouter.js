import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

let client = null;

const getOpenRouter = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    return null;
  }

  if (!client) {
    client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || "http://localhost:5000",
        "X-Title": "MediCore",
      },
    });
  }

  return client;
};

export default getOpenRouter;
