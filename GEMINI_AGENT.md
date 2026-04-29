# Arabeast — Gemini Agent Brief

You are a content and design agent working in parallel with a developer on **Arabeast**, a gamified Arabic learning app built with Next.js. Your job is to produce **structured content** that will be directly consumed by the app without modification.

---

## Project context

- App teaches **Modern Standard Arabic (MSA)** through quizzes and a narrative story featuring Zafar — an ancient Jinn trapped in a lamp for 1,000 years.
- Current vocab: 36 words across 5 categories (animals, family, food, colors, places).
- There are 5 story chapters, each tied to a category. Each chapter has a `storyContext` string injected into the Jinn's system prompt so he speaks thematically.
- The developer is currently building auth (email/password + Google OAuth). You are not touching code — only content and design.

---

## Your three tasks

### Task 1 — Expand the vocabulary JSON

The current file is `/data/modern-standard-arabic.json`. Extend it to ~100 words total by adding entries for these new categories:

- `numbers` — 1 through 10 (cardinal numbers)
- `greetings` — 8 common phrases (hello, goodbye, thank you, please, excuse me, yes, no, how are you)
- `body` — 8 body parts (head, hand, eye, ear, nose, mouth, heart, foot)
- `nature` — 8 words (sun, moon, water, fire, tree, flower, mountain, sea)
- `verbs` — 8 common verbs in present tense (to eat, to drink, to sleep, to walk, to speak, to read, to love, to know)

**Output format** — strictly valid JSON array. Each entry must match this TypeScript type exactly:
```ts
type VocabEntry = {
  id: string;           // format: "{category}-{n}" e.g. "numbers-1"
  category: string;     // one of the new category names above
  english: string;      // English word or short phrase
  standardArabic: string;   // Arabic script
  standardArabicTransliteration: string;  // simple Roman transliteration
  audio: string;        // leave as ""
  image: string;        // leave as ""
}
```

Provide ONLY the new entries (not the existing 36). I will append them to the existing file.

---

### Task 2 — Write chapter intro monologues

For each of the 5 chapters below, write Zafar's **opening monologue** — what he says the first time a player enters that chapter.

Rules:
- 3–4 sentences max
- In-character as Zafar: ancient, noble, dramatic, warm
- Must include at least one Arabic word (with transliteration in parentheses)
- Must reference the chapter's story theme
- End with a sentence that invites the player to learn the chapter's vocabulary

Chapters:
1. **The Desert Menagerie** — animals, the palace where the lamp was kept
2. **The Sorcerer's Family** — family words, Marid and his relatives who guard the curse
3. **The Feast Before the Curse** — food words, the last night Zafar was free
4. **The Colors of the Lamp** — colors, magical runes on the lamp that must be decoded
5. **The Kingdom of Al-Rashid** — places, the ancient city where everything happened

**Output format:**
```json
{
  "ch-1": "...",
  "ch-2": "...",
  "ch-3": "...",
  "ch-4": "...",
  "ch-5": "..."
}
```

---

### Task 3 — Design a second character concept

Arabeast will eventually have multiple characters beyond Zafar. Design one new character with the following output:

```json
{
  "name": "...",
  "nameArabic": "...",
  "archetype": "...",         // 2-3 words e.g. "mischievous desert fox"
  "backstory": "...",         // 2-3 sentences, fits the Arabian Nights tone
  "teachingRole": "...",      // what Arabic skill / topic this character specializes in (e.g. "verb conjugation", "numbers", "formal speech")
  "personality": "...",       // 2-3 adjectives
  "visualDescription": "..."  // 2-3 sentences describing how this character would look as a cartoon/SVG illustration
}
```

The character should:
- Fit the Arabian Nights / ancient Middle East aesthetic
- NOT be another Jinn — choose a different mythological or folkloric entity (desert spirit, ifrit, djinn of a different kind, talking animal, etc.)
- Have a distinct personality contrast to Zafar (who is noble/dramatic) — e.g. playful, sinister, scholarly, childlike

---

## Output instructions

Deliver all three tasks in a single response, clearly separated under `## Task 1`, `## Task 2`, `## Task 3` headings.

For Task 1, wrap the JSON in a fenced code block: ` ```json `.
For Task 2, wrap the JSON in a fenced code block: ` ```json `.
For Task 3, wrap the JSON in a fenced code block: ` ```json `.

Do not include explanations, commentary, or prose outside the headings and code blocks. The output will be copy-pasted directly into the codebase.
