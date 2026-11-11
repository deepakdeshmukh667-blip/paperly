-- ====================================================================
-- PAPERLY — Cloudflare D1 Migration 0002: Template Studio Extension
-- ====================================================================

-- 1. Extend magazine_templates with studio metadata
ALTER TABLE magazine_templates ADD COLUMN tags TEXT DEFAULT '[]';
ALTER TABLE magazine_templates ADD COLUMN mood TEXT DEFAULT 'Sophisticated';
ALTER TABLE magazine_templates ADD COLUMN page_count INTEGER DEFAULT 4;
ALTER TABLE magazine_templates ADD COLUMN photo_slots INTEGER DEFAULT 4;
ALTER TABLE magazine_templates ADD COLUMN source_type TEXT DEFAULT 'original'; -- 'imported' | 'inspired' | 'user'
ALTER TABLE magazine_templates ADD COLUMN source_attribution TEXT;
ALTER TABLE magazine_templates ADD COLUMN theme_tokens TEXT;

-- 2. User Favorite Templates Table
CREATE TABLE IF NOT EXISTS user_favorite_templates (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL REFERENCES magazine_templates(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_fav_user ON user_favorite_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_fav_tpl ON user_favorite_templates(template_id);
