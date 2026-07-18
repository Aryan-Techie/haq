# Haq · हक़ — Delhi Labour Rights Assistant

> **हक़ (haq)** means *"right / entitlement."* Haq is a Hindi-first AI assistant that helps Delhi's workers **know their rights, cite the actual law, and take the next step** — check the minimum wage, understand e-Shram and welfare boards, and draft a formal complaint.

Built for the **GDG Cloud New Delhi × Elastic "Build With AI" Buildathon** — Theme 2, *Migrant Worker & Labour Rights Agent (human impact)*.

---

## What it does

- 💬 **Grounded chat agent** — ask in plain Hindi or English about wages, an unpaid contractor, a workplace injury, e-Shram, PF/ESI. It answers simply, **names the law** (Code on Wages 2019, BOCW Act, Employees' Compensation Act…), and **ends with a concrete next step**.
- 🔎 **Live + cited** — uses **Gemini with Google Search grounding**, so wage figures and scheme details stay current and every answer shows its **sources** (plus Google's Search-Suggestions chip).
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

# 3. run
npm run dev
# open http://localhost:3000
```

> After adding the key to `.env.local`, **restart `npm run dev`** (env vars load at startup).
> Without a key the app still runs and shows a friendly "add a key" message — so it never crashes on stage.

### Optional: zero-setup shareable link
Deploy to **Vercel** (free): import the repo, set `GEMINI_API_KEY` in Project → Settings → Environment Variables, deploy. The teammate just opens the URL — nothing to install.

---

## 2-minute demo script

1. **Open the app** (defaults to Hindi). Read the tagline: *"अपने हक़ जानिए."*
2. Tap the quick chip **"मुझे न्यूनतम मज़दूरी नहीं मिल रही"** → watch it stream a plain-Hindi answer that **cites the Code on Wages 2019**, states the Delhi minimum wage, and tells the worker to call **155214** / file a complaint. Point at the **source chips** underneath.
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
Next.js Route Handlers (server — GEMINI_API_KEY never leaves here)
        │                              │
  Gemini 2.5 Flash               Gemini 2.5 Flash
  + Google Search grounding      + JSON responseSchema
  (streamed answer + citations)  (structured complaint)
```

- **Two-call design:** Google Search grounding and strict JSON output can't be combined in one Gemini call, so chat is grounded+streamed while the complaint drafter is a separate structured call.
- **Knowledge core** (`lib/knowledge.ts`) — real, sourced Delhi labour facts (wage rates, statutes, schemes, helplines, offices) are injected into the system prompt so the essentials are correct even if search returns nothing; grounding refreshes the volatile numbers and adds citations.
- **ToS:** Google's Search-Suggestions HTML is rendered whenever grounded results are shown, as required.

## Tech stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · `@google/genai` (Gemini) · react-markdown · lucide-react. No database, no auth.

## Data & sources
Minimum-wage figures effective **1 April 2025** (Delhi Labour Department; revised each April/October with CPI-IW). e-Shram (eshram.gov.in, helpline 14434), Delhi BOCW Welfare Board (bocw.delhi.gov.in), Shramik Helpline 155214 (labour.delhi.gov.in). **This is information, not legal advice — confirm current rates from the cited source.**

## How it maps to the judging criteria
- **Real-world impact** — a genuinely underserved user (migrant/daily-wage workers), in their language, on questions that affect their livelihood.
- **Data effort** — curated + sourced legal/wage/scheme knowledge base, refreshed live via Search grounding with citations.
- **Actionability & security** — names the office, drafts the complaint, gives the helpline; server-side key, no PII stored, urgent-situation routing to emergency numbers.
- **Demo & storytelling** — one clear, emotional flow end to end.

> **Note on Elastic:** to keep this a single sendable app with near-zero setup, we did not run an Elasticsearch server. The knowledge lookup is isolated in `lib/knowledge.ts` and can be swapped to an Elastic query if a cluster is available.

## Project structure
```
app/            page.tsx (chat) · layout.tsx (fonts) · api/chat · api/complaint
components/      Header, TrustBar, QuickChips, Composer, MessageBubble, AnswerBlock,
                CitationChips, SearchSuggestions, ToolsBar, Modal, WageCheckModal,
                ComplaintModal, ResourcesModal, LangToggle
lib/            gemini.ts · systemPrompt.ts · knowledge.ts · schemas.ts · i18n.ts · useChat.ts · types.ts
```

## Privacy
No accounts. No database. Nothing the user types is stored. The Gemini API key is read only on the server (`.env.local`) and is never exposed to the browser.
