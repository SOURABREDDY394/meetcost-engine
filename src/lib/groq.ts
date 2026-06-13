import "server-only";

import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export function getGroqClient() {
  if (groqClient) return groqClient;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing.");

  groqClient = new Groq({ apiKey });
  return groqClient;
}

export function getGroqModel() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}
