-- =============================================
-- Migration 15: Visit System Enhancements
-- =============================================

-- 1. Visit Assignment History (tracks re-assignments)
CREATE TABLE IF NOT EXISTS visit_assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visit_requests(id) ON DELETE CASCADE,
  old_agent_id UUID REFERENCES profiles(id),
  new_agent_id UUID NOT NULL REFERENCES profiles(id),
  changed_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assign_history_visit ON visit_assignment_history(visit_id);
ALTER TABLE visit_assignment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view assignment history"
  ON visit_assignment_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Visiting agents can view their assignment history"
  ON visit_assignment_history FOR SELECT USING (
    auth.uid() = new_agent_id OR auth.uid() = old_agent_id
  );

-- 2. Visit Comments (admin writes, agent reads)
CREATE TABLE IF NOT EXISTS visit_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visit_requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_visit_comments_visit ON visit_comments(visit_id);
ALTER TABLE visit_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage visit comments"
  ON visit_comments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Visiting agents can read comments on their visits"
  ON visit_comments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM visit_requests
      WHERE visit_requests.id = visit_comments.visit_id
        AND visit_requests.visiting_agent_id = auth.uid()
    )
  );

CREATE POLICY "Visiting agents can add comments on their visits"
  ON visit_comments FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM visit_requests
      WHERE visit_requests.id = visit_comments.visit_id
        AND visit_requests.visiting_agent_id = auth.uid()
    )
  );

-- 3. Agent Property Assignments (admin assigns properties to visiting agents)
CREATE TABLE IF NOT EXISTS agent_property_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, property_id)
);
CREATE INDEX IF NOT EXISTS idx_apa_agent ON agent_property_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_apa_property ON agent_property_assignments(property_id);
ALTER TABLE agent_property_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage property assignments"
  ON agent_property_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can view their property assignments"
  ON agent_property_assignments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_property_assignments.agent_id
        AND agents.profile_id = auth.uid()
    )
  );

-- 4. Reschedule fields on visit_requests
ALTER TABLE visit_requests
  ADD COLUMN IF NOT EXISTS reschedule_reason TEXT,
  ADD COLUMN IF NOT EXISTS reschedule_date DATE,
  ADD COLUMN IF NOT EXISTS reschedule_time TIME;

-- 5. Update visiting_status constraint with new pipeline states
ALTER TABLE visit_requests DROP CONSTRAINT IF EXISTS visit_requests_visiting_status_check;
ALTER TABLE visit_requests ADD CONSTRAINT visit_requests_visiting_status_check CHECK (
  visiting_status IN (
    'view',
    'contact_done',
    'customer_confirmed',
    'customer_arrived',
    'visit_done',
    'customer_remarks',
    'deal_pending',
    'deal_fail',
    'commission_got',
    'deal_close',
    'reschedule'
  )
);
