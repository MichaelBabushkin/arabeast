# Gemini Agent Brief #3 — Qamar Integration

You are a senior TypeScript/React engineer working on **Arabeast**, a gamified Arabic vocabulary learning app built with Next.js 16 App Router, React 19, and Tailwind CSS. Your job is to wire in the second character, **Qamar**, a sly fennec fox, as a fully playable teacher alongside the existing Jinn (Zafar).

---

## What already exists

### Characters
- **Zafar** — existing Jinn character. SVG in `components/jinn/JinnCharacter.tsx`. Chat component in `components/JinnChat.tsx`. API at `app/api/jinn/route.ts`.
- **Qamar** — new fennec fox. Data files exist but she is NOT yet integrated:
  - `data/character-qamar.json` — personality / backstory
  - `data/qamar-visual-spec.json` — visual spec for SVG
  - `data/qamar-chapters.json` — 5 chapters she teaches
  - `data/qamar-system-prompt.json` — her Gemini system prompt

### Existing chapter system (`lib/chapters.ts`)
```ts
import type { VocabCategory } from './vocab';

export type Chapter = {
  id: string;
  number: number;
  title: string;
  titleArabic: string;
  subtitle: string;
  category: VocabCategory;
  icon: string;
  color: string;
  xpRequired: number;
  storyContext: string;
};

export const CHAPTERS: Chapter[] = [
  {
    id: 'ch-1', number: 1,
    title: 'The Desert Menagerie', titleArabic: 'حيوانات الصحراء',
    subtitle: 'Animals of the Ancient World', category: 'animals', icon: '🦁', color: '#d4a017',
    xpRequired: 0, storyContext: 'The lamp was once kept in a great desert palace...',
  },
  { id: 'ch-2', number: 2, ..., category: 'family', xpRequired: 50 },
  { id: 'ch-3', number: 3, ..., category: 'food',   xpRequired: 120 },
  { id: 'ch-4', number: 4, ..., category: 'colors', xpRequired: 220 },
  { id: 'ch-5', number: 5, ..., category: 'places', xpRequired: 350 },
];
```

### Existing vocab categories (`lib/vocab.ts`)
```ts
export type VocabCategory = 'animals' | 'family' | 'food' | 'colors' | 'places';
```
Qamar teaches: `numbers | greetings | body | nature | verbs` — these categories must be added.

### Existing Jinn API (`app/api/jinn/route.ts`)
The full route handles Gemini chat. Key types:
```ts
export type JinnMessage  = { role: "user" | "model"; content: string };
export type JinnRequest  = { message: string; language?: "en"|"he"; history?: JinnMessage[]; learnedWords?: string[]; storyContext?: string };
export type JinnResponse = { arabic: string; transliteration: string; reply: string; emotion: "idle"|"talking"|"happy"|"sad" };
```
It calls `ai.models.generateContent` with `model: "gemini-3.1-flash-lite-preview"`, `responseMimeType: "application/json"`, `temperature: 0.9`, `maxOutputTokens: 300`.

### Existing JinnChat component (`components/JinnChat.tsx`)
Props:
```ts
type Props = {
  language: "en" | "he";
  learnedWords: string[];
  onLanguageChange: (lang: "en" | "he") => void;
  onJinnStateChange: (state: "idle" | "talking" | "happy" | "sad") => void;
  storyContext?: string;
};
```
It has a hardcoded `INITIAL_MESSAGE`. Posts to `/api/jinn`.

### Story page (`app/play/story/page.tsx`)
In the `(phase === "story" || phase === "quiz")` block, it renders:
```tsx
<JinnCharacter state={jinnState} />
<JinnChat language={language} learnedWords={learnedWords} ... storyContext={activeChapter.storyContext} />
```
The "story" phase shows a "Chapter Goal" panel with `activeChapter.storyContext` + a "Start Quiz" button.

### Opening monologues (Zafar, `data/chapter-intros.json`)
```json
{
  "ch-1": "Welcome to the Desert Menagerie, traveler...",
  "ch-2": "You have entered the realm of the Sorcerer's Family...",
  ...
}
```

