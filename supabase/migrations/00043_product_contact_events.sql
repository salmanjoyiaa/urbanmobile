-- Anonymous product contact tracking (WhatsApp / phone dialer clicks). No customer PII.

CREATE TABLE public.product_contact_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'phone')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_contact_events_product ON public.product_contact_events(product_id);
CREATE INDEX idx_product_contact_events_created ON public.product_contact_events(created_at DESC);

ALTER TABLE public.product_contact_events ENABLE ROW LEVEL SECURITY;

-- Listing owners and admins can read events (dashboards use authenticated Supabase client)
CREATE POLICY "Agents and admins read product contact events"
  ON public.product_contact_events FOR SELECT
  TO authenticated
  USING (
    product_id IN (SELECT id FROM public.products WHERE agent_id = get_agent_id())
    OR get_user_role() = 'admin'
  );

-- Inserts are performed by the Next.js API using the service role (bypasses RLS).
