# Folder & File Structure — Explained

Every file and folder in this project, explained in plain English.

---

## Root Level

```
haq-project/
├── app/                  ← Next.js pages and API routes
├── components/           ← React UI components
├── lib/                  ← Shared logic, data, and utilities
├── evals/                ← Automated AI evaluation / testing system
├── scripts/              ← One-off helper scripts
├── public/               ← Static files (icons, images)
├── .env.local            ← Your secret API key (NOT committed to git)
├── .env.example          ← Template showing which env vars are needed
├── package.json          ← Project metadata + list of dependencies
├── next.config.ts        ← Next.js configuration
├── tsconfig.json         ← TypeScript configuration
├── postcss.config.mjs    ← Needed by Tailwind CSS v4
└── eslint.config.mjs     ← Code linting rules
```

---

## `app/` — The Next.js Application

Next.js uses **file-system routing**: the folder structure determines the URLs.

```
app/
├── page.tsx              ← The homepage (URL: /)
├── layout.tsx            ← Root HTML wrapper — fonts, metadata, <html> tag
├── globals.css           ← Global CSS — design tokens, base styles, animations
├── manifest.ts           ← PWA web app manifest (makes it installable)
├── favicon.ico           ← Browser tab icon
└── api/
    ├── chat/
    │   └── route.ts      ← POST /api/chat — streams AI answers with citations
    └── complaint/
        └── route.ts      ← POST /api/complaint — generates structured complaint JSON
```

### `app/layout.tsx`
The **root layout** that wraps every page. It:
- Loads the three Google Fonts (Lexend, Source Sans 3, Noto Devanagari)
- Sets the HTML `lang="hi"` (Hindi by default, changed dynamically via JavaScript)
- Defines `<head>` metadata: page title, description, PWA manifest link, icons
- Renders `{children}` — whatever the current page is

### `app/page.tsx`
The **entire main page** — there's only one route in this app. It:
- Manages state: `lang` (Hindi/English), `wageOpen`/`complaintOpen`/`resOpen` (modal open/closed)
- Uses the `useChat` hook to manage the message list and send/stop/reset
- Renders the layout: Sidebar (desktop) + Header + messages + Composer (input box)
- Renders three modals: WageCheck, Complaint, Resources

### `app/api/chat/route.ts`
Server-side **streaming chat endpoint**. When you type a question and hit send:
1. Receives the message history + language from the browser
2. Builds the system prompt (who the AI is, what it knows)
3. Calls Gemini with Google Search grounding enabled
4. Streams back text chunks as NDJSON (`{"t":"text","v":"..."}`)
5. If grounding fails (no billing), falls back to knowledge-only mode
6. Sends a final `{"t":"meta"}` line with sources and Google's search chip HTML

### `app/api/complaint/route.ts`
Server-side **complaint generation endpoint**. When you click "Generate Complaint":
1. Receives issue type, name, employer, details + language
2. Calls Gemini with `responseSchema` (forces specific JSON structure)
3. Returns a complete `ComplaintDraft` object with title, letter body, documents needed, how to submit

---

## `components/` — UI Building Blocks

Each file is a **React component** — a reusable piece of the UI.

```
components/
├── Header.tsx            ← Top bar: app name, language toggle, new chat button
├── Sidebar.tsx           ← Left panel (desktop only): nav links, tools
├── TrustBar.tsx          ← "Information, not legal advice" disclaimer bar (mobile)
├── QuickChips.tsx        ← Starter suggestion buttons shown on empty chat
├── Composer.tsx          ← The text input + image upload + send/stop button
├── MessageBubble.tsx     ← Renders a single message (user or AI)
├── AnswerBlock.tsx       ← Renders the AI's answer with Markdown formatting
├── CitationChips.tsx     ← The source link pills shown below AI answers
├── SearchSuggestions.tsx ← Google's required search suggestion HTML chip
├── ToolsBar.tsx          ← Row of tool buttons (wage check, complaint, resources) on mobile
├── LangToggle.tsx        ← Hindi/English switcher button
├── Modal.tsx             ← Generic modal overlay container
├── WageCheckModal.tsx    ← Minimum wage calculator UI
├── ComplaintModal.tsx    ← Complaint letter drafter UI (form + generated letter)
├── ResourcesModal.tsx    ← Helplines, offices, and scheme cards
└── InstallPrompt.tsx     ← PWA install prompt (shows after some use)
```

### Component Data Flow (simplified)

```
page.tsx
  ├── sends lang, callbacks → Header, Sidebar, ToolsBar, Composer
  ├── sends messages → MessageBubble[]
  │       └── MessageBubble → AnswerBlock → CitationChips, SearchSuggestions
  └── controls modals → WageCheckModal, ComplaintModal, ResourcesModal
```

---

## `lib/` — Shared Logic

The "brain" of the app. These files are used by both the browser and server.

```
lib/
├── types.ts        ← TypeScript type definitions for all data structures
├── gemini.ts       ← Gemini client setup, message format conversion
├── systemPrompt.ts ← Builds the AI's instruction prompt
├── knowledge.ts    ← Hard-coded Delhi labour facts (wages, laws, helplines)
├── schemas.ts      ← JSON schema for the complaint response structure
├── i18n.ts         ← All text strings in Hindi and English
├── useChat.ts      ← React hook: message state, send/stop/reset logic
└── image.ts        ← Image file → base64 conversion for photo uploads
```

