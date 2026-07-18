# Tech Stack — Every Technology Explained

This document explains every piece of technology used in Haq, from the ground up, assuming no prior knowledge.

---

## 1. TypeScript

**What it is:** A programming language. It's JavaScript (the language that runs in browsers) but with *types* added on top.

**What types do:** Types let you say "this variable is a number" or "this object must have these exact fields." If you make a mistake — like putting text where a number should go — TypeScript catches it *before* the code even runs.

**Files in this project:** Everything ending in `.ts` or `.tsx`. For example:
- `lib/types.ts` — defines all the "shapes" of data used across the app (what a message looks like, what a complaint looks like)
- `app/page.tsx` — the main page component

---

## 2. React 19

**What it is:** A JavaScript library for building user interfaces. Made by Meta (Facebook).

**The key idea:** Instead of writing raw HTML that changes when things happen, you write **components** — reusable pieces of UI that automatically update when their data changes.

**Example:** The `MessageBubble` component takes a message as input and renders it. When new messages arrive, React automatically re-renders.

**Files in this project:** Everything in `components/` (Header, Sidebar, Composer, etc.) and `app/page.tsx`.

**React 19 specifics:** This project uses the very latest React — React 19.2.4 — which includes performance improvements and new hooks.

---

## 3. Next.js 16 (App Router)

**What it is:** A *framework* built on top of React. Where React gives you components, Next.js gives you the *entire application structure* — routing, server-side code, API routes, and more.

**Why it matters:**
- **App Router:** Next.js organises pages by folder structure. A file at `app/page.tsx` becomes the homepage (`/`). A file at `app/api/chat/route.ts` becomes the API endpoint `/api/chat`.
- **Server Components vs Client Components:** Files with `"use client"` at the top run in the browser. Files without it run on the server. This is how the API key stays secret — the server files never send the key to the browser.
- **Streaming:** Next.js supports streaming responses. When Gemini generates text word by word, Next.js streams it to the browser in real time.

**Key files:**
- `next.config.ts` — Next.js configuration
- `app/layout.tsx` — The root HTML wrapper, applied to every page
- `app/page.tsx` — The homepage
- `app/api/*/route.ts` — API endpoints

**Version note:** This is Next.js **16.2.10** — a newer version than what most tutorials cover. The App Router (`app/` directory) is the modern way to build Next.js apps.

---

## 4. Tailwind CSS v4

**What it is:** A CSS framework. CSS is what makes web pages look good — colors, spacing, fonts, layout.

**The Tailwind approach:** Instead of writing separate CSS files with class names you invent, Tailwind gives you thousands of utility classes you apply directly in your HTML/JSX. `bg-blue-500` makes something blue. `p-4` adds padding. `flex` makes a flexbox container.

**v4 specifics:** Tailwind v4 is the newest major version and changes how you configure things. Instead of a `tailwind.config.js` file, design tokens (custom colors, fonts) are defined inside the CSS file itself using `@theme {}`. See `app/globals.css`.

**This project's design tokens (custom values):**
```css
--color-bg: #f4f6fa        /* light grey page background */
--color-accent: #0369a1    /* the CTA (call to action) blue */
--color-primary: #0f172a   /* near-black text */
--color-success: #047857   /* green for good news */
--color-danger: #b91c1c    /* red for warnings */
```

---

## 5. Google Gemini AI (`@google/genai`)

**What it is:** Google's family of large language models (LLMs). An LLM is a model trained on enormous amounts of text that can understand questions and generate human-like responses.

**The specific model used:** `gemini-2.5-flash` (the latest free-tier model, overridable via `GEMINI_MODEL` env var). "Flash" models are fast and cheap; "Pro" models are more capable but cost more.

**Two distinct calls this project makes:**

| Call | Endpoint | Mode | Purpose |
|---|---|---|---|
| Chat | `/api/chat` | Streamed + Google Search grounding | Answer labour rights questions live, with citations |
| Complaint | `/api/complaint` | Structured JSON output | Draft a formal complaint letter in a specific schema |

**Why two separate calls?** Google's Gemini API cannot combine "Google Search grounding" (live web search) with "structured JSON output" in the same request. So the project uses two different configurations — one for each purpose.

