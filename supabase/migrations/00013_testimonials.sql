-- Testimonials table for homepage display
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Tenant',
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active testimonials"
  ON testimonials FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL USING (get_user_role() = 'admin');

-- Seed some initial testimonials
INSERT INTO testimonials (name, role, content, rating) VALUES
  ('Ahmed Al-Rashid', 'Tenant', 'Found my perfect apartment in Riyadh within days. The visiting team was professional and the entire process was seamless.', 5),
  ('Sara Mohammed', 'Tenant', 'Excellent maintenance service — they responded within an hour for an emergency plumbing issue. Highly recommend!', 5),
  ('Khalid Ibrahim', 'Property Agent', 'As an agent, this platform has transformed how I manage listings. The dashboard is intuitive and client communication is streamlined.', 5),
  ('Fatima Al-Harbi', 'Tenant', 'The short-term rental options are fantastic. Moved to Jeddah for work and found a fully furnished place in my budget quickly.', 4),
  ('Omar Hassan', 'Tenant', 'Great selection of properties across Saudi Arabia. The booking process was smooth and the agents were very responsive.', 5);
