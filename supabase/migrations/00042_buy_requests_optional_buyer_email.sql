-- Product leads: allow WhatsApp-only flow (name + phone); email optional for admins to fill later
ALTER TABLE public.buy_requests
  ALTER COLUMN buyer_email DROP NOT NULL;
