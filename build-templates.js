const fs = require('fs');
const path = require('path');

const THEMES = {
  'classic-ivory': {
    id: 'classic-ivory',
    name: 'Classic Ivory & Ink',
    bg: '#f4ede0',
    surface: '#ffffff',
    textPrimary: '#0c0b0a',
    textSecondary: '#4a4237',
    accent: '#6e1423',
    fontHeadline: 'Playfair Display',
    fontBody: 'Inter',
    fontQuote: 'Cormorant Garamond'
  },
  'ink-noir': {
    id: 'ink-noir',
    name: 'Ink Noir & Ivory',
    bg: '#0c0b0a',
    surface: '#181412',
    textPrimary: '#f6f0e4',
    textSecondary: '#c4b59f',
    accent: '#c94d63',
    fontHeadline: 'Playfair Display',
    fontBody: 'Inter',
    fontQuote: 'Cormorant Garamond'
  },
  'minimalist-linen': {
    id: 'minimalist-linen',
    name: 'Minimalist Linen',
    bg: '#f7f4ee',
    surface: '#ffffff',
    textPrimary: '#1a1815',
    textSecondary: '#524b42',
    accent: '#4a2c20',
    fontHeadline: 'Playfair Display',
    fontBody: 'Inter',
    fontQuote: 'Cormorant Garamond'
  },
  'romantic-rose': {
    id: 'romantic-rose',
    name: 'Romantic Monograph',
    bg: '#faf3ed',
    surface: '#ffffff',
    textPrimary: '#1e1416',
    textSecondary: '#5e4348',
    accent: '#7d1d2e',
    fontHeadline: 'Playfair Display',
    fontBody: 'Inter',
    fontQuote: 'Cormorant Garamond'
  },
  'editorial-monochrome': {
    id: 'editorial-monochrome',
    name: 'Editorial Monochrome',
    bg: '#121212',
    surface: '#1f1f1f',
    textPrimary: '#fbfbfb',
    textSecondary: '#b8b8b8',
    accent: '#ffffff',
    fontHeadline: 'Playfair Display',
    fontBody: 'Inter',
    fontQuote: 'Cormorant Garamond'
  }
};

let uid = 5000;
const elem = (t, x, y, w, h, o = {}) => ({
  id: uid++,
  t,
  x,
  y,
  w,
  h,
  font: "Playfair Display",
  size: 20,
  color: "#1b1714",
  align: "left",
  weight: 400,
  italic: false,
  sp: 0,
  text: "",
  ...o
});

const imgSlot = (src, id) => ({
  src,
  bg: `url("${src}")`,
  type: 'stock',
  fit: 'cover',
  position: 'center',
  imageId: id || `stock_${Date.now()}_${Math.random().toString(36).substr(2,4)}`
});

