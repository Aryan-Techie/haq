/**
 * scripts/seed-elastic.mjs
 *
 * Seeds the Elasticsearch "haq-knowledge" index with the Haq knowledge base.
 *
 * Run once (or whenever the data changes):
 *   node scripts/seed-elastic.mjs
 *
 * Re-runnable safely — uses index-by-ID (upsert) so duplicates don't accumulate.
 * The index is auto-created with the correct mapping if it doesn't exist.
 *
 * Reads credentials from .env.local automatically (via dotenv).
 */

import { Client } from "@elastic/elasticsearch";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const envPath = join(__dirname, "..", ".env.local");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.warn("Could not load .env.local — using process environment");
  }
}
loadEnv();

// ─── Elasticsearch client ─────────────────────────────────────────────────────
const url = process.env.ELASTICSEARCH_URL;
const apiKey = process.env.ELASTICSEARCH_API_KEY;
const username = process.env.ELASTICSEARCH_USERNAME || "elastic";
const password = process.env.ELASTICSEARCH_PASSWORD || "";
const INDEX = process.env.ELASTICSEARCH_INDEX || "haq-knowledge";

if (!url) {
  console.error("❌  ELASTICSEARCH_URL not set in .env.local");
  process.exit(1);
}

const client = new Client({
  node: url,
  auth: apiKey ? { apiKey } : { username, password },
  tls: { rejectUnauthorized: false },
});

// ─── Index mapping ────────────────────────────────────────────────────────────
const MAPPING = {
  mappings: {
    properties: {
      type:      { type: "keyword" },
      title:     { type: "text", analyzer: "standard" },
      content:   { type: "text", analyzer: "standard" },
      tags:      { type: "keyword" },
      source:    { type: "keyword" },
      url:       { type: "keyword", index: false },
      language:  { type: "keyword" },
      updatedAt: { type: "date" },
    },
  },
};

