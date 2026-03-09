-- ============================================================
-- Migration 00035: Persistent visit booking lead-hours setting
-- ============================================================

INSERT INTO platform_settings (key, value)
VALUES ('visit_booking_lead_hours', '3')
ON CONFLICT (key) DO NOTHING;