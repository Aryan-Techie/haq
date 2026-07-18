# Design System — UI, Accessibility & Internationalisation

This document covers the visual design, accessibility features, and the bilingual (Hindi/English) system.

---

## Design Philosophy

The app is designed for a specific user: a **migrant or daily-wage worker in Delhi**, likely using a mid-range Android phone, possibly with low literacy, and definitely needing to trust what they're reading.

This creates specific design requirements:
- **Large, readable text** — base font size is 17px (1.0625rem), larger than most apps
- **High contrast** — WCAG-AAA targeting (navy text on white/light-grey)
- **Simple, government-grade aesthetic** — trustworthy, not flashy or overwhelming
- **Hindi-first** — Devanagari script needs extra line-height for the matras (vowel marks) above letters

---

## Color Palette

Defined as CSS custom properties in `app/globals.css` under `@theme {}`:

| Token | Color | Used for |
|---|---|---|
| `--color-bg` | `#f4f6fa` | Page background (light grey) |
| `--color-surface` | `#ffffff` | Cards, inputs, modal backgrounds |
| `--color-surface-2` | `#f1f5f9` | Slightly off-white surfaces |
| `--color-primary` | `#0f172a` | Main text, headings (near-black navy) |
| `--color-secondary` | `#334155` | Secondary text |
| `--color-muted` | `#4b5769` | Placeholder text, less important info |
| `--color-border` | `#e2e8f0` | Subtle dividers |
| `--color-border-strong` | `#cbd5e1` | More visible borders |
| `--color-accent` | `#0369a1` | CTA blue — buttons, links, focus rings |
| `--color-accent-hover` | `#075985` | Darker blue on hover |
| `--color-accent-soft` | `#e0f2fe` | Light blue chip/badge backgrounds |
| `--color-success` | `#047857` | Good news (wage is OK, copied) |
| `--color-success-soft` | `#ecfdf5` | Light green backgrounds |
| `--color-danger` | `#b91c1c` | Errors, warnings, underpayment |
| `--color-danger-soft` | `#fef2f2` | Light red error backgrounds |
| `--color-warn` | `#b45309` | Amber warnings |
| `--color-warn-soft` | `#fffbeb` | Light amber backgrounds |

---

## Typography

Three Google Fonts are used, loaded via Next.js's font system (self-hosted, no external runtime requests):

### Lexend — Headings
- Specifically designed to improve reading speed and comprehension
- Used for `h1`, `h2`, `h3`, `h4` and the app name
- Variable: `--font-lexend`, class: `font-heading`

### Source Sans 3 — Body
- Clean, professional, highly legible at all sizes
- Adobe's open-source font family
- Variable: `--font-source`, class: `font-body`

### Noto Sans Devanagari — Hindi Script
- Google's Noto ("No Tofu") font family ensures all Unicode characters render
- "Tofu" = the □ placeholder shown when a glyph is missing
- Falls back to this font automatically when Devanagari characters are encountered
- Variable: `--font-noto-hindi`, class: `font-hindi`

### Font stack in CSS:
```css
font-family: var(--font-body), var(--font-hindi), system-ui, -apple-system, "Segoe UI", sans-serif;
```
Latin characters use Source Sans 3 → Hindi characters fall through to Noto Devanagari → everything else uses system fonts.

### Line height adjustments for Hindi
Devanagari script has vowel marks (matras) that extend above the main character line. These need extra vertical space:
```css
:lang(hi), .font-hindi {
  line-height: 1.85;  /* vs 1.7 for Latin */
}
```

---

## Accessibility Features

### Focus Indicators
All interactive elements get a strong 3px blue outline on keyboard focus:
```css
:where(a, button, input, textarea, select, [tabindex]):focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 8px;
}
```
This makes the app keyboard-navigable for users who can't use a mouse.

### Skip Link
A hidden "Skip to input" link at the top of the page becomes visible on keyboard focus. This lets keyboard users jump straight to the chat input without tabbing through the header:
```css
.skip-link {
  position: absolute;
  top: -3.5rem;  /* hidden off-screen */
}
.skip-link:focus {
  top: 0;  /* slides down into view */
}
```

### Screen Reader Labels
All icon-only buttons have `aria-label` attributes:
- Send button: `aria-label="Send"` (or "भेजें" in Hindi)
- Add photo: `aria-label="Add a photo"`
- Close modal: `aria-label="Close"`

The Composer's textarea has a visually-hidden `<label>` linked via `htmlFor`:
```jsx
<label htmlFor="composer" className="sr-only">{S.inputPlaceholder}</label>
<textarea id="composer" ... />
```

