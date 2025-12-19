# Arabeast

Gamified Arabic learning MVP built with Next.js (App Router), Tailwind CSS, and Lucide icons. The app serves vocab quizzes from a local JSON file and tracks XP, hearts, and a mocked streak.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Features
- Local MSA vocab loaded from `data/modern-standard-arabic.json`
- API route at `/api/quiz` providing one target + three distractors
- Quiz UI with green/red feedback, Next Question flow, and mobile-first layout
- Gamification: 5-heart life system, +10 XP per correct answer, mocked `3 days` streak
- Modular components: `Header`, `QuizCard`, `GameOverModal`

## Project structure
- `app/` — App Router routes and pages
- `app/api/quiz/route.ts` — quiz API backed by local JSON
- `components/` — UI building blocks
- `lib/vocab.ts` — vocabulary loader and quiz generator
- `data/modern-standard-arabic.json` — sample vocab (10 animals)

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint check

## Notes
- The Arabic font uses Google Noto Naskh Arabic via `next/font/google`.
- No database is used; all state is local in the UI.