**Google Search Grounding:** The chat agent can use Google Search as a tool. When it does, Gemini searches the web, reads the results, and cites them in its answer. This keeps wage figures and scheme details current.

**Key library file:** `lib/gemini.ts` — creates and caches the Gemini client, maps messages to the format Gemini expects.

---

## 6. Streaming (NDJSON)

**What it is:** Instead of waiting for the entire AI response before showing anything, the server streams text chunks to the browser as they're generated.

**The format used:** NDJSON (Newline-Delimited JSON). Each line sent over the stream is a small JSON object:
```json
{"t":"text","v":"You have the "}
{"t":"text","v":"right to minimum wage."}
{"t":"meta","sources":[...],"searchSuggestionsHtml":"..."}
```

- `t: "text"` — a chunk of the AI's answer
- `t: "meta"` — sent at the end, contains web sources and Google's required search chip HTML
- `t: "error"` — something went wrong

**On the browser side:** `lib/useChat.ts` uses the Fetch API's `ReadableStream` to read the stream line by line and update the UI in real time.

---

## 7. PWA (Progressive Web App)

**What it is:** A web app that can be "installed" like a native app — added to the phone's home screen, with its own icon and full-screen mode.

**How it works:**
- `app/manifest.ts` — defines the app name, icons, theme color, and display mode (`standalone` = no browser chrome)
- `scripts/gen-icons.mjs` — a helper script that generates all the icon sizes needed for different devices
- The browser detects the manifest and shows an "Add to Home Screen" prompt

**Files:** `components/InstallPrompt.tsx` — a custom UI prompt that appears after the user has used the app a bit, offering to install it.

---

## 8. Lucide React (Icons)

**What it is:** A library of clean, consistent SVG icons as React components.

**Usage:** `import { Scale, Send, Phone } from "lucide-react"` — then use `<Scale size={30} />` to render an icon.

**Why:** Rather than downloading image files for icons, these are vector graphics that scale to any size without blurring.

---

## 9. react-markdown + remark-gfm

**What it is:** The AI's responses contain Markdown — a text format where `**bold**` becomes **bold**, `- item` becomes a bullet point, etc. These libraries convert Markdown to HTML for the browser to render.

**remark-gfm:** "GitHub Flavored Markdown" — adds tables, strikethrough, and other extensions beyond basic Markdown.

**File:** `components/AnswerBlock.tsx` — uses `<ReactMarkdown>` to render the AI's answer with the custom `prose-haq` CSS class applied.

---

## 10. Google Fonts (next/font)

**What it is:** Typography — the fonts used to display text.

**Three fonts in this project** (loaded in `app/layout.tsx`):

| Font | Variable | Used for |
|---|---|---|
| **Lexend** | `--font-lexend` | Headings (`font-heading`) — a font specifically designed for readability and low literacy |
| **Source Sans 3** | `--font-source` | Body text — clean, legible Latin characters |
| **Noto Sans Devanagari** | `--font-noto-hindi` | Hindi script (Devanagari) — Google's Noto fonts are designed to cover all writing systems |

The fonts are loaded via Next.js's `next/font/google` — they're self-hosted (downloaded at build time) so they don't make external requests at runtime, which improves performance and privacy.

---

## Summary Table

| Technology | Category | Version | Role |
|---|---|---|---|
| TypeScript | Language | ^5 | Type-safe JavaScript |
| React | UI Library | 19.2.4 | Component-based UI |
| Next.js | Framework | 16.2.10 | App structure, routing, API |
| Tailwind CSS | Styling | ^4 | Utility-first CSS |
| @google/genai | AI SDK | ^2.12.0 | Gemini API client |
| lucide-react | Icons | ^1.25.0 | SVG icon components |
| react-markdown | Rendering | ^10.1.0 | Markdown → HTML |
| remark-gfm | Plugin | ^4.0.1 | Extended markdown syntax |
| Lexend | Font | — | Heading typography |
| Source Sans 3 | Font | — | Body typography |
| Noto Sans Devanagari | Font | — | Hindi script rendering |
