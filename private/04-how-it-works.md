# How It Works — Data Flow & Architecture

This document traces exactly what happens when a user does something in the app.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                        │
│                                                            │
│  app/page.tsx                                              │
│    └── useChat hook (lib/useChat.ts)                       │
│         └── fetch POST /api/chat   ──────────────────────► │─┐
│                                                            │ │
│  ComplaintModal                                            │ │
│    └── fetch POST /api/complaint  ───────────────────────► │─┤
└────────────────────────────────────────────────────────────┘ │
                                                               │
┌────────────────────────────────────────────────────────────┐ │
│                    SERVER (Next.js)                        │◄┘
│                                                            │
│  app/api/chat/route.ts                                     │
│    ├── builds system prompt (lib/systemPrompt.ts)          │
│    │    └── injects knowledge (lib/knowledge.ts)           │
│    ├── calls Gemini with Google Search grounding           │
│    └── streams NDJSON back to browser                      │
│                                                            │
│  app/api/complaint/route.ts                                │
│    ├── builds complaint system prompt                      │
│    ├── calls Gemini with JSON schema (lib/schemas.ts)      │
│    └── returns ComplaintDraft JSON                         │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌──────────────────────┐
              │   Google Gemini API  │
              │   (gemini-2.5-flash) │
              │   + Google Search    │
              └──────────────────────┘
