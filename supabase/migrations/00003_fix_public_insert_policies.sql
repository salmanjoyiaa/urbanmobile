-- Fix: Allow anonymous users to create visit requests
-- The original policy "Anyone can create visit requests" used WITH CHECK (true)
-- but wasn't explicitly granted to the anon role in all Supabase configurations.

DROP POLICY IF EXISTS "Anyone can create visit requests" ON visit_requests;

CREATE POLICY "Anyone can create visit requests"
  ON visit_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Also allow anon to read available slots (GET /api/visits needs SELECT on properties)
-- The properties SELECT policy already allows public reads for active listings.

-- Similarly fix buy_requests if it has the same issue
DROP POLICY IF EXISTS "Anyone can create buy requests" ON buy_requests;

CREATE POLICY "Anyone can create buy requests"
  ON buy_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