// Helper to build 4 magazine pages matching theme and layout
function buildMagazinePages(title, subtitle, tag, theme, photos, storyText, quoteText) {
  const t = THEMES[theme] || THEMES['classic-ivory'];
  return [
    // Page 1: Masthead Cover
    {
      bg: t.bg,
      els: [
        elem("img", 36, 130, 468, 430, imgSlot(photos[0], `${title}_p1_hero`)),
        elem("text", 36, 40, 468, 62, { text: title, size: title.length > 24 ? 30 : 38, font: t.fontHeadline, weight: 700, color: t.textPrimary, align: "center", sp: 1 }),
        elem("text", 36, 104, 468, 18, { text: `${tag.toUpperCase()} EDITION · VOL. 2026`, size: 10, font: t.fontBody, color: t.accent, align: "center", sp: 5, weight: 600 }),
        elem("text", 40, 580, 460, 46, { text: subtitle, size: 13, font: t.fontQuote, italic: true, color: t.textPrimary, align: "center" }),
        elem("line", 210, 636, 120, 1, { color: t.accent }),
        elem("text", 36, 652, 468, 20, { text: "PAPERLY EDITORIAL MONOGRAPH", size: 9, font: t.fontBody, sp: 4, color: t.textSecondary, align: "center" })
      ]
    },
    // Page 2: Feature Spread with Two-Column Story & Photos
    {
      bg: t.bg === '#0c0b0a' ? '#181412' : '#fcfaf6',
      els: [
        elem("text", 36, 36, 468, 18, { text: `${tag.toUpperCase()} · DISPATCH`, size: 10, font: t.fontBody, sp: 5, color: t.accent, weight: 600 }),
        elem("text", 36, 56, 468, 54, { text: subtitle, size: 26, font: t.fontHeadline, weight: 700, color: t.textPrimary }),
        elem("line", 36, 122, 60, 2, { color: t.accent }),
        elem("img", 36, 145, 260, 270, imgSlot(photos[1] || photos[0], `${title}_p2_img1`)),
        elem("text", 315, 145, 190, 20, { text: "THE CHRONICLE", size: 9, font: t.fontBody, sp: 3, color: t.textSecondary, weight: 600 }),
        elem("text", 315, 175, 190, 240, { text: storyText, size: 12, font: t.fontBody, color: t.textPrimary, lineHeight: 1.55 }),
        elem("img", 36, 435, 160, 245, imgSlot(photos[2] || photos[0], `${title}_p2_img2`)),
        elem("text", 216, 455, 290, 210, { text: `“${quoteText}”`, size: 22, italic: true, font: t.fontQuote, color: t.accent, lineHeight: 1.35 })
      ]
    },
    // Page 3: Visual Showcase / Gallery
    {
      bg: t.bg,
      els: [
        elem("text", 36, 36, 468, 18, { text: "PHOTO ARCHIVE", size: 10, font: t.fontBody, sp: 4, color: t.accent, weight: 600 }),
        elem("text", 36, 58, 468, 44, { text: "Moments in Negative Space", size: 24, font: t.fontHeadline, weight: 700, color: t.textPrimary }),
        elem("img", 36, 120, 224, 280, imgSlot(photos[2] || photos[0], `${title}_p3_img1`)),
        elem("img", 280, 120, 224, 280, imgSlot(photos[3] || photos[1] || photos[0], `${title}_p3_img2`)),
        elem("img", 36, 420, 468, 220, imgSlot(photos[0], `${title}_p3_hero`)),
        elem("text", 36, 655, 468, 22, { text: "Curated frames. Handcrafted layout.", size: 11, font: t.fontBody, color: t.textSecondary, align: "center" })
      ]
    },
    // Page 4: Dedication & Back Cover
    {
      bg: t.bg === '#0c0b0a' ? '#0c0b0a' : '#eae1d2',
      els: [
        elem("text", 60, 180, 420, 30, { text: "DEDICATION", size: 11, font: t.fontBody, sp: 6, align: "center", color: t.accent, weight: 700 }),
        elem("line", 240, 225, 60, 2, { color: t.accent }),
        elem("text", 60, 260, 420, 200, { text: `“To the days that taught us how to slow down, and the people who made ordinary hours feel golden.”`, size: 28, italic: true, align: "center", font: t.fontQuote, color: t.textPrimary, lineHeight: 1.4 }),
        elem("text", 60, 560, 420, 30, { text: "PUBLISHED WITH PAPERLY.", size: 11, align: "center", font: t.fontBody, sp: 4, color: t.accent, weight: 600 }),
        elem("text", 60, 595, 420, 20, { text: "Stories, reimagined for the digital age.", size: 10, align: "center", font: t.fontQuote, italic: true, color: t.textSecondary })
      ]
    }
  ];
}

