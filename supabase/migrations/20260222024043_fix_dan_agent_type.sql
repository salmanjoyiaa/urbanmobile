-- Fix Dan's agent type issue where he applied as a Visiting Team member 
-- but was accidentally recorded as a Property Agent in the database.

UPDATE agents
SET agent_type = 'visiting'
FROM profiles
WHERE agents.profile_id = profiles.id
  AND profiles.full_name ILIKE '%Dan%'
  AND agents.agent_type = 'property';
