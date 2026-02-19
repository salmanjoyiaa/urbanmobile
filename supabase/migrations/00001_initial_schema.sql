-- =============================================
-- UrbanSaudi: Initial Database Schema
-- =============================================

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- AGENTS (only for users with role = 'agent')
-- =============================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  license_number TEXT,
  company_name TEXT,
  document_url TEXT,
  bio TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_profile_id ON agents(profile_id);

CREATE TRIGGER set_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- PROPERTIES
-- =============================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('apartment', 'villa', 'office', 'land', 'studio', 'duplex')),
  purpose TEXT NOT NULL CHECK (purpose IN ('sale', 'rent')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'rented', 'archived')),
  price NUMERIC(12,2) NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  bedrooms SMALLINT,
  bathrooms SMALLINT,
  area_sqm NUMERIC(10,2),
  year_built SMALLINT,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_purpose ON properties(purpose);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_created ON properties(created_at DESC);
CREATE INDEX idx_properties_featured ON properties(featured) WHERE featured = true;

CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- PRODUCTS (used household items)
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('furniture', 'appliances', 'electronics', 'decor', 'kitchen', 'outdoor', 'other')),
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  price NUMERIC(10,2) NOT NULL,
  city TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_agent ON products(agent_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_city ON products(city);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_products_created ON products(created_at DESC);

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- VISIT REQUESTS
-- =============================================
CREATE TABLE visit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  admin_notes TEXT,
  confirmed_by UUID REFERENCES profiles(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent double-booking: unique on property + date + time for active requests
CREATE UNIQUE INDEX idx_visit_slot_unique
  ON visit_requests(property_id, visit_date, visit_time)
  WHERE status IN ('pending', 'confirmed');

CREATE INDEX idx_visits_property ON visit_requests(property_id);
CREATE INDEX idx_visits_date ON visit_requests(visit_date);
CREATE INDEX idx_visits_status ON visit_requests(status);

CREATE TRIGGER set_visits_updated_at
  BEFORE UPDATE ON visit_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- BUY REQUESTS (product leads)
-- =============================================
CREATE TABLE buy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed')),
  admin_notes TEXT,
  confirmed_by UUID REFERENCES profiles(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_buy_requests_product ON buy_requests(product_id);
CREATE INDEX idx_buy_requests_status ON buy_requests(status);

CREATE TRIGGER set_buy_requests_updated_at
  BEFORE UPDATE ON buy_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- NOTIFICATIONS (in-app)
-- =============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =============================================
-- AUDIT LOG
-- =============================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- =============================================
-- RLS HELPER FUNCTIONS
-- =============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's agent record id
CREATE OR REPLACE FUNCTION get_agent_id()
RETURNS UUID AS $$
  SELECT id FROM agents WHERE profile_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are readable"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE USING (get_user_role() = 'admin');

-- AGENTS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved agents publicly readable"
  ON agents FOR SELECT USING (
    status = 'approved'
    OR profile_id = auth.uid()
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Users can insert own agent record"
  ON agents FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can update agents"
  ON agents FOR UPDATE USING (get_user_role() = 'admin');

-- PROPERTIES
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active properties publicly readable"
  ON properties FOR SELECT USING (
    status = 'active'
    OR agent_id = get_agent_id()
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Agents can insert own properties"
  ON properties FOR INSERT WITH CHECK (agent_id = get_agent_id());

CREATE POLICY "Agents can update own properties"
  ON properties FOR UPDATE USING (
    agent_id = get_agent_id()
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Agents can delete own properties"
  ON properties FOR DELETE USING (
    agent_id = get_agent_id()
    OR get_user_role() = 'admin'
  );

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Available products publicly readable"
  ON products FOR SELECT USING (
    is_available = true
    OR agent_id = get_agent_id()
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Agents can insert own products"
  ON products FOR INSERT WITH CHECK (agent_id = get_agent_id());

CREATE POLICY "Agents can update own products"
  ON products FOR UPDATE USING (
    agent_id = get_agent_id()
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Agents can delete own products"
  ON products FOR DELETE USING (
    agent_id = get_agent_id()
    OR get_user_role() = 'admin'
  );

-- VISIT REQUESTS
ALTER TABLE visit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create visit requests"
  ON visit_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Agents see visits for own properties"
  ON visit_requests FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE agent_id = get_agent_id())
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Admins can update visits"
  ON visit_requests FOR UPDATE USING (get_user_role() = 'admin');

-- BUY REQUESTS
ALTER TABLE buy_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create buy requests"
  ON buy_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Agents see leads for own products"
  ON buy_requests FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE agent_id = get_agent_id())
    OR get_user_role() = 'admin'
  );

CREATE POLICY "Admins can update buy requests"
  ON buy_requests FOR UPDATE USING (get_user_role() = 'admin');

-- NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- AUDIT LOG
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
  ON audit_log FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "System can insert audit log"
  ON audit_log FOR INSERT WITH CHECK (true);

-- =============================================
-- AUTH TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('agent-documents', 'agent-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies: public read for public buckets
CREATE POLICY "Public read property images"
  ON storage.objects FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated upload property images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload product images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins read agent documents"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'agent-documents'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Authenticated upload agent documents"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'agent-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated upload avatars"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
