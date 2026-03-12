-- Add "seller" as a valid agent_type
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_agent_type_check;
ALTER TABLE agents ADD CONSTRAINT agents_agent_type_check
  CHECK (agent_type IN ('property', 'visiting', 'seller'));
