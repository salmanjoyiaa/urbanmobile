-- =============================================
-- RLS Hardening Migration
-- Tightens overly permissive policies found in security audit
-- =============================================

-- =============================================
-- 1. Restrict anonymous profile access
--    Previously: USING (true) exposed all profiles (including admin) to anon
--    Now: Only agent profiles visible to public, users see own, admins see all
-- =============================================
DROP POLICY IF EXISTS "Public profiles are readable" ON profiles;
CREATE POLICY "Public profiles are readable"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (
    role = 'agent'
    OR id = auth.uid()
    OR get_user_role() = 'admin'
  );

-- =============================================
-- 2. Restrict visit_requests SELECT to authenticated only
--    Previously: USING (true) let anon enumerate visitor PII
--    The public slot-availability API uses createAdminClient() (service_role)
--    which bypasses RLS, so this change is safe
-- =============================================
DROP POLICY IF EXISTS "Agents and anon see relevant visits" ON visit_requests;
CREATE POLICY "Agents and admins see relevant visits"
  ON visit_requests FOR SELECT
  TO authenticated
  USING (
    property_id IN (SELECT id FROM properties WHERE agent_id = get_agent_id())
    OR get_user_role() = 'admin'
  );

-- =============================================
-- 3. Restrict notifications INSERT
--    Previously: WITH CHECK (true) let any user insert notifications for others
--    Now: Users can only insert for themselves, admins can insert for anyone
-- =============================================
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON notifications;
CREATE POLICY "System inserts notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR get_user_role() = 'admin');

-- =============================================
-- 4. Remove authenticated audit_log INSERT policy
--    Previously: WITH CHECK (true) let any user insert audit entries (tampering)
--    The app uses createAdminClient() (service_role) for audit logging,
--    which bypasses RLS — so no authenticated policy is needed
-- =============================================
DROP POLICY IF EXISTS "Authenticated can insert audit log" ON audit_log;
