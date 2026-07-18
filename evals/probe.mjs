// Probe candidate models for free-tier availability + Google Search grounding.
// Tests plain first, then grounded (only if plain works). Spaced for 10 RPM.
// Usage: node evals/probe.mjs
import { GoogleGenAI } from "@google/genai";
import { readFileSync } from "node:fs";

function loadEnv() {
  const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const out = {};
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const env = loadEnv();
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const models = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
];
const q = "दिल्ली में अकुशल मज़दूर की न्यूनतम मज़दूरी कितनी है? कौन-सा कानून यह हक़ देता है?";

async function call(model, grounded) {
  const t = Date.now();
  try {
    const cfg = { temperature: 0.3 };
    if (grounded) cfg.tools = [{ googleSearch: {} }];
    const r = await ai.models.generateContent({ model, contents: q, config: cfg });
    const gm = r.candidates?.[0]?.groundingMetadata;
    return {
      ok: true,
      ms: Date.now() - t,
      sources: gm?.groundingChunks?.length || 0,
      chip: !!gm?.searchEntryPoint?.renderedContent,
      text: (r.text || "").slice(0, 90).replace(/\s+/g, " "),
    };
  } catch (e) {
    const msg = e?.message || String(e);
    const code = msg.match(/"code":\s*(\d+)/)?.[1] || "?";
    return { ok: false, code, ms: Date.now() - t };
  }
}

for (const model of models) {
  const plain = await call(model, false);
  process.stdout.write(
    `${model.padEnd(26)} plain:${plain.ok ? "200" : plain.code}`
  );
  await sleep(6500);
  if (plain.ok) {
    const g = await call(model, true);
    process.stdout.write(
      `  grounded:${g.ok ? "200" : g.code}  sources=${g.sources ?? "-"} chip=${g.chip ?? "-"} ${g.ms}ms`
    );
    if (g.ok) process.stdout.write(`\n   → ${g.text}…`);
    await sleep(6500);
  }
  process.stdout.write("\n");
}
