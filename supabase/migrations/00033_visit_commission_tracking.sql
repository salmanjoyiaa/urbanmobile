-- ============================================================
-- Migration 00033: Visit commission amount tracking
-- ============================================================

ALTER TABLE visit_requests
  ADD COLUMN IF NOT EXISTS commission_received_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS commission_received_at TIMESTAMPTZ;

ALTER TABLE visit_requests DROP CONSTRAINT IF EXISTS visit_requests_commission_amount_check;
ALTER TABLE visit_requests
  ADD CONSTRAINT visit_requests_commission_amount_check
  CHECK (
    commission_received_amount IS NULL
    OR commission_received_amount > 0
  );
