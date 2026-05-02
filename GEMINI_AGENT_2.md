# Arabeast — Gemini Agent Brief #2: Second Character (Qamar)

You previously designed a character called Qamar in `data/character-qamar.json`. Now build her out fully so a developer can integrate her into the app.

---

## Context

The app already has **Zafar** — an ancient Jinn, noble and dramatic, trapped in a lamp for 1,000 years. He teaches vocabulary through conversation and story chapters. His system prompt is:

```
You are Zafar, an ancient Jinn sealed inside an oil lamp for 1,000 years by a jealous sorcerer named Marid...
```

Qamar is the **second character**. She will teach a different set of topics (verbs, greetings, numbers, body parts, nature) and have a distinct personality contrast to Zafar.

---

## Your four deliverables

### Deliverable 1 — Qamar's full system prompt

Write Qamar's complete system prompt (like Zafar's above) for the Gemini API. It must:
- Establish her name, origin, personality, and backstory in 1–2 paragraphs
- Define her teaching style (what she emphasizes, how she corrects mistakes)
- Include the same JSON response format Zafar uses:
  ```json
  {
    "arabic": "...",
    "transliteration": "...",
    "reply": "...",
    "emotion": "idle | talking | happy | sad"
  }
  ```
- Keep responses SHORT — 2–4 sentences, game character not textbook
- She should speak primarily in Arabic (MSA) but explain in the player's language

---

### Deliverable 2 — Qamar's 5 chapters

Design 5 story chapters for Qamar, covering these vocab categories in order:
1. `numbers` — 1 through 10
2. `greetings` — common phrases
3. `body` — body parts
4. `nature` — sun, moon, water, fire, tree, etc.
5. `verbs` — common present-tense verbs

For each chapter provide:
```json
{
  "id": "qamar-ch-1",
  "number": 1,
  "title": "...",
  "titleArabic": "...",
  "subtitle": "...",
  "category": "numbers",
  "icon": "...",
  "color": "#hex",
  "xpRequired": 500,
  "storyContext": "...",
  "characterId": "qamar",
  "openingMonologue": "..."
}
```

- `xpRequired` should gate Qamar's chapters after Zafar's (Zafar's last chapter requires 350 XP, so start Qamar at 500 and increment by 150)
- `storyContext` = 2–3 sentences injected into her system prompt when the chapter is active
- `openingMonologue` = what Qamar says the first time the player enters this chapter (3–4 sentences, in character, ends with an invitation to learn the vocab)

---

### Deliverable 3 — Qamar's visual spec

Describe Qamar visually in enough detail for a developer to build her as an SVG illustration (same style as Zafar — flat cartoon, Arabian Nights aesthetic, ~260×390px viewBox).

Provide:
```json
{
  "bodyShape": "...",
  "skinTone": "#hex",
  "primaryColor": "#hex",
  "accentColor": "#hex",
  "hair": "...",
  "clothing": "...",
  "distinguishingFeatures": "...",
  "idleAnimation": "...",
  "talkingAnimation": "...",
  "happyAnimation": "...",
  "sadAnimation": "..."
}
```

---

### Deliverable 4 — Qamar's vocab additions

The current vocab file has entries for `numbers`, `greetings`, `body`, `nature`, `verbs` added from Brief #1. Review and add any missing words to reach at least 8 entries per category. Output only the **missing** entries (ones not already in the list below).

Already existing entries per category:
- **numbers**: One through Ten (10 entries) — complete
- **greetings**: Hello, Goodbye, Thank you, Please, Excuse me, Yes, No, How are you (8 entries) — complete  
- **body**: Head, Hand, Eye, Ear, Nose, Mouth, Heart, Foot (8 entries) — complete
- **nature**: Sun, Moon, Water, Fire, Tree, Flower, Mountain, Sea (8 entries) — complete
- **verbs**: To eat, To drink, To sleep, To walk, To speak, To read, To love, To know (8 entries) — complete

If all categories already have 8+ entries, output `[]` for this deliverable.

---

## Output format

Deliver all four under `## Deliverable 1`, `## Deliverable 2`, `## Deliverable 3`, `## Deliverable 4` headings.

Wrap each JSON in fenced code blocks. No prose outside the headings and code blocks.
