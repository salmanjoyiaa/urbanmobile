-- Allow maintenance as a valid agents.agent_type (admin create + public signup)
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_agent_type_check;
ALTER TABLE public.agents ADD CONSTRAINT agents_agent_type_check
  CHECK (agent_type IN ('property', 'visiting', 'seller', 'maintenance'));
