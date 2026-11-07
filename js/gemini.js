/**
 * PAPERLY — Google Gemini AI Integration Engine
 * Generates bespoke editorial copy, captions, headlines and stories in PAPERLY's signature magazine voice.
 */

const PAPERLY_GEMINI = (() => {
  const STORAGE_KEY = 'paperly_gemini_api_key';
  const DEFAULT_MODEL = 'gemini-2.5-flash';

  // Offline editorial fallbacks for instant demo & offline resilience
  const OFFLINE_LIBRARY = {
    Emotional: {
      Headline: [
        "The Day My Heart Learned to Stay",
        "Held in Light, Kept Forever",
        "Where the Sun Remembered Us",
        "Moments That Outlasted the Afternoon"
      ],
      Caption: [
        "Some moments ask nothing of us but to be felt.",
        "I did not know then how much this quiet afternoon would mean.",
        "Caught between the light and the silence, exactly where we wanted to be.",
        "Proof that time moves slower when you're paying attention."
      ],
      Story: [
        "It still lives in the quiet corners of my memory. We didn't plan the route or watch the time; we simply allowed the day to unfold, and in doing so, created the kind of hours you remember for decades.",
        "Years from now, this is what I will reach for first: the laughter that started from nothing, the golden light pooling on the table, and the feeling that nowhere else in the world mattered."
      ],
      Wish: [
        "May every year return you to the people and places where you feel most yourself.",
        "Happy birthday. You make every ordinary room brighter and every shared memory richer."
      ],
      Dedication: [
        "For you, who stayed when staying was hard, and made joy look effortless.",
        "To the one who taught me what home feels like, wherever we are."
      ]
    },
    Cute: {
      Headline: [
        "Tiny Moments, Giant Smiles",
        "Snack Time Is Basically a National Holiday",
        "Caught in the Act of Being Adorable",
        "Adventures in Being Unapologetically Us"
      ],
      Caption: [
        "Caught mid-giggle. Zero regrets, maximum happiness.",
        "Plot twist: we were actually the main characters all along.",
        "Some days just require extra sprinkles and spontaneous dance breaks."
      ],
      Story: [
        "Honestly? Peak happiness. We set out with zero plans and ended up finding three stray kittens, sharing one oversized pastry, and deciding this was our greatest Tuesday yet.",
        "We were not being silly. We were being excellent at enjoying life. The photographic evidence speaks for itself."
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
        "Technically Legal, Highly Questionable"
      ],
      Caption: [
        "Nobody told us the camera was rolling. You're welcome.",
        "Proof that we can behave ourselves in public for at least 45 seconds.",
        "It seemed like a good idea at 4 PM. It was not, but it was hilarious."
      ],
      Story: [
        "Nothing went to plan, which turned out to be the masterstroke. We took the wrong turn twice, ordered food we couldn't pronounce, and laughed until our ribs ached.",
        "The brochure promised serene relaxation. What we actually delivered was pure chaotic comedy, and we wouldn't trade it for anything."
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
        "Chapters Written in Silence and Light"
      ],
      Caption: [
        "A pause between two chapters of an unfolding life.",
        "Stillness, if you look closely enough, is full of movement and grace.",
        "We inhabit memories long before we understand their weight."
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
        "The Gratitude That Fills Every Room"
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
        "A Curated Study in Light and Leisure"
      ],
      Caption: [
        "Photographed in the last amber light of an unforgettable evening.",
        "Understated, unforgettable, and entirely ours.",
        "Where restraint meets romance: the true essence of summer."
      ],
      Story: [
        "A deliberate study in light, leisure, and the understated beauty of the everyday. Elegance is not what is added, but the quiet confidence of knowing what to keep.",
        "The coast yielded its warmth slowly. In the end, the most luxurious souvenirs were not things we bought, but the stillness we were finally able to keep."
      ],
      Wish: [
        "An exquisite year to you, filled with unhurried beauty and distinction.",
        "To another chapter written with grace, curiosity, and impeccable style."
      ],
      Dedication: [
        "Dedicated to those rare souls who define elegance without effort.",
        "For you: in quiet, enduring admiration."
      ]
    }
  };

  function getApiKey() {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function setApiKey(key) {
    try {
      if (key && key.trim()) {
        localStorage.setItem(STORAGE_KEY, key.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY);
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
   * Crafts high-end editorial system instructions for Gemini
   */
  function buildSystemInstruction(tone, kind) {
    return `You are the Lead Editorial Director and Writer for PAPERLY, a prestigious luxury digital magazine studio inspired by Kinfolk, Vogue, Vanity Fair, Cereal, and Architectural Digest.
Your readers transform their real photographs, personal memories, relationships, and milestones into museum-grade published magazines.

TONE SPECIFICATION: "${tone}".
- Emotional: Heartfelt, poetic, tender, nostalgic, luminous warmth.
- Cute: Warm, charming, lighthearted, playful, lovable without being cheesy.
- Funny: Witty, fond banter, clever observational humor, affectionate sarcasm.
- Deep: Literary, philosophical, poignant, reflective, poetic depth.
- Meaningful: Sincere, grounded, celebrating enduring family bonds, legacy and gratitude.
- Luxury Editorial: High-fashion, unhurried, minimalist elegance, refined and evocative.

CONTENT FORMAT: "${kind}".
- Headline: 4 to 8 words maximum. Punchy, poetic, striking title suitable for a magazine cover or feature opener. Do NOT wrap in quotes. Title Case.
- Caption: 1 to 2 evocative sentences that breathe life into a photograph or moment.
- Story: 2 to 4 sentences or a compelling magazine paragraph written in the first person ("we" or "I").
- Wish: 1 to 3 sentences celebrating a milestone or birthday with warmth and genuine heart.
- Dedication: 1 to 2 poetic lines honoring someone special.

CRITICAL RULES:
- Never use clichés or generic AI filler like "In a world where..." or "Embark on a journey".
- Write with cadence, tactile detail, and emotional resonance.
- Return ONLY the clean, final copy ready to be printed on the magazine page. Do not include markdown labels, quotes around titles, or conversational intros/outros.`;
  }

  /**
   * Main text generation using Gemini REST API
   */
  async function generate({ tone = 'Emotional', kind = 'Headline', memo = '', action = 'gen', existingText = '' }) {
    const apiKey = getApiKey();

    if (!apiKey) {
      // Use fallback library
      return getFallback(tone, kind, memo, action, existingText);
    }

    let userPrompt = '';
    if (action === 'gen') {
      userPrompt = memo.trim()
        ? `Here is the user's memory and notes: "${memo.trim()}". Write a ${kind} in ${tone} style.`
        : `Write a compelling ${kind} in ${tone} style for a personal digital magazine.`;
    } else if (action === 'rw' || action === 'an') {
      userPrompt = `Rewrite the following editorial copy to give it a fresh angle and alternative expression in ${tone} style:\n"${existingText || memo}"`;
    } else if (action === 'em') {
      userPrompt = `Take this copy and make it noticeably more heartfelt, nostalgic, and emotionally resonant:\n"${existingText || memo}"`;
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
          temperature: 0.8,
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
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${response.status}`;
        console.warn(`Gemini API returned error: ${errMsg}. Using editorial fallback.`);
        return {
          text: getFallback(tone, kind, memo, action, existingText).text,
          source: 'fallback',
          error: errMsg
        };
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const resultText = candidate?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error('Empty response from Gemini');
      }

      // Clean quotation marks if a headline
      const cleaned = (kind === 'Headline') ? resultText.replace(/^["']|["']$/g, '').trim() : resultText;

      return {
        text: cleaned,
        source: 'gemini',
        model: DEFAULT_MODEL
      };
    } catch (err) {
      console.warn('Gemini request failed:', err);
      return {
        text: getFallback(tone, kind, memo, action, existingText).text,
        source: 'fallback',
        error: err.message
      };
    }
  }

  /**
   * Multimodal Gemini Vision: Describe and write captions for uploaded photographs
   */
  async function generateFromImage({ dataUrl, tone = 'Emotional', kind = 'Caption', memo = '' }) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        text: getFallback(tone, kind, memo, 'gen').text,
        source: 'fallback',
        error: 'API key not configured'
      };
    }

    // Extract base64 and mime type from dataUrl
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return {
        text: getFallback(tone, kind, memo, 'gen').text,
        source: 'fallback',
        error: 'Invalid image format'
      };
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const promptText = memo.trim()
      ? `Examine this photograph closely. Combined with the photographer's memory: "${memo.trim()}", write a ${kind} in ${tone} editorial style for PAPERLY magazine.`
      : `Examine this photograph closely. Write an evocative, editorial ${kind} in ${tone} style for PAPERLY magazine that captures its mood, lighting, and human emotion.`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

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
              { text: promptText }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 400
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) throw new Error('No content returned');

      return {
        text: (kind === 'Headline') ? resultText.replace(/^["']|["']$/g, '').trim() : resultText,
        source: 'gemini-vision',
        model: DEFAULT_MODEL
      };
    } catch (err) {
      console.warn('Gemini vision failed:', err);
      return {
        text: getFallback(tone, kind, memo, 'gen').text,
        source: 'fallback',
        error: err.message
      };
    }
  }

  /**
   * Offline fallback generator
   */
  let fallbackIndex = 0;
  function getFallback(tone, kind, memo, action, existingText) {
    const toneSet = OFFLINE_LIBRARY[tone] || OFFLINE_LIBRARY.Emotional;
    const items = toneSet[kind] || toneSet.Headline;
    fallbackIndex++;
    const chosen = items[fallbackIndex % items.length];

    let result = chosen;
    if (memo && kind === 'Story') {
      const cleanMemo = memo.trim().replace(/[.!?]*$/, '. ');
      result = `${cleanMemo}${chosen}`;
    }

    if (action === 'sh' && (existingText || result)) {
      result = (existingText || result).split(/[.!?]/)[0] + '.';
    }

    return {
      text: result,
      source: 'offline'
    };
  }

  return {
    getApiKey,
    setApiKey,
    hasApiKey,
    generate,
    generateFromImage,
    tones: Object.keys(OFFLINE_LIBRARY),
    kinds: ['Headline', 'Caption', 'Story', 'Wish', 'Dedication']
  };
})();

if (typeof window !== 'undefined') {
  window.PAPERLY_GEMINI = PAPERLY_GEMINI;

  // PAPERLY_AI — high-level adapter used by the Creation Wizard (create.html)
  // Wraps PAPERLY_GEMINI with named methods and tone/format mapping.
  window.PAPERLY_AI = {
    /**
     * @param {{ recipient, occasion, details, tone }} opts
     */
    generateHeadline: ({ recipient, occasion, details, tone = 'Emotional' }) =>
      PAPERLY_GEMINI.generate({
        tone: normalizeTone(tone),
        kind: 'Headline',
        memo: `Recipient: ${recipient}. Occasion: ${occasion}. Notes: ${details}`,
        action: 'gen'
      }).then(r => r.text),

    generateStory: ({ recipient, occasion, details, tone = 'Emotional' }) =>
      PAPERLY_GEMINI.generate({
        tone: normalizeTone(tone),
        kind: 'Story',
        memo: `Recipient: ${recipient}. Occasion: ${occasion}. Notes: ${details}`,
        action: 'gen'
      }).then(r => r.text),

    generateDedication: ({ recipient, occasion, details, tone = 'Emotional' }) =>
      PAPERLY_GEMINI.generate({
        tone: normalizeTone(tone),
        kind: 'Dedication',
        memo: `Recipient: ${recipient}. Occasion: ${occasion}. Notes: ${details}`,
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
        memo: `For ${recipient}. ${occasion}. Notes: ${details}`,
        action: 'gen'
      }).then(r => r.text),
  };

  // Maps wizard tone keys to PAPERLY_GEMINI tone strings
  function normalizeTone(t) {
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

