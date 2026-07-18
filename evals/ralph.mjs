/**
 * Ralph loop — self-refines the agent's system prompt from failing evals.
 *
 *   npm run dev      # server running
 *   npm run ralph    # iterate: run evals → reflect on failures → rewrite guardrails → re-run
 *
 * Each iteration writes consolidated guardrail bullets to evals/prompt.override.md,
 * which lib/systemPrompt.ts appends to the agent's instructions at request time
 * (the running dev server picks it up immediately — no restart needed).
 * Hill-climbs: reverts to the best-scoring override if an iteration regresses.
 *
 * Env: RALPH_ITERS (default 3).
 */
import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { runAll } from "./run.mjs";

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
const env = loadEnv();
const MODEL = env.GEMINI_MODEL || "gemini-flash-latest";
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const overrideUrl = new URL("./prompt.override.md", import.meta.url);
const histDir = new URL("./history/", import.meta.url);
const readOverride = () => {
  try { return readFileSync(overrideUrl, "utf8").trim(); } catch { return ""; }
};

async function reflect(failures, current) {
  const detail = failures
    .map((f) => {
      const why = f.error
        ? `error: ${f.error}`
        : [
            f.checkFails?.length
              ? `failed checks: ${f.checkFails.map((c) => c.type + (c.any ? `(${c.any.join("/")})` : "")).join(", ")}`
              : "",
            f.judge && !f.judge.pass ? `judge(${f.judge.score}/5): ${f.judge.reason}` : "",
          ].filter(Boolean).join(" | ");
      const out = typeof f.output === "string" ? f.output : JSON.stringify(f.output);
      return `- ${f.id} (${f.kind}) FAILED — ${why}\n  Answer excerpt: ${String(out).slice(0, 300).replace(/\s+/g, " ")}`;
    })
    .join("\n");

  const prompt = `You improve the SYSTEM PROMPT of "Haq", a Hindi-first Delhi labour-rights assistant, using failing evaluation cases.

Current learned refinements:
"""${current || "(none yet)"}"""

Failing cases and why:
${detail}

Write an improved, CONSOLIDATED list of AT MOST 6 short imperative guardrail bullets that fix these failures without harming good behaviour. The assistant must stay accurate (never invent numbers/laws), speak plainly, reply in the user's language (Hindi stays Hindi), cite the relevant law, and always give a concrete next step. Keep bullets concrete and testable.

Output ONLY the bullet lines, each starting with "- ". No preamble.`;

  const r = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { temperature: 0.3 },
  });
  return (r.text || "").trim();
}

const MAX = parseInt(process.env.RALPH_ITERS || "3", 10);
try { mkdirSync(histDir, { recursive: true }); } catch {}

let bestFails = Infinity;
let bestOverride = readOverride();

for (let i = 1; i <= MAX; i++) {
  console.log(`\n=== Ralph iteration ${i}/${MAX} ===`);
  const res = await runAll({ quiet: false });
  const nFail = res.failures.length;

  writeFileSync(
    new URL(`./history/iter-${i}.json`, import.meta.url),
    JSON.stringify({ iteration: i, score: res.score, override: readOverride(), results: res.results }, null, 2)
  );

  if (nFail <= bestFails) {
    bestFails = nFail;
    bestOverride = readOverride();
  } else {
    console.log(`  ↩ iteration regressed (${nFail} > ${bestFails} fails) — reverting to best guardrails`);
    writeFileSync(overrideUrl, bestOverride + "\n");
  }

  if (nFail === 0) {
    console.log("\n✅ All cases pass. Stopping.");
    break;
  }
  if (i === MAX) {
    console.log(`\nReached max iterations. Best: ${cases_total() - bestFails}/${cases_total()} passing.`);
    break;
  }

  console.log("  Reflecting on failures…");
  const improved = await reflect(res.failures, readOverride());
  if (improved) {
    writeFileSync(overrideUrl, improved + "\n");
    console.log("  ✍ Updated evals/prompt.override.md:\n" + improved.split("\n").map((l) => "     " + l).join("\n"));
  }
  await sleep(3000);
}

function cases_total() {
  return JSON.parse(readFileSync(new URL("./report.json", import.meta.url), "utf8")).results.length;
}
