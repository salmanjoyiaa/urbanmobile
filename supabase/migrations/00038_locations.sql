CREATE TABLE IF NOT EXISTS cities (
  name VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name VARCHAR(255) REFERENCES cities(name) ON UPDATE CASCADE ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_name, name)
);

-- RLS policies
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Admin full access cities" ON cities FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin full access districts" ON districts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Seed existing data from properties table
INSERT INTO cities (name) 
SELECT DISTINCT city FROM properties WHERE city IS NOT NULL
ON CONFLICT (name) DO NOTHING;

INSERT INTO districts (city_name, name)
SELECT DISTINCT p.city, p.district 
FROM properties p
JOIN cities c ON c.name = p.city
WHERE p.district IS NOT NULL AND p.district != ''
ON CONFLICT (city_name, name) DO NOTHING;