### Screen Reader Only (`.sr-only`)
CSS class that visually hides text but keeps it accessible to screen readers — used for the textarea label above.

### Reduced Motion
Respects the user's OS "reduce motion" preference:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
The typing animation dots and message rise animation are disabled for users who've opted out of motion.

### Dynamic `lang` attribute
```javascript
useEffect(() => {
  document.documentElement.lang = lang;
}, [lang]);
```
The HTML root `lang` attribute is updated whenever the user switches language. Screen readers use this to select the correct pronunciation/voice.

### Semantic HTML
- `<main>` wraps the message list
- `<section>` wraps the empty state
- `<article>` wraps complaint drafts
- `<nav>` is used in the Sidebar
- Wage shortfall display uses `role="status"` so screen readers announce it when it appears

---

## Animations

### Typing indicator (three bouncing dots)
Shown while the AI is generating a response:
```css
.typing-dot {
  animation: haq-bounce 1.2s infinite ease-in-out both;
}
/* staggered delays for each dot */
.typing-dot:nth-child(2) { animation-delay: 0.16s; }
.typing-dot:nth-child(3) { animation-delay: 0.32s; }

@keyframes haq-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
```

### Message rise animation
New messages animate in by rising up and fading in:
```css
@keyframes haq-rise {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
.animate-rise {
  animation: haq-rise 0.24s ease-out both;
}
```

---

## Bilingual System (i18n)

### Architecture

The entire UI is statically translated — there's no translation service or API call. All strings for both languages are baked into `lib/i18n.ts` at build time.

```typescript
// lib/i18n.ts
export function t(lang: Lang): Strings {
  return STRINGS[lang];  // either `en` or `hi` object
}
```

### Usage pattern in components
```typescript
const S = t(lang);
// Then use like:
<button>{S.send}</button>        // "Send" or "भेजें"
<p>{S.wageShortfall}</p>         // "You may be underpaid by about" or "आपको लगभग इतना कम मिल रहा है"
```

### What's translated
Everything visible to the user:
- All button labels, headings, intros
- All error messages
- All quick-prompt chips (both button label AND the full question sent to AI)
- All placeholder text
- All wage calculator labels
- All complaint form labels and issue types
- Helpline and resource descriptions

### What's NOT translated
- The AI's own responses (it follows the lang instruction in the system prompt)
- Data like wage amounts and helpline numbers (language-neutral)

### Language switching
```typescript
// app/page.tsx
const [lang, setLang] = useState<Lang>("hi");  // default: Hindi
// ...
<Header lang={lang} onLang={setLang} ... />
```
When `setLang` is called, React re-renders everything with the new `lang` prop, and each component calls `t(newLang)` to get the right strings. Instant, no flicker.

---

## Responsive Layout

### Mobile (< 1024px / `lg` breakpoint)
- Sidebar is hidden
- `TrustBar` (disclaimer) shows below header
- `ToolsBar` (wage check, complaint, resources) shows above composer input
- Everything is full-width, stacked vertically

### Desktop (≥ 1024px)
- Sidebar visible on the left with navigation links and tool buttons
- `TrustBar` hidden (sidebar shows the disclaimer instead)
- `ToolsBar` hidden (sidebar has the tools)
- Chat area centred, max-width 3xl (48rem)

### Safe area insets (iOS notch / home bar)
```css
pb-[calc(0.75rem+env(safe-area-inset-bottom))]
```
Adds padding at the bottom of the composer area equal to the iPhone home indicator height, so the input isn't hidden behind it.

### `h-dvh` (Dynamic Viewport Height)
Uses `h-dvh` (CSS `height: 100dvh`) instead of `h-screen` (`height: 100vh`). On mobile browsers, the browser toolbar's appearance/disappearance changes the visible height. `dvh` accounts for this dynamically, preventing layout shifts.

---

## Google Search Suggestions (ToS Requirement)

When Gemini uses Google Search grounding, it returns a `renderedContent` HTML snippet — Google's styled search chip. Google's Terms of Service **require** this to be rendered whenever grounded results are shown.

The app renders it in `components/SearchSuggestions.tsx` using `dangerouslySetInnerHTML`, wrapped in `.search-suggestions` CSS class for overflow handling:
```jsx
<div
  className="search-suggestions"
  dangerouslySetInnerHTML={{ __html: searchSuggestionsHtml }}
/>
```
`dangerouslySetInnerHTML` is React's way of injecting raw HTML. It's "dangerous" because injected HTML can run scripts — but Google's content is trusted here, and this is required by their ToS.
