-- ============================================================
-- Migration 00029: Prevent visiting agent double-booking
-- Enforce one assigned visit per agent per date+time slot.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_visit_requests_assigned_agent_slot_unique
  ON visit_requests(visiting_agent_id, visit_date, visit_time)
  WHERE visiting_agent_id IS NOT NULL AND status = 'assigned';
