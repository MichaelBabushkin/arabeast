# Arabeast

A gamified Arabic vocabulary learning app — Duolingo-style, built with Next.js.

## Purpose

Teach Modern Standard Arabic (MSA) vocabulary through interactive games and quizzes. The goal is to make Arabic learning engaging, fun, and repeatable — with a talking Jinn companion who reacts to your answers and holds real Arabic conversations with you.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Fonts:** Noto Naskh Arabic (via CSS variable `--font-noto-naskh`)
- **Database:** Railway PostgreSQL (hobby plan) + Drizzle ORM
- **AI Conversation:** Google Gemini API — free tier during development, Gemini 2.5 Flash-Lite for production ($0.10/$0.40 per MTok)
- **Speech Recognition:** Transformers.js (`@xenova/transformers`) — Whisper model in-browser via WebAssembly (free, no API cost)
- **State:** Client-side + Railway DB for cross-session persistence
- **Vocab data:** `/data/modern-standard-arabic.json` — local JSON, loaded at build time

## Project Structure

```
app/
  page.tsx                    # Main game screen
  layout.tsx                  # Root layout
  globals.css                 # Global styles + animation keyframes
  api/
    quiz/route.ts             # GET /api/quiz — returns a random QuizItem
    jinn/route.ts             # POST /api/jinn — Gemini conversation endpoint
    progress/route.ts         # GET/POST /api/progress — session persistence
components/
  Header.tsx                  # XP, hearts, streak display
  QuizCard.tsx                # Quiz question + answer options
  GameOverModal.tsx           # Modal shown when hearts reach 0
  MicInput.tsx                # Microphone recording + Whisper inference UI
  jinn/
    JinnCharacter.tsx         # Animated SVG Jinn (idle/talking/happy/sad states)
data/
  modern-standard-arabic.json # Vocab entries
lib/
  vocab.ts                    # VocabEntry + QuizItem types, getRandomQuiz()
  db/
    schema.ts                 # Drizzle schema definitions
    client.ts                 # Drizzle + pg pool setup
    queries.ts                # Typed query helpers
```

## Vocab Entry Shape

```ts
type VocabEntry = {
  id: string;
  english: string;
  standardArabic: string;
  standardArabicTransliteration: string;
  audio?: string;   // URL to audio file, falls back to Web Speech API
  image?: string;   // URL to image
};
```

## Game Mechanics (current)

- **Hearts:** 5 lives. Lose 1 per wrong answer. Game over at 0.
- **XP:** +10 per correct answer.
- **Streak:** Displayed in header (hardcoded — real tracking coming in Phase 4).
- **Audio:** Web Speech API (`ar-SA`, rate 0.9) as default; audio file URL used if present.
- **Quiz format:** 4-option multiple choice — 1 correct + 3 random distractors.

## Jinn Character

SVG-based animated character in `components/jinn/JinnCharacter.tsx`. States:

| State     | Trigger                      | Animation                              |
|-----------|------------------------------|----------------------------------------|
| `idle`    | Page load / waiting          | Gentle float (3.2s)                    |
| `talking` | New question / AI response   | Jaw open/close + head bob + float      |
| `happy`   | Correct answer               | Raised arms + sparkles + fast float    |
| `sad`     | Wrong answer / game over     | Drooping arms + tears + slow sob heave |

## AI Conversation Architecture

The Jinn holds real Arabic conversations powered by Gemini.

**Endpoint:** `POST /api/jinn`
- Accepts `{ message: string, language: "en" | "he", history: Message[] }`
- Returns `{ reply: string, arabic: string, transliteration: string }`

**System prompt personality:**
- Jinn speaks primarily in Arabic (MSA)
- Provides transliteration + translation in user's native language (English or Hebrew)
- Reacts emotionally to pronunciation quality
- Weaves the curse narrative into conversation
- If the user asks a grammar/vocabulary question in English or Hebrew, the Jinn answers in that language

**Speech input flow:**
1. User clicks mic button → `MicInput.tsx` records audio via MediaRecorder
2. Audio passed to Whisper (Transformers.js web worker) → transcript
3. Transcript sent to `/api/jinn` → Gemini response
4. Response displayed in Jinn dialogue box + TTS playback

## Database Schema (Drizzle + Railway PostgreSQL)

```ts
// users — anonymous sessions for now
users: { id, sessionToken, createdAt, language: "en" | "he" }

// game_sessions
game_sessions: { id, userId, gameId, startedAt, endedAt, finalXp, heartsRemaining }

// word_progress — per-word spaced repetition data
word_progress: { id, userId, wordId, timesCorrect, timesWrong, lastSeenAt, nextReviewAt }

// conversation_messages — Jinn conversation history
conversation_messages: { id, userId, role: "user" | "jinn", content, arabicContent, createdAt }
```

## Environment Variables

```bash
DATABASE_URL=          # Railway PostgreSQL connection string
GEMINI_API_KEY=        # Google AI Studio key (free tier for dev)
```

## Development Phases

- **Phase 1 (current):** Gemini Jinn conversation API — most impactful, no DB needed
- **Phase 2:** Railway DB + Drizzle schema + session persistence
- **Phase 3:** Transformers.js Whisper speech input
- **Phase 4:** Hebrew/English i18n + native language preference UI
- **Phase 5:** Spaced repetition + streak tracking + cross-session progress

## Development

```bash
npm run dev     # start dev server at localhost:3000
npm run build   # production build
npm run lint    # ESLint (zero warnings policy)
```

## Known Gaps / TODOs

- Only 10 vocab words (all animals) — needs more content and categories
- Streak is hardcoded — needs Phase 4 real tracking
- No user accounts or cross-session progress — Phase 2
- Audio fields in JSON are empty — Phase 3 Whisper handles input; TTS via Web Speech API for output
- Images are `placehold.co` placeholders — needs real illustrations

## AI Agent Skills

### Caveman Mode
This repository supports "Caveman Mode" to drastically reduce token consumption during technical, code-heavy tasks. 
- **Activate:** Tell the agent to "use caveman mode" or "activate caveman".
- **Deactivate:** Tell the agent to "return to normal", "disable caveman", or "speak normally".
- **Behavior:** When active, the AI must remove all pleasantries, hedging, and filler words. Use fragments, abbreviations, and symbols (e.g. `->`). Speak like a smart caveman.
