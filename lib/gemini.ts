import { GoogleGenAI } from "@google/genai";
import type { Content } from "@google/genai";
import type { WireMessage } from "./types";

/** Newest free-tier flash model. Override with GEMINI_MODEL. */
export const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

/**
 * Whether to attempt Google Search grounding. Grounding needs a billing-enabled
 * project (free up to 5k grounded prompts/month); without it the API returns 429.
 * The chat route attempts grounding and falls back to the curated knowledge core.
 * Set GEMINI_GROUNDING=off to skip the attempt entirely.
 */
export const GROUNDING_ENABLED = process.env.GEMINI_GROUNDING !== "off";

let cached: GoogleGenAI | null = null;

/** Returns a client, or null when no API key is configured. */
export function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cached) cached = new GoogleGenAI({ apiKey });
  return cached;
}

/** Map the chat wire format to Gemini `contents` (text + attached images). */
export function toContents(messages: WireMessage[]): Content[] {
  return messages
    .filter((m) => m.text?.trim() || m.images?.length)
    .map((m) => {
      const parts: Content["parts"] = [];
      for (const img of m.images ?? []) {
        parts!.push({ inlineData: { mimeType: img.mime, data: img.data } });
      }
      if (m.text?.trim()) parts!.push({ text: m.text });
      return { role: m.role === "model" ? "model" : "user", parts };
    });
}
