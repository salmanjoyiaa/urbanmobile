-- =============================================
-- Migration 11: Visiting Agents & Assignment Roles
-- =============================================

-- 1. Extend the agents table to have agent_type
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS agent_type TEXT DEFAULT 'property';

-- 2. Drop and Re-create visit_requests status constraint to include 'assigned'
ALTER TABLE visit_requests DROP CONSTRAINT IF EXISTS visit_requests_status_check;

ALTER TABLE visit_requests ADD CONSTRAINT visit_requests_status_check CHECK (
    status IN (
        'pending',
        'confirmed',
        'cancelled',
        'completed',
        'assigned'
    )
);

-- 3. Add visiting team tracking fields to visit_requests
ALTER TABLE visit_requests
  ADD COLUMN IF NOT EXISTS visiting_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_remarks TEXT,
  ADD COLUMN IF NOT EXISTS visiting_status TEXT DEFAULT 'view';

-- Add check constraint for the visiting_status explicit pipeline
ALTER TABLE visit_requests ADD CONSTRAINT visit_requests_visiting_status_check CHECK (
    visiting_status IN (
        'view',
        'visit_done',
        'customer_remarks',
        'deal_pending',
        'deal_fail',
        'commission_got',
        'deal_close'
    )
);

-- 4. RLS Policy for Visiting Agents (Allows them to read/update assigned visits)
CREATE POLICY "Visiting agents can view their assigned requests"
    ON visit_requests FOR SELECT
    USING (auth.uid() = visiting_agent_id);

CREATE POLICY "Visiting agents can update their assigned requests"
    ON visit_requests FOR UPDATE
    USING (auth.uid() = visiting_agent_id);
