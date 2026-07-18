# Index — Private Documentation

This folder contains deep-dive documentation about the **Haq (हक़)** project.
If you're new to the project, read in order.

---

## Documents

| # | File | What it covers |
|---|---|---|
| 1 | [01-overview.md](./01-overview.md) | What the project is, who it's for, what it does |
| 2 | [02-tech-stack.md](./02-tech-stack.md) | Every technology used — explained from scratch |
| 3 | [03-folder-structure.md](./03-folder-structure.md) | Every file and folder explained |
| 4 | [04-how-it-works.md](./04-how-it-works.md) | Data flow — what happens when you do things |
| 5 | [05-ai-system.md](./05-ai-system.md) | The AI prompts, knowledge base, and eval loop |
| 6 | [06-developer-guide.md](./06-developer-guide.md) | Setup, scripts, how to edit things |
| 7 | [07-design-and-ux.md](./07-design-and-ux.md) | Colors, fonts, accessibility, Hindi/English system |

---

## 30-Second Summary

**Haq** is a Next.js 16 web app that uses Google Gemini AI to help Delhi workers know their labour rights.

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4
- **Backend:** Next.js API routes (server-side, key never exposed to browser)
- **AI:** Gemini 2.5 Flash — streaming chat with Google Search grounding + structured complaint generation
- **Languages:** Full Hindi + English UI (`lib/i18n.ts`)
- **Knowledge:** Hard-coded verified Delhi labour data (`lib/knowledge.ts`)
- **No database:** Stateless — nothing stored, no user accounts
- **PWA:** Installable on phone home screen
- **Evals:** Automated AI testing + self-improvement loop (`evals/`)

---

## Key Files at a Glance

| File | Role |
|---|---|
| `app/page.tsx` | Main page — the entire UI |
| `app/api/chat/route.ts` | AI chat stream endpoint |
| `app/api/complaint/route.ts` | Complaint generation endpoint |
| `lib/knowledge.ts` | Delhi labour law data (wages, laws, helplines) |
| `lib/systemPrompt.ts` | AI instruction builder |
| `lib/i18n.ts` | All UI strings in Hindi + English |
| `lib/useChat.ts` | Client-side chat state management |
| `lib/types.ts` | TypeScript data type definitions |
| `evals/ralph.mjs` | Self-improving AI eval loop |
