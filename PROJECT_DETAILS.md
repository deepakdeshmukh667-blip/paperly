# PAPERLY — Project Specification & Technical Documentation

**Brand Name:** PAPERLY.  
**Official Tagline:** Stories, reimagined for the digital age.  
**Domain / Concept:** AI-Powered Personalised Digital Magazine Creation Platform.

---

## 1. Brand Identity & Design System

### 1.1 Brand Personality
- **Premium:** Evoking high-end luxury editorial magazines (*Kinfolk*, *Vogue*, *Cereal*, *Vanity Fair*).
- **Personal:** Built around the user's authentic voice, relationships, and memories.
- **Editorial:** Grounded in grid design, deliberate whitespace, and asymmetric balance.
- **Modern & Creative:** Dynamic canvas publishing directly in the browser.

### 1.2 Color Palette Tokens
| Token | Hex Value | Role |
| :--- | :--- | :--- |
| **Warm Ivory** | `#f6f0e4`, `#f4ede0` | Primary page & canvas background |
| **Deep Charcoal / Black** | `#0c0b0a`, `#000000` | Display headlines, borders & night contrast |
| **Subtle Burgundy** | `#6e1423` | Primary accent, rules & active states |
| **Warm Beige** | `#e3d5bd`, `#d9c9ad` | Muted accents, borders & supporting elements |
| **Muted Slate** | `#9b9082` | Secondary metadata & captions |

### 1.3 Typography
- **Display Headlines:** `Playfair Display` (Serif, weights 600, 700)
- **Prose, Quotes & Captions:** `Cormorant Garamond` (Serif, italic, weights 400, 600)
- **Body & Studio UI:** `Inter` (Sans-serif, weights 400, 500, 600)

---

## 2. System Architecture & File Structure

```
paperly/
├── index.html            # Landing page with interactive 3D scrollbook & template collection
├── studio.html           # Full desktop publishing canvas & AI writer studio
├── server.js             # High-speed zero-dependency Node.js HTTP server
├── package.json          # Node.js project manifest & scripts
├── .gitignore            # Git exclusion rules
├── README.md             # Project overview & quickstart guide
├── PROJECT_DETAILS.md    # Complete technical specifications (this document)
├── css/
│   └── paperly.css       # Design tokens, modal backdrops, badges & print styles
└── js/
    ├── gemini.js         # Google Gemini 2.5 Flash API client & offline fallbacks
    └── templates-data.js # Starter editions & reusable page layout presets
```

---

## 3. Core Modules & Functionality

### 3.1 Marketing Landing Page (`index.html`)
- **Hero Display:** Asymmetric tilted covers (*Two of Us*, *Forever Sisters*) and open spreads.
- **3D Scrollbook:** Scroll-driven physics engine (`<section data-scrollbook="true">`) turning pages with realistic 3D perspective transforms (`translateZ`, `rotateY`).
- **Signature Category Collection:**
  - *Best Friend Edition*
  - *Birthday Edition*
  - *Couple Edition*
  - *Anniversary Edition*
  - *Travel Edition*
  - *Fashion Edition*
  Every category card routes directly into `studio.html?template=<category>` with that edition pre-loaded.
- **AI Transformation Box:** Interactive before/after widget illustrating how informal notes are turned into publication-ready copy.

### 3.2 Magazine Studio (`studio.html`)
- **Document Engine:** 540px × 720px portrait magazine pages (3:4 ratio) with smooth CSS scaling.
- **State Management & Undo Stack:** Reactive state `S` with 60-step Undo (`Ctrl+Z`) and Redo (`Ctrl+Shift+Z`) stack, auto-saving to `localStorage`.
- **Canvas Interactions:**
  - Drag-and-drop element repositioning.
  - Corner handle (`.hd`) resizing with aspect ratio support.
  - Double-click text inline editing (`contentEditable`).
  - Alignment guides toggle.
  - Layer arrangement (*Bring Forward*, *Send Back*).
- **Thumbnail Management:** Reorder pages with HTML5 drag-and-drop, add blank pages, duplicate, or delete.
- **Publishing & Persistence:**
  - **Export PDF:** Print-ready vector stylesheet (`@page { size: 540px 720px; margin: 0; }`).
  - **Save Project File:** Export complete magazine as `.paperly.json`.
  - **Load Project File:** Import `.paperly.json` to resume editing anytime.
  - **Fullscreen Preview:** High-resolution presentation mode.

---

## 4. Google Gemini AI Engine (`js/gemini.js`)

### 4.1 Model & Configuration
- **Model:** `gemini-2.5-flash` via Google Generative Language REST API (`v1beta`).
- **Client Security:** API key stored securely in user's browser `localStorage` (`paperly_gemini_api_key`).
- **Offline Resilience:** Curated fallback library ensures the studio never breaks when offline or before a key is configured.

### 4.2 Editorial System Instructions
Tailored system prompts instruct Gemini to write with tactile detail, cadence, and restraint, avoiding generic AI tropes.

### 4.3 Tones & Content Types
- **Tones:** *Emotional*, *Cute*, *Funny*, *Deep*, *Meaningful*, *Luxury Editorial*.
- **Content Types:** *Headline*, *Caption*, *Story*, *Wish*, *Dedication*.
- **Refinement Actions:** *Rewrite*, *More Emotional*, *Shorten*, *Expand Story*, *Another Variation*.
- **Multimodal Gemini Vision:** Inspects uploaded photographs (`inline_data` base64) to generate authentic captions matching visual context.

---

## 5. Starter Editions Library (`js/templates-data.js`)

1. **Forever Sisters (Best Friend):** Friendship origin stories, memory highlights, inside jokes ranked, and heartfelt dedications.
2. **The Birthday Issue (Birthday):** Milestone spreads, 30 reasons we love you, celebration photos, and birthday blessings.
3. **Two of Us (Couple):** How we met, coffee dates, ordinary afternoons, and love letter spreads.
4. **Ten Years, Retold (Anniversary):** A decade of milestones, ticket stubs, ticket timelines, and anniversary vows.
5. **Lisbon After Dark (Travel):** Cobblestone streets, tram journeys, Alfama balconies, and travel quotes.
6. **The Unhurried Season (Fashion / Style):** Minimalist editorial, linen textures, lookbook notes, and colophon.

---

## 6. How to Run Locally

### Option A: Direct Node Server (Recommended)
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: npm Scripts
```bash
npm start
```

### Option C: Direct Browser
Open `index.html` or `studio.html` directly in any modern browser.

---

## 7. License & Rights
© 2026 PAPERLY. All rights reserved.
Stories, reimagined for the digital age.

