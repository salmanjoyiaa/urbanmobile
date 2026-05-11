-- Optional promo videos for marketplace listings (public URLs in storage bucket)
ALTER TABLE public.maintenance_services
  ADD COLUMN IF NOT EXISTS videos TEXT[] NOT NULL DEFAULT '{}';
