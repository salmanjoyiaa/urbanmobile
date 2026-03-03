-- =============================================
-- Migration 26: Fix public visibility of rented & reserved properties
-- The previous RLS policy only allowed anonymous users to see
-- properties with status = 'available'. This update allows
-- public read access to 'rented' and 'reserved' properties as well,
-- so they appear on the /properties listing page.
-- =============================================

DROP POLICY IF EXISTS "Available properties publicly readable" ON properties;
CREATE POLICY "Listed properties publicly readable"
  ON properties FOR SELECT
  TO anon, authenticated
  USING (
    status IN ('available', 'rented', 'reserved')
    OR agent_id = get_agent_id()
    OR get_user_role() = 'admin'
  );
