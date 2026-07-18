/**
 * Curated Delhi labour-rights knowledge core.
 *
 * Every figure here is sourced and dated. It is injected into the agent's
 * system prompt as authoritative context, and also powers the offline UI
 * cards (wage check, resources). The agent is instructed to refresh volatile
 * numbers (wage rates) via Google Search and to always cite.
 *
 * Sources: labour.delhi.gov.in · eshram.gov.in · bocw.delhi.gov.in (Aug 2025)
 */

export const DELHI_MIN_WAGE = {
  asOf: "1 April 2025",
  source: "Delhi Labour Department",
  sourceUrl: "https://labour.delhi.gov.in/labour/current-minimum-wage-rate",
  note: "Revised every April and October with dearness allowance based on the CPI-IW. Confirm the current rate before acting.",
  daysPerMonth: 26,
  monthly: {
    unskilled: 18456,
    semiskilled: 20371,
    skilled: 22411,
    clerical: 24356,
  } as Record<string, number>,
};

export interface Statute {
  name: string;
  aka?: string;
  covers: string;
}

export const STATUTES: Statute[] = [
  {
    name: "Code on Wages, 2019",
    aka: "subsumes the Minimum Wages Act 1948 & Payment of Wages Act 1936",
    covers:
      "Right to at least the notified minimum wage; timely payment of wages; no unauthorised deductions.",
  },
  {
    name: "Inter-State Migrant Workmen Act, 1979",
    covers:
      "Protections for migrant workers hired through contractors across states — registration, displacement allowance, equal wages.",
  },
  {
    name: "Building & Other Construction Workers Act, 1996",
    aka: "BOCW Act",
    covers:
      "Welfare, safety and registration of construction workers; funds the Delhi construction workers' welfare board.",
  },
  {
    name: "Employees' Compensation Act, 1923",
    covers:
      "Compensation for injury, disability or death caused by a workplace accident.",
  },
  {
    name: "Employees' State Insurance Act, 1948 (ESI) & EPF Act, 1952",
    covers:
      "Medical cover and provident fund for eligible workers; employer must deposit contributions.",
  },
  {
    name: "Occupational Safety, Health & Working Conditions Code, 2020",
    covers: "Safe working conditions, hours of work, and welfare facilities.",
  },
];

export interface Helpline {
  name: string;
  number: string;
  hours?: string;
  note?: string;
}

export const HELPLINES: Helpline[] = [
  {
    name: "Delhi Shramik Helpline",
    number: "155214",
    hours: "Mon–Sat, 9:30 AM – 6:00 PM",
    note: "Non-payment of wages, minimum-wage violations, wrongful termination, labour-law complaints.",
  },
  {
    name: "e-Shram Helpdesk",
    number: "14434",
    hours: "Mon–Sun, 8:00 AM – 8:00 PM",
    note: "Registration and questions about the e-Shram card for unorganised workers.",
  },
  {
    name: "National child-labour / bonded-labour",
    number: "1098 (Childline) · 112 (Emergency)",
    note: "For a child worker, bonded or forced labour, or immediate danger — call now.",
  },
];

export interface Office {
  name: string;
  address: string;
  forWhat: string;
  url?: string;
}

export const OFFICES: Office[] = [
  {
    name: "Office of the Labour Commissioner, GNCT of Delhi",
    address:
      "5, Sham Nath Marg, Delhi – 110054 (with district labour offices across Delhi)",
    forWhat:
      "Wage complaints, minimum-wage and termination disputes. File at the district labour office for your workplace's area.",
    url: "https://labour.delhi.gov.in/",
  },
];

export interface Scheme {
  key: string;
  name: string;
  forWhat: string;
  eligibility: string[];
  benefits: string[];
  howToApply: string[];
  fee?: string;
  helpline?: string;
  url: string;
}

