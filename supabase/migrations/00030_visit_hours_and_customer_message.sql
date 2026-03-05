-- ============================================================
-- Migration 00030: Weekly property visit hours + customer message
-- ============================================================

-- Store customer note from homepage visit form
ALTER TABLE visit_requests
  ADD COLUMN IF NOT EXISTS visitor_message TEXT;

-- Weekly visit hours per property (0=Sunday ... 6=Saturday)
CREATE TABLE IF NOT EXISTS property_visit_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, weekday),
  CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_property_visit_hours_property
  ON property_visit_hours(property_id);

CREATE INDEX IF NOT EXISTS idx_property_visit_hours_property_weekday
  ON property_visit_hours(property_id, weekday);

CREATE TRIGGER set_property_visit_hours_updated_at
  BEFORE UPDATE ON property_visit_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE property_visit_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read property visit hours" ON property_visit_hours;
CREATE POLICY "Public can read property visit hours"
  ON property_visit_hours FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage property visit hours" ON property_visit_hours;
CREATE POLICY "Admins can manage property visit hours"
  ON property_visit_hours FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Seed defaults for existing properties: weekdays open, weekends closed, 08:00-19:00
INSERT INTO property_visit_hours (property_id, weekday, is_open, start_time, end_time)
SELECT
  p.id,
  d.weekday,
  CASE WHEN d.weekday BETWEEN 1 AND 5 THEN true ELSE false END,
  '08:00'::time,
  '19:00'::time
FROM properties p
CROSS JOIN (SELECT generate_series(0, 6) AS weekday) d
ON CONFLICT (property_id, weekday) DO NOTHING;
