-- =============================================
-- Migration 16: Agents can read assigned properties
-- Visiting agents must be able to SELECT properties that are
-- assigned to them via agent_property_assignments (e.g. for
-- the "My Properties" dashboard), even when status != 'active'.
-- =============================================

CREATE POLICY "Agents can read assigned properties"
  ON properties FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM agent_property_assignments apa
      INNER JOIN agents a ON a.id = apa.agent_id AND a.profile_id = auth.uid()
      WHERE apa.property_id = properties.id
    )
  );
