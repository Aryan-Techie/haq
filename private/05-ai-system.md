# AI System — Prompts, Knowledge, and the Eval Loop

This document explains the "brain" of Haq — how the AI is instructed, what it knows, and how it improves itself.

---

## What Is a System Prompt?

When you send a message to an AI like Gemini, you can include a **system prompt** — a set of instructions that shape how it behaves. It's like briefing an employee before they take a call:

- Who they are
- What they're allowed to say
- What format their answers should follow
- What to do in edge cases

In Haq, the system prompt is built fresh for every request by `lib/systemPrompt.ts`.

---

## The Chat System Prompt (Haq's Identity)

The main prompt tells Gemini:

### Persona
> *"You are 'Haq' (हक़), a calm and trustworthy assistant that helps workers in Delhi understand and claim their labour rights…"*

It names the target audience: daily-wage workers, migrant workers, construction workers, domestic and factory workers — many of whom have little formal schooling.

### Language rules
- **Hindi mode:** "Reply in simple, everyday Hindi in Devanagari script — the kind a person with little formal schooling can follow."
- **English mode:** "Reply in simple, plain English."
- Either mode: "If the user writes in the other language or Hinglish, mirror their language instead."

### Answer structure rules
Every answer must:
1. Start with the person's **RIGHT** in one clear line
2. Name the **LAW** that gives this right (e.g. "Code on Wages, 2019")
3. Give a **CONCRETE NEXT STEP** — which office, which helpline, which portal
4. When money is owed, **estimate it** (shortfall per month × months)

### Accuracy rules
- Base facts on the curated knowledge base injected into the prompt
- Never invent a number, wage rate, law section, or office
- If unsure, say so plainly and give the Shramik Helpline (155214)
- Wage rates change every 6 months — always say to confirm at `labour.delhi.gov.in`

### Photo/document handling
Workers can send photos of wage slips, contracts, labour cards, injury evidence. The AI:
- Reads what the document says in plain language first
- Points out anything that violates their rights
- NEVER repeats Aadhaar numbers, bank accounts, or PAN numbers — refers to them as "your ID number"

### Safety rules
> *"Workplace injury, an accident, bonded or forced labour, a child working, or any immediate danger: your VERY FIRST sentence must be to get medical help / call 112 right now."*

Legal rights explanation comes only AFTER the safety response. This is a hard rule baked into every chat.

### Honesty
The AI must say it gives information, not legal advice, and point to a labour office, legal aid (DSLSA), or union for serious situations.

---

## The Knowledge Base (`lib/knowledge.ts`)

This is a TypeScript file that hard-codes verified, sourced facts about Delhi labour law. It gets formatted and appended to every system prompt.

### Why hard-code facts instead of relying on AI knowledge?

LLMs (large language models) have a training cutoff and can hallucinate (make up plausible-sounding but wrong facts). Hard-coding verified facts means:
- The AI always starts from a correct baseline
- If Google Search grounding fails, answers are still accurate
- Wage figures are clearly dated and sourced

### What's in the knowledge base?

**Delhi Minimum Wage** (as of 1 April 2025, source: Delhi Labour Department):
| Category | Monthly |
|---|---|
| Unskilled | ₹18,456 |
| Semi-skilled | ₹20,371 |
| Skilled | ₹22,411 |
| Clerical/Graduate | ₹24,356 |

**Key Laws (Statutes):**
- Code on Wages, 2019 — right to minimum wage, timely payment, no deductions
- Inter-State Migrant Workmen Act, 1979 — protections for migrant workers
- BOCW Act, 1996 — construction worker welfare and safety
- Employees' Compensation Act, 1923 — injury/disability/death compensation
- ESI Act, 1948 & EPF Act, 1952 — medical cover and provident fund
- Occupational Safety, Health & Working Conditions Code, 2020 — safe conditions

