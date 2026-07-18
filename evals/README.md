# Haq — Evals & the Ralph loop

Automated tests for the app **and** the AI agent, plus a self-refinement loop.

## What's here
- `cases.mjs` — the test suite. Each case hits the **live app** (`/api/chat` or `/api/complaint`) and is graded two ways:
  - **deterministic checks** — cheap regression guards (Hindi script present, the real wage figure, a helpline number, complaint structure).
  - **LLM judge** — Gemini grades open-ended quality against a rubric (plain language, cites the law, ends with a next step, safety-first on injuries).
- `run.mjs` — runs every case, prints a PASS/FAIL table, writes `report.json`, exits non-zero on failure.
- `ralph.mjs` — the **Ralph loop**: run evals → reflect on the failures → rewrite consolidated guardrails into `prompt.override.md` → re-run. Hill-climbs (reverts a regressing change).
- `prompt.override.md` — *generated*. `lib/systemPrompt.ts` appends it to the agent's instructions at request time, so refinements go live with **no restart**.
- `probe.mjs` — checks which models this API key can use and whether grounding works.
- `history/` — a snapshot per Ralph iteration.

## Run
```bash
# terminal 1
npm run dev

# terminal 2
npm run eval      # one-shot test run  → evals/report.json
npm run ralph     # iterate + auto-refine the prompt (RALPH_ITERS=3 by default)
npm run probe     # model / grounding availability for your key
```

## Notes
- **Rate limits:** the free tier is ~10 requests/min, so the runner spaces calls ~6s apart and retries on 429. A full run is a couple of minutes.
- **Grounding:** off by default on a key without billing (see `.env.local`). Tests therefore validate the agent's answers from the curated knowledge core. Enable billing → live citations, and the same tests still pass.
- **Extend it:** add cases to `cases.mjs`. Keep deterministic checks for hard facts (numbers, helplines, script) and a `judge` rubric for tone/quality. Re-run `npm run ralph` to let the agent tighten its own guardrails against new cases over time.
