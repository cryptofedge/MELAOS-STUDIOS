# MELAOS STUDIOS — Google Play drafts

App: **MELAOS STUDIOS** · package `com.melaosstudios.app` · developer account **FEDGE 2.O** (personal)
Play Console app id: 4975526294644040752

Graphics in this folder:

| Asset | File | Spec |
|---|---|---|
| App icon | `play-icon-512.png` | 512×512, 32-bit PNG, < 1 MB |
| Feature graphic | `feature-graphic-1024x500.png` | 1024×500, no alpha |
| Phone screenshots | `screenshots/01-home.png` … `04-library.png` | 1080×1920 (9:16) |

`screenshots/unused-05-pricing.png` is left out on purpose: the pricing page offers Pro/Premier plans that cannot be bought yet. Selling digital subscriptions inside the Android app will require Google Play Billing.

---

## Store listing — Español (Latinoamérica), es-419 (default)

**App name (30):** MELAOS STUDIOS

**Short description (80):**
Crea canciones con IA: describe tu idea y escucha tu tema con letra y portada.

**Full description (4000):**

MELAOS STUDIOS es un estudio de música con inteligencia artificial. Describe la canción que tienes en mente y la app la crea: música, voz, letra y portada.

Cómo funciona
• Describe tu idea con tus palabras o díctala con el micrófono.
• Elige género, mood, BPM, tipo de voz e idioma de la letra.
• Melao escribe la letra a partir de tu descripción, o escribe la tuya.
• Escucha tu canción, ajusta la mezcla con el ecualizador y descárgala.
• Crea una portada con IA, con o sin una imagen de referencia.

Hecho para los ritmos latinos
Dembow, bachata, merengue, típico, salsa, reggaetón, cumbia y latin trap, además de hip-hop, trap, drill, R&B, soul, pop, electrónica, afrobeats y reggae.

Habla con Melao
Melao, el asistente del estudio, te ayuda con ideas, géneros y producción, en español o en inglés.

Bueno saber
• Por ahora, cada canción dura hasta 50 segundos.
• Necesitas conexión a internet.
• Todo lo que crea la IA tiene un botón «Reportar» para avisarnos si algo es ofensivo o inapropiado.
• No necesitas crear una cuenta.

MELAOS STUDIOS es una marca de Eclat Universe. Donde el Sonido Encuentra el Alma.

---

## Store listing — English (United States), en-US (translation)

**App name (30):** MELAOS STUDIOS

**Short description (80):**
Make songs with AI: describe your idea and hear your track with lyrics and art.

**Full description (4000):**

MELAOS STUDIOS is an AI music studio. Describe the song you have in mind and the app makes it: music, vocals, lyrics and cover art.

How it works
• Describe your idea in your own words, or dictate it with the microphone.
• Pick the genre, mood, BPM, vocal type and lyrics language.
• Melao writes the lyrics from your description, or you write your own.
• Play your song, shape the mix with the equalizer and download it.
• Create AI cover art, with or without a reference image.

Built for Latin rhythms
Dembow, bachata, merengue, típico, salsa, reggaeton, cumbia and Latin trap, plus hip-hop, trap, drill, R&B, soul, pop, electronic, afrobeats and reggae.

Talk to Melao
Melao, the studio assistant, helps with ideas, genres and production, in Spanish or English.

Good to know
• For now, each song is up to 50 seconds long.
• An internet connection is required.
• Everything the AI creates has a "Report" button so you can tell us if something is offensive or inappropriate.
• No account needed.

MELAOS STUDIOS is an Eclat Universe brand. Where Sound Meets Soul.

---

## Store settings (draft)

- App category: **Music & Audio**
- Tags: Music creation, AI (pick from Play's list)
- Contact email: **cryptofedge@gmail.com** (same as the privacy page)
- Website: https://melaosstudios.com
- Privacy policy: **https://melaosstudios.com/privacy** (live only after you deploy)

---

## App content — draft answers

These are drafts for you to review. Each form is submitted in Play Console and becomes part of what Google reviews, so check every answer against how the app works today.

### Privacy policy
https://melaosstudios.com/privacy — operator Rafael Rodriguez Jr., contact cryptofedge@gmail.com (set in `apps/web/src/app/privacy/page.tsx`).

### App access
"All functionality in my app is available without any access restrictions." (No login is required; the sign-in screen is a preview that does nothing.)

### Ads
"No, my app does not contain ads."

### Content rating (IARC questionnaire)
- Category: **All other app types** (it is not a game, social network or news app).
- Violence, fear, sexuality, gambling, controlled substances, crude humour: **No**.
- Language / profanity: the AI writes lyrics from what the user asks for, so explicit words are possible. Answer honestly; if you say yes to mild language, expect **Teen / PEGI 12**.
- Users interact or exchange content with each other: **No** (there is no sharing between users today).
- Shares the user's location: **No**.
- Digital purchases: **No** (nothing can be bought yet).
- Generative AI content: **Yes** — songs, lyrics, cover art and chat replies, with in-app reporting.

### Target audience and content
- Recommended: **18 and over** only. Generative AI can produce mature lyrics, and any age under 13 brings the Families policy and its extra requirements. You can widen it later (13–17) once you are comfortable with the content filters.
- Appeals to children: **No**.

### Data safety
- Does the app collect or share required user data types? **Yes.**
- Is all collected data encrypted in transit? **Yes** (HTTPS only).
- Do you provide a way to request deletion? **Yes** — by email to the contact address (there are no accounts, so no account-deletion URL is needed).

| Data type (Play's names) | Collected | Shared* | Ephemeral | Required? | Purpose |
|---|---|---|---|---|---|
| App activity → Other user-generated content (song descriptions, lyrics, cover-art descriptions, Melao chat messages, content reports) | Yes | No | No | Required to use AI features | App functionality |
| Photos and videos → Photos (optional reference image for cover art) | Yes | No | No | Optional | App functionality |

\* Under Play's definitions, sending data to a service provider that processes it on your behalf (Replicate, Google Gemini API, Render, your Discord/Slack report channel) is **not** "sharing".

Not declared, with the reason (re-check before submitting):
- **Audio / voice:** dictation uses the browser's built-in speech recognition (Chrome sends audio to Google). The app itself never receives audio, only text.
- **IP address:** used only in server memory for rate limits, never stored by the app; your host (Render) keeps standard request logs.
- **Name, email, account info, location, contacts, financial info, device IDs:** not collected.

If you add real accounts, payments or analytics, update the privacy page and this form together.

### Other declarations
- Government app: No · Financial features: None · Health: No · News: No.
- Generative AI: the app generates songs, lyrics, images and chat replies with AI and offers in-app reporting (Report button on each).

---

## Release status

- Internal testing: release **2 (1.0.1)** uploaded as a **draft** (not rolled out). Version 1 (1.0.0) was replaced because its launcher icon was too big; version code 1 is used up. Add testers (an email list) and roll it out when ready.
- Production needs a **closed test with at least 12 testers opted in for 14 continuous days** first (personal developer account), then "Apply for production" on the Dashboard.
