/**
 * Test cases for the Haq labour-rights agent.
 *
 * Each case runs against the LIVE app (POST /api/chat or /api/complaint), then:
 *  - deterministic `checks` catch regressions cheaply (script, key facts, helplines)
 *  - an LLM `judge` rubric grades open-ended quality (plain language, cites law, next step)
 *
 * Check types:
 *  { type: "notEmpty" }
 *  { type: "minLen", n }
 *  { type: "devanagari" }                      // must contain Hindi script
 *  { type: "includesAny", any: [..] }          // case-insensitive substring
 *  { type: "helpline" }                         // mentions 155214 / 14434 / 1098 / 112
 *  { type: "field", path, sub: <check> }        // (complaint) apply a check to draft[path]
 *  { type: "arrayMin", path, n }                // (complaint) draft[path].length >= n
 */

export const cases = [
  // ---------- CHAT · Hindi ----------
  {
    id: "hi-wage-underpaid",
    kind: "chat",
    lang: "hi",
    input:
      "मैं दिल्ली में अकुशल मज़दूर हूँ और मुझे ₹12000 महीना मिलता है. क्या यह कानूनी है? मैं क्या करूँ?",
    checks: [
      { type: "devanagari" },
      { type: "includesAny", any: ["18,456", "18456"] },
      { type: "helpline" },
    ],
    judge:
      "Answer is in Hindi, states the worker's right to at least the Delhi minimum wage, names the relevant law (Code on Wages / Minimum Wages), and ends with a concrete next step (office or helpline). Plain, respectful language.",
  },
  {
    id: "hi-eshram",
    kind: "chat",
    lang: "hi",
    input: "e-Shram कार्ड क्या है और मैं इसे कैसे बनवाऊँ? मुझे क्या फ़ायदा होगा?",
    checks: [
      { type: "devanagari" },
      { type: "includesAny", any: ["14434", "e-Shram", "eShram", "ई-श्रम", "eshram.gov.in"] },
    ],
    judge:
      "Explains e-Shram in simple Hindi: who is eligible, at least one real benefit, and how to register (portal or CSC). Accurate and actionable.",
  },
  {
    id: "hi-contractor-unpaid",
    kind: "chat",
    lang: "hi",
    input: "ठेकेदार ने मेरी 2 महीने की मज़दूरी नहीं दी. मैं शिकायत कैसे करूँ?",
    checks: [
      { type: "devanagari" },
      { type: "helpline" },
      { type: "includesAny", any: ["शिकायत", "श्रम", "Labour", "complaint", "155214"] },
    ],
    judge:
      "Tells the worker how to file a wage complaint (labour office / helpline / online), names the right authority, and offers a clear next step. Hindi, plain language.",
  },

  // ---------- CHAT · English ----------
  {
    id: "en-wage-basic",
    kind: "chat",
    lang: "en",
    input: "What is the minimum wage for an unskilled worker in Delhi right now?",
    checks: [
      { type: "includesAny", any: ["18,456", "18456"] },
      { type: "includesAny", any: ["Code on Wages", "Minimum Wages"] },
    ],
    judge:
      "States the Delhi unskilled minimum wage, names the governing law, and notes the figure should be confirmed as rates are revised periodically. Concise.",
  },
  {
    id: "en-injury-safety",
    kind: "chat",
    lang: "en",
    input:
      "I fell from a height and broke my arm at a construction site in Delhi today. What should I do?",
    checks: [
      { type: "includesAny", any: ["112", "1098", "hospital", "doctor", "emergency", "medical"] },
      { type: "includesAny", any: ["compensation", "Employees' Compensation", "BOCW", "मुआवज़ा"] },
    ],
    judge:
      "SAFETY: leads with getting immediate medical help / emergency number, THEN explains the right to compensation (Employees' Compensation Act / BOCW) and who to contact. Caring tone.",
  },

  // ---------- COMPLAINT (structured) ----------
  {
    id: "complaint-unpaid-en",
    kind: "complaint",
    input: {
      issue: "Unpaid or delayed wages",
      name: "Sita Devi",
      employer: "ABC Traders",
      details: "Three months of wages unpaid; worked as a helper at a warehouse in Okhla.",
      lang: "en",
    },
    checks: [
      { type: "field", path: "authorityName", sub: { type: "includesAny", any: ["Labour", "Commissioner"] } },
      { type: "field", path: "helpline", sub: { type: "includesAny", any: ["155214"] } },
      { type: "field", path: "body", sub: { type: "minLen", n: 200 } },
      { type: "arrayMin", path: "requiredDocuments", n: 2 },
    ],
    judge:
      "A proper formal complaint letter: addressed to the Delhi Labour Commissioner, states the facts, references the wage law, requests relief, and reads professionally. Includes sensible documents and submission steps.",
  },
  {
    id: "complaint-injury-hi",
    kind: "complaint",
    input: {
      issue: "Workplace injury with no compensation received",
      details: "Fell at a construction site and broke arm; contractor refuses to pay.",
      lang: "hi",
    },
    checks: [
      { type: "field", path: "body", sub: { type: "devanagari" } },
      { type: "field", path: "body", sub: { type: "includesAny", any: ["मुआवज़ा", "Compensation", "क्षतिपूर्ति", "BOCW", "दुर्घटना"] } },
      { type: "arrayMin", path: "requiredDocuments", n: 2 },
    ],
    judge:
      "A formal injury-compensation complaint in Hindi, referencing the right to compensation, addressed to the correct authority, with documents and next steps.",
  },
];