// ─── Seed documents ───────────────────────────────────────────────────────────
// This is the full curated Delhi labour-rights knowledge base.
// Add more documents here — each becomes a searchable record in Elasticsearch.
const DOCUMENTS = [
  // ── Wages ──────────────────────────────────────────────────────────────────
  {
    id: "wage-delhi-unskilled",
    type: "wage",
    title: "Delhi Minimum Wage — Unskilled Worker",
    content:
      "As of 1 April 2025, the statutory minimum wage for an unskilled worker in Delhi is ₹18,456 per month (₹710 per day, based on 26 working days). This is set by the Delhi Labour Department under the Code on Wages, 2019. Rates are revised every April and October based on the Consumer Price Index for Industrial Workers (CPI-IW). Always confirm the current rate at labour.delhi.gov.in.",
    tags: ["minimum-wage", "unskilled", "wages", "delhi", "न्यूनतम मज़दूरी"],
    source: "Delhi Labour Department",
    url: "https://labour.delhi.gov.in/labour/current-minimum-wage-rate",
    language: "both",
    updatedAt: "2025-04-01",
  },
  {
    id: "wage-delhi-semiskilled",
    type: "wage",
    title: "Delhi Minimum Wage — Semi-Skilled Worker",
    content:
      "As of 1 April 2025, the statutory minimum wage for a semi-skilled worker (mason helper, machine operator) in Delhi is ₹20,371 per month (₹784 per day). Revised biannually by the Delhi Labour Department under the Code on Wages, 2019.",
    tags: ["minimum-wage", "semi-skilled", "wages", "delhi"],
    source: "Delhi Labour Department",
    url: "https://labour.delhi.gov.in/labour/current-minimum-wage-rate",
    language: "both",
    updatedAt: "2025-04-01",
  },
  {
    id: "wage-delhi-skilled",
    type: "wage",
    title: "Delhi Minimum Wage — Skilled Worker",
    content:
      "As of 1 April 2025, the statutory minimum wage for a skilled worker (mason, electrician, carpenter, plumber) in Delhi is ₹22,411 per month (₹862 per day). Set under the Code on Wages, 2019.",
    tags: ["minimum-wage", "skilled", "wages", "delhi", "electrician", "carpenter", "mason"],
    source: "Delhi Labour Department",
    url: "https://labour.delhi.gov.in/labour/current-minimum-wage-rate",
    language: "both",
    updatedAt: "2025-04-01",
  },
  {
    id: "wage-delhi-clerical",
    type: "wage",
    title: "Delhi Minimum Wage — Clerical / Graduate / Supervisor",
    content:
      "As of 1 April 2025, the statutory minimum wage for a clerical, graduate, or supervisory worker in Delhi is ₹24,356 per month. Set under the Code on Wages, 2019.",
    tags: ["minimum-wage", "clerical", "supervisor", "graduate", "wages", "delhi"],
    source: "Delhi Labour Department",
    url: "https://labour.delhi.gov.in/labour/current-minimum-wage-rate",
    language: "both",
    updatedAt: "2025-04-01",
  },

  // ── Statutes ────────────────────────────────────────────────────────────────
  {
    id: "statute-code-on-wages",
    type: "statute",
    title: "Code on Wages, 2019",
    content:
      "The Code on Wages, 2019 (which subsumes the Minimum Wages Act 1948 and Payment of Wages Act 1936) gives every worker the right to be paid at least the notified minimum wage, to receive wages on time (within 2 days of wage period end for daily workers), and prohibits unauthorised deductions. Violations can be reported to the district labour office or via the SAMADHAN portal. Penalty for employer: up to ₹50,000 fine and 3 months imprisonment for repeat offences.",
    tags: ["code-on-wages", "minimum-wage", "wages", "payment", "law", "statute", "2019"],
    source: "Ministry of Labour and Employment",
    url: "https://labour.gov.in/code-wages",
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "statute-bocw",
    type: "statute",
    title: "Building & Other Construction Workers Act, 1996 (BOCW Act)",
    content:
      "The BOCW Act 1996 mandates registration of construction workers and provides for welfare benefits through state welfare boards (in Delhi: DBOCWWB). Employers of 10+ construction workers must register and contribute 1% of construction cost to the welfare fund. Workers are entitled to safety equipment, rest rooms, crèches, and first aid. Non-registration by employer is an offence.",
    tags: ["bocw", "construction", "building", "welfare", "safety", "1996", "statute"],
    source: "Ministry of Labour",
    url: "https://bocw.delhi.gov.in",
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "statute-employees-compensation",
    type: "statute",
    title: "Employees' Compensation Act, 1923",
    content:
      "Under the Employees' Compensation Act 1923, if a worker is injured, disabled, or killed in a workplace accident, the employer must pay compensation. For death: 50% of monthly wages × relevant factor (min ₹1,20,000). For permanent total disablement: 60% of monthly wages × factor (min ₹1,40,000). For temporary disablement: 25% of wages for the period. The employer must also pay for medical treatment. File a claim with the Commissioner for Employees' Compensation (Labour Commissioner's office).",
    tags: ["injury", "accident", "compensation", "death", "disability", "statute", "1923"],
    source: "Ministry of Labour",
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "statute-esi-epf",
    type: "statute",
    title: "ESI Act 1948 & EPF Act 1952 — Medical Cover and Provident Fund",
    content:
      "The Employees' State Insurance (ESI) Act 1948 requires employers with 10+ workers (certain sectors 20+) to contribute 3.25% of wages to ESI, and workers contribute 0.75%. This gives medical, sickness, maternity, and disability benefits. The Employee Provident Fund (EPF) Act 1952 requires employer and employee to each contribute 12% of basic wages to the provident fund. If employer does not deduct or deposit PF/ESI, file a complaint at the regional EPF/ESIC office or call 1800-118-005 (EPFO toll-free).",
    tags: ["esi", "epf", "provident-fund", "pf", "medical", "insurance", "statute"],
    source: "Ministry of Labour",
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "statute-migrant-workmen",
    type: "statute",
    title: "Inter-State Migrant Workmen Act, 1979",
    content:
      "The Inter-State Migrant Workmen (Regulation of Employment and Conditions of Service) Act, 1979 protects migrant workers hired through contractors across state borders. Entitlements include: displacement allowance (equal to 1 month's wages), journey allowance, wages equal to workers of the same category at the destination, suitable accommodation, and return journey at employer's cost. Contractors employing 5+ migrant workers must be registered.",
    tags: ["migrant", "migrant-worker", "inter-state", "contractor", "statute", "1979"],
    source: "Ministry of Labour",
    language: "both",
    updatedAt: "2025-01-01",
  },

  // ── Helplines ───────────────────────────────────────────────────────────────
  {
    id: "helpline-shramik",
    type: "helpline",
    title: "Delhi Shramik Helpline — 155214",
    content:
      "The Delhi Shramik Helpline (155214) handles complaints about non-payment of wages, payment below minimum wage, wrongful termination, workplace harassment, and violations of labour law. Open Monday to Saturday, 9:30 AM to 6:00 PM. Workers can call to register a complaint verbally; a case number is issued. The helpline is operated by the Delhi Labour Department (GNCT of Delhi).",
    tags: ["helpline", "155214", "complaint", "wages", "shramik", "delhi", "हेल्पलाइन"],
    source: "Delhi Labour Department",
    url: "https://labour.delhi.gov.in",
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "helpline-eshram",
    type: "helpline",
    title: "e-Shram Helpdesk — 14434",
    content:
      "The e-Shram national helpdesk (14434) helps unorganised workers with registration on the e-Shram portal, updating their profile, card-related questions, and information about linked welfare schemes. Open every day including Sunday, 8:00 AM to 8:00 PM. The e-Shram card is a national ID for unorganised workers — it gives accident insurance of ₹2,00,000 (death) or ₹1,00,000 (partial disability) under PMSBY.",
    tags: ["helpline", "14434", "e-shram", "eshram", "registration", "card", "unorganised"],
    source: "Ministry of Labour",
    url: "https://eshram.gov.in",
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "helpline-emergency",
    type: "helpline",
    title: "Emergency Numbers — Injury, Bonded Labour, Child Labour",
    content:
      "For a workplace accident, injury, bonded labour, or child labour situation: call Emergency 112 immediately for medical or police help. For child labour or trafficking: call Childline 1098 (free, 24×7). For bonded labour liberation: contact the District Magistrate's office or call 112. Never delay medical treatment to gather evidence — safety first, then rights.",
    tags: ["emergency", "112", "childline", "1098", "injury", "bonded-labour", "child-labour"],
    language: "both",
    updatedAt: "2025-01-01",
  },

  // ── Schemes ─────────────────────────────────────────────────────────────────
  {
    id: "scheme-eshram",
    type: "scheme",
    title: "e-Shram Card — National ID for Unorganised Workers",
    content:
      "The e-Shram card is a free national identity card for workers in the unorganised sector (construction, domestic work, agriculture, street vendors, etc.). Eligibility: age 16–59, working in unorganised sector, NOT a member of EPFO/ESIC, and not an income-tax payer. Aadhaar-linked mobile required for OTP. Benefits: 12-digit Universal Account Number (UAN), accident insurance ₹2,00,000 on death / ₹1,00,000 on partial disability under PMSBY. Also gives priority access to other government schemes. Register free at eshram.gov.in or any Common Service Centre (CSC/Jan Seva Kendra). Helpline: 14434.",
    tags: ["e-shram", "eshram", "scheme", "registration", "unorganised", "accident-insurance", "UAN"],
    source: "Ministry of Labour",
    url: "https://eshram.gov.in",
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "scheme-bocw-board",
    type: "scheme",
    title: "Delhi BOCW Welfare Board — Construction Worker Benefits",
    content:
      "The Delhi Building & Other Construction Workers Welfare Board (DBOCWWB) provides welfare benefits to registered construction workers. Eligibility: age 18–60, at least 90 days of construction work in the past 12 months. Registration fee: ₹5 one-time + ₹20/year. Benefits include: old-age pension ₹3,000/month after age 60; death (accident) benefit ₹2,00,000 to nominee; disability pension ₹3,000/month; maternity benefit ₹30,000; marriage assistance ₹51,000 (daughters); children's education support; tool-kit grant ₹5,000 once every 5 years. Register at bocw.delhi.gov.in or a district labour office with Aadhaar, proof of construction work, and bank details.",
    tags: ["bocw", "construction", "welfare", "pension", "scheme", "delhi", "registration", "बोर्ड"],
    source: "Delhi BOCW Welfare Board",
    url: "https://bocw.delhi.gov.in",
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "scheme-pm-shram-yogi",
    type: "scheme",
    title: "PM Shram Yogi Maandhan — Pension for Unorganised Workers",
    content:
      "PM Shram Yogi Maandhan (PM-SYM) is a voluntary, contributory pension scheme for unorganised workers with monthly income up to ₹15,000. Workers aged 18–40 contribute ₹55–₹200/month (depending on entry age); the government matches it. At age 60, the worker gets ₹3,000/month pension. If the worker dies, the spouse gets 50% (₹1,500/month). Enrol at any Common Service Centre (CSC) with Aadhaar and savings bank account. Helpline: 1800-267-6888.",
    tags: ["pension", "pm-sym", "shram-yogi", "scheme", "unorganised", "retirement"],
    source: "Ministry of Labour",
    url: "https://labour.gov.in/pm-shram-yogi-maandhan",
    language: "both",
    updatedAt: "2025-01-01",
  },

  // ── Offices ─────────────────────────────────────────────────────────────────
  {
    id: "office-labour-commissioner",
    type: "office",
    title: "Office of the Labour Commissioner, GNCT of Delhi",
    content:
      "The Office of the Labour Commissioner (GNCT of Delhi) is the primary authority for wage complaints, minimum-wage violations, and termination disputes in Delhi. Head office: 5, Sham Nath Marg, Delhi – 110054. There are also district labour offices across all Delhi districts — file at the office covering the area where the workplace is located. Website: labour.delhi.gov.in. Shramik Helpline: 155214. Workers can also file online via the SAMADHAN portal (samadhan.labour.gov.in).",
    tags: ["office", "labour-commissioner", "complaint", "delhi", "दफ्तर"],
    source: "Delhi Labour Department",
    url: "https://labour.delhi.gov.in",
    language: "both",
    updatedAt: "2025-01-01",
  },

  // ── Portals ─────────────────────────────────────────────────────────────────
  {
    id: "portal-samadhan",
    type: "portal",
    title: "SAMADHAN — Online Labour Grievance Portal",
    content:
      "SAMADHAN (samadhan.labour.gov.in) is the Government of India's online portal to file and track labour complaints. A worker can file a complaint about wage violations, PF/ESI non-deposit, workplace safety, or contractor non-compliance. The portal routes the complaint to the correct authority and provides a reference number to track status. Available in English and Hindi. No cost to file.",
    tags: ["samadhan", "portal", "online", "complaint", "grievance", "filing"],
    source: "Ministry of Labour",
    url: "https://samadhan.labour.gov.in",
    language: "both",
    updatedAt: "2025-01-01",
  },

  // ── FAQs ────────────────────────────────────────────────────────────────────
  {
    id: "faq-contractor-not-paying",
    type: "faq",
    title: "My contractor has not paid my wages — what do I do?",
    content:
      "If your contractor or employer has not paid your wages: (1) Under the Code on Wages 2019, wages must be paid on the last day of the wage period (or within 2 days for daily workers). (2) Collect evidence: note the dates worked, amounts owed, name of contractor, and site address. (3) Call the Shramik Helpline 155214 immediately — they can mediate. (4) File a formal complaint at your district labour office or online at samadhan.labour.gov.in. (5) You can also use the Haq complaint drafter to generate a ready-to-submit letter. There is no fee to file a complaint. The employer can be fined ₹50,000 or more.",
    tags: ["unpaid-wages", "contractor", "non-payment", "complaint", "faq", "मज़दूरी"],
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "faq-below-minimum-wage",
    type: "faq",
    title: "I am being paid less than minimum wage — what are my rights?",
    content:
      "Every worker in Delhi has the legal right to at least the minimum wage under the Code on Wages, 2019. As of April 2025: unskilled ₹18,456/month, semi-skilled ₹20,371, skilled ₹22,411, clerical ₹24,356. If your pay is less: (1) Calculate the shortfall (minimum − actual) × months worked. (2) Call Shramik Helpline 155214 and report the employer. (3) File a written complaint at the district labour office for your area. (4) The employer may owe you the full shortfall as back-wages plus compensation. You can draft the complaint in the Haq app — tap 'Draft a complaint'.",
    tags: ["minimum-wage", "below-minimum", "underpaid", "rights", "faq"],
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "faq-workplace-injury",
    type: "faq",
    title: "I was injured at work — what compensation am I owed?",
    content:
      "SAFETY FIRST: Get medical help immediately — call 112 if serious. Under the Employees' Compensation Act 1923: if injury causes temporary disablement, the employer must pay 25% of wages for the entire period. For permanent total disablement: 60% of monthly wages × the relevant factor (minimum ₹1,40,000). For death: 50% of wages × factor (minimum ₹1,20,000) paid to the family. The employer must also pay all medical expenses. If the employer refuses: file a claim with the Commissioner for Employees' Compensation at the Labour Commissioner's office, Delhi. Do this within 2 years of the accident. Helpline: 155214.",
    tags: ["injury", "accident", "compensation", "construction", "workplace", "faq", "चोट"],
    language: "both",
    updatedAt: "2025-01-01",
  },
  {
    id: "faq-wrongful-termination",
    type: "faq",
    title: "I was fired without notice or reason — what are my rights?",
    content:
      "Under the Industrial Disputes Act 1947 and Code on Wages 2019, an employer cannot terminate a worker without: (1) giving notice (usually 30 days) or paying wages in lieu of notice, (2) paying any wages owed up to the date of termination, and (3) in many cases, paying severance (gratuity under the Payment of Gratuity Act after 5+ years of service). If you were fired unfairly: (1) Note the date, reason given (if any), and any documents. (2) Call Shramik Helpline 155214. (3) File a complaint at the district labour office for an unfair termination (retrenchment) inquiry. (4) Use the Haq complaint drafter for a formal letter.",
    tags: ["termination", "fired", "dismissal", "notice", "severance", "gratuity", "faq"],
    language: "both",
    updatedAt: "2025-01-01",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function createIndexIfNeeded() {
  const exists = await client.indices.exists({ index: INDEX });
  if (exists) {
    console.log(`ℹ️  Index "${INDEX}" already exists — will upsert documents.`);
    return;
  }
  await client.indices.create({ index: INDEX, body: MAPPING });
  console.log(`✅  Created index "${INDEX}"`);
}

async function seed() {
  console.log("\n🌱  Haq — Elasticsearch Seed Script");
  console.log("=====================================");
  console.log(`Cluster: ${url}`);
  console.log(`Index:   ${INDEX}\n`);

  // 1. Ping cluster
  try {
    await client.ping();
    console.log("✅  Cluster reachable\n");
  } catch (err) {
    console.error("❌  Cannot reach Elasticsearch cluster:", err.message);
    console.error("    Check ELASTICSEARCH_URL and credentials in .env.local");
    process.exit(1);
  }

  // 2. Create index
  await createIndexIfNeeded();

  // 3. Bulk index documents
  const ops = DOCUMENTS.flatMap((doc) => {
    const { id, ...body } = doc;
    return [
      { index: { _index: INDEX, _id: id } },
      body,
    ];
  });

  const result = await client.bulk({ operations: ops, refresh: true });

  const errors = result.items.filter((i) => i.index?.error);
  if (errors.length) {
    console.error("⚠️  Some documents failed to index:");
    errors.forEach((e) => console.error("  ", e.index?.error));
  }

  const ok = result.items.length - errors.length;
  console.log(`\n✅  Seeded ${ok} documents into "${INDEX}"`);

  // 4. Verification
  const count = await client.count({ index: INDEX });
  console.log(`📊  Index now contains ${count.count} documents total`);

  // 5. Test search
  console.log("\n🔍  Test search: "minimum wage unskilled"");
  const test = await client.search({
    index: INDEX,
    body: { query: { multi_match: { query: "minimum wage unskilled", fields: ["title^3", "content^2", "tags"] } }, size: 2 },
  });
  test.hits.hits.forEach((h) => {
    console.log(`  → [${h._source.type}] ${h._source.title} (score: ${h._score?.toFixed(2)})`);
  });

  console.log("\n🎉  Done! Elasticsearch is ready for Haq.\n");
}

seed().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
