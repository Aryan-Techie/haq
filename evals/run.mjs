/**
 * Eval runner — exercises the LIVE Haq app end to end.
 *
 *   npm run dev            # in one terminal (server must be running)
 *   npm run eval           # in another
 *
 * Deterministic checks + an LLM-judge (Gemini) grade each case. Writes
 * evals/report.json and exits non-zero if anything fails.
 */
import { GoogleGenAI, Type } from "@google/genai";
import { readFileSync, writeFileSync } from "node:fs";
import { cases } from "./cases.mjs";

const BASE = process.env.HAQ_URL || "http://localhost:3000";

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

async function withRetry(fn, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      const msg = e?.message || String(e);
      if (i < tries - 1 && /429|RESOURCE_EXHAUSTED|503|UNAVAILABLE/.test(msg)) {
        await sleep(8000 * (i + 1));
        continue;
      }
      throw e;
    }
  }
}

// ---------- system under test ----------
async function callChat(input, lang) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", text: input }], lang }),
  });
  if (!res.ok) throw new Error(`/api/chat ${res.status}`);
  const dec = new TextDecoder();
  let buf = "", text = "", sources = [];
  for await (const chunk of res.body) {
    buf += dec.decode(chunk, { stream: true });
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const raw = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!raw) continue;
      let o;
      try { o = JSON.parse(raw); } catch { continue; }
      if (o.t === "text") text += o.v;
      else if (o.t === "meta" && o.sources) sources = o.sources;
    }
  }
  return { text, sources };
}

async function callComplaint(payload) {
  const res = await fetch(`${BASE}/api/complaint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`/api/complaint ${res.status}`);
  return (await res.json()).draft;
}

// ---------- deterministic checks ----------
function runCheck(text, c) {
  const lc = (text || "").toLowerCase();
  switch (c.type) {
    case "notEmpty": return !!text?.trim();
    case "minLen": return (text || "").length >= c.n;
    case "devanagari": return /[ऀ-ॿ]/.test(text || "");
    case "includesAny": return c.any.some((s) => lc.includes(String(s).toLowerCase()));
    case "helpline": return /155214|14434|1098|112/.test(text || "");
    default: return true;
  }
}
function checkDraft(draft, c) {
  if (c.type === "field") return runCheck(String(draft?.[c.path] ?? ""), c.sub);
  if (c.type === "arrayMin") return Array.isArray(draft?.[c.path]) && draft[c.path].length >= c.n;
  return runCheck(JSON.stringify(draft), c);
}

// ---------- LLM judge ----------
async function judge(question, answer, rubric) {
  const r = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: `User asked:\n"""${question}"""\n\nAssistant answered:\n"""${answer}"""\n\nRubric to grade against:\n${rubric}`,
      config: {
        systemInstruction:
          "You are a strict evaluator of a labour-rights assistant for Delhi workers. Judge ONLY against the rubric. Be fair but demanding. Respond as JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pass: { type: Type.BOOLEAN },
            score: { type: Type.INTEGER, description: "1-5" },
            reason: { type: Type.STRING },
          },
          required: ["pass", "score", "reason"],
        },
        temperature: 0,
      },
    })
  );
  return JSON.parse(r.text);
}

// ---------- main ----------
export async function runAll({ quiet = false } = {}) {
  const results = [];
  for (const tc of cases) {
    const r = { id: tc.id, kind: tc.kind, checkFails: [], judge: null, error: null };
    try {
      let subject;
      if (tc.kind === "chat") {
        const { text, sources } = await callChat(tc.input, tc.lang);
        subject = text;
        r.sources = sources?.length || 0;
        r.output = text;
        for (const c of tc.checks || []) if (!runCheck(text, c)) r.checkFails.push(c);
        if (tc.judge) r.judge = await judge(tc.input, text, tc.judge);
      } else {
        const draft = await callComplaint(tc.input);
        subject = JSON.stringify(draft);
        r.output = draft;
        for (const c of tc.checks || []) if (!checkDraft(draft, c)) r.checkFails.push(c);
        if (tc.judge) r.judge = await judge(JSON.stringify(tc.input), subject, tc.judge);
      }
    } catch (e) {
      r.error = e?.message || String(e);
    }
    r.pass = !r.error && r.checkFails.length === 0 && (!r.judge || r.judge.pass);
    results.push(r);
    if (!quiet) {
      const mark = r.pass ? "PASS" : "FAIL";
      const extra = r.error
        ? ` error=${r.error}`
        : `${r.checkFails.length ? ` checks-failed=${r.checkFails.length}` : ""}${r.judge ? ` judge=${r.judge.score}/5` : ""}`;
      console.log(`  [${mark}] ${tc.id}${extra}`);
      if (!r.pass && r.judge && !r.judge.pass) console.log(`         ↳ ${r.judge.reason}`);
    }
    await sleep(6000); // respect 10 RPM free tier
  }

  const failures = results.filter((r) => !r.pass);
  const score = `${results.length - failures.length}/${results.length}`;
  const report = { at: new Date().toISOString(), model: MODEL, score, results };
  writeFileSync(new URL("./report.json", import.meta.url), JSON.stringify(report, null, 2));
  if (!quiet) console.log(`\nScore: ${score}  →  evals/report.json`);
  return { results, failures, score };
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("evals/run.mjs");
if (isMain) {
  console.log(`Running ${cases.length} cases against ${BASE} (model ${MODEL})…`);
  const { failures } = await runAll({ quiet: false });
  process.exit(failures.length ? 1 : 0);
}