```

---

## Flow 1: Sending a Chat Message

**Step-by-step trace of what happens when you type a question and hit Send:**

### 1. User types and hits Enter / Send button
- `Composer.tsx` calls `onSend(value, images)`
- `page.tsx` has wired `onSend` to the `send` function from `useChat`

### 2. `useChat.send()` runs (client-side)
```
lib/useChat.ts → send()
```
- Trims the text, checks it's not empty and we're not already busy
- Builds `history` — an array of all past messages + the new one
- Creates a `userMsg` object and a placeholder `botMsg` (with `streaming: true`)
- Adds both to `messages` state → React re-renders → the user sees their message appear instantly
- Sets `busy = true` → the Send button becomes a Stop button

### 3. Fetch request to the server
```
POST /api/chat
Body: { messages: [...], lang: "hi" }
```
- Uses `AbortController` so the request can be cancelled if user hits Stop
- Response is a **streaming** `ReadableStream`

### 4. Server receives the request
```
app/api/chat/route.ts
```
- Validates the body (needs messages + lang)
- Checks for the API key — returns `{error: "no_key"}` if missing
- Calls `buildSystemPrompt(lang)` to get the full instruction text:
  - Who Haq is
  - How to speak (Hindi or English)
  - What every answer must include
  - The entire knowledge base (wages, laws, helplines, schemes, offices)
  - Any auto-generated guardrails from `evals/prompt.override.md`

### 5. Gemini API call (with streaming + grounding)
```javascript
client.models.generateContentStream({
  model: "gemini-2.5-flash",
  contents: [...message history...],
  config: {
    systemInstruction: "...",
    temperature: 0.5,
    tools: [{ googleSearch: {} }]  // enables web search
  }
})
```
- Temperature 0.5 = somewhat creative but mostly factual
- `googleSearch` tool lets Gemini search the web mid-generation

### 6. Streaming back to the browser
As Gemini generates text, the server immediately forwards each chunk:
```jsonc
{"t":"text","v":"आपको "}      // "You "
{"t":"text","v":"कम से कम "}  // "at least "
// ... more chunks ...
{"t":"meta","sources":[{"title":"labour.delhi.gov.in","uri":"..."}],"searchSuggestionsHtml":"..."}
```

### 7. `useChat` reads the stream
- Uses `ReadableStream.getReader()` to read byte chunks
- `TextDecoder` converts bytes → text
- Splits on newlines to get complete JSON objects
- `handle(obj)`:
  - `t:"text"` → appends `obj.v` to the bot message text → React re-renders
  - `t:"meta"` → sets sources, searchSuggestionsHtml, and `streaming: false`
  - `t:"error"` → shows error message

### 8. Grounding fallback
If the API key doesn't have billing enabled, grounding returns a 429 error. The server catches this and retries *without* `googleSearch: {}` — using only the curated knowledge base. The user still gets a good answer; they just won't see web source citations.

---

## Flow 2: Generating a Complaint Letter

**Step-by-step trace of the complaint feature:**

### 1. User opens "Draft a Complaint" modal
- `page.tsx` sets `complaintOpen = true`
- `ComplaintModal.tsx` renders

### 2. User fills in the form
- Issue type (dropdown): unpaid wages, below minimum, termination, injury, etc.
- Name (optional)
- Employer (optional)
- Details (free text): what happened, dates, amounts

### 3. User clicks "Generate Complaint"
- `ComplaintModal.tsx` calls `generate()`
- Sends:
  ```
  POST /api/complaint
  Body: { issue, name, employer, details, lang }
  ```

### 4. Server generates the complaint
```
app/api/complaint/route.ts
```
- Formats the user's inputs into a `facts` string
- Calls `buildComplaintSystemPrompt(lang)` — different from chat prompt:
  - Instructs Gemini to address the right authority
  - Tells it to cite the relevant law
  - Tells it to use `[square bracket placeholders]` for unknown details
  - Instructs it to return ONLY JSON
- Calls Gemini with:
  ```javascript
  config: {
    responseMimeType: "application/json",
    responseSchema: complaintSchema,  // enforces exact JSON structure
    temperature: 0.4                  // lower = more consistent format
  }
  ```

### 5. Structured JSON response
Gemini returns a JSON object matching `complaintSchema`:
```json
{
  "title": "Complaint for non-payment of wages",
  "authorityName": "Office of the Labour Commissioner, GNCT of Delhi",
  "authorityAddress": "5, Sham Nath Marg, Delhi – 110054",
  "subject": "...",
  "body": "Respected Sir/Madam,\n\nI, [Your Name]...",
  "requiredDocuments": ["Identity proof (Aadhaar/Voter ID)", "Wage slips if available", ...],
  "helpline": "155214",
  "howToSubmit": "Visit the district labour office for your area, or file online at samadhan.labour.gov.in",
  "disclaimer": "This is a template only, not legal advice..."
}
```

### 6. Modal renders the draft
- Shows the letter in a styled preview
- Lists required documents
- Shows how to submit
- Provides Copy and Download buttons
- Download creates a `.txt` file the worker can take to a print shop

---

## Flow 3: Language Switching

**Completely client-side — no server involved:**

1. User clicks the language toggle button (`LangToggle.tsx` inside `Header.tsx`)
2. `page.tsx` sets `lang` state to `"en"` or `"hi"`
3. `useEffect` in `page.tsx` updates `document.documentElement.lang` → browsers/screen readers know the language
4. Every component that receives `lang` calls `t(lang)` from `lib/i18n.ts` → gets the right strings
5. React re-renders everything with the new strings — instant, no page reload

The language state is **not persisted** — if you refresh the page it goes back to Hindi (the default).

---

## Flow 4: Minimum Wage Calculator

**Entirely client-side — no AI involved:**

1. User opens "Check minimum wage" modal
2. `WageCheckModal.tsx` imports `DELHI_MIN_WAGE` from `lib/knowledge.ts` directly
3. User picks category → component reads `DELHI_MIN_WAGE.monthly[category]`
4. User types their actual pay → component computes shortfall = minimum − actual
5. If shortfall > 0: shows red warning with the amount underpaid
6. "Ask the assistant what to do" button → calls `onAsk(prompt)` → sends a pre-filled question to the chat, then closes the modal

No network request happens for the wage calculation itself. The data is baked into `lib/knowledge.ts`.

---

## The Two-Call Design (Why It Matters)

The README mentions a "two-call design." Here's why it exists:

**Problem:** Google's Gemini API has two powerful features:
1. **Google Search grounding** — lets the AI search the web and cite sources
2. **Structured JSON output** (`responseSchema`) — guarantees the AI returns a specific JSON shape

**Limitation:** These two features **cannot be used in the same API call**. If you try, you get an error.

**Solution:** Use them separately:
- Chat uses grounding (no schema) → conversational, cited answers
- Complaint uses schema (no grounding) → guaranteed structure, downloadable letter

This is explicitly noted in the code and README as a deliberate architectural choice.

---

## Security Model

| Concern | Solution |
|---|---|
| API key exposure | Server-only (`app/api/` files) — never sent to browser |
| User data privacy | No database, no logging of user messages |
| Aadhaar / ID numbers | AI is instructed never to repeat them back even if visible in photos |
| Emergency situations | AI must prioritise emergency numbers before any legal info |
| Graceful degradation | No API key = friendly error message, not a crash |
