# Haq · हक़ — Delhi Labour Rights Assistant

> **हक़ (haq)** means *"right / entitlement."* Haq is a Hindi-first AI assistant that helps Delhi's workers **know their rights, cite the actual law, and take the next step** — check the minimum wage, understand e-Shram and welfare boards, and draft a formal complaint.

Built for the **GDG Cloud New Delhi × Elastic "Build With AI" Buildathon** — Theme 2, *Migrant Worker & Labour Rights Agent (human impact)*.

---

## What it does

- 💬 **Grounded chat agent** — ask in plain Hindi or English about wages, an unpaid contractor, a workplace injury, e-Shram, PF/ESI. It answers simply, **names the law** (Code on Wages 2019, BOCW Act, Employees' Compensation Act…), and **ends with a concrete next step**.
- 🔍 **Elasticsearch-powered RAG** — every question is BM25-searched against a curated `haq-knowledge` index (21 docs: wages, statutes, helplines, schemes, FAQs) and the top matches are injected into the model's context as authoritative, retrieval-augmented facts — not just a static prompt.
- 🔎 **Live + cited** — optionally uses **Gemini with Google Search grounding** so wage figures stay current and answers can show their **sources** (plus Google's Search-Suggestions chip) when enabled.
- 💰 **Minimum-wage check** — pick your work type → see the wage the law guarantees in Delhi, and how much you're being underpaid.
- 📝 **Complaint drafter** — fills a formal, ready-to-submit complaint addressed to the right authority, with the documents to attach and how to file it. Copy or download as text.
- ☎️ **Helplines & offices** — Shramik Helpline **155214**, e-Shram **14434**, welfare-board and office details, one tap to call.
- 🌐 **Hindi-first & accessible** — Devanagari UI, large high-contrast type, keyboard-navigable, screen-reader labels.
- 📱 **Installable PWA** — add to home screen on Android/iOS, works offline for the app shell.
- 🔒 **No data stored** — stateless; the API key stays on the server; nothing the worker types is saved.

---

## Run it (for the person demoing)

**Prerequisites:** Node.js 20+.

```bash
# 1. install
npm install

# 2. add a FREE Gemini key (no credit card) — https://aistudio.google.com/apikey
#    open .env.local and paste it:
#    GEMINI_API_KEY=your_key_here

# 3. (recommended — this is the Elastic integration) add Elastic Cloud credentials
#    to .env.local, then seed the knowledge index — see "Elasticsearch setup" below:
#    ELASTICSEARCH_URL=...
#    ELASTICSEARCH_API_KEY=...
npm run seed

# 4. run
npm run dev
# open http://localhost:3000
```

> After adding keys to `.env.local`, **restart `npm run dev`** (env vars load at startup).
> Without any key the app still runs and shows a friendly "add a key" message — so it never crashes on stage. Without Elasticsearch configured, it silently falls back to the static knowledge core (see below).

### Optional: zero-setup shareable link
Deploy to **Vercel** (free): import the repo, set `GEMINI_API_KEY` in Project → Settings → Environment Variables, deploy. The teammate just opens the URL — nothing to install.

---

## 2-minute demo script

1. **Open the app** (defaults to Hindi). Read the tagline: *"अपने हक़ जानिए."*
2. Tap the quick chip **"मुझे न्यूनतम मज़दूरी नहीं मिल रही"** → watch it stream a plain-Hindi answer that **cites the Code on Wages 2019**, states the Delhi minimum wage, and tells the worker to call **155214** / file a complaint. Have the server terminal visible (or `tail`ed) so the mentor can see the `[elastic] query="…" → N hits` log line firing live — that's the Elasticsearch retrieval happening in real time. If Google grounding is enabled, also point at the **source chips** underneath.
3. Tap **"Check minimum wage"** → choose *Unskilled*, type what you're paid (e.g. `14000`) → it shows the **shortfall** and offers *"Ask the assistant what to do."*
4. Tap **"Draft a complaint"** → pick *Unpaid wages*, add a couple of details → **Generate**. A formal letter appears addressed to the Labour Commissioner with documents + how to submit. **Download** it.
5. Toggle **EN** → the whole UI and the agent switch to English.
6. Close: *"No login, no data stored, runs on a free Gemini key — and it speaks the worker's language."*

---

## How it works

```
Browser (Next.js + React, Hindi/English)
        │  POST /api/chat        POST /api/complaint
        ▼                              ▼
Next.js Route Handlers (server — API keys never leave here)
        │                              │
        ├──► Elasticsearch: BM25 multi_match search over "haq-knowledge"
        │    (21 curated docs — wages, statutes, helplines, schemes, FAQs)
        │    top-K hits formatted as high-priority RAG context
        ▼                              ▼
  Gemini 2.5 Flash               Gemini 2.5 Flash
  + Google Search grounding      + JSON responseSchema
  + Elasticsearch RAG context    + Elasticsearch RAG context
  (streamed answer + citations)  (structured complaint)
```

- **RAG layer (Elasticsearch):** every question first runs a BM25 full-text search (`multi_match` across `title`/`content`/`tags`, with fuzzy matching) against the `haq-knowledge` index (`lib/elastic.ts`). The top hits are formatted and injected into the Gemini system prompt as authoritative, high-priority context (`lib/systemPrompt.ts`) — this is retrieval-augmented generation, not just a hard-coded prompt. If Elasticsearch is unreachable or unconfigured, retrieval fails closed and the app silently falls back to the static `lib/knowledge.ts` core, so a cluster hiccup never breaks the demo.
- **Two-call design:** Google Search grounding and strict JSON output can't be combined in one Gemini call, so chat is grounded+streamed while the complaint drafter is a separate structured call.
- **Knowledge core** (`lib/knowledge.ts`) — real, sourced Delhi labour facts (wage rates, statutes, schemes, helplines, offices) are injected into every system prompt as the baseline, underneath the live Elasticsearch results, so the essentials are correct even if both search layers return nothing.
- **ToS:** Google's Search-Suggestions HTML is rendered whenever grounded results are shown, as required.

## Tech stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · `@google/genai` (Gemini) · `@elastic/elasticsearch` (RAG retrieval) · react-markdown · lucide-react. No user accounts, no auth — Elasticsearch holds only the static, public knowledge index (no user data).

## Data & sources
Minimum-wage figures effective **1 April 2025** (Delhi Labour Department; revised each April/October with CPI-IW). e-Shram (eshram.gov.in, helpline 14434), Delhi BOCW Welfare Board (bocw.delhi.gov.in), Shramik Helpline 155214 (labour.delhi.gov.in). **This is information, not legal advice — confirm current rates from the cited source.**

## How it maps to the judging criteria
- **Real-world impact** — a genuinely underserved user (migrant/daily-wage workers), in their language, on questions that affect their livelihood.
- **Data effort** — curated + sourced legal/wage/scheme knowledge base, indexed in Elasticsearch and retrieved via BM25 search on every request, refreshed live via Search grounding with citations.
- **Actionability & security** — names the office, drafts the complaint, gives the helpline; server-side keys, no PII stored, urgent-situation routing to emergency numbers.
- **Demo & storytelling** — one clear, emotional flow end to end.

## Elasticsearch setup
```bash
# 1. Get a free Elastic Cloud deployment: https://cloud.elastic.co (14-day trial)
# 2. In Kibana → Stack Management → API Keys, create a key and copy the "Encoded" value
#    (must be the base64 id:secret pair — not the raw "api_key" field alone)
# 3. Add to .env.local:
#    ELASTICSEARCH_URL=https://<your-deployment>.<region>.gcp.cloud.es.io:443
#    ELASTICSEARCH_API_KEY=<the Encoded value>
# 4. Seed the index (safe to re-run — upserts by ID, no duplicates):
npm run seed
```
Without these two variables set, `lib/elastic.ts` degrades gracefully: every search returns no results and the app runs on the static `lib/knowledge.ts` core only — nothing breaks, but the RAG layer is inactive.

## Project structure
```
app/            page.tsx (chat) · layout.tsx (fonts) · api/chat · api/complaint
components/      Header, TrustBar, QuickChips, Composer, MessageBubble, AnswerBlock,
                CitationChips, SearchSuggestions, ToolsBar, Modal, WageCheckModal,
                ComplaintModal, ResourcesModal, LangToggle
lib/            gemini.ts · elastic.ts (ES client + RAG search) · systemPrompt.ts ·
                knowledge.ts · schemas.ts · i18n.ts · useChat.ts · types.ts
scripts/        seed-elastic.mjs — creates + upserts the "haq-knowledge" index (npm run seed)
```

## Privacy
No accounts. No database. Nothing the user types is stored. The Gemini API key is read only on the server (`.env.local`) and is never exposed to the browser.