export const SCHEMES: Scheme[] = [
  {
    key: "eshram",
    name: "e-Shram Card",
    forWhat: "National ID + benefits for any unorganised-sector worker.",
    eligibility: [
      "Age 16–59",
      "Working in the unorganised sector",
      "Not a member of EPFO / ESIC and not an income-tax payer",
      "Aadhaar linked to a mobile number",
    ],
    benefits: [
      "12-digit Universal Account Number (UAN), valid across India",
      "Accident insurance (PMSBY): ₹2,00,000 on death, ₹1,00,000 on partial disability",
      "Access to government welfare schemes for registered workers",
    ],
    howToApply: [
      "Register free at eshram.gov.in, or at any nearby Common Service Centre (CSC)",
      "Keep your Aadhaar-linked mobile handy for the OTP",
    ],
    fee: "Free",
    helpline: "14434",
    url: "https://eshram.gov.in/",
  },
  {
    key: "bocw",
    name: "Delhi Construction Workers' Welfare Board (DBOCWWB)",
    forWhat: "Welfare benefits for registered construction workers in Delhi.",
    eligibility: [
      "Construction worker aged 18–60",
      "At least 90 days of construction work in the past year",
    ],
    benefits: [
      "Old-age pension ₹3,000/month after 60",
      "Death (accident) benefit ₹2,00,000 to nominee; disability pension ₹3,000/month",
      "Marriage assistance ₹51,000; children's education support; maternity benefit",
      "Tool-kit grant ₹5,000 once every 5 years",
    ],
    howToApply: [
      "Register at bocw.delhi.gov.in or a district labour office",
      "Carry Aadhaar, proof of construction work, and bank details",
    ],
    fee: "₹5 registration + ₹20/year subscription",
    url: "https://bocw.delhi.gov.in/",
  },
];

export interface Portal {
  name: string;
  url: string;
  forWhat: string;
}

export const PORTALS: Portal[] = [
  {
    name: "SAMADHAN — online labour grievance",
    url: "https://samadhan.labour.gov.in/",
    forWhat: "File and track a labour complaint online.",
  },
  {
    name: "Delhi Labour Department",
    url: "https://labour.delhi.gov.in/",
    forWhat: "Minimum wage rates, offices, and forms.",
  },
];

/** Compact, authoritative context block injected into the system prompt. */
export function knowledgeContext(): string {
  const w = DELHI_MIN_WAGE.monthly;
  const wageLines = `Delhi minimum wage (as of ${DELHI_MIN_WAGE.asOf}, source ${DELHI_MIN_WAGE.source}): unskilled ₹${w.unskilled}/month, semi-skilled ₹${w.semiskilled}/month, skilled ₹${w.skilled}/month, clerical/graduate ₹${w.clerical}/month. ${DELHI_MIN_WAGE.note}`;

  const statuteLines = STATUTES.map(
    (s) => `- ${s.name}${s.aka ? ` (${s.aka})` : ""}: ${s.covers}`
  ).join("\n");

  const helpLines = HELPLINES.map(
    (h) => `- ${h.name}: ${h.number}${h.hours ? ` (${h.hours})` : ""} — ${h.note ?? ""}`
  ).join("\n");

  const schemeLines = SCHEMES.map(
    (s) =>
      `- ${s.name} (${s.url}): ${s.forWhat} Eligibility: ${s.eligibility.join(
        "; "
      )}. Key benefits: ${s.benefits.join("; ")}. Apply: ${s.howToApply.join(
        "; "
      )}.${s.fee ? ` Fee: ${s.fee}.` : ""}${s.helpline ? ` Helpline ${s.helpline}.` : ""}`
  ).join("\n");

  const officeLines = OFFICES.map(
    (o) => `- ${o.name}, ${o.address}: ${o.forWhat}`
  ).join("\n");

  return [
    "AUTHORITATIVE FACTS (prefer these; use Google Search to confirm current wage figures and cite the source):",
    wageLines,
    "",
    "KEY LAWS:",
    statuteLines,
    "",
    "HELPLINES:",
    helpLines,
    "",
    "SCHEMES / WELFARE BOARDS:",
    schemeLines,
    "",
    "WHERE TO GO:",
    officeLines,
    "",
    `ONLINE: ${PORTALS.map((p) => `${p.name} (${p.url})`).join(" · ")}`,
  ].join("\n");
}
