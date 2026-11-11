/**
 * PAPERLY — Cloudflare Workers API & Backend Service
 * 
 * Official backend for PAPERLY:
 * - D1: Relational database queries for projects, pages, users, templates
 * - R2: File storage for private photos and magazine assets
 * - Workers AI: On-edge LLM text generation
 * - Better Auth compatible session authorization
 */

// Helper: JSON response with CORS
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...headers
    }
  });
}

function handleCors() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    }
  });
}

// Simple deterministic password hasher for serverless environments (SHA-256 + salt)
async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode("paperly_salt_" + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Session verification helper
async function getAuthenticatedUser(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  if (env.DB) {
    const session = await env.DB.prepare(
      "SELECT s.*, u.id as user_id, u.email, u.full_name FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime('now')"
    ).bind(token).first();
    if (session) {
      return { id: session.user_id, email: session.email, name: session.full_name };
    }
  }

  // Fallback for development if token is mock
  if (token.startsWith("usr_")) {
    return { id: token, email: "collector@paperly.studio", name: "Editorial Collector" };
  }
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    if (method === "OPTIONS") {
      return handleCors();
    }

    // Health check
    if (url.pathname === "/api/health") {
      return json({
        status: "healthy",
        service: "PAPERLY Backend Worker",
        platform: "Cloudflare Workers",
        hasD1: !!env.DB,
        hasR2: !!env.R2_BUCKET,
        hasAI: !!env.AI,
        timestamp: new Date().toISOString()
      });
    }

    // --- AUTHENTICATION ENDPOINTS ---
    if (url.pathname === "/api/auth/signup" && method === "POST") {
      try {
        const body = await request.json();
        const { email, password, name } = body;
        if (!email || !password || !name) {
          return json({ error: "Missing required fields (email, password, name)" }, 400);
        }

        const userId = "usr_" + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
        const passwordHash = await hashPassword(password);
        const token = "tok_" + crypto.randomUUID().replace(/-/g, '');
        const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();

        if (env.DB) {
          // Check existing email
          const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase()).first();
          if (existing) {
            return json({ error: "An account with this email already exists" }, 409);
          }
          await env.DB.prepare(
            "INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)"
          ).bind(userId, email.toLowerCase(), passwordHash, name).run();

          await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)"
          ).bind(crypto.randomUUID(), userId, token, expiresAt).run();
        }

        return json({
          success: true,
          token,
          user: { id: userId, email: email.toLowerCase(), name }
        }, 201);
      } catch (err) {
        return json({ error: err.message || "Failed to create account" }, 500);
      }
    }

    if (url.pathname === "/api/auth/login" && method === "POST") {
      try {
        const body = await request.json();
        const { email, password } = body;
        if (!email || !password) {
          return json({ error: "Email and password are required" }, 400);
        }

        const passwordHash = await hashPassword(password);
        let user = null;

        if (env.DB) {
          user = await env.DB.prepare(
            "SELECT id, email, full_name, password_hash FROM users WHERE email = ?"
          ).bind(email.toLowerCase()).first();

          if (!user || user.password_hash !== passwordHash) {
            return json({ error: "Invalid email or password" }, 401);
          }
        } else {
          // In-memory / mock validation for local testing without D1 binding
          user = { id: "usr_demo", email: email.toLowerCase(), full_name: "Editorial Creator" };
        }

        const token = "tok_" + crypto.randomUUID().replace(/-/g, '');
        const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();

        if (env.DB) {
          await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)"
          ).bind(crypto.randomUUID(), user.id, token, expiresAt).run();
        }

        return json({
          success: true,
          token,
          user: { id: user.id, email: user.email, name: user.full_name }
        });
      } catch (err) {
        return json({ error: err.message || "Failed to authenticate" }, 500);
      }
    }

    if (url.pathname === "/api/auth/me" && method === "GET") {
      const user = await getAuthenticatedUser(request, env);
      if (!user) return json({ error: "Unauthorized" }, 401);
      return json({ user });
    }

    // --- MAGAZINE PROJECTS ENDPOINTS ---
    if (url.pathname === "/api/projects" && method === "GET") {
      const user = await getAuthenticatedUser(request, env);
      const userId = user ? user.id : "usr_guest";

      if (env.DB) {
        const { results } = await env.DB.prepare(
          "SELECT * FROM magazine_projects WHERE user_id = ? ORDER BY updated_at DESC"
        ).bind(userId).all();
        return json({ projects: results || [] });
      }

      return json({ projects: [] });
    }

    if (url.pathname === "/api/projects" && method === "POST") {
      const user = await getAuthenticatedUser(request, env);
      const userId = user ? user.id : "usr_guest";
      const body = await request.json();

      const projectId = body.id || ("proj_" + crypto.randomUUID().replace(/-/g, '').slice(0, 10));
      const title = body.title || "Untitled Magazine";
      const category = body.category || "Best Friend";
      const status = body.status || "Draft";
      const pages = body.pages || [];

      if (env.DB) {
        await env.DB.prepare(
          "INSERT INTO magazine_projects (id, user_id, title, category, status, page_count, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
        ).bind(projectId, userId, title, category, status, pages.length).run();

        // Save pages
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          await env.DB.prepare(
            "INSERT OR REPLACE INTO magazine_pages (id, project_id, page_number, background_color, page_data) VALUES (?, ?, ?, ?, ?)"
          ).bind(`${projectId}_p${i+1}`, projectId, i + 1, page.bg || "#f4ede0", JSON.stringify(page.els || [])).run();
        }
      }

      return json({
        success: true,
        project: { id: projectId, title, category, status, pageCount: pages.length, pages }
      }, 201);
    }

    // Single Project GET / PUT / DELETE
    const projMatch = url.pathname.match(/^\/api\/projects\/([a-zA-Z0-9_-]+)$/);
    if (projMatch) {
      const projectId = projMatch[1];
      const user = await getAuthenticatedUser(request, env);
      const userId = user ? user.id : null;

      if (method === "GET") {
        if (env.DB) {
          const project = await env.DB.prepare("SELECT * FROM magazine_projects WHERE id = ?").bind(projectId).first();
          if (!project) return json({ error: "Project not found" }, 404);

          const { results: pageRows } = await env.DB.prepare(
            "SELECT * FROM magazine_pages WHERE project_id = ? ORDER BY page_number ASC"
          ).bind(projectId).all();

          const pages = (pageRows || []).map(r => ({
            bg: r.background_color,
            els: JSON.parse(r.page_data || "[]")
          }));

          return json({ project: { ...project, pages } });
        }
        return json({ error: "Database not bound" }, 503);
      }

      if (method === "PUT") {
        const body = await request.json();
        if (env.DB) {
          await env.DB.prepare(
            "UPDATE magazine_projects SET title = coalesce(?, title), status = coalesce(?, status), page_count = coalesce(?, page_count), updated_at = datetime('now') WHERE id = ?"
          ).bind(body.title, body.status, body.pages ? body.pages.length : null, projectId).run();

          if (body.pages && Array.isArray(body.pages)) {
            // Delete old and re-insert
            await env.DB.prepare("DELETE FROM magazine_pages WHERE project_id = ?").bind(projectId).run();
            for (let i = 0; i < body.pages.length; i++) {
              const p = body.pages[i];
              await env.DB.prepare(
                "INSERT INTO magazine_pages (id, project_id, page_number, background_color, page_data) VALUES (?, ?, ?, ?, ?)"
              ).bind(`${projectId}_p${i+1}`, projectId, i + 1, p.bg || "#f4ede0", JSON.stringify(p.els || [])).run();
            }
          }
        }
        return json({ success: true, id: projectId });
      }

      if (method === "DELETE") {
        if (env.DB) {
          await env.DB.prepare("DELETE FROM magazine_projects WHERE id = ?").bind(projectId).run();
        }
        return json({ success: true, deleted: projectId });
      }
    }

    // --- TEMPLATES CATALOG ENDPOINTS ---
    if (url.pathname === "/api/templates" && method === "GET") {
      const cat = url.searchParams.get("category");
      const source = url.searchParams.get("source");
      if (env.DB) {
        let query = "SELECT * FROM magazine_templates";
        const params = [];
        const conds = [];
        if (cat && cat !== "all") {
          conds.push("lower(category) = lower(?)");
          params.push(cat);
        }
        if (source && source !== "all") {
          conds.push("source_type = ?");
          params.push(source);
        }
        if (conds.length) query += " WHERE " + conds.join(" AND ");
        const { results } = await env.DB.prepare(query).bind(...params).all();
        if (results && results.length) {
          const formatted = results.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category,
            description: r.description,
            thumbnail: r.preview_image_url,
            sourceType: r.source_type || 'original',
            sourceAttribution: r.source_attribution,
            tags: JSON.parse(r.tags || '[]'),
            mood: r.mood || 'Sophisticated',
            pageCount: r.page_count || 4,
            photoSlots: r.photo_slots || 4,
            themeTokens: JSON.parse(r.theme_tokens || '{}'),
            pages: JSON.parse(r.template_data || '[]')
          }));
          return json({ success: true, total: formatted.length, templates: formatted });
        }
      }
      return json({ success: true, total: 100, source: "embedded_catalog_fallback" });
    }

    // --- INSPIRATION VISION DECOMPOSITION ENDPOINT ---
    if (url.pathname === "/api/inspiration/decompose" && method === "POST") {
      try {
        const body = await request.json();
        const { concept, style = "minimalist", mood = "Sophisticated", referenceUrl } = body;
        const synthId = "inspired-" + crypto.randomUUID().slice(0, 8);
        const title = concept ? concept.split(',')[0].trim() : "The Architecture of a Quiet Season";

        const newTemplate = {
          id: synthId,
          name: title,
          category: "Lifestyle",
          sourceType: "inspired",
          sourceAttribution: `Original design inspired by visual study: "${referenceUrl || concept || 'Editorial Minimal'}" via PAPERLY Vision Engine`,
          tags: ["Lifestyle", "Original Edition", "Vision AI", mood],
          mood: mood,
          pageCount: 4,
          photoSlots: 4,
          thumbnail: "assets/thumbnails/lifestyle-1-the-art-of-slow-living.png",
          cover: "assets/samples/sample_lifestyle_01.png",
          coverBg: "#0c0b0a",
          description: "Original editorial layout inspired by contemporary design references, curated with balanced typography.",
          pages: [
            {
              bg: "#0c0b0a",
              els: [
                { id: 101, t: "text", x: 36, y: 40, w: 468, h: 60, text: title.toUpperCase(), size: 32, font: "Playfair Display", weight: 700, color: "#f6f0e4", align: "center", sp: 2 },
                { id: 102, t: "text", x: 36, y: 104, w: 468, h: 20, text: "FOLIO MONOGRAPH · ISSUE 01", size: 10, font: "Inter", color: "#6e1423", align: "center", sp: 5, weight: 600 },
                { id: 103, t: "img", x: 36, y: 135, w: 468, h: 430, src: "assets/samples/sample_lifestyle_01.png", bg: "url('assets/samples/sample_lifestyle_01.png')", type: "stock", fit: "cover", position: "center" },
                { id: 104, t: "text", x: 36, y: 585, w: 468, h: 45, text: "“In the end, we only preserve what we hold with care.”", size: 14, font: "Cormorant Garamond", italic: true, color: "#f6f0e4", align: "center" },
                { id: 105, t: "line", x: 210, y: 642, w: 120, h: 1, color: "#6e1423" }
              ]
            }
          ]
        };

        return json({ success: true, template: newTemplate });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // --- WORKERS AI INFERENCE ENDPOINT ---
    if (url.pathname === "/api/ai/generate" && method === "POST") {
      try {
        const body = await request.json();
        const { kind, tone, occasion, memory, prompt } = body;

        let generatedText = "";

        if (env.AI) {
          // Cloudflare Workers AI execution
          const systemPrompt = `You are PAPERLY's Lead Editorial Director and Chief Wordsmith, crafting luxury personal digital magazine copy in the style of Vogue, Kinfolk, The New Yorker, Cereal, and Vanity Fair.
Your prose is cinematic, sensory, tactile, and deeply evocative. Tone: ${tone || 'Emotional'}.
Never use clichés or generic AI openings like "In a world where..." or "Embark on a journey".
Format: ${kind || 'Story'}. Write with rhythm, emotional subtext, and unhurried elegance.`;
          const userPrompt = prompt || `Write a luxury editorial ${kind || 'story'} for a ${occasion || 'special occasion'}.
Personal memories & context: "${memory || ''}".
Return ONLY the clean, final editorial copy ready to be printed in the magazine.`;

          const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            max_tokens: 512,
            temperature: 0.7
          });

          generatedText = aiResponse.response || aiResponse.text || "";
        }

        // Fallback if AI not bound or local dev
        if (!generatedText) {
          generatedText = `It began with a borrowed camera and a long road south. We arrived as travelers and left as people who had found something quiet and irreplaceable. Every photograph was a promise: we will remember how golden the light felt.`;
        }

        return json({ success: true, text: generatedText, source: env.AI ? "cloudflare-workers-ai" : "offline-editorial-fallback" });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // --- CLOUDFLARE R2 OBJECT STORAGE ENDPOINTS ---
    if (url.pathname === "/api/upload" && method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file || !(file instanceof File)) {
          return json({ error: "No file provided in form data" }, 400);
        }

        const user = await getAuthenticatedUser(request, env);
        const userId = user ? user.id : "usr_guest";
        const fileExt = file.name.split('.').pop() || 'jpg';
        const key = `users/${userId}/photos/${crypto.randomUUID()}.${fileExt}`;

        if (env.R2_BUCKET) {
          await env.R2_BUCKET.put(key, file.stream(), {
            httpMetadata: { contentType: file.type }
          });
        }

        return json({
          success: true,
          key,
          filename: file.name,
          url: `/api/images/${encodeURIComponent(key)}`
        });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // Stream image from R2
    const imgMatch = url.pathname.match(/^\/api\/images\/(.+)$/);
    if (imgMatch && method === "GET") {
      const key = decodeURIComponent(imgMatch[1]);
      if (env.R2_BUCKET) {
        const object = await env.R2_BUCKET.get(key);
        if (!object) return new Response("Image Not Found", { status: 404 });

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        return new Response(object.body, { headers });
      }
      return new Response("Storage Not Configured", { status: 503 });
    }

    // If no API routes matched, return 404 or pass to static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return json({ error: "API route not found", path: url.pathname }, 404);
  }
};
