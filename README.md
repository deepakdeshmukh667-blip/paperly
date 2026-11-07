# PAPERLY. — Stories, reimagined for the digital age.

An AI-powered personalised digital magazine creation platform. Customers can upload their photographs, share personal memories, and transform them into beautifully designed digital magazines.

---

## ✦ Brand Identity & Visual Palette
- **Brand Name:** PAPERLY.
- **Official Tagline:** Stories, reimagined for the digital age.
- **Palette:**
  - Primary: Warm Ivory (`#f6f0e4`, `#f4ede0`), Deep Charcoal/Black (`#0c0b0a`)
  - Accents: Subtle Burgundy (`#6e1423`), Warm Beige (`#e3d5bd`)
- **Typography:**
  - Display Headlines: `Playfair Display`
  - Editorial Quotes & Prose: `Cormorant Garamond`
  - Body & UI: `Inter`

---

## ✦ Project Structure

```
paperly/
├── index.html            # Landing page (hero, mockups, collection, AI demo, workflow)
├── studio.html           # Full interactive digital magazine creation studio
├── css/
│   └── paperly.css       # Brand design tokens, modals, badges, toasts & print styles
├── js/
│   ├── gemini.js         # Google Gemini API client (gemini-2.5-flash) & offline engine
│   └── templates-data.js # Starter editions & reusable editorial page blocks
└── package.json          # Project configuration & npm start script
```

---

## ✦ Features & Capabilities

### 1. Landing Page (`index.html`)
- **Asymmetric Magazine Mockups:** High-definition CSS/SVG covers and spreads.
- **Direct Studio Routing:** Category cards (*Best Friend*, *Birthday*, *Couple*, *Anniversary*, *Travel*, *Fashion*) load directly into the Studio with pre-populated multi-page editions.
- **Interactive AI Transformation Demo:** Live before/after quote box showcasing raw notes transformed into editorial prose.
- **Responsive Navigation:** Desktop navbar and full-screen animated mobile drawer.

### 2. Magazine Studio (`studio.html`)
- **Document Management:** Page thumbnails with drag-and-drop reordering, add/duplicate/delete page operations.
- **WYSIWYG Editorial Canvas:** Drag-to-move, bottom-right resize handles, double-click inline text editing (`contentEditable`), and alignment guides.
- **Design Inspector:** Typography controls (font family, size, tracking, weight, alignment, italics), color pickers, layer ordering (bring forward / send back), and photo uploads.
- **Google Gemini AI Writer:**
  - **Styles:** *Emotional*, *Cute*, *Funny*, *Deep*, *Meaningful*, *Luxury Editorial*.
  - **Formats:** *Headline*, *Caption*, *Story*, *Wish*, *Dedication*.
  - **Refinements:** *Rewrite*, *Make More Emotional*, *Shorten*, *Expand Story*, *Another Variation*.
  - **Multimodal Vision:** Generates captions directly by analyzing uploaded photos.
  - **API Key Manager:** Safe client-side storage in `localStorage` with connection testing.
  - **Offline Resilience:** High-quality editorial fallbacks ensure the studio always functions even without an API key.
- **Export & Presentation:**
  - **Preview:** Fullscreen presentation mode.
  - **Export PDF:** Vector print stylesheet (`@media print`) configured for standard 540×720 magazine aspect ratio.
  - **Project Save/Load:** Download and upload `.paperly.json` project files to local disk.

---

## ✦ Getting Started

You can run PAPERLY directly in any modern browser:

1. **Direct file opening:** Double click `index.html` or `studio.html` to open in Google Chrome, Edge, or Safari.
2. **Local development server:**
   ```bash
   npm start
   ```
   Or using Python:
   ```bash
   python -m http.server 3000
   ```
   Then open `http://localhost:3000` in your browser.