### `lib/types.ts`
Defines the "shape" of all data objects:
- `Lang` — `"hi"` or `"en"`
- `ChatMessage` — `{ id, role, text, images, sources, streaming, error }`
- `WireMessage` — the slimmer format sent over the network
- `Source` — `{ title, uri, domain }` — a citation
- `Attachment` — `{ mime, data }` — a base64-encoded image
- `ComplaintDraft` — the full complaint object returned by `/api/complaint`

### `lib/gemini.ts`
- Creates and caches the `GoogleGenAI` client (singleton pattern — only one instance)
- Reads the API key from `process.env.GEMINI_API_KEY`
- `toContents()` — converts our `WireMessage[]` format into Gemini's `Content[]` format
- Returns `null` if no API key is configured (graceful degradation)

### `lib/systemPrompt.ts`
Builds the text instruction block sent to Gemini at the start of every conversation. Two variants:
- `buildSystemPrompt(lang)` — for chat: tells Gemini it's "Haq", how to speak, what every answer must include, safety rules, and injects the knowledge context
- `buildComplaintSystemPrompt(lang)` — for complaints: tells Gemini to write formal letters, which authority to address, what placeholders to use

Also optionally loads `evals/prompt.override.md` — auto-generated refinements from the eval loop.

### `lib/knowledge.ts`
A **curated knowledge base** — real, sourced data about Delhi labour rights. This is injected into every system prompt so the AI always has accurate baseline information even when Google Search is unavailable.

Contains:
- `DELHI_MIN_WAGE` — monthly rates by category (as of 1 April 2025, source: Delhi Labour Dept)
- `STATUTES` — key laws: Code on Wages, BOCW Act, Employees Compensation Act, ESI/EPF, etc.
- `HELPLINES` — Shramik Helpline 155214, e-Shram 14434, emergency numbers
- `OFFICES` — Labour Commissioner office address
- `SCHEMES` — e-Shram card, Delhi BOCW Welfare Board (eligibility, benefits, how to apply)
- `PORTALS` — SAMADHAN grievance portal, Delhi Labour Dept website
- `knowledgeContext()` — formats all the above into a readable text block for the prompt

### `lib/schemas.ts`
Defines the **JSON schema** for the complaint response. Gemini uses this to guarantee its output matches the required structure — fields like `title`, `authorityName`, `body`, `requiredDocuments`, etc. are all defined here using Google GenAI's `Type` enum.

### `lib/i18n.ts`
All user-facing text strings in both Hindi and English. The `t(lang)` function returns the right set based on the current language. Every UI string — button labels, placeholders, error messages, quick-prompt suggestions — comes from here, never hardcoded in components.

### `lib/useChat.ts`
A **React custom hook** that manages the entire chat state:
- `messages` — array of all `ChatMessage` objects
- `busy` — is the AI currently responding?
- `send(text, images)` — adds user message, calls `/api/chat`, reads the streaming response, updates messages in real time
- `stop()` — aborts the fetch (cancels the stream)
- `reset()` — clears all messages and starts fresh

### `lib/image.ts`
Handles photo uploads. Converts a browser `File` object to base64 and a preview URL, with size limits and MIME type validation. The base64 data is sent to Gemini as an inline image for the AI to "read."

---

## `evals/` — AI Evaluation System

An automated testing and self-improvement system for the AI agent.

```
evals/
├── README.md            ← How to run evals
├── cases.mjs            ← Test cases (questions + expected answer criteria)
├── run.mjs              ← Test runner: hits the live app, grades answers
├── ralph.mjs            ← "Ralph loop": run → reflect → refine → repeat
├── probe.mjs            ← Check which models and features your API key supports
└── vision-test.mjs      ← Test the image-reading (document photo) feature
```

The **Ralph loop** is self-improvement: it runs the tests, asks Gemini to analyse failures, rewrites `evals/prompt.override.md` with new guardrails, re-runs the tests, and only keeps the change if it's an improvement.

---

## `scripts/` — Helper Scripts

```
scripts/
└── gen-icons.mjs        ← Generates PWA icons (192×192, 512×512, apple-touch, etc.)
                            Run once when setting up the PWA assets.
```

---

## `public/` — Static Assets

Files served directly as-is (no processing):
- `favicon-32.png`, `icon-192.png`, `icon-512.png` — PWA icons
- `apple-touch-icon.png` — iOS home screen icon
- `manifest.webmanifest` — generated from `app/manifest.ts`

---

## Configuration Files

| File | Purpose |
|---|---|
| `package.json` | Lists all dependencies, defines `npm run` scripts |
| `tsconfig.json` | TypeScript compiler settings (path aliases like `@/lib/`) |
| `next.config.ts` | Next.js settings (minimal in this project) |
| `postcss.config.mjs` | Required by Tailwind v4 to process CSS |
| `eslint.config.mjs` | Code quality rules, extends Next.js defaults |
| `.env.local` | Local secrets — `GEMINI_API_KEY`. **Never commit this.** |
| `.env.example` | Template for `.env.local` (safe to commit) |
| `.gitignore` | Files git should ignore (`.env.local`, `.next/`, `node_modules/`) |