### Qamar chapters (`data/qamar-chapters.json`)
```json
[
  {
    "id": "qamar-ch-1", "number": 1,
    "title": "The Desert Mathematics", "titleArabic": "رياضيات الصحراء",
    "subtitle": "Counting the Dunes", "category": "numbers",
    "icon": "🔢", "color": "#f59e0b", "xpRequired": 500,
    "storyContext": "Qamar challenges the player to a game of wits...",
    "characterId": "qamar",
    "openingMonologue": "Oh, another traveler? Zafar must have sent you. Before I share my stolen magic, let's see if you can even count the dunes..."
  },
  { "id": "qamar-ch-2", ..., "xpRequired": 650, "category": "greetings", ... },
  { "id": "qamar-ch-3", ..., "xpRequired": 800, "category": "body", ... },
  { "id": "qamar-ch-4", ..., "xpRequired": 950, "category": "nature", ... },
  { "id": "qamar-ch-5", ..., "xpRequired": 1100, "category": "verbs", ... }
]
```

### Qamar system prompt (`data/qamar-system-prompt.json`)
```json
{
  "systemPrompt": "You are Qamar, a sly and mischievous fennec fox... playful, cunning, sarcastic... Keep responses 2-4 sentences. Always respond in JSON: { arabic, transliteration, reply, emotion: 'idle|talking|happy|sad' }"
}
```

### Qamar visual spec (`data/qamar-visual-spec.json`)
```json
{
  "bodyShape": "Sleek, petite fennec fox sitting on a tiny, tattered magic carpet.",
  "skinTone": "#fde68a",
  "primaryColor": "#d97706",
  "accentColor": "#fbbf24",
  "hair": "Sandy fur with intricate henna-like dark brown patterns.",
  "clothing": "No traditional clothes — glowing purple gem amulet + oversized ink-stained calligraphy quill.",
  "distinguishingFeatures": "Unnaturally large ears emitting soft golden magical glow. Bushy curling tail.",
  "idleAnimation": "Gently bobs up and down on hovering magic carpet, occasionally swishing tail.",
  "talkingAnimation": "Leans forward with sly grin, pointing quill assertively, glowing ears twitch.",
  "happyAnimation": "Quick mid-air flip on carpet, scatters golden magical sparkles, lands in smug pose.",
  "sadAnimation": "Ears droop dramatically, carpet sinks lower, hides face behind bushy tail."
}
```

---

## Your tasks

### Task 1 — Extend vocab categories (`lib/vocab.ts`)

Add Qamar's five categories to the union type:

```ts
export type VocabCategory = 'animals' | 'family' | 'food' | 'colors' | 'places'
  | 'numbers' | 'greetings' | 'body' | 'nature' | 'verbs';
```

No other changes to this file.

---

### Task 2 — Update `lib/chapters.ts`

1. Add `characterId` and `openingMonologue` fields to `Chapter` type:
```ts
export type Chapter = {
  id: string;
  number: number;
  title: string;
  titleArabic: string;
  subtitle: string;
  category: VocabCategory;
  icon: string;
  color: string;
  xpRequired: number;
  storyContext: string;
  characterId: "zafar" | "qamar";
  openingMonologue: string;
};
```

2. Add `characterId: "zafar"` and the opening monologue from `data/chapter-intros.json` to each existing Zafar chapter.

3. Append Qamar's 5 chapters from `data/qamar-chapters.json` to the CHAPTERS array (exact same ids, titles, subtitles, categories, icons, colors, xpRequired, storyContext, openingMonologue as in the JSON — do NOT invent new values).

The final CHAPTERS array should have 10 entries total: ch-1 through ch-5 (Zafar), then qamar-ch-1 through qamar-ch-5 (Qamar).

---

### Task 3 — Create `/app/api/qamar/route.ts`

Model this exactly after `app/api/jinn/route.ts`. Key differences:
- Use the system prompt string from `data/qamar-system-prompt.json` (the `systemPrompt` field) instead of the Jinn system prompt
- Export types named `QamarMessage`, `QamarRequest`, `QamarResponse` (same shapes as Jinn equivalents)
- The route should be at `app/api/qamar/route.ts`, exported as `POST`
- Everything else (Gemini model, config, JSON parse logic, error handling) is identical to the Jinn route