// 30 Comprehensive Original Templates Across 10 Categories
const TEMPLATES_RAW = [
  // 1. Fashion (3)
  {
    id: "the-unhurried-season",
    name: "The Unhurried Season",
    category: "Fashion",
    tags: ["High Fashion", "Runway", "Minimalist", "Vogue"],
    mood: "Sophisticated",
    theme: "classic-ivory",
    photos: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "A Study in Silhouette and Leisure",
    description: "Curated high-fashion editorial exploring timeless drapery, natural fibers, and negative space.",
    story: "Elegance is rarely about excess; it is the discipline of knowing precisely what to leave out. In this collection, linen meets stone, and sunlight reveals the quiet artistry of tailored form.",
    quote: "True style requires neither haste nor noise."
  },
  {
    id: "atelier-noir",
    name: "Atelier Noir",
    category: "Fashion",
    tags: ["Haute Couture", "Monochrome", "Edgy", "Avant-Garde"],
    mood: "Bold Avant-Garde",
    theme: "ink-noir",
    photos: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Darkness as a Sculptural Medium",
    description: "Dramatic haute couture editorial with midnight textures, obsidian tones, and sharp architectural cuts.",
    story: "In black, garments speak through contour and shadow. The eye is no longer distracted by surface hues; it is drawn to the intention behind every stitch.",
    quote: "Black is not absence; it is pure focus."
  },
  {
    id: "silk-and-solitude",
    name: "Silk & Solitude",
    category: "Fashion",
    tags: ["Lookbook", "Warm Hues", "Gentle", "Resort"],
    mood: "Minimalist",
    theme: "minimalist-linen",
    photos: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Breathable Silhouettes for Unhurried Days",
    description: "Sun-drenched resort wear captured in earthen ceramic courtyards and warm seaside breezes.",
    story: "We designed these pages for clothes that move like morning air. No rigid stays, no harsh lines—just natural silk falling across afternoon light.",
    quote: "Comfort is the ultimate luxury."
  },

  // 2. Travel (3)
  {
    id: "lisbon-after-dark",
    name: "Lisbon After Dark",
    category: "Travel",
    tags: ["Night Walk", "Portugal", "Trams", "Old Town"],
    mood: "Nocturnal & Atmospheric",
    theme: "ink-noir",
    photos: [
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1513688190325-2474d2a29743?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Yellow Trams, Tiled Facades & Midnight Fado",
    description: "A sensory exploration of cobblestones, hilltop viewpoints, and wine shared long after the city fell asleep.",
    story: "Lisbon rewards those who walk without maps. Turn a corner in Alfama and the air smells of roasted chestnuts and sea salt; three streets over, guitar strings echo off glazed ceramic tiles.",
    quote: "A city best understood by starlight."
  },
  {
    id: "mediterranean-light",
    name: "Mediterranean Light",
    category: "Travel",
    tags: ["Greece", "Coast", "Summer", "Islands"],
    mood: "Sun-drenched & Warm",
    theme: "classic-ivory",
    photos: [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Limestone Cliffs and Turquoise Tides",
    description: "Sun-bleached terraces, olive groves, and afternoon swims across the Aegean archipelago.",
    story: "The noon heat in the islands makes everything quiet. Only the cicadas speak, while fishing boats rock against harbor walls worn smooth by four hundred summers.",
    quote: "Salt in the hair, peace in the mind."
  },
  {
    id: "highland-odyssey",
    name: "Highland Odyssey",
    category: "Travel",
    tags: ["Scotland", "Misty Peaks", "Roadtrip", "Cabins"],
    mood: "Rustic & Moody",
    theme: "minimalist-linen",
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Fog, Ferns, and the Open Glen",
    description: "An evocative road expedition across rolling moorland, lochs, and stone hearths.",
    story: "The highlands do not ask you to hurry. Rain rolls across the valley in gentle grey curtains, turning every peat stream into dark tea. By dusk, the woodsmoke begins to rise.",
    quote: "Wilderness is where we find ourselves."
  },

  // 3. Lifestyle (3)
  {
    id: "kinfolk-living",
    name: "Kinfolk Living",
    category: "Lifestyle",
    tags: ["Slow Living", "Organic", "Design", "Simplicity"],
    mood: "Serene & Organic",
    theme: "minimalist-linen",
    photos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "The Deliberate Beauty of Natural Space",
    description: "Architectural tranquility, warm oak textures, and thoughtful everyday living.",
    story: "Living deliberately begins with our surroundings. When rooms are uncluttered and lit by natural daylight, our thoughts have room to breathe and settle.",
    quote: "Simplicity is the keynote of all true elegance."
  },
  {
    id: "morning-rituals",
    name: "Morning Rituals",
    category: "Lifestyle",
    tags: ["Coffee", "Dawn", "Mindfulness", "Home"],
    mood: "Intimate & Peaceful",
    theme: "classic-ivory",
    photos: [
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "The Quiet Hour Before the World Wakes",
    description: "Brewing pour-over coffee, opening windows to cool air, and journaling before alarms sound.",
    story: "The first hour of morning belongs to you alone. The kettle steams, the street below is silent, and for a few unhurried minutes, there are no obligations.",
    quote: "Own your mornings, own your peace."
  },
  {
    id: "the-nordic-home",
    name: "The Nordic Home",
    category: "Lifestyle",
    tags: ["Scandi", "Architecture", "Minimal", "Interior"],
    mood: "Architectural Clean",
    theme: "editorial-monochrome",
    photos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Form, Function & Scandinavian Warmth",
    description: "Clean geometric lines, pale birch woods, and generous floor-to-ceiling window light.",
    story: "Scandinavian design proved that modernism does not have to be cold. By celebrating natural grain and honest craft, a home becomes a sanctuary against the winter chill.",
    quote: "A well-built chair changes how you sit."
  },

  // 4. Wedding (3)
  {
    id: "two-of-us-forever",
    name: "Two of Us, Forever",
    category: "Wedding",
    tags: ["Love Story", "Ceremony", "Vows", "Portraits"],
    mood: "Romantic & Timeless",
    theme: "romantic-rose",
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "From First Glances to Forever Promises",
    description: "An elegant wedding monograph documenting vows, delicate lace details, and first dances.",
    story: "We stood beneath the cedar trees and promised to choose each other on ordinary Tuesdays as gladly as we did today. To look back at these photographs is to remember that love is both an anchor and a voyage.",
    quote: "Two paths, one quiet horizon."
  },
  {
    id: "the-vow-monograph",
    name: "The Vow Monograph",
    category: "Wedding",
    tags: ["Monograph", "Classic", "Calligraphy", "Elegance"],
    mood: "Reverent & Emotional",
    theme: "classic-ivory",
    photos: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Words Spoken Before Friends and Family",
    description: "High-contrast editorial wedding album focusing on candid emotions, speeches, and tears of joy.",
    story: "Not a single rehearsed line could match the look in your eyes when the music swelled. We laughed, we wiped away mascara, and we danced until the candles burnt down to their saucers.",
    quote: "Where you go, I will go."
  },
  {
    id: "golden-hour-nuptials",
    name: "Golden Hour Nuptials",
    category: "Wedding",
    tags: ["Sunset", "Outdoor", "Wildflowers", "Bohemian"],
    mood: "Luminous & Warm",
    theme: "romantic-rose",
    photos: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "When Sunset Met Our First Dance",
    description: "Sunlit vineyard celebrations, wildflower bouquets, and warm twilight toasts.",
    story: "As the sun slipped below the hillside, the whole vineyard turned to liquid amber. We kicked off our shoes on the lawn and spun under festoon lights until midnight.",
    quote: "Forever begins in amber light."
  },

  // 5. Business (3)
  {
    id: "the-quarterly-dispatch",
    name: "The Quarterly Dispatch",
    category: "Business",
    tags: ["Executive", "Annual Report", "Strategy", "Leadership"],
    mood: "Authoritative & Sharp",
    theme: "classic-ivory",
    photos: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Executive Summary & Industry Insights",
    description: "Prestigious corporate publication delivering strategic milestones, partner essays, and quarterly metrics.",
    story: "Great organizations are shaped by the clarity of their purpose. Over the past twelve months, our focus on deliberate execution has unlocked new frontiers in human-centric technology.",
    quote: "Vision without execution is hallucination."
  },
  {
    id: "founder-monograph",
    name: "Founder Monograph",
    category: "Business",
    tags: ["Leadership", "Interview", "Startup", "Profile"],
    mood: "Editorial Profile",
    theme: "ink-noir",
    photos: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Behind Closed Doors with Visionary Builders",
    description: "In-depth portrait study and interview layout tracing the founding years of transformative ventures.",
    story: "Behind every overnight success lie five hundred cold coffees, broken prototypes, and the solitary conviction to show up again when everyone else advised pivoting.",
    quote: "Build what you wish existed."
  },
  {
    id: "venture-and-vision",
    name: "Venture & Vision",
    category: "Business",
    tags: ["Tech", "Innovation", "Quarterly", "Corporate"],
    mood: "Contemporary Corporate",
    theme: "minimalist-linen",
    photos: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Investing in the Next Generation of Craft",
    description: "Modern, clean corporate case studies highlighting sustainability, design engineering, and team milestones.",
    story: "Capital alone does not solve human problems; thoughtful systems do. Here, we outline the fundamental design principles that guide our investments.",
    quote: "The future belongs to the curious."
  },

  // 6. Portfolio (3)
  {
    id: "studio-archive-vol1",
    name: "Studio Archive Vol. 1",
    category: "Portfolio",
    tags: ["Design", "Architecture", "Exhibition", "Case Studies"],
    mood: "Curated Showcase",
    theme: "editorial-monochrome",
    photos: [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "A Retrospective of Spatial Works",
    description: "Curated portfolio layout showcasing industrial design, branding identity, and architectural renders.",
    story: "Design is not what it looks like; it is how it performs in space. In this volume, we examine ten projects across three continents that challenged conventional materials.",
    quote: "Good design is as little design as possible."
  },
  {
    id: "creative-retrospective",
    name: "Creative Retrospective",
    category: "Portfolio",
    tags: ["Art Direction", "Graphic Design", "Typography", "Prints"],
    mood: "Expressive & Bold",
    theme: "ink-noir",
    photos: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Five Years of Visual Brand Architectures",
    description: "Bold editorial presentation highlighting visual identities, custom typefaces, and campaigns.",
    story: "We believe in bold typography, intentional white space, and concepts with teeth. Each project in this monograph began with a simple question: what if we took away everything superfluous?",
    quote: "Make it simple, but significant."
  },
  {
    id: "the-maker-edition",
    name: "The Maker Edition",
    category: "Portfolio",
    tags: ["Craft", "Ceramics", "Handmade", "Textiles"],
    mood: "Craft & Detail",
    theme: "minimalist-linen",
    photos: [
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Clay, Wood, Loom & Bronze",
    description: "Artisanal portfolio showcasing tactile craftsmanship, workshop behind-the-scenes, and raw materials.",
    story: "In an age of instant digital mass production, we celebrate the maker’s thumbprint. Clay spun on kick wheels, wool dyed with walnut hulls, and bronze cast in sand.",
    quote: "The hand leaves its soul on the vessel."
  },

  // 7. Food (3)
  {
    id: "table-and-vine",
    name: "Table & Vine",
    category: "Food",
    tags: ["Culinary", "Recipes", "Wine", "Feasts"],
    mood: "Epicurean & Warm",
    theme: "classic-ivory",
    photos: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Seasonal Cooking and Shared Tables",
    description: "Gastronomic publication featuring artisanal sourdough, garden herbs, and wine pairings.",
    story: "Food is the simplest way we tell people we love them. Gathered around an old pine table, passing warm bread and spilling olive oil, hours dissolve into easy laughter.",
    quote: "To cook for someone is to offer comfort."
  },
  {
    id: "the-sunday-supper",
    name: "The Sunday Supper",
    category: "Food",
    tags: ["Family", "Tradition", "Comfort Food", "Baking"],
    mood: "Rustic & Hearty",
    theme: "romantic-rose",
    photos: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Passed-Down Heirlooms and Simmering Pots",
    description: "Heartfelt cookbook magazine documenting grandmother’s recipes, hand-written notes, and kitchen stories.",
    story: "The best recipes don’t have exact gram measurements; they have phrases like ‘until it smells like Sunday morning’ and ‘a pinch from the wooden box.’",
    quote: "Memories live inside shared meals."
  },
  {
    id: "slow-roast-journal",
    name: "Slow Roast Journal",
    category: "Food",
    tags: ["Coffee", "Bakery", "Artisan", "Patisserie"],
    mood: "Cozy & Artisanal",
    theme: "minimalist-linen",
    photos: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "The Anatomy of a Flaky Morning Croissant",
    description: "Detailed study in laminated dough, single-origin espresso extraction, and neighborhood bakeries.",
    story: "Three in the morning is when bakers begin. While the city sleeps under rain, flour dusts the stainless countertops and butter melts into delicate layers.",
    quote: "Patience makes the crust."
  },

  // 8. Photography (3)
  {
    id: "shadow-and-soul",
    name: "Shadow & Soul",
    category: "Photography",
    tags: ["Black and White", "Portraits", "Street", "High Contrast"],
    mood: "Fine Art Monochrome",
    theme: "editorial-monochrome",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Fine Art Black and White Monograph",
    description: "Expressive monochrome portraiture highlighting bone structure, raw gaze, and deep silver halation.",
    story: "Color is descriptive. Black and white is interpretive. Stripped of hue, the camera searches for bone, grain, and the unspoken weight of human emotion.",
    quote: "Seeing in light and shadow."
  },
  {
    id: "thirty-five-millimeter",
    name: "35mm Analog Chronicles",
    category: "Photography",
    tags: ["Film Grain", "Leica", "Candid", "Analog"],
    mood: "Raw & Authentic",
    theme: "ink-noir",
    photos: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Roll After Roll of Unrepeatable Light",
    description: "Analog film study captured on Kodak Tri-X and Portra 400 across Paris, Tokyo, and New York.",
    story: "With thirty-six frames to a canister, you learn to look twice before squeezing the shutter. You wait for the breath, the sideways glance, the wind in the trench coat.",
    quote: "The chemistry of fleeting time."
  },
  {
    id: "golden-light-studies",
    name: "Golden Light Studies",
    category: "Photography",
    tags: ["Landscape", "Dusk", "Golden Hour", "Atmosphere"],
    mood: "Ethereal & Warm",
    theme: "classic-ivory",
    photos: [
      "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "When the Sun Touches Horizon",
    description: "Luminous landscape and portrait collection bathed in late afternoon amber tones.",
    story: "There are ten minutes each evening when physics gives way to poetry. Long shadows drape across wheat fields, and faces look like Renaissance canvases.",
    quote: "Light is the brush; time is the canvas."
  },

  // 9. Personal/Memory (3)
  {
    id: "forever-sisters",
    name: "Forever Sisters",
    category: "Personal/Memory",
    tags: ["Friendship", "Roadtrips", "Memories", "Sisterhood"],
    mood: "Tender Friendship",
    theme: "romantic-rose",
    photos: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Inside Jokes, Ranked: 20 Years of Sundays",
    description: "Cherished tribute to lifelong friendship, mutual support, road trips, and inside jokes.",
    story: "We are composed of such ordinary, unrepeatable afternoons. To hold them in print is to honour the quiet truth of who we are when nobody else is watching.",
    quote: "Some friendships are written in the stars."
  },
  {
    id: "the-birthday-issue",
    name: "The Birthday Issue",
    category: "Personal/Memory",
    tags: ["Celebration", "Milestone", "Letters", "Party"],
    mood: "Celebratory & Joyful",
    theme: "classic-ivory",
    photos: [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "30 Things We Love About You",
    description: "Milestone celebration edition collecting letters, candid laughter, and moments from loved ones.",
    story: "A whole year wrapped inside forty pages. Here are the friends who showed up in the rain, the impromptu dinners that lasted till dawn, and the memories we never want to lose.",
    quote: "Another year brighter, bolder, and loved."
  },
  {
    id: "ten-years-retold",
    name: "Ten Years, Retold",
    category: "Personal/Memory",
    tags: ["Anniversary", "Decade", "Archive", "Retrospective"],
    mood: "Deeply Nostalgic",
    theme: "ink-noir",
    photos: [
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "We Kept Every Ticket Stub",
    description: "A decade of milestones, packed suitcases, quiet apartments, and enduring bonds.",
    story: "Ten years ago we set out with two bags and no plan. Tonight, we put all the boarding passes and blurred polaroids in order, realizing that home was always each other.",
    quote: "A decade well lived, a lifetime to go."
  },

  // 10. Education (3)
  {
    id: "the-commencement",
    name: "The Commencement",
    category: "Education",
    tags: ["Graduation", "Diploma", "Campus", "Future"],
    mood: "Triumphant & Dignified",
    theme: "classic-ivory",
    photos: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Late Nights, Library Stacks & Open Horizons",
    description: "Prestigious graduation commemorative issue documenting campus years and honors.",
    story: "The library stacks at midnight, the thesis written on cold coffee, and the quiet pride of walking across the quad. Today we close one chapter to begin the great work ahead.",
    quote: "Knowledge is the quietest rebellion."
  },
  {
    id: "curiosity-and-craft",
    name: "Curiosity & Craft",
    category: "Education",
    tags: ["Scholarly", "Research", "Lab", "Discovery"],
    mood: "Scholarly & Modern",
    theme: "minimalist-linen",
    photos: [
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "The Pursuit of Scientific and Literary Truth",
    description: "Academic journal format celebrating student research, fellowship essays, and field notes.",
    story: "True inquiry begins when you are willing to discard the comfortable answer. In these notebooks lie the hypotheses that challenged our assumptions.",
    quote: "To question is to learn."
  },
  {
    id: "the-literary-monograph",
    name: "The Literary Monograph",
    category: "Education",
    tags: ["Literature", "Essays", "Poetry", "Classics"],
    mood: "Refined & Intellectual",
    theme: "ink-noir",
    photos: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=85"
    ],
    subtitle: "Voices, Critiques & Modern Poetry",
    description: "Fine literary review edition presenting creative non-fiction, poems, and book reviews.",
    story: "Print gives weight to thought. When an essay is typeset with care, the reader pauses and listens to the cadence of the author’s voice.",
    quote: "Words outlive the monument."
  }
];

// Build Full Templates Object
const EDITIONS = {};
TEMPLATES_RAW.forEach(t => {
  const themeObj = THEMES[t.theme] || THEMES['classic-ivory'];
  EDITIONS[t.id] = {
    id: t.id,
    name: t.name,
    category: t.category,
    tags: t.tags,
    mood: t.mood,
    pageCount: 4,
    photoSlots: t.photos.length,
    thumbnail: t.photos[0],
    cover: t.photos[0],
    coverBg: themeObj.bg,
    description: t.description,
    themeTokens: themeObj,
    pages: buildMagazinePages(t.name, t.subtitle, t.category, t.theme, t.photos, t.story, t.quote)
  };
});

// Write to data/templates.json
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'data', 'templates.json'), JSON.stringify(EDITIONS, null, 2), 'utf8');
console.log(`Generated data/templates.json with ${Object.keys(EDITIONS).length} templates.`);

// Write to js/templates-data.js
const fileContent = `/**
 * PAPERLY — Starter Templates & Editorial Editions Catalog
 * 30 Handcrafted luxury editorial layouts across 10 categories.
 * Strict typographic hierarchy, theme tokens, and real photographic image models.
 */

const PAPERLY_TEMPLATES = (() => {
  const THEMES = ${JSON.stringify(THEMES, null, 2)};
  const EDITIONS = ${JSON.stringify(EDITIONS, null, 2)};

  const PAGE_BLOCKS = {
    cover: (title = "PAPERLY", issue = "SUMMER ISSUE · 2026", sub = "A CURATED COLLECTION OF MEMORIES", photoUrl) => ({
      bg: "#0c0b0a",
      els: [
        { id: 9001, t: 'img', x: 36, y: 130, w: 468, h: 430, src: photoUrl || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85", bg: \`url("\${photoUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85'}")\`, type: 'stock', fit: 'cover', position: 'center', imageId: 'pb_cover_hero' },
        { id: 9002, t: 'text', x: 36, y: 40, w: 468, h: 62, text: title, size: title.length > 24 ? 30 : 38, font: "Playfair Display", weight: 700, color: "#f6f0e4", align: "center", sp: 1 },
        { id: 9003, t: 'text', x: 36, y: 104, w: 468, h: 18, text: issue, size: 10, font: "Inter", color: "#6e1423", align: "center", sp: 5, weight: 600 },
        { id: 9004, t: 'text', x: 40, y: 580, w: 460, h: 46, text: sub, size: 13, font: "Cormorant Garamond", italic: true, color: "#f6f0e4", align: "center" },
        { id: 9005, t: 'line', x: 210, y: 636, w: 120, h: 1, color: "#6e1423" },
        { id: 9006, t: 'text', x: 36, y: 652, w: 468, h: 20, text: "PAPERLY EDITORIAL MONOGRAPH", size: 9, font: "Inter", sp: 4, color: "#a89b88", align: "center" }
      ]
    }),
    feature: (tag = "ESSAY", headline = "A Season of Living Deliberately", body = "We began this journey not knowing what was around the bend.", quote = "In the end, we only regret the chances we did not take.", photoA, photoB) => ({
      bg: "#f4ede0",
      els: [
        { id: 9011, t: 'text', x: 36, y: 36, w: 468, h: 18, text: tag, size: 10, font: "Inter", sp: 5, color: "#6e1423", weight: 600 },
        { id: 9012, t: 'text', x: 36, y: 56, w: 468, h: 54, text: headline, size: 26, font: "Playfair Display", weight: 700, color: "#0c0b0a" },
        { id: 9013, t: 'line', x: 36, y: 122, w: 60, h: 2, color: "#6e1423" },
        { id: 9014, t: 'img', x: 36, y: 145, w: 260, h: 270, src: photoA || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85", bg: \`url("\${photoA || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85'}")\`, type: 'stock', fit: 'cover', position: 'center', imageId: 'pb_feat_1' },
        { id: 9015, t: 'text', x: 315, y: 145, w: 190, h: 20, text: "EDITORIAL DISPATCH", size: 9, font: "Inter", sp: 3, color: "#8b7e6d", weight: 600 },
        { id: 9016, t: 'text', x: 315, y: 175, w: 190, h: 240, text: body, size: 12, font: "Inter", color: "#333", lineHeight: 1.55 },
        { id: 9017, t: 'img', x: 36, y: 435, w: 160, h: 245, src: photoB || "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=85", bg: \`url("\${photoB || 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=85'}")\`, type: 'stock', fit: 'cover', position: 'center', imageId: 'pb_feat_2' },
        { id: 9018, t: 'text', x: 216, y: 455, w: 290, h: 210, text: \`“\${quote}”\`, size: 22, italic: true, font: "Cormorant Garamond", color: "#6e1423", lineHeight: 1.35 }
      ]
    }),
    spread: (headline = "The summer we stopped checking the time", body = "It began with a borrowed camera and a long road south.", photoUrl) => ({
      bg: "#f4ede0",
      els: [
        { id: 9021, t: 'img', x: 36, y: 36, w: 468, h: 380, src: photoUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85", bg: \`url("\${photoUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85'}")\`, type: 'stock', fit: 'cover', position: 'center', imageId: 'pb_spread_hero' },
        { id: 9022, t: 'text', x: 36, y: 435, w: 468, h: 24, text: "MEMORIES IN FOCUS", size: 10, font: "Inter", sp: 4, color: "#6e1423", weight: 700 },
        { id: 9023, t: 'text', x: 36, y: 465, w: 468, h: 65, text: headline, size: 30, font: "Playfair Display", weight: 700 },
        { id: 9024, t: 'line', x: 36, y: 540, w: 80, h: 2, color: "#6e1423" },
        { id: 9025, t: 'text', x: 36, y: 558, w: 468, h: 120, text: body, size: 14, font: "Cormorant Garamond", italic: true, color: "#222" }
      ]
    }),
    gallery: (tag = "THE ARCHIVE", title = "Fragments of Our Favorite Days", pA, pB, pC) => ({
      bg: "#0c0b0a",
      els: [
        { id: 9031, t: 'text', x: 36, y: 36, w: 468, h: 20, text: tag, size: 10, color: "#d9c9ad", font: "Inter", sp: 5 },
        { id: 9032, t: 'text', x: 36, y: 60, w: 468, h: 48, text: title, size: 26, color: "#f4ede0", weight: 700 },
        { id: 9033, t: 'img', x: 36, y: 120, w: 224, h: 260, src: pA || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=85", bg: \`url("\${pA || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=85'}")\`, type: 'stock', fit: 'cover', position: 'center', imageId: 'pb_gal_1' },
        { id: 9034, t: 'img', x: 280, y: 120, w: 224, h: 260, src: pB || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85", bg: \`url("\${pB || 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85'}")\`, type: 'stock', fit: 'cover', position: 'center', imageId: 'pb_gal_2' },
        { id: 9035, t: 'img', x: 36, y: 400, w: 468, h: 230, src: pC || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85", bg: \`url("\${pC || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'}")\`, type: 'stock', fit: 'cover', position: 'center', imageId: 'pb_gal_3' },
        { id: 9036, t: 'text', x: 36, y: 648, w: 468, h: 24, text: "Photographs by us. Edited with care.", size: 11, color: "#9b9082", font: "Inter", align: "center" }
      ]
    }),
    dedication: (recipient = "FOR MAA", body = "For every quiet sacrifice, every recipe, every 'call me when you reach'.\\n\\nWith all my love, always.") => ({
      bg: "#eae1d2",
      els: [
        { id: 9041, t: 'text', x: 60, y: 180, w: 420, h: 30, text: recipient, size: 12, font: "Inter", sp: 6, align: "center", color: "#6e1423", weight: 700 },
        { id: 9042, t: 'line', x: 240, y: 225, w: 60, h: 2, color: "#6e1423" },
        { id: 9043, t: 'text', x: 60, y: 260, w: 420, h: 220, text: body, size: 30, italic: true, align: "center", font: "Cormorant Garamond", color: "#1a1a1a" },
        { id: 9044, t: 'text', x: 60, y: 560, w: 420, h: 30, text: "Written with PAPERLY.", size: 11, align: "center", font: "Inter", sp: 4, color: "#6e1423" }
      ]
    })
  };

  return {
    THEMES,
    EDITIONS,
    PAGE_BLOCKS
  };
})();

if (typeof window !== 'undefined') {
  window.PAPERLY_TEMPLATES = PAPERLY_TEMPLATES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PAPERLY_TEMPLATES;
}
`;

fs.writeFileSync(path.join(__dirname, 'js', 'templates-data.js'), fileContent, 'utf8');
console.log(`Updated js/templates-data.js successfully!`);

