/**
 * PAPERLY — Magazine Starter Editions & Page Presets
 * Pre-designed luxury editorial layouts for all signature and special editions.
 * Inspired by Vogue, Kinfolk, Cereal, The New Yorker, and Architectural Digest.
 * 
 * Image Model Standard:
 * Every image element adheres to the PaperlyImageModel:
 * { id, t: 'img', x, y, w, h, src, type: 'upload'|'ai'|'stock', fit: 'cover', position: 'center', imageId }
 */

const PAPERLY_TEMPLATES = (() => {
  let uid = 1000;
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

  // Authentic High-Resolution Editorial Photography Catalog (Unsplash Curated)
  const EDITORIAL_PHOTOS = [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85", // 0: Forever Sisters / Friendship
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85", // 1: Two of Us / Couple
    "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=85", // 2: Lisbon After Dark / Travel
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85", // 3: The Unhurried Season / Fashion
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=85", // 4: The Birthday Issue / Celebration
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85", // 5: Ten Years Retold / Monograph
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85", // 6: Kinfolk Living / Architecture
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85", // 7: Table & Vine / Culinary
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85", // 8: After Midnight / Indie Music
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85", // 9: The Commencement / Graduation
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85", // 10: Shadow & Soul / Monochrome Portrait
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85"  // 11: Dear Diary / Personal Reflections
  ];

  // Helper to build a standard PaperlyImageModel element
  const photoSlot = (idx, o = {}) => {
    const src = EDITORIAL_PHOTOS[Math.abs(idx) % EDITORIAL_PHOTOS.length];
    return {
      src,
      bg: `url("${src}")`,
      type: 'stock',
      fit: 'cover',
      position: 'center',
      imageId: `stock_${idx}`,
      ...o
    };
  };

  // Modular Page Layout Builders
  const PAGE_BLOCKS = {
    cover: (title = "PAPERLY", issue = "SUMMER ISSUE · 2026", sub = "A CURATED COLLECTION OF MEMORIES", photoIdx = 0, bg = "#0c0b0a", textColor = "#f6f0e4") => ({
      bg,
      els: [
        elem("img", 36, 125, 468, 435, photoSlot(photoIdx)),
        elem("text", 36, 40, 468, 64, { text: title, size: 44, font: "Playfair Display", weight: 700, color: textColor, align: "center", sp: 2 }),
        elem("text", 36, 104, 468, 20, { text: issue, size: 10, font: "Inter", color: "#6e1423", align: "center", sp: 6, weight: 600 }),
        elem("text", 50, 580, 440, 50, { text: sub, size: 14, font: "Cormorant Garamond", italic: true, color: textColor, align: "center" }),
        elem("line", 210, 642, 120, 1, { color: "#6e1423" }),
        elem("text", 36, 658, 468, 20, { text: "THE EDITORIAL MONOGRAPH", size: 9, font: "Inter", sp: 5, color: "#a89b88", align: "center" })
      ]
    }),

    feature: (tag = "ESSAY", headline = "A Season of Living Deliberately", body = "We began this journey not knowing what was around the bend. All we had was the quiet certainty that whatever we found, we would face together.", quote = "“In the end, we only regret the chances we did not take.”", photoIdx = 1) => ({
      bg: "#f4ede0",
      els: [
        elem("text", 36, 36, 468, 20, { text: tag, size: 11, font: "Inter", sp: 5, color: "#6e1423", weight: 600 }),
        elem("text", 36, 64, 468, 68, { text: headline, size: 30, font: "Playfair Display", weight: 700, color: "#0c0b0a" }),
        elem("line", 36, 138, 60, 2, { color: "#6e1423" }),
        elem("img", 36, 155, 260, 270, photoSlot(photoIdx)),
        elem("text", 330, 155, 174, 30, { text: "EDITORIAL DISPATCH", size: 9, font: "Inter", sp: 3, color: "#8b7e6d", weight: 600 }),
        elem("text", 330, 195, 174, 230, { text: body, size: 13, font: "Inter", color: "#333", lineHeight: 1.5 }),
        elem("img", 36, 450, 160, 234, photoSlot(photoIdx + 1)),
        elem("text", 216, 470, 288, 200, { text: quote, size: 24, italic: true, font: "Cormorant Garamond", color: "#6e1423" })
      ]
    }),

    spread: (headline = "The summer we stopped checking the time", body = "It began with a borrowed camera and a long road south. By the last evening, the film was nearly gone and nobody wanted to leave.", tag = "MEMORIES IN FOCUS", photoIdx = 2) => ({
      bg: "#f4ede0",
      els: [
        elem("img", 36, 36, 468, 380, photoSlot(photoIdx)),
        elem("text", 36, 435, 468, 24, { text: tag, size: 11, font: "Inter", sp: 4, color: "#6e1423", weight: 700 }),
        elem("text", 36, 465, 468, 75, { text: headline, size: 34, font: "Playfair Display", weight: 700 }),
        elem("line", 36, 550, 80, 2, { color: "#6e1423" }),
        elem("text", 36, 570, 468, 110, { text: body, size: 15, font: "Cormorant Garamond", italic: true, color: "#222" })
      ]
    }),

    dedication: (recipient = "FOR MAA", body = "For every quiet sacrifice, every recipe, every ‘call me when you reach’.\n\nWith all my love, always.", sign = "Written with PAPERLY", bg = "#e9dcc3") => ({
      bg,
      els: [
        elem("text", 60, 160, 420, 40, { text: recipient, size: 13, font: "Inter", sp: 6, align: "center", color: "#6e1423", weight: 700 }),
        elem("line", 240, 215, 60, 2, { color: "#6e1423" }),
        elem("text", 60, 250, 420, 240, { text: body, size: 34, italic: true, align: "center", font: "Cormorant Garamond", color: "#1a1a1a" }),
        elem("text", 60, 560, 420, 30, { text: sign, size: 12, align: "center", font: "Inter", sp: 3, color: "#6e1423" })
      ]
    }),

    gallery: (tag = "THE ARCHIVE", title = "Fragments of Our Favorite Days", photoA = 3, photoB = 4, photoC = 5) => ({
      bg: "#0c0b0a",
      els: [
        elem("text", 36, 40, 468, 24, { text: tag, size: 10, color: "#d9c9ad", font: "Inter", sp: 5 }),
        elem("text", 36, 68, 468, 50, { text: title, size: 28, color: "#f4ede0", weight: 700 }),
        elem("img", 36, 130, 224, 260, photoSlot(photoA)),
        elem("img", 280, 130, 224, 260, photoSlot(photoB)),
        elem("img", 36, 410, 468, 230, photoSlot(photoC)),
        elem("text", 36, 656, 468, 24, { text: "Photographs by us. Edited with care.", size: 11, color: "#9b9082", font: "Inter", align: "center" })
      ]
    })
  };

  // Complete Signature & Special Editorial Editions
  const EDITIONS = {
    "best-friend": {
      name: "Forever Sisters",
      category: "Best Friend",
      description: "Friendship, inside jokes, and 20 years of Sundays in print.",
      cover: EDITORIAL_PHOTOS[0],
      coverBg: "#3a0a12",
      pages: [
        PAGE_BLOCKS.cover("FOREVER SISTERS", "SUMMER ISSUE · 2026", "Inside jokes, ranked. 20 years of Sundays.", 0, "#6e1423", "#f6f0e4"),
        PAGE_BLOCKS.feature("ORIGIN STORY", "How We Survived School Together", "We met over a shared packet of crisps and an intense dislike of physics class. Twenty years later, she is still the first call I make whenever life gets interesting.", "“A real friend doesn't judge your questionable decisions; she documents them with flair.”", 1),
        PAGE_BLOCKS.gallery("HIGHLIGHT REEL", "Unfiltered & Unforgettable", 2, 3, 4),
        PAGE_BLOCKS.dedication("TO MY SOUL SISTER", "Thank you for answering every midnight phone call and laughing until our mascara ran.\n\nHere’s to another twenty years of chaos.", "With infinite love, Your Favorite Trouble", "#f4ede0")
      ]
    },

    "birthday": {
      name: "The Birthday Issue",
      category: "Birthday",
      description: "A year in one issue. 30 things we love about you, frame by frame.",
      cover: EDITORIAL_PHOTOS[4],
      coverBg: "#1c1712",
      pages: [
        PAGE_BLOCKS.cover("THE BIRTHDAY ISSUE", "VOLUME 30 · SPECIAL EDITION", "30 things we love about you. The party, frame by frame.", 4, "#f6f0e4", "#0c0b0a"),
        PAGE_BLOCKS.spread("The Year of Becoming Unstoppable", "Thirty didn't arrive quietly. It came with bold leaps, new addresses, and the realization that the best chapters were never in the outline.", "MILESTONE EDITION", 5),
        PAGE_BLOCKS.gallery("PARTY ALBUM", "The Night the Cake Disappeared", 6, 7, 8),
        PAGE_BLOCKS.dedication("HAPPY 30TH BIRTHDAY", "May this coming year ask gentler questions of you and return you to the people who love you most.\n\nKeep growing toward your own light.", "Celebrated with PAPERLY", "#e9dcc3")
      ]
    },

    "couple": {
      name: "Two of Us",
      category: "Couple",
      description: "Two people, one story. How we met and our favourite ordinary days.",
      cover: EDITORIAL_PHOTOS[1],
      coverBg: "#1a1a1a",
      pages: [
        PAGE_BLOCKS.cover("TWO OF US", "ISSUE NO. 1 · AUTUMN", "How we met. Our favourite ordinary days.", 1, "#1a1a1a", "#f6f0e4"),
        PAGE_BLOCKS.feature("CHAPTER ONE", "Monsoon, Coffee, and One Broken Umbrella", "It began with torrential rain and a crowded café where only one corner table was free. Two coffees turned into three hours, and neither of us wanted the storm to end.", "“Love isn't always grand gestures; it is saving the warm croissant for each other.”", 2),
        PAGE_BLOCKS.spread("The Summer We Stopped Checking the Time", "It began with a borrowed camera and a long road south. By the last evening, the film was nearly gone and nobody wanted to leave.", "THE JOURNEY", 3),
        PAGE_BLOCKS.dedication("FOR MY FAVORITE HUMAN", "Every ordinary day is an adventure when you are across the table.\n\nI would choose you in every lifetime.", "Forever & Always, Yours", "#f6f0e4")
      ]
    },

    "anniversary": {
      name: "Ten Years, Retold",
      category: "Anniversary",
      description: "Years, in chapters. We kept every ticket stub. Tonight, we put them in order.",
      cover: EDITORIAL_PHOTOS[5],
      coverBg: "#2e241c",
      pages: [
        PAGE_BLOCKS.cover("TEN YEARS", "A DECADE RETOLD · 2016–2026", "A decade of small miracles, quiet victories, and fierce devotion.", 5, "#e3d5bd", "#0c0b0a"),
        PAGE_BLOCKS.spread("A Decade of Kitchen Table Conversations", "We kept every train ticket, concert stub, and postcard. Looking back, the grand milestones blur, but the quiet Tuesday mornings shine like gold.", "TEN YEARS OF US", 6),
        PAGE_BLOCKS.gallery("THE ARCHIVE", "Ten Years, Ten Thousand Smiles", 7, 8, 9),
        PAGE_BLOCKS.dedication("A DECADE OF DEVOTION", "To the one who has held my hand through every storm and every sunshine.\n\nTen years down, a lifetime to go.", "With all my heart, Forever", "#f4ede0")
      ]
    },

    "travel": {
      name: "Lisbon After Dark",
      category: "Travel",
      description: "Trips worth keeping. Trams, tiled walls, and one very long dinner.",
      cover: EDITORIAL_PHOTOS[2],
      coverBg: "#0f171d",
      pages: [
        PAGE_BLOCKS.cover("LISBON AFTER DARK", "TRAVEL JOURNAL · ISSUE 4", "Trams, tiled walls, and one very long dinner.", 2, "#f6f0e4", "#0c0b0a"),
        PAGE_BLOCKS.feature("EXPEDITION", "Lost in the Streets of Alfama", "Cobblestones polished smooth by centuries, laundry waving like celebration banners, and the bittersweet melancholy of Fado drifting from open windows.", "“Travel is the only expense that makes you infinitely richer.”", 3),
        PAGE_BLOCKS.spread("Where the Atlantic Meets the Sky", "We stood at Cabo da Roca with salt on our lips and the edge of the old world at our feet. We were small, and the world was magnificent.", "COASTAL DIARIES", 4),
        PAGE_BLOCKS.dedication("POSTCARD HOME", "To everyone who told us to take the detour.\n\nYou were right. The road less traveled was everything.", "Written in Lisbon · With PAPERLY", "#e9dcc3")
      ]
    },

    "fashion": {
      name: "The Unhurried Season",
      category: "Fashion",
      description: "Style, edited. A curated study in light, leisure, and elegance.",
      cover: EDITORIAL_PHOTOS[3],
      coverBg: "#121212",
      pages: [
        PAGE_BLOCKS.cover("EDITORIAL", "THE UNHURRIED SEASON", "In praise of quiet luxury and deliberate attention.", 3, "#0c0b0a", "#f4ede0"),
        PAGE_BLOCKS.feature("WARDROBE", "A Study in Linen and Amber", "True luxury does not clamor for attention. It exists in the drape of natural fibers, the warmth of morning sun, and the ease of a woman at peace with herself.", "“Style is a way to say who you are without having to speak.”", 4),
        PAGE_BLOCKS.gallery("LOOKBOOK", "Light, Texture & Form", 5, 6, 7),
        PAGE_BLOCKS.dedication("COLOPHON", "Created with PAPERLY Magazine Studio.\nDesigned for collectors of rare and thoughtful moments.", "PAPERLY Publishing House", "#0c0b0a")
      ]
    },

    "personal-journal": {
      name: "Dear Diary",
      category: "Personal Journal",
      description: "Your private world in print. Reflections, moods and the quiet moments that shaped a year.",
      cover: EDITORIAL_PHOTOS[11],
      coverBg: "#241b17",
      pages: [
        PAGE_BLOCKS.cover("DEAR DIARY", "PERSONAL VOLUME · 2026", "Reflections, moods and the quiet moments that shaped a year.", 11, "#2a1f1a", "#f4ede0"),
        PAGE_BLOCKS.spread("The Year I Chose Myself", "Some years arrive quietly and leave you transformed. I stopped measuring progress by milestones and started measuring it by mornings.", "REFLECTIONS", 0),
        PAGE_BLOCKS.feature("INNER LIFE", "What I Learned in the Silence", "I kept a journal because I had nowhere else to put the thoughts that were too tender for conversation and too important to forget.", "“Writing is the painting of the voice.”", 1),
        PAGE_BLOCKS.dedication("NOTE TO SELF", "You have survived every hard day so far.\n\nKeep choosing the version of yourself that you are proudest of.", "With love, Future You · Written with PAPERLY", "#f4ede0")
      ]
    },

    "minimalist-living": {
      name: "Kinfolk Living",
      category: "Personal Journal",
      description: "Slow living, architectural spaces, and the beauty of deliberate simplicity.",
      cover: EDITORIAL_PHOTOS[6],
      coverBg: "#1c1d1a",
      pages: [
        PAGE_BLOCKS.cover("KINFOLK LIVING", "VOLUME XII · ARCHITECTURE", "In search of light, natural textures, and unhurried spaces.", 6, "#161815", "#f4ede0"),
        PAGE_BLOCKS.spread("The Architecture of Sanctuary", "A home should not be an exhibition of possessions; it should be a container for stillness, where morning shadows measure the passage of peaceful hours.", "SPACE & STILLNESS", 7),
        PAGE_BLOCKS.gallery("ATMOSPHERE", "Light, Concrete, Wood & Air", 8, 9, 10),
        PAGE_BLOCKS.dedication("THE SLOW MANIFESTO", "Leave room on the table. Leave time on the clock.\n\nThe finest luxury is having nowhere you need to rush.", "Kinfolk Press · PAPERLY", "#f4ede0")
      ]
    },

    "culinary-arts": {
      name: "The Table & The Vine",
      category: "Personal Journal",
      description: "Feasts, recipes, Sunday dinners, and kitchen table stories worth remembering.",
      cover: EDITORIAL_PHOTOS[7],
      coverBg: "#2d1b16",
      pages: [
        PAGE_BLOCKS.cover("THE TABLE & THE VINE", "AUTUMN HARVEST EDITION", "To everyone who knows that love is best served warm.", 7, "#2d1b16", "#f4ede0"),
        PAGE_BLOCKS.feature("THE FEAST", "Salt, Sourdough, and Long Conversations", "The food was unforgettable, but what we truly fed on was the laughter that spilled over long after the candles burned down to the wood.", "“To eat is a necessity, but to eat intelligently is an art.”", 8),
        PAGE_BLOCKS.spread("Recipes Kept on Stained Paper", "The handwritten notes carry butter smudges and pencil corrections from grandmother's kitchen. Those are the most sacred heirlooms we own.", "HERITAGE RECIPES", 9),
        PAGE_BLOCKS.dedication("TO THE HOSTS", "To every meal shared under soft lamps.\n\nMay our glasses stay full and our tables remain crowded.", "Buon Appetito · PAPERLY", "#f4ede0")
      ]
    },

    "indie-culture": {
      name: "After Midnight",
      category: "Best Friend",
      description: "Concerts, analog photos, garage bands, and the soundtrack of our youth.",
      cover: EDITORIAL_PHOTOS[8],
      coverBg: "#0d0d12",
      pages: [
        PAGE_BLOCKS.cover("AFTER MIDNIGHT", "VINYL & ANALOG CHRONICLES", "Heavy bass, warm tape hiss, and blurry neon nights.", 8, "#0c0b0a", "#f6f0e4"),
        PAGE_BLOCKS.spread("When the Speakers Shook the Floor", "Our ears were ringing until Tuesday morning. We stood front row with sweat in our eyes, screaming the chorus like our lives depended on it.", "LIVE DISPATCH", 9),
        PAGE_BLOCKS.gallery("GIG ARCHIVE", "Strobe Lights, Ticket Stubs & Guitars", 10, 0, 1),
        PAGE_BLOCKS.dedication("PLAY IT LOUD", "To the friends who share your taste in loud guitars and midnight diners.\n\nKeep dancing through the noise.", "Turn Up the Volume · PAPERLY", "#e3d5bd")
      ]
    },

    "commencement": {
      name: "The Commencement",
      category: "Birthday",
      description: "Milestones, late-night study sessions, diplomas, and the open road ahead.",
      cover: EDITORIAL_PHOTOS[9],
      coverBg: "#1a2228",
      pages: [
        PAGE_BLOCKS.cover("THE COMMENCEMENT", "CLASS OF 2026 · MONOGRAPH", "A tribute to endurance, curiosity, and the courage to begin.", 9, "#141c22", "#f6f0e4"),
        PAGE_BLOCKS.spread("The Long Walk to the Podium", "Years condensed into a single morning. The caps flew into the sky like a constellation of relief and untamed ambition.", "CHAPTER ONE", 10),
        PAGE_BLOCKS.gallery("CAMPUS DIARIES", "Library Desks, Rainy Lawns & Triumphs", 11, 2, 3),
        PAGE_BLOCKS.dedication("FORWARD", "Go out into the world and build something that didn't exist before you arrived.\n\nWe could not be prouder.", "With endless pride, Family & Friends", "#f4ede0")
      ]
    },

    "monochrome": {
      name: "Shadow & Soul",
      category: "Fashion",
      description: "Fine art black and white portraits, candid street scenes, and timeless contrast.",
      cover: EDITORIAL_PHOTOS[10],
      coverBg: "#000000",
      pages: [
        PAGE_BLOCKS.cover("SHADOW & SOUL", "NOIR ISSUE · VOL I", "Color is descriptive. Black and white is interpretive.", 10, "#000000", "#ffffff"),
        PAGE_BLOCKS.spread("The Honesty of Pure Contrast", "Stripped of color, an image cannot hide. The light finds the character in the jawline, the history in the eyes, the truth of the moment.", "MONOCHROME ESSAYS", 11),
        PAGE_BLOCKS.gallery("PORTRAITS IN SHADOW", "Silver Halide, Grain & Radiance", 1, 2, 3),
        PAGE_BLOCKS.dedication("IN PRAISE OF SHADOWS", "To the beauty that reveals itself only when the bright lights are turned away.\n\nTimeless and eternal.", "PAPERLY Fine Art Press", "#1a1a1a")
      ]
    }
  };

  return {
    PAGE_BLOCKS,
    EDITIONS,
    EDITORIAL_PHOTOS,
    elem
  };
})();

if (typeof window !== 'undefined') {
  window.PAPERLY_TEMPLATES = PAPERLY_TEMPLATES;
}
