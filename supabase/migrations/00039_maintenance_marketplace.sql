-- =============================================
-- Migration 39: Maintenance Marketplace
-- =============================================

-- 1. Create maintenance_services table
CREATE TABLE IF NOT EXISTS public.maintenance_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('single_person', 'company')),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price NUMERIC(10,2),
    city TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_maint_services_agent ON public.maintenance_services(agent_id);
CREATE INDEX idx_maint_services_category ON public.maintenance_services(category);
CREATE INDEX idx_maint_services_city ON public.maintenance_services(city);
CREATE INDEX idx_maint_services_status ON public.maintenance_services(status);

-- Update trigger
CREATE TRIGGER update_maint_services_modtime
    BEFORE UPDATE ON public.maintenance_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- RLS for maintenance_services
ALTER TABLE public.maintenance_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active maintenance services publicly readable"
    ON public.maintenance_services FOR SELECT
    USING (status = 'active' OR agent_id = get_agent_id() OR get_user_role() = 'admin');

CREATE POLICY "Agents can insert own maintenance services"
    ON public.maintenance_services FOR INSERT
    WITH CHECK (agent_id = get_agent_id());

CREATE POLICY "Agents can update own maintenance services"
    ON public.maintenance_services FOR UPDATE
    USING (agent_id = get_agent_id() OR get_user_role() = 'admin');

CREATE POLICY "Admins can delete maintenance services"
    ON public.maintenance_services FOR DELETE
    USING (get_user_role() = 'admin' OR agent_id = get_agent_id());


-- 2. Alter maintenance_requests to support the marketplace and media
ALTER TABLE public.maintenance_requests
    ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.maintenance_services(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS visit_date DATE,
    ADD COLUMN IF NOT EXISTS visit_time TIME,
    ADD COLUMN IF NOT EXISTS audio_url TEXT,
    ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

-- Fix existing constraint or add new index for agent queries
CREATE INDEX IF NOT EXISTS idx_maint_requests_agent ON public.maintenance_requests(agent_id);

-- Update RLS for maintenance_requests to allow agents to see their approved requests
DROP POLICY IF EXISTS "Agents can view their approved maintenance requests" ON public.maintenance_requests;
CREATE POLICY "Agents can view their approved maintenance requests"
    ON public.maintenance_requests FOR SELECT
    USING (agent_id = get_agent_id() AND status IN ('approved', 'completed'));


-- 3. Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('maintenance-media', 'maintenance-media', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('maintenance-services', 'maintenance-services', true) ON CONFLICT DO NOTHING;

-- RLS for maintenance-services (images of services, public)
CREATE POLICY "Public read maintenance-services"
  ON storage.objects FOR SELECT USING (bucket_id = 'maintenance-services');
CREATE POLICY "Authenticated upload maintenance-services"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'maintenance-services' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated update maintenance-services"
  ON storage.objects FOR UPDATE USING (bucket_id = 'maintenance-services' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete maintenance-services"
  ON storage.objects FOR DELETE USING (bucket_id = 'maintenance-services' AND auth.role() = 'authenticated');

-- RLS for maintenance-media (private uploads for requests)
CREATE POLICY "Admins and assigned agents read maintenance-media"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'maintenance-media' AND (auth.role() = 'authenticated')
  );
CREATE POLICY "Anyone can upload maintenance-media"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'maintenance-media');
