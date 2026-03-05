-- ============================================================
-- Migration 00032: Persistent visit booking window setting
-- ============================================================

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER trg_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION set_platform_settings_updated_at();

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage platform settings" ON platform_settings;
CREATE POLICY "Admins can manage platform settings"
  ON platform_settings FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

INSERT INTO platform_settings (key, value)
VALUES ('visit_booking_window_days', '10')
ON CONFLICT (key) DO NOTHING;
