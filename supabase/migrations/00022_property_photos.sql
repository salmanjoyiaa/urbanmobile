-- Create property_photos table for advanced photo management
CREATE TABLE property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ordering_index INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_photos_property ON property_photos(property_id);
CREATE INDEX idx_property_photos_ordering ON property_photos(property_id, ordering_index);

CREATE TRIGGER set_property_photos_updated_at
  BEFORE UPDATE ON property_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property photos publicly readable"
  ON property_photos FOR SELECT USING (true);

CREATE POLICY "Agents can insert own property photos"
  ON property_photos FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE agent_id = get_agent_id())
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Agents can update own property photos"
  ON property_photos FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE agent_id = get_agent_id())
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Agents can delete own property photos"
  ON property_photos FOR DELETE USING (
    property_id IN (SELECT id FROM properties WHERE agent_id = get_agent_id())
    OR get_user_role() = 'admin'
  );
