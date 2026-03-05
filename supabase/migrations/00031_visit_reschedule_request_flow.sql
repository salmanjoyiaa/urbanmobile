-- ============================================================
-- Migration 00031: Visit reschedule request flow metadata
-- ============================================================

ALTER TABLE visit_requests
  ADD COLUMN IF NOT EXISTS parent_visit_id UUID REFERENCES visit_requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS request_source TEXT NOT NULL DEFAULT 'customer',
  ADD COLUMN IF NOT EXISTS reschedule_requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reschedule_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reschedule_reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reschedule_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reschedule_review_note TEXT;

ALTER TABLE visit_requests DROP CONSTRAINT IF EXISTS visit_requests_request_source_check;
ALTER TABLE visit_requests
  ADD CONSTRAINT visit_requests_request_source_check
  CHECK (request_source IN ('customer', 'visiting_agent_reschedule'));

ALTER TABLE visit_requests DROP CONSTRAINT IF EXISTS visit_requests_reschedule_parent_check;
ALTER TABLE visit_requests
  ADD CONSTRAINT visit_requests_reschedule_parent_check
  CHECK (
    (request_source = 'visiting_agent_reschedule' AND parent_visit_id IS NOT NULL)
    OR request_source = 'customer'
  );

CREATE INDEX IF NOT EXISTS idx_visit_requests_parent_visit_id
  ON visit_requests(parent_visit_id);

CREATE INDEX IF NOT EXISTS idx_visit_requests_request_source_status
  ON visit_requests(request_source, status);
