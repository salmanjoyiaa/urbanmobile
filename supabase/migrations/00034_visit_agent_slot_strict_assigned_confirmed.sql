-- ============================================================
-- Migration 00034: Strict visiting agent slot lock
-- Enforce one visit per visiting agent per date+time slot for
-- both assigned and confirmed visits.
--
-- If duplicates exist, keep the earliest row (created_at, id)
-- and reset all others to pending/unassigned for manual reassignment.
-- ============================================================

WITH ranked_conflicts AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY visiting_agent_id, visit_date, visit_time
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM visit_requests
  WHERE visiting_agent_id IS NOT NULL
    AND status IN ('assigned', 'confirmed')
)
UPDATE visit_requests vr
SET
  visiting_agent_id = NULL,
  status = 'pending',
  visiting_status = 'view',
  confirmed_by = NULL,
  confirmed_at = NULL,
  admin_notes = concat_ws(
    ' | ',
    NULLIF(vr.admin_notes, ''),
    '[AUTO_UNASSIGNED_SLOT_CONFLICT_00034]'
  )
FROM ranked_conflicts rc
WHERE vr.id = rc.id
  AND rc.rn > 1;

DROP INDEX IF EXISTS idx_visit_requests_assigned_agent_slot_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_visit_requests_assigned_agent_slot_unique
  ON visit_requests(visiting_agent_id, visit_date, visit_time)
  WHERE visiting_agent_id IS NOT NULL
    AND status IN ('assigned', 'confirmed');