```ts
// Top of file — read system prompt from JSON
import qamarSystemPromptData from "@/data/qamar-system-prompt.json";
const SYSTEM_PROMPT = qamarSystemPromptData.systemPrompt;
```

---

### Task 4 — Create `components/QamarChat.tsx`

Model after `components/JinnChat.tsx`. Key differences:
- Posts to `/api/qamar` instead of `/api/jinn`
- Imports `QamarMessage`, `QamarResponse` from `@/app/api/qamar/route`
- Accept an `initialMonologue?: string` prop. When provided, use it as the initial chat message body (instead of the hardcoded Jinn message). Example:
  ```ts
  const FALLBACK_INITIAL: ChatMessage = {
    role: "qamar",
    text: "Hmm, another wanderer? I suppose I can spare a moment. Ask me something — if you dare.",
    arabic: "أهلاً أيها التائه",
    transliteration: "Ahlan ayyuha at-ta'ih",
  };
  ```
  And at the top of the component:
  ```ts
  const initial: ChatMessage = initialMonologue
    ? { role: "qamar", text: initialMonologue }
    : FALLBACK_INITIAL;
  const [messages, setMessages] = useState<ChatMessage[]>([initial]);
  ```
- Change `role: "jinn"` → `role: "qamar"` everywhere in this file (messages, conditionals)
- Change placeholder text from "Speak to the Jinn…" → "Speak to Qamar…"
- Change thinking text from "Zafar is thinking…" → "Qamar is thinking…"
- The error fallback message: "A sandstorm scrambles the signal… try again."
- Remove the voice picker (the `<select>` for JINN_VOICES) — Qamar doesn't have a voice picker yet
- Keep the language toggle (EN / עב)
- Keep the mic input
- Props type:
  ```ts
  type Props = {
    language: "en" | "he";
    learnedWords: string[];
    onLanguageChange: (lang: "en" | "he") => void;
    onQamarStateChange: (state: "idle" | "talking" | "happy" | "sad") => void;
    storyContext?: string;
    initialMonologue?: string;
  };
  ```

---

### Task 5 — Attempt `components/qamar/QamarCharacter.tsx`

Create an SVG-based animated character component that mirrors the structure of `components/jinn/JinnCharacter.tsx`. The component must:
- Export `type QamarState = "idle" | "talking" | "happy" | "sad"` (same as `JinnState`)
- Default export `QamarCharacter({ state }: { state: QamarState })`
- Render inside a `<svg viewBox="0 0 260 390" xmlns="...">` (same dimensions as Jinn)
- Use the color palette: fur `#fde68a`, primary `#d97706`, accent `#fbbf24`, henna patterns `#92400e`, purple amulet `#7c3aed`

**Character elements to include:**
1. **Magic carpet** — a small ornate carpet at the bottom of the SVG (around y=300-360). Sandy/red with geometric patterns. It should float (CSS animation: `qamar-float`).
2. **Tail** — a large bushy tail curling to one side (right), amber/sandy colored
3. **Body** — small oval fennec fox torso, `#fde68a`, with a few henna pattern lines (`#92400e`, strokeWidth 1.5, no fill)
4. **Head** — round circle, `#fde68a`, centered around cx=130 cy=120
5. **Ears** — two very large pointed ears (fennec-style), `#fde68a` outer, `#d97706` inner. Add a golden glow filter (`feGaussianBlur` + `feMerge`) to make them glow
6. **Eyes** — two small ellipses, `#1a0a00`, with a golden highlight dot
7. **Nose** — small triangle/ellipse, `#d97706`
8. **Amulet** — a small purple gem (`#7c3aed`) hanging on the chest
9. **Quill** — a large stylized feather quill (held in one "paw"), `#fde68a` with `#d97706` tip, slightly rotated

**Animations (CSS keyframes, defined via `<style>` tag inside the SVG or via `globals.css`-style inline):**
- `qamar-float`: same gentle bob as jinn-float (translateY -6px → 0 → -6px, 3.2s ease-in-out infinite)
- `qamar-ear-twitch`: for the "talking" state, scale ears slightly (1 → 1.05 → 1, 0.4s)
- `qamar-flip`: for the "happy" state, rotate the whole character 360deg
- `qamar-droop`: for the "sad" state, translateY downward slightly

