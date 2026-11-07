-- ====================================================================
-- PAPERLY — Cloudflare D1 Relational Database Schema
-- Version: 1.0.0
-- Description: Core tables for multi-tenant magazine publishing platform
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions Table (Compatible with Better Auth)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Magazine Projects Table
CREATE TABLE IF NOT EXISTS magazine_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    template_id TEXT,
    cover_image_key TEXT,
    status TEXT DEFAULT 'Draft', -- 'Draft', 'Published', 'Archived'
    page_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Magazine Pages Table
CREATE TABLE IF NOT EXISTS magazine_pages (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES magazine_projects(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    background_color TEXT DEFAULT '#f4ede0',
    background_image_key TEXT,
    page_data TEXT NOT NULL, -- JSON serialized element tree (els)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, page_number)
);

-- 5. Uploaded Images Metadata (Cloudflare R2 storage)
CREATE TABLE IF NOT EXISTS uploaded_images (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES magazine_projects(id) ON DELETE SET NULL,
    r2_object_key TEXT UNIQUE NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Magazine Templates Catalog
CREATE TABLE IF NOT EXISTS magazine_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    preview_image_url TEXT,
    template_data TEXT NOT NULL, -- JSON serialized page definitions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance & Security Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON magazine_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_project ON magazine_pages(project_id);
CREATE INDEX IF NOT EXISTS idx_images_user ON uploaded_images(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_cat ON magazine_templates(category);
