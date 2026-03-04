-- ============================================================
-- Migration 00028: Unique visitor analytics
-- 1) Add stable visitor_id to page_views
-- 2) Add indexes for traffic queries
-- 3) Add summary RPC with unique visitor counts
-- ============================================================

ALTER TABLE page_views
  ADD COLUMN IF NOT EXISTS visitor_id text;

CREATE INDEX IF NOT EXISTS idx_page_views_created_at
  ON page_views(created_at);

CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id
  ON page_views(visitor_id);

CREATE OR REPLACE FUNCTION get_site_traffic_summary()
RETURNS TABLE (
  today_views bigint,
  week_views bigint,
  total_views bigint,
  today_unique bigint,
  week_unique bigint,
  total_unique bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH normalized AS (
    SELECT
      created_at,
      COALESCE(
        NULLIF(visitor_id, ''),
        CASE
          WHEN ip_hash IS NULL AND user_agent IS NULL THEN NULL
          ELSE COALESCE(ip_hash, 'unknown-ip') || ':' || COALESCE(user_agent, 'unknown-ua')
        END,
        'unknown-visitor'
      ) AS visitor_key
    FROM page_views
  )
  SELECT
    COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now())) AS today_views,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') AS week_views,
    COUNT(*) AS total_views,
    COUNT(DISTINCT visitor_key) FILTER (WHERE created_at >= date_trunc('day', now())) AS today_unique,
    COUNT(DISTINCT visitor_key) FILTER (WHERE created_at >= now() - interval '7 days') AS week_unique,
    COUNT(DISTINCT visitor_key) AS total_unique
  FROM normalized;
$$;

REVOKE ALL ON FUNCTION get_site_traffic_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_site_traffic_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_site_traffic_summary() TO service_role;