**State-specific changes (conditionally render different groups):**
- `idle`: floating carpet, neutral expression, tail curled right
- `talking`: ears twitching, leaning forward (translate body slightly forward), quill angled out
- `happy`: golden sparkle dots scattered around (4–6 small circles with opacity animation), carpet flipped
- `sad`: ears drooped (rotate ear paths), carpet lower

Use the same animation injection pattern as JinnCharacter (inline `<style>` tag inside the SVG if CSS-in-SVG, or a `<style>` tag using `dangerouslySetInnerHTML` pattern like the Jinn component uses).

This is an ambitious task — do your best. The output will be reviewed and iterated on. Prioritize getting the shape and structure right over pixel-perfect polish.

---

### Task 6 — Update `app/play/story/page.tsx`

The story page must conditionally render Qamar's character + chat for Qamar chapters.

1. Add imports at the top:
```tsx
import QamarCharacter, { type QamarState } from "@/components/qamar/QamarCharacter";
import QamarChat from "@/components/QamarChat";
```

2. The `jinnState` / `setJinnState` variable currently types as `JinnState`. Unify it:
```tsx
type CharacterState = "idle" | "talking" | "happy" | "sad";
const [characterState, setCharacterState] = useState<CharacterState>("idle");
```
Replace all `jinnState` → `characterState` and `setJinnState` → `setCharacterState`.

3. In the JSX where the character panel is rendered (currently `<JinnCharacter state={jinnState} />`), conditionally render by `characterId`:
```tsx
{activeChapter.characterId === "qamar" ? (
  <QamarCharacter state={characterState} />
) : (
  <JinnCharacter state={characterState} />
)}
```

4. Replace the `<JinnChat ... />` with a conditional:
```tsx
{activeChapter.characterId === "qamar" ? (
  <QamarChat
    language={language}
    learnedWords={learnedWords}
    onLanguageChange={setLanguage}
    onQamarStateChange={handleJinnStateChange}
    storyContext={activeChapter.storyContext}
    initialMonologue={activeChapter.openingMonologue}
  />
) : (
  <JinnChat
    language={language}
    learnedWords={learnedWords}
    onLanguageChange={setLanguage}
    onJinnStateChange={handleJinnStateChange}
    storyContext={activeChapter.storyContext}
    initialMonologue={activeChapter.openingMonologue}
  />
)}
```

5. **Also update `JinnChat.tsx`** to accept an `initialMonologue?: string` prop and use it as the initial message (same pattern as QamarChat), so Zafar also says his chapter-specific opening line.

6. Rename `handleJinnStateChange` → `handleCharacterStateChange` for clarity (update all call sites).

---

## What NOT to change

- `app/api/jinn/route.ts` — do not modify
- `components/jinn/JinnCharacter.tsx` — do not modify (only read for reference)
- `app/page.tsx` — do not modify (home screen uses CHAPTERS array which will auto-update)
- `data/*.json` files — do not modify

---

## Deliverables checklist

- [ ] `lib/vocab.ts` — VocabCategory extended
- [ ] `lib/chapters.ts` — Chapter type + 10 chapters (5 Zafar + 5 Qamar)
- [ ] `app/api/qamar/route.ts` — new Qamar conversation API
- [ ] `components/QamarChat.tsx` — new chat UI for Qamar
- [ ] `components/qamar/QamarCharacter.tsx` — new animated SVG character
- [ ] `app/play/story/page.tsx` — conditional Qamar/Zafar rendering
- [ ] `components/JinnChat.tsx` — add `initialMonologue` prop

---

## Important notes

- TypeScript strict mode — no `any`, no type assertions unless strictly necessary
- No new comments unless documenting a non-obvious invariant
- Do not add new npm packages
- The Google GenAI import is `import { GoogleGenAI } from "@google/genai"` — same as jinn route
- For JSON imports, use `import data from "@/data/file.json"` — Next.js handles this with `resolveJsonModule: true`
- Keep Tailwind classes consistent with the rest of the codebase (dark theme, amber palette)
