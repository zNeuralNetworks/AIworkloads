-- Create Glossary table
CREATE TABLE IF NOT EXISTS glossary (
  term TEXT PRIMARY KEY,
  definition TEXT NOT NULL,
  category TEXT,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Products table
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

-- Create HPC Items table
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

-- Create Performance Data table
CREATE TABLE IF NOT EXISTS performance_data (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Protocol Concepts table
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

-- Create Admin Edit Log table (for audit trail)
CREATE TABLE IF NOT EXISTS admin_edit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  action TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_glossary_category ON glossary(category);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_hpc_items_category ON hpc_items(category);
CREATE INDEX IF NOT EXISTS idx_admin_edit_log_user_id ON admin_edit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_edit_log_created_at ON admin_edit_log(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpc_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_edit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read, authenticated users can write
CREATE POLICY "Allow public read access" ON glossary
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update" ON glossary
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON glossary
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Apply similar policies to other tables
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read" ON hpc_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write" ON hpc_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON hpc_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read" ON performance_data FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write" ON performance_data FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON performance_data FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read" ON protocol_concepts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write" ON protocol_concepts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON protocol_concepts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admin edit log: only admin can read their own logs
CREATE POLICY "Users can see their edit logs" ON admin_edit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert logs" ON admin_edit_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
