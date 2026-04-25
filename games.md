# Arabeast — Games

A collection of game concepts for the app. Each game is a self-contained experience with its own story, mechanics, and vocab focus. The plan is to ship them progressively — potentially tied to user level or unlocked as the player advances.

---

## 1. The Jinn's Curse ⭐ (In Development)

**Status:** Active development

**Concept:**
You find an old lamp. A Jinn appears — but he's been cursed by a sorcerer and can only speak in Arabic. To understand him, you must learn the language. As you unlock words, his story unfolds: he was once a powerful spirit, betrayed, sealed away for centuries.

**Story hook:** The Jinn is a persistent animated companion who reacts to your answers — celebrates when you win, sulks when you fail. The addiction loop is wanting to know what happens to him next.

**Gameplay loop:**
- Each vocab theme (animals, emotions, people, places, actions) = a new chapter of the Jinn's backstory
- Correct answers = the Jinn speaks more, reveals more of his story
- Wrong answers = lose hearts, the Jinn looks frustrated/sad
- Complete a chapter = animated cutscene / story reveal moment

**Vocab progression:** Themes unlock sequentially as the story advances

### Conversation Partner Feature (Coming in Phase 1–3)

The Jinn doesn't just react to quiz answers — he holds real Arabic conversations with the player. This is the core differentiator from Duolingo.

**How it works:**
1. After a quiz round (or at any point), the player can tap a mic button
2. They speak Arabic (a word, a phrase, or a full sentence)
3. Whisper (Transformers.js, runs in-browser — free) transcribes the audio
4. The transcript is sent to the Jinn API (`/api/jinn`) powered by Gemini
5. The Jinn responds in-character: corrects pronunciation gently, praises good attempts, continues the curse narrative

**Language support:**
- Players can ask questions or say things in **English** or **Hebrew** (selected in settings)
- The Jinn replies in Arabic first, then provides a translation/explanation in the player's native language
- Grammar questions in English/Hebrew get answered clearly, still in the Jinn's voice

**Example exchange:**
> Player (speaks): "أسد" *(lion)*
> Jinn: "نعم! أسد — you remember! The sorcerer who cursed me once rode a lion into battle… (Hebrew: כן, זוכר את המילה! האריה — הוא מבין אותך.)"

**Jinn personality in conversation:**
- Speaks mainly in MSA Arabic with transliteration shown
- Emotionally reactive: happy when the player speaks well, frustrated when they give up
- Weaves the curse narrative into every exchange — each conversation is also a story beat
- Never breaks character, but gracefully switches to the player's native language when needed

**Technical implementation:**
- `POST /api/jinn` — Gemini 2.5 Flash-Lite (free tier during dev, ~$0.10/MTok input in prod)
- Gemini Native Audio Live API under evaluation as a single-call alternative (audio in → response out, no separate Whisper step)
- Conversation history stored per session; persisted to Railway DB in Phase 2
- System prompt includes: Jinn backstory, player's current chapter progress, native language preference, recently learned words

---

## 2. Caravan to Baghdad

**Status:** Planned

**Concept:**
You're a young merchant's apprentice in medieval Arabia. Your goal: reach Baghdad and the legendary House of Wisdom. At each stop — desert camps, oases, souks, cities — NPCs speak only Arabic. Learning their words = earning their trust = unlocking the next leg of the journey.

**Story hook:** A mystery about what's really hidden inside the House of Wisdom, revealed piece by piece as you travel.

**Gameplay loop:**
- A visual map that progresses as you advance
- Each location has a set of vocab to learn before you can move on
- Wrong answers = you get lost, robbed, or turned away
- Correct answers = collect items, gold, story fragments

**Vocab progression:** Tied to location themes (souk = commerce words, desert = nature/survival, city = people/society)

---

## 3. Word Beast Hunter

**Status:** Planned

**Concept:**
Arabia is overrun with mythical creatures from Arab folklore — Jinn, Ghoul, Roc, Marid, Ifrit. Each creature is defeated not by weapons, but by knowing Arabic words. Win = the beast becomes your companion. Lose = it escapes to a harder dungeon.

**Story hook:** A growing bestiary of Arab folklore creatures, each with lore and a personality. You're building a team.

**Gameplay loop:**
- Walk a stylized world map, encounter beasts
- Battle = vocabulary challenge (creature-themed words)
- Defeated beasts join your party and follow you
- Harder creatures require more advanced vocabulary

**Vocab progression:** Creature-themed word sets, increasing difficulty

---

## 4. 1001 Nights — You Are Scheherazade

**Status:** Planned

**Concept:**
The Sultan will execute you at dawn unless your story holds his attention. Each night you tell a tale — and the tale only continues if you answer correctly. Across 1001 nights, the Sultan himself slowly changes — you're not just surviving, you're transforming him.

**Story hook:** Two parallel stories: the tale-within-a-tale vocab challenge, and the overarching story of the Sultan's transformation.

**Gameplay loop:**
- Each "night" = a story session with a vocab theme
- Wrong answers = Sultan loses interest, you lose a night (life)
- Complete a story arc = illustrated panel unlock
- 1001 nights = the full game arc across many sessions

**Vocab progression:** Each tale covers a different category (animals, travel, emotions, food, family)

---

## Progression Notes

- Games may be tied to player level: unlock Caravan to Baghdad after finishing Jinn's Curse, etc.
- Each game could cover different MSA difficulty tiers
- A unified XP and level system could span all games
- The conversation partner feature (Phase 1–3) is shared infrastructure — all games can use it
