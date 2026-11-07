/**
 * PAPERLY — Google Gemini AI Integration Engine
 * Generates bespoke editorial copy, captions, headlines, and long-form stories
 * trained on the world's most prestigious editorial publications:
 * Vogue, Kinfolk, Cereal, The New Yorker, Vanity Fair, and Architectural Digest.
 */

const PAPERLY_GEMINI = (() => {
  const STORAGE_KEY = 'paperly_gemini_api_key';
  const DEFAULT_MODEL = 'gemini-2.5-flash';

  // --- EDITORIAL TRAINING CORPUS & KNOWLEDGE BASE ---
  const EDITORIAL_KNOWLEDGE_BASE = {
    fewShotExamples: [
      {
        input: "Went to Goa with Meera, rained the whole time, best trip ever",
        kind: "Headline",
        tone: "Emotional",
        output: "Monsoon, Meera and a Very Small Umbrella"
      },
      {
        input: "Went to Goa with Meera, rained the whole time, best trip ever",
        kind: "Story",
        tone: "Emotional",
        output: "The forecast promised sunshine, but the sky had other ideas. For seven days, we ran through drenched cobblestones and shared half-soaked pastries under an awning that leaked. It was the best trip of our lives not because anything went according to plan, but because neither of us cared that it didn't."
      },
      {
        input: "Celebrating 10 years together. Met in college library reading poetry.",
        kind: "Headline",
        tone: "Luxury Editorial",
        output: "Ten Years, Retold: From Library Stacks to Forever"
      },
      {
        input: "Sister turning 30, always there for me, crazy road trips and late night calls.",
        kind: "Dedication",
        tone: "Meaningful",
        output: "For my sister: the anchor in every storm and the first to turn up the radio when the road opens up. Happy 30th."
      },
      {
        input: "Solo road trip through Portugal cliffs, drinking espresso overlooking the sea.",
        kind: "Caption",
        tone: "Deep",
        output: "The Atlantic had no opinion on my deadlines. I sat until the sun dipped under the tide, finally remembering what quiet felt like."
      },
      {
        input: "Three friends trying to bake a birthday cake and catching the kitchen towel on fire.",
        kind: "Story",
        tone: "Funny",
        output: "The recipe called for twenty minutes at 180 degrees. It did not mention the tea towel catching fire, the icing sliding off the side like a tectonic shift, or three grown adults weeping with laughter on the tile floor. The cake tasted terrible; the night was Michelin-starred."
      },
      {
        input: "A baby's first steps in the garden wearing oversized yellow boots.",
        kind: "Caption",
        tone: "Cute",
        output: "Two feet, six unsteady wobbles, and an entire universe discovered between the lavender bushes."
      }
    ],

    vocabularyBank: {
      tactile: ["amber light", "grain of the film", "rain-slicked stone", "sun-bleached cotton", "creased train tickets", "faded ink", "cool linen"],
      emotional: ["unhurried warmth", "unspoken kinship", "tender quiet", "fierce devotion", "quiet triumph", "irrepressible laughter", "lasting grace"],
      cadence: ["short punchy declaratives", "sensory grounded realism", "poetic closing cadence free from cliché"]
    }
  };

  // Expanded Offline Library for complete local offline resilience
  const OFFLINE_LIBRARY = {
    Emotional: {
      Headline: [
        "The Day My Heart Learned to Stay",
        "Held in Light, Kept Forever",
        "Where the Sun Remembered Us",
        "Moments That Outlasted the Afternoon",
        "The Summer We Stopped Checking the Time",
        "A Letter to the Ordinary Days"
      ],
      Caption: [
        "Some moments ask nothing of us but to be felt.",
        "I did not know then how much this quiet afternoon would mean.",
        "Caught between the light and the silence, exactly where we wanted to be.",
        "Proof that time moves slower when you're paying attention.",
        "The sound of her laughter echoing down the hallway."
      ],
      Story: [
        "It still lives in the quiet corners of my memory. We didn't plan the route or watch the time; we simply allowed the day to unfold, and in doing so, created the kind of hours you remember for decades.",
        "Years from now, this is what I will reach for first: the laughter that started from nothing, the golden light pooling on the table, and the feeling that nowhere else in the world mattered.",
        "There is a particular gentleness to looking back at moments when you were completely, effortlessly happy. We had nowhere to be, and somehow that was everything."
      ],
      Wish: [
        "May every year return you to the people and places where you feel most yourself.",
        "Happy birthday. You make every ordinary room brighter and every shared memory richer.",
        "Wishing you unhurried mornings, deep laughter, and love that never wavers."
      ],
      Dedication: [
        "For you, who stayed when staying was hard, and made joy look effortless.",
        "To the one who taught me what home feels like, wherever we are.",
        "To every tomorrow that begins with your smile across the table."
      ]
    },
    Cute: {
      Headline: [
        "Tiny Moments, Giant Smiles",
        "Snack Time Is Basically a National Holiday",
        "Caught in the Act of Being Adorable",
        "Adventures in Being Unapologetically Us",
        "Little Things, Infinite Joy"
      ],
      Caption: [
        "Caught mid-giggle. Zero regrets, maximum happiness.",
        "Plot twist: we were actually the main characters all along.",
        "Some days just require extra sprinkles and spontaneous dance breaks.",
        "Officially the best decision we made all week."
      ],
      Story: [
        "Honestly? Peak happiness. We set out with zero plans and ended up finding three stray kittens, sharing one oversized pastry, and deciding this was our greatest Tuesday yet.",
        "We were not being silly. We were being excellent at enjoying life. The photographic evidence speaks for itself.",
        "Rule number one: if something makes you laugh until your stomach hurts, it belongs in the magazine."
      ],
      Wish: [
        "Happy birthday! Cake first, adulting later (or never).",
        "Another lap around the sun and you're still the sweetest human on the planet!"
      ],
      Dedication: [
        "To my favourite human, with a tiny heart doodle and infinite hugs.",
        "For you: my sunshine in sneakers, forever and always."
      ]
    },
    Funny: {
      Headline: [
        "Plans? We Had None. It Was Perfect",
        "Seven Photos, One Good Hair Day",
        "The Group Chat Will Never Let Us Forget",
        "Technically Legal, Highly Questionable",
        "Chronicles of Questionable Choices"
      ],
      Caption: [
        "Nobody told us the camera was rolling. You're welcome.",
        "Proof that we can behave ourselves in public for at least 45 seconds.",
        "It seemed like a good idea at 4 PM. It was not, but it was hilarious.",
        "Exhibit A in why we aren't allowed to make decisions unsupervised."
      ],
      Story: [
        "Nothing went to plan, which turned out to be the masterstroke. We took the wrong turn twice, ordered food we couldn't pronounce, and laughed until our ribs ached.",
        "The brochure promised serene relaxation. What we actually delivered was pure chaotic comedy, and we wouldn't trade it for anything in the world."
      ],
      Wish: [
        "Happy birthday! You aren't getting older, you're just becoming a vintage classic.",
        "Another year wiser, yet somehow still ready to make questionable choices with me."
      ],
      Dedication: [
        "To the one who laughs at my jokes even before the punchline.",
        "For you: the reason my face hurts from smiling in every photo."
      ]
    },
    Deep: {
      Headline: [
        "What Remains When the Noise Fades",
        "Time Is Kind to Those Who Notice",
        "The Architecture of a Quiet Season",
        "Chapters Written in Silence and Light",
        "The Geography of Memory"
      ],
      Caption: [
        "A pause between two chapters of an unfolding life.",
        "Stillness, if you look closely enough, is full of movement and grace.",
        "We inhabit memories long before we understand their true weight."
      ],
      Story: [
        "Memory is not merely what occurred; it is what lingered behind after the noise receded. In this season, we learned that the deepest transformations happen quietly, without fanfare.",
        "We are composed of such ordinary, unrepeatable afternoons. To hold them in print is to honour the quiet truth of who we were becoming."
      ],
      Wish: [
        "May this coming year ask better, gentler questions of your soul.",
        "Happy birthday. Keep growing toward the light you already carry within."
      ],
      Dedication: [
        "For those rare souls who shape us without ever needing to ask.",
        "To the quiet people whose presence holds our scattered world together."
      ]
    },
    Meaningful: {
      Headline: [
        "The People Who Make Us Who We Are",
        "A Life Measured in Gathered Moments",
        "Roots, Wings and Unbroken Circles",
        "The Gratitude That Fills Every Room",
        "Heirlooms of the Heart"
      ],
      Caption: [
        "Together is simply the best place we have ever been.",
        "Generations of love captured in a single, unhurried frame.",
        "Every thread of our story leads back to this very bond."
      ],
      Story: [
        "What matters in this life is rarely loud. It is the steady hands, the people who show up without being called, and the unshakeable foundation we build together through every season.",
        "Looking back at this chapter, we see how every detour brought us closer. This magazine is our shared testimony to the family and friendships that sustain us."
      ],
      Wish: [
        "Wishing you a year as generous and compassionate as your own heart.",
        "Happy birthday, and thank you for being the anchor in all our lives."
      ],
      Dedication: [
        "With endless gratitude for everything you gave without asking in return.",
        "To family: the first, finest, and most enduring story we know."
      ]
    },
    "Luxury Editorial": {
      Headline: [
        "In Praise of the Unhurried Season",
        "The Art of Being Present",
        "Golden Hours Along the Coast",
        "A Curated Study in Light and Leisure",
        "Minimalism, Warmth and Wonder"
      ],
      Caption: [
        "Photographed in the last amber light of an unforgettable evening.",
        "Understated, unforgettable, and entirely ours.",
        "Where restraint meets romance: the true essence of summer.",
        "A quiet composition in linen, shadow, and warm earth."
      ],
      Story: [
        "True luxury does not clamour for attention. It exists in the unhurried morning espresso, the gentle drape of natural linen, and the ease of an hour spent with someone who asks nothing of you but your company.",
        "We curated this issue not as a catalogue of events, but as a sensory record: the sound of sea salt against stone, the perfume of late summer jasmine, and the deliberate luxury of staying still."
      ],
      Wish: [
        "May your upcoming year be characterized by clarity, beauty, and deliberate joy.",
        "To a year of exquisite tastes, meaningful accomplishments, and peace."
      ],
      Dedication: [
        "To collectors of rare moments and thoughtful beauty.",
        "Crafted with PAPERLY Studio · In honour of enduring elegance."
      ]
    }
  };

  // --- API KEY STORAGE ---
  function getApiKey() {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function setApiKey(key) {
    try {
      if (!key) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, key.trim());
      }
      return true;
    } catch (e) {
      console.error('Failed to save API key:', e);
      return false;
    }
  }

  function hasApiKey() {
    const key = getApiKey();
    return Boolean(key && key.length > 10);
  }

  /**
   * Constructs deep editorial system instructions with in-context training examples
   */
  function buildSystemInstruction(tone, kind) {
    const examples = EDITORIAL_KNOWLEDGE_BASE.fewShotExamples
      .filter(ex => ex.kind === kind || ex.tone === tone)
      .slice(0, 3)
      .map(ex => `INPUT: "${ex.input}" -> OUTPUT: "${ex.output}"`)
      .join('\n');

    return `You are the Lead Editorial Director and Chief Wordsmith for PAPERLY, the high-end digital publishing house inspired by Vogue, Kinfolk, The New Yorker, Vanity Fair, Cereal, and Architectural Digest.
Your readers convert real photographs, intimate memories, family bonds, and milestones into museum-grade published magazines.

TONE SPECIFICATION: "${tone}".
- Emotional: Poetic, tender, nostalgic, luminous warmth.
- Cute: Warm, charming, lighthearted, lovable without being cheesy.
- Funny: Witty, fond banter, observational humor, affectionate irony.
- Deep: Literary, philosophical, poignant, reflective, poetic depth.
- Meaningful: Sincere, grounded, celebrating enduring bonds and gratitude.
- Luxury Editorial: High-fashion, unhurried, minimalist elegance, refined and evocative.

CONTENT FORMAT: "${kind}".
- Headline: 4 to 8 words maximum. Punchy, poetic, striking title suitable for a luxury magazine cover or feature opener. Do NOT wrap in quotes. Title Case.
- Caption: 1 to 2 evocative sentences that breathe life into a photograph or moment.
- Story: 2 to 4 sentences or a compelling magazine paragraph written in the first person ("we" or "I").
- Wish: 1 to 3 sentences celebrating a milestone or birthday with warmth and genuine heart.
- Dedication: 1 to 2 poetic lines honoring someone special.

FEW-SHOT EDITORIAL EXAMPLES (TRAINING CONTEXT):
${examples}

CRITICAL RULES:
- Never use generic AI clichés like "In a world where...", "embark on a journey", or "testament to...".
- Write with cadence, tactile detail (${EDITORIAL_KNOWLEDGE_BASE.vocabularyBank.tactile.slice(0, 3).join(', ')}), and genuine emotional subtext.
- Return ONLY the clean, final copy ready to be printed on the magazine page. Do not include markdown labels, quotes around titles, or conversational intros/outros.`;
  }

  /**
   * Main text generation using Gemini REST API with local context fallback
   */
  async function generate({ tone = 'Emotional', kind = 'Headline', memo = '', action = 'gen', existingText = '' }) {
    const apiKey = getApiKey();

    if (!apiKey) {
      return getFallback(tone, kind, memo, action, existingText);
    }

    let userPrompt = '';
    if (action === 'gen') {
      userPrompt = memo.trim()
        ? `Here is the user's personal memory and notes:\n"${memo.trim()}"\n\nWrite a ${kind} in ${tone} style.`
        : `Write a compelling, evocative ${kind} in ${tone} style for a luxury personal digital magazine.`;
    } else if (action === 'rw' || action === 'an') {
      userPrompt = `Rewrite the following editorial copy to give it a fresh angle and alternative expression in ${tone} style:\n"${existingText || memo}"`;
    } else if (action === 'em') {
      userPrompt = `Take this copy and make it noticeably more heartfelt, nostalgic, and emotionally resonant in ${tone} style:\n"${existingText || memo}"`;
    } else if (action === 'sh') {
      userPrompt = `Make this ${kind} more concise, punchy and minimalist, while keeping its emotional punch:\n"${existingText || memo}"`;
    } else if (action === 'ex') {
      userPrompt = `Expand this memory into a rich, immersive magazine paragraph with sensory details in ${tone} style:\n"${existingText || memo}"`;
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
      
      const payload = {
        system_instruction: {
          parts: [{ text: buildSystemInstruction(tone, kind) }]
        },
        contents: [
          {
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 500,
          topP: 0.95
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = cleanOutput(rawText, kind);

      return {
        text: cleaned || getFallback(tone, kind, memo, action, existingText).text,
        source: 'gemini'
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to trained editorial library:', err.message);
      const fb = getFallback(tone, kind, memo, action, existingText);
      fb.error = err.message;
      return fb;
    }
  }

  /**
   * Multimodal image captioning with Gemini Vision
   */
  async function generateFromImage({ dataUrl, tone = 'Emotional', kind = 'Caption', memo = '' }) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return getFallback(tone, kind, memo, 'gen', '');
    }

    try {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        throw new Error('Invalid image data URL format');
      }
      const mimeType = match[1];
      const base64Data = match[2];

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const userText = memo.trim()
        ? `Look closely at this photograph and these personal notes: "${memo.trim()}". Write a magazine ${kind} in ${tone} style.`
        : `Look closely at this photograph. Observe the light, colors, emotions, and atmosphere. Write a magazine ${kind} in ${tone} style.`;

      const payload = {
        system_instruction: {
          parts: [{ text: buildSystemInstruction(tone, kind) }]
        },
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              },
              { text: userText }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 300
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return {
        text: cleanOutput(rawText, kind),
        source: 'gemini-vision'
      };
    } catch (e) {
      console.warn('Vision generation error:', e);
      return getFallback(tone, kind, memo, 'gen', '');
    }
  }

  function cleanOutput(text, kind) {
    if (!text) return '';
    let t = text.trim();
    if (kind === 'Headline') {
      t = t.replace(/^["'`“]+|["'`”]+$/g, '').replace(/^(Headline|Title):\s*/i, '');
    }
    return t;
  }

  function getFallback(tone, kind, memo, action, existingText) {
    const toneSet = OFFLINE_LIBRARY[tone] || OFFLINE_LIBRARY.Emotional;
    const items = toneSet[kind] || toneSet.Headline;
    const item = items[Math.floor(Math.random() * items.length)];

    return {
      text: item,
      source: 'offline-editorial-corpus'
    };
  }

  return {
    getApiKey,
    setApiKey,
    hasApiKey,
    generate,
    generateFromImage,
    tones: Object.keys(OFFLINE_LIBRARY),
    knowledgeBase: EDITORIAL_KNOWLEDGE_BASE
  };
})();

if (typeof window !== 'undefined') {
  window.PAPERLY_GEMINI = PAPERLY_GEMINI;

  // PAPERLY_AI — High-level context-aware adapter used by the Creation Wizard (create.html)
  window.PAPERLY_AI = {
    generateHeadline: ({ recipient, occasion, details, tone = 'Emotional' }) =>
      PAPERLY_GEMINI.generate({
        tone: normalizeTone(tone),
        kind: 'Headline',
        memo: `Recipient: ${recipient || 'Honored guest'}. Occasion: ${occasion || 'Celebration'}. Notes: ${details || ''}`,
        action: 'gen'
      }).then(r => r.text),

    generateStory: ({ recipient, occasion, details, tone = 'Emotional' }) =>
      PAPERLY_GEMINI.generate({
        tone: normalizeTone(tone),
        kind: 'Story',
        memo: `Recipient: ${recipient || 'Our story'}. Occasion: ${occasion || 'Milestone'}. Notes: ${details || ''}`,
        action: 'gen'
      }).then(r => r.text),

    generateDedication: ({ recipient, occasion, details, tone = 'Emotional' }) =>
      PAPERLY_GEMINI.generate({
        tone: normalizeTone(tone),
        kind: 'Dedication',
        memo: `Recipient: ${recipient || 'Loved one'}. Occasion: ${occasion || 'Tribute'}. Notes: ${details || ''}`,
        action: 'gen'
      }).then(r => r.text),

    generateCaption: ({ details, tone = 'Emotional' }) =>
      PAPERLY_GEMINI.generate({
        tone: normalizeTone(tone),
        kind: 'Caption',
        memo: details,
        action: 'gen'
      }).then(r => r.text),

    generateWish: ({ recipient, occasion, details, tone = 'Emotional' }) =>
      PAPERLY_GEMINI.generate({
        tone: normalizeTone(tone),
        kind: 'Wish',
        memo: `For ${recipient || 'Friend'}. ${occasion || 'Milestone'}. Notes: ${details || ''}`,
        action: 'gen'
      }).then(r => r.text)
  };

  function normalizeTone(t) {
    if (!t) return 'Emotional';
    const MAP = {
      emotional: 'Emotional',
      cute: 'Cute',
      funny: 'Funny',
      deep: 'Deep',
      meaningful: 'Meaningful',
      luxury: 'Luxury Editorial'
    };
    return MAP[t] || MAP[t.toLowerCase()] || 'Emotional';
  }
}
