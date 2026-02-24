-- =============================================
-- Visit slots dummy data (for testing availability UI)
-- Run after migrations. Requires at least one active property.
-- Uses SLOT_CONFIG times: 9–17, break 13–14, 20-min slots (e.g. 09:00, 10:20, 14:00).
-- =============================================

WITH prop AS (
  SELECT id FROM properties WHERE status = 'active' LIMIT 1
)
INSERT INTO visit_requests (
  property_id,
  visitor_name,
  visitor_email,
  visitor_phone,
  visit_date,
  visit_time,
  status
)
SELECT
  p.id,
  v.name,
  v.email,
  v.phone,
  v.dt,
  v.tm,
  v.st
FROM prop p
CROSS JOIN (VALUES
  ('Dummy Visitor 1', 'dummy1@example.com', '+966500000001', (CURRENT_DATE + INTERVAL '3 days')::date, '09:00'::time, 'pending'),
  ('Dummy Visitor 2', 'dummy2@example.com', '+966500000002', (CURRENT_DATE + INTERVAL '3 days')::date, '10:20'::time, 'confirmed'),
  ('Dummy Visitor 3', 'dummy3@example.com', '+966500000003', (CURRENT_DATE + INTERVAL '5 days')::date, '14:00'::time, 'pending')
) AS v(name, email, phone, dt, tm, st);

-- To use a fixed property UUID instead, run:
-- INSERT INTO visit_requests (property_id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, status)
-- VALUES
--   ('YOUR_PROPERTY_UUID', 'Dummy Visitor 1', 'dummy1@example.com', '+966500000001', (CURRENT_DATE + INTERVAL '3 days')::date, '09:00'::time, 'pending'),
--   ('YOUR_PROPERTY_UUID', 'Dummy Visitor 2', 'dummy2@example.com', '+966500000002', (CURRENT_DATE + INTERVAL '3 days')::date, '10:20'::time, 'confirmed'),
--   ('YOUR_PROPERTY_UUID', 'Dummy Visitor 3', 'dummy3@example.com', '+966500000003', (CURRENT_DATE + INTERVAL '5 days')::date, '14:00'::time, 'pending');
