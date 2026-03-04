-- ============================================================
-- Migration 00027: Visit system enhancements v2
-- 1. notification_sent_at dedup flag on visit_requests
-- 2. visit_id FK on notification_logs
-- 3. page_views table for analytics
-- ============================================================

-- 1. Notification dedup flag
ALTER TABLE visit_requests
  ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz;

-- 2. Link notification_logs to visit_requests
ALTER TABLE notification_logs
  ADD COLUMN IF NOT EXISTS visit_id uuid REFERENCES visit_requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notification_logs_visit_id
  ON notification_logs(visit_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at
  ON notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel
  ON notification_logs(channel);

-- 3. Page views table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page text NOT NULL DEFAULT '/',
  ip_hash text,
  user_agent text,
  referrer text,
  country text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view page_views"
  ON page_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Service role inserts (no INSERT policy needed for service role)

-- Aggregated view for admin dashboard
CREATE OR REPLACE VIEW page_view_stats AS
SELECT
  page,
  date_trunc('day', created_at)::date AS view_date,
  count(*) AS view_count
FROM page_views
GROUP BY page, date_trunc('day', created_at)
ORDER BY view_date DESC;