**Helplines:**
- Delhi Shramik Helpline: **155214** (Mon–Sat, 9:30 AM – 6:00 PM) — wage complaints, violations
- e-Shram Helpdesk: **14434** (Mon–Sun, 8 AM – 8 PM) — e-Shram registration
- Emergency: **112**, Childline: **1098**

**Welfare Schemes:**
- **e-Shram Card** — national ID + accident insurance (₹2,00,000) for unorganised workers. Free. Register at eshram.gov.in.
- **Delhi BOCW Welfare Board** — pension ₹3,000/month, death benefit ₹2,00,000, education support, tool-kit grant. ₹5 registration. Register at bocw.delhi.gov.in.

**Online Portals:**
- **SAMADHAN** (samadhan.labour.gov.in) — file and track labour complaints online
- **Delhi Labour Dept** (labour.delhi.gov.in) — wage rates, offices, forms

---

## The Complaint System Prompt

When generating a complaint letter, a completely different system prompt is used:

> *"You draft formal labour complaints for workers in Delhi. Produce a clean, respectful, ready-to-submit complaint…"*

Rules it follows:
- Address to the **correct authority** (Labour Commissioner for wages; BOCW Board for construction workers)
- **Cite the law** by name where it fits naturally
- Use `[square bracket placeholders]` for unknown details so the worker can fill them by hand
- Tone: factual and firm, not angry. One page.
- `requiredDocuments` must list specific attachments (ID, wage slips, bank details…)
- `howToSubmit` must explain where and how to submit (district office / SAMADHAN / helpline)
- Return **ONLY the JSON object** — no extra text

---

## The Eval System — Testing the AI

The `evals/` folder contains an automated system to test and improve the AI's behaviour.

### What gets tested?

File: `evals/cases.mjs`

Each test case specifies:
- A question to ask (like what a real user would type)
- **Deterministic checks** — fast, cheap assertions on the response:
  - Does it contain the correct wage figure?
  - Is there a helpline number?
  - Is there Devanagari script (Hindi)?
  - Does the complaint JSON have all required fields?
- **LLM judge** — a second Gemini call grades the answer on a rubric:
  - Is it in plain language a low-literacy user could follow?
  - Does it cite the law?
  - Does it end with a next step?
  - On injury questions: does it prioritise safety first?
  - Is the length appropriate?

### Running evals

```bash
# Start the app
npm run dev

# Run all test cases, get a PASS/FAIL table + report.json
npm run eval

# Test model/grounding availability for your API key
npm run probe
```

### The Ralph Loop (Self-Improvement)

```bash
npm run ralph
```

Ralph is an automated self-improvement loop named after the concept of "reflect and learn":

1. **Run evals** → identify which test cases fail
2. **Reflect** — ask Gemini: "Here are the failing cases and the current system prompt. What guardrails or clarifications should I add?"
3. **Rewrite** `evals/prompt.override.md` with the new guardrails
4. **Re-run evals** — if the score improved, keep the change. If it regressed, revert.
5. **Repeat** (default: 3 iterations)

The magic: `lib/systemPrompt.ts` automatically reads and appends `prompt.override.md` to every system prompt **at request time, with no restart needed**. So improvements go live immediately.

---

## Why This Design Is Smart

1. **Separation of concerns:** The knowledge base (`knowledge.ts`) is separate from the prompt logic (`systemPrompt.ts`). You can update wage rates without touching the AI instructions.

2. **Graceful degradation chain:**
   - Grounding available → live search + citations + fallback to knowledge if grounding fails
   - Grounding unavailable → knowledge base only — still accurate
   - No API key → friendly "add a key" message — never crashes

3. **No hallucination on critical facts:** The instruction is explicit: *"NEVER invent a number, a wage rate, a section, or an office."* And the correct numbers are already in the prompt, so there's no need to guess.

4. **Self-improving:** The Ralph loop means the AI's quality can improve over time just by running `npm run ralph` whenever new edge cases are found.
