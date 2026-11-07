/**
 * PAPERLY — Magazine Starter Editions & Page Presets
 * Pre-designed luxury editorial layouts for all 6 signature categories.
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

  const art = (k) => {
    const P = [
      ["#2b1a1c", "#a8664a", "#f0c9a0"],
      ["#16212a", "#4f7a8a", "#e8d9b8"],
      ["#2a2218", "#8a6a3a", "#f2e3c0"],
      ["#1b1b1d", "#6b2a35", "#e9cfc0"],
      ["#1a2a22", "#4a7a58", "#d8e8cf"],
      ["#2d1b2e", "#7b3a6d", "#edd3e6"]
    ][k % 6];
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset=".55" stop-color="${P[1]}"/><stop offset="1" stop-color="${P[2]}"/></linearGradient></defs><rect width="300" height="400" fill="url(#g)"/><circle cx="210" cy="130" r="45" fill="${P[2]}" opacity=".85"/><path d="M0 320 Q80 250 160 300 T300 270 V400 H0 Z" fill="${P[0]}" opacity=".8"/><ellipse cx="110" cy="270" rx="32" ry="75" fill="${P[0]}"/><circle cx="110" cy="180" r="26" fill="${P[0]}"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  };

  // Reusable page building blocks
  const PAGE_BLOCKS = {
    cover: (title = "PAPERLY", subtitle = "THE SUMMER ISSUE · 2026", subtext = "The year I learned to slow down", artIdx = 0, bg = "#0c0b0a", titleColor = "#f4ede0") => ({
      bg,
      els: [
        elem("img", 0, 0, 540, 720, { bg: art(artIdx) }),
        elem("text", 36, 44, 468, 100, { text: title, size: 76, color: titleColor, align: "center", sp: 8, weight: 700 }),
        elem("text", 36, 144, 468, 24, { text: subtitle, size: 11, color: "#d9c9ad", align: "center", sp: 5, font: "Inter" }),
        elem("line", 230, 180, 80, 1, { color: "#6e1423" }),
        elem("text", 36, 530, 380, 120, { text: subtext, size: 40, color: "#f4ede0", italic: true, font: "Cormorant Garamond" }),
        elem("text", 36, 664, 468, 20, { text: "Stories, reimagined for the digital age.", size: 10, color: "#d9c9ad", font: "Inter", sp: 2 })
      ]
    }),

    feature: (tag = "GOLDEN HOURS", headline = "Where the light stayed late", body = "We chased the last warm light along the coast, laughing about nothing and everything. Some evenings do not end; they simply become a memory we carry.", quote = "“The best days were never planned. They arrived softly, and stayed.”", artIdx = 1) => ({
      bg: "#f4ede0",
      els: [
        elem("img", 36, 36, 270, 390, { bg: art(artIdx) }),
        elem("text", 330, 36, 174, 30, { text: tag, size: 11, font: "Inter", sp: 4, color: "#6e1423", weight: 700 }),
        elem("text", 330, 70, 174, 150, { text: headline, size: 30, weight: 700, font: "Playfair Display" }),
        elem("line", 330, 230, 60, 2, { color: "#6e1423" }),
        elem("text", 330, 246, 174, 180, { text: body, size: 13, font: "Inter", color: "#333" }),
        elem("img", 36, 450, 160, 234, { bg: art(artIdx + 1) }),
        elem("text", 216, 470, 288, 200, { text: quote, size: 24, italic: true, font: "Cormorant Garamond", color: "#6e1423" })
      ]
    }),

    spread: (headline = "The summer we stopped checking the time", body = "It began with a borrowed camera and a long road south. By the last evening, the film was nearly gone and nobody wanted to leave.", tag = "MEMORIES IN FOCUS", artIdx = 2) => ({
      bg: "#f6f0e4",
      els: [
        elem("img", 36, 36, 468, 380, { bg: art(artIdx) }),
        elem("text", 36, 440, 468, 24, { text: tag, size: 11, font: "Inter", sp: 4, color: "#6e1423", weight: 700 }),
        elem("text", 36, 470, 468, 80, { text: headline, size: 36, font: "Playfair Display", weight: 700 }),
        elem("line", 36, 560, 80, 2, { color: "#6e1423" }),
        elem("text", 36, 580, 468, 100, { text: body, size: 15, font: "Cormorant Garamond", italic: true, color: "#222" })
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

    gallery: (tag = "THE ARCHIVE", title = "Fragments of Our Favorite Days", artA = 3, artB = 4, artC = 5) => ({
      bg: "#0c0b0a",
      els: [
        elem("text", 36, 40, 468, 24, { text: tag, size: 10, color: "#d9c9ad", font: "Inter", sp: 5 }),
        elem("text", 36, 68, 468, 50, { text: title, size: 28, color: "#f4ede0", weight: 700 }),
        elem("img", 36, 130, 224, 260, { bg: art(artA) }),
        elem("img", 280, 130, 224, 260, { bg: art(artB) }),
        elem("img", 36, 410, 468, 230, { bg: art(artC) }),
        elem("text", 36, 656, 468, 24, { text: "Photographs by us. Edited with care.", size: 11, color: "#9b9082", font: "Inter", align: "center" })
      ]
    })
  };

  // 6 Complete Starter Editions matching the Homepage
  const EDITIONS = {
    "best-friend": {
      name: "Forever Sisters",
      category: "Best Friend",
      description: "Friendship, inside jokes, and 20 years of Sundays in print.",
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
      pages: [
        PAGE_BLOCKS.cover("THE BIRTHDAY ISSUE", "VOLUME 30 · SPECIAL EDITION", "30 things we love about you. The party, frame by frame.", 1, "#f6f0e4", "#0c0b0a"),
        PAGE_BLOCKS.spread("The Year of Becoming Unstoppable", "Thirty didn't arrive quietly. It came with bold leaps, new addresses, and the realization that the best chapters were never in the outline.", "MILESTONE EDITION", 2),
        PAGE_BLOCKS.gallery("PARTY ALBUM", "The Night the Cake Disappeared", 3, 4, 5),
        PAGE_BLOCKS.dedication("HAPPY 30TH BIRTHDAY", "May this coming year ask gentler questions of you and return you to the people who love you most.\n\nKeep growing toward your own light.", "Celebrated with PAPERLY", "#e9dcc3")
      ]
    },

    "couple": {
      name: "Two of Us",
      category: "Couple",
      description: "Two people, one story. How we met and our favourite ordinary days.",
      pages: [
        PAGE_BLOCKS.cover("TWO OF US", "ISSUE NO. 1 · AUTUMN", "How we met. Our favourite ordinary days.", 2, "#1a1a1a", "#f6f0e4"),
        PAGE_BLOCKS.feature("CHAPTER ONE", "Monsoon, Coffee, and One Broken Umbrella", "It began with torrential rain and a crowded café where only one corner table was free. Two coffees turned into three hours, and neither of us wanted the storm to end.", "“Love isn't always grand gestures; it is saving the warm croissant for each other.”", 3),
        PAGE_BLOCKS.spread("The Summer We Stopped Checking the Time", "It began with a borrowed camera and a long road south. By the last evening, the film was nearly gone and nobody wanted to leave.", "THE JOURNEY", 0),
        PAGE_BLOCKS.dedication("FOR MY FAVORITE HUMAN", "Every ordinary day is an adventure when you are across the table.\n\nI would choose you in every lifetime.", "Forever & Always, Yours", "#f6f0e4")
      ]
    },

    "anniversary": {
      name: "Ten Years, Retold",
      category: "Anniversary",
      description: "Years, in chapters. We kept every ticket stub. Tonight, we put them in order.",
      pages: [
        PAGE_BLOCKS.cover("TEN YEARS", "A DECADE RETOLD · 2016–2026", "A decade of small miracles, quiet victories, and fierce devotion.", 3, "#e3d5bd", "#0c0b0a"),
        PAGE_BLOCKS.spread("A Decade of Kitchen Table Conversations", "We kept every train ticket, concert stub, and postcard. Looking back, the grand milestones blur, but the quiet Tuesday mornings shine like gold.", "TEN YEARS OF US", 1),
        PAGE_BLOCKS.gallery("THE ARCHIVE", "Ten Years, Ten Thousand Smiles", 2, 4, 5),
        PAGE_BLOCKS.dedication("A DECADE OF DEVOTION", "To the one who has held my hand through every storm and every sunshine.\n\nTen years down, a lifetime to go.", "With all my heart, Forever", "#f4ede0")
      ]
    },

    "travel": {
      name: "Lisbon After Dark",
      category: "Travel",
      description: "Trips worth keeping. Trams, tiled walls, and one very long dinner.",
      pages: [
        PAGE_BLOCKS.cover("LISBON AFTER DARK", "TRAVEL JOURNAL · ISSUE 4", "Trams, tiled walls, and one very long dinner.", 4, "#f6f0e4", "#0c0b0a"),
        PAGE_BLOCKS.feature("EXPEDITION", "Lost in the Streets of Alfama", "Cobblestones polished smooth by centuries, laundry waving like celebration banners, and the bittersweet melancholy of Fado drifting from open windows.", "“Travel is the only expense that makes you infinitely richer.”", 5),
        PAGE_BLOCKS.spread("Where the Atlantic Meets the Sky", "We stood at Cabo da Roca with salt on our lips and the edge of the old world at our feet. We were small, and the world was magnificent.", "COASTAL DIARIES", 0),
        PAGE_BLOCKS.dedication("POSTCARD HOME", "To everyone who told us to take the detour.\n\nYou were right. The road less traveled was everything.", "Written in Lisbon · With PAPERLY", "#e9dcc3")
      ]
    },

    "fashion": {
      name: "The Unhurried Season",
      category: "Fashion",
      description: "Style, edited. A curated study in light, leisure, and elegance.",
      pages: [
        PAGE_BLOCKS.cover("EDITORIAL", "THE UNHURRIED SEASON", "In praise of quiet luxury and deliberate attention.", 5, "#0c0b0a", "#f4ede0"),
        PAGE_BLOCKS.feature("WARDROBE", "A Study in Linen and Amber", "True luxury does not clamor for attention. It exists in the drape of natural fibers, the warmth of morning sun, and the ease of a woman at peace with herself.", "“Style is a way to say who you are without having to speak.”", 2),
        PAGE_BLOCKS.gallery("LOOKBOOK", "Light, Texture & Form", 3, 4, 1),
        PAGE_BLOCKS.dedication("COLOPHON", "Created with PAPERLY Magazine Studio.\nDesigned for collectors of rare and thoughtful moments.", "PAPERLY Publishing House", "#0c0b0a")
      ]
    }
  };

  return {
    PAGE_BLOCKS,
    EDITIONS,
    art,
    elem
  };
})();

if (typeof window !== 'undefined') {
  window.PAPERLY_TEMPLATES = PAPERLY_TEMPLATES;
}

