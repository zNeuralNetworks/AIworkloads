-- ============================================================================
-- COPY-PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- https://app.supabase.com/project/puktrjfoazyydypagvyj/sql
-- ============================================================================

-- DROP existing tables if needed (commented out for safety)
-- DROP TABLE IF EXISTS admin_edit_log CASCADE;
-- DROP TABLE IF EXISTS glossary CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS hpc_items CASCADE;
-- DROP TABLE IF EXISTS performance_data CASCADE;
-- DROP TABLE IF EXISTS protocol_concepts CASCADE;

-- ============================================================================
-- 1. GLOSSARY TABLE - Stores term definitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS glossary (
  term TEXT PRIMARY KEY,
  definition TEXT NOT NULL,
  category TEXT,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_glossary_category ON glossary(category);
ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;

-- RLS: Public can read, authenticated can write
CREATE POLICY "glossary_public_read" ON glossary
  FOR SELECT USING (true);

CREATE POLICY "glossary_auth_write" ON glossary
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "glossary_auth_insert" ON glossary
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "glossary_auth_delete" ON glossary
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 2. PRODUCTS TABLE - Stores platform/tool information
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  key_features JSONB,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "products_auth_write" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "products_auth_insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "products_auth_delete" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 3. HPC_ITEMS TABLE - Stores HPC checklist items
-- ============================================================================
CREATE TABLE IF NOT EXISTS hpc_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hpc_items_category ON hpc_items(category);
ALTER TABLE hpc_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hpc_items_public_read" ON hpc_items FOR SELECT USING (true);
CREATE POLICY "hpc_items_auth_write" ON hpc_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "hpc_items_auth_insert" ON hpc_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "hpc_items_auth_delete" ON hpc_items FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 4. PERFORMANCE_DATA TABLE - Stores chart data
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_data (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE performance_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perf_data_public_read" ON performance_data FOR SELECT USING (true);
CREATE POLICY "perf_data_auth_write" ON performance_data FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "perf_data_auth_insert" ON performance_data FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "perf_data_auth_delete" ON performance_data FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 5. PROTOCOL_CONCEPTS TABLE - Stores protocol information
-- ============================================================================
CREATE TABLE IF NOT EXISTS protocol_concepts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  acronym TEXT,
  overview TEXT,
  use_cases TEXT[],
  pros TEXT[],
  cons TEXT[],
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE protocol_concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proto_public_read" ON protocol_concepts FOR SELECT USING (true);
CREATE POLICY "proto_auth_write" ON protocol_concepts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "proto_auth_insert" ON protocol_concepts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "proto_auth_delete" ON protocol_concepts FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 6. ADMIN_EDIT_LOG TABLE - Stores edit history for auditing
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_edit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  action TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_edit_log_user_id ON admin_edit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_edit_log_created_at ON admin_edit_log(created_at DESC);

ALTER TABLE admin_edit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "edit_log_users_read_own" ON admin_edit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "edit_log_system_insert" ON admin_edit_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- VERIFICATION QUERIES (run these to verify tables were created)
-- ============================================================================

-- List all tables created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Tables are now ready. You should see:
-- ✓ glossary
-- ✓ products
-- ✓ hpc_items
-- ✓ performance_data
-- ✓ protocol_concepts
-- ✓ admin_edit_log
--
-- Next steps:
-- 1. Go to "Table Editor" in Supabase dashboard
-- 2. Confirm all 6 tables are visible
-- 3. Return to your app and test authentication
-- 4. Run: npm run dev
-- 5. Try admin login with magic link
