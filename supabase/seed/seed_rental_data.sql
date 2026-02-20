-- =============================================
-- UrbanSaudi Rental Seed Data
-- Run AFTER 00009_rental_only_pivot.sql migration
-- All properties are RENTAL ONLY (short_term, long_term, contract)
-- Pricing targets middle-class Saudi customers
-- =============================================

-- =============================================
-- CLEANUP: Remove old seed properties & products so re-runs work
-- =============================================
DELETE FROM public.visit_requests WHERE property_id IN (
  SELECT id FROM public.properties WHERE id::text LIKE 'r0%'
);
DELETE FROM public.buy_requests WHERE product_id IN (
  SELECT id FROM public.products WHERE id::text LIKE 'p0%'
);
DELETE FROM public.products WHERE id::text LIKE 'p0%';
DELETE FROM public.properties WHERE id::text LIKE 'r0%';

-- =============================================
-- RENTAL PROPERTIES (UUIDs: r0xxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx)
-- =============================================
-- Uses existing agents from seed_test_data.sql:
--   a0000001 = Ahmed (Riyadh), a0000002 = Fatima (Jeddah), a0000003 = Khalid (Eastern Province)

INSERT INTO public.properties (id, agent_id, title, description, type, purpose, price, city, district, bedrooms, bathrooms, area_sqm, year_built, amenities, images, status) VALUES

-- === SHORT-TERM RENTALS (price = per night, SAR 150-500) ===

('r0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000010',
 'Furnished Studio near Riyadh Boulevard',
 'Cozy fully-furnished studio perfect for short stays. Walking distance to Riyadh Boulevard entertainment area. Includes WiFi, smart TV, and kitchenette. Ideal for business travelers and tourists.',
 'studio', 'short_term', 250.00, 'Riyadh', 'Al-Olaya', 1, 1, 42.00, 2023,
 ARRAY['parking', 'elevator', 'security', 'central_ac', 'furnished', 'kitchen_appliances'],
 ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
 'active'),

('r0000002-0000-4000-8000-000000000002', 'a0000002-0000-4000-8000-000000000011',
 'Sea-View Apartment Daily Rental',
 'Wake up to Red Sea views every morning. Fully furnished 2BR apartment with balcony. Perfect for family vacations. Close to Jeddah Corniche and shopping malls. Weekly maid service included.',
 'apartment', 'short_term', 450.00, 'Jeddah', 'Al-Corniche', 2, 2, 110.00, 2022,
 ARRAY['parking', 'pool', 'gym', 'elevator', 'security', 'balcony', 'furnished'],
 ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'],
 'active'),

('r0000003-0000-4000-8000-000000000003', 'a0000003-0000-4000-8000-000000000012',
 'Budget Studio in Khobar City Center',
 'Affordable daily rental in the heart of Khobar. Clean, air-conditioned studio with basic kitchen. Great for solo travelers and contractors on short assignments.',
 'studio', 'short_term', 150.00, 'Khobar', 'City Center', 1, 1, 35.00, 2020,
 ARRAY['parking', 'elevator', 'security', 'central_ac', 'furnished'],
 ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
 'active'),

('r0000004-0000-4000-8000-000000000004', 'a0000001-0000-4000-8000-000000000010',
 'Modern Apartment near Makkah Gate',
 'Comfortable furnished apartment ideal for Umrah visitors. 15 minutes from Haram. Accommodates up to 6 guests. Includes prayer rugs and Quran.',
 'apartment', 'short_term', 350.00, 'Makkah', 'Al-Aziziah', 3, 2, 130.00, 2021,
 ARRAY['parking', 'elevator', 'security', 'central_ac', 'furnished', 'kitchen_appliances'],
 ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
 'active'),

-- === LONG-TERM RENTALS (price = per month, SAR 2,000-8,000) ===

('r0000005-0000-4000-8000-000000000005', 'a0000001-0000-4000-8000-000000000010',
 'Affordable 2BR Apartment in Al-Malaz',
 'Spacious 2-bedroom apartment in a family-friendly neighborhood. Close to schools, parks, and Al-Malaz shopping area. Unfurnished — make it your own home. Very affordable rent for families.',
 'apartment', 'long_term', 3500.00, 'Riyadh', 'Al-Malaz', 2, 2, 120.00, 2018,
 ARRAY['parking', 'elevator', 'security', 'central_ac'],
 ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', 'https://images.unsplash.com/photo-1600566753086-00f18f6b6b58?w=800&q=80'],
 'active'),

('r0000006-0000-4000-8000-000000000006', 'a0000001-0000-4000-8000-000000000010',
 'Family Villa in Al-Naseem Compound',
 'Well-maintained 4BR villa in a gated compound with pool and playground. Ideal for families with children. 24-hour security, community center, and grocery store within compound.',
 'villa', 'long_term', 7500.00, 'Riyadh', 'Al-Naseem', 4, 3, 280.00, 2019,
 ARRAY['parking', 'pool', 'garden', 'security', 'central_ac', 'maid_room'],
 ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'],
 'active'),

('r0000007-0000-4000-8000-000000000007', 'a0000002-0000-4000-8000-000000000011',
 'Cozy Studio for Young Professionals',
 'Modern studio apartment near business district. Fiber internet ready, gym in building. Perfect for single professionals or students. Utilities included in rent.',
 'studio', 'long_term', 2000.00, 'Jeddah', 'Al-Salamah', 1, 1, 48.00, 2022,
 ARRAY['parking', 'gym', 'elevator', 'security', 'central_ac'],
 ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
 'active'),

('r0000008-0000-4000-8000-000000000008', 'a0000002-0000-4000-8000-000000000011',
 '3BR Apartment near Jeddah Schools',
 'Family apartment in Al-Rawdah with 3 bedrooms and a maid room. Walking distance to international schools. Quiet residential area with parks nearby.',
 'apartment', 'long_term', 5500.00, 'Jeddah', 'Al-Rawdah', 3, 3, 170.00, 2020,
 ARRAY['parking', 'elevator', 'security', 'central_ac', 'maid_room', 'balcony'],
 ARRAY['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'],
 'active'),

('r0000009-0000-4000-8000-000000000009', 'a0000003-0000-4000-8000-000000000012',
 'Modern Duplex in Dammam',
 'Spacious duplex with separate living areas on each floor. Great for growing families. Garden space, covered parking for 2 cars. Close to Dammam Corniche.',
 'duplex', 'long_term', 6000.00, 'Dammam', 'Al-Faisaliah', 4, 4, 240.00, 2021,
 ARRAY['parking', 'garden', 'security', 'central_ac'],
 ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'],
 'active'),

('r0000010-0000-4000-8000-000000000010', 'a0000003-0000-4000-8000-000000000012',
 'Budget 1BR in Khobar',
 'Affordable one-bedroom apartment in a central location. Grocery stores, restaurants, and public transport nearby. Perfect entry-level rental for singles and couples.',
 'apartment', 'long_term', 2500.00, 'Khobar', 'Al-Thuqbah', 1, 1, 65.00, 2017,
 ARRAY['parking', 'elevator', 'security', 'central_ac'],
 ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
 'active'),

('r0000011-0000-4000-8000-000000000011', 'a0000001-0000-4000-8000-000000000010',
 'Quiet 2BR near Madinah Haram',
 'Peaceful 2-bedroom apartment just 10 minutes from the Prophet''s Mosque. Ideal for families relocating to Madinah or long-term visitors. Clean and well-maintained.',
 'apartment', 'long_term', 4000.00, 'Madinah', 'Al-Aziziah', 2, 2, 100.00, 2019,
 ARRAY['parking', 'elevator', 'security', 'central_ac'],
 ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
 'active'),

-- === CONTRACT RENTALS (price = per year, SAR 18,000-60,000) ===

('r0000012-0000-4000-8000-000000000012', 'a0000003-0000-4000-8000-000000000012',
 'Office Space in Khobar Business Hub',
 'Professional office space with reception area, 3 private offices, and meeting room. 24/7 access, fiber internet, shared kitchen. Ideal for small businesses and startups.',
 'office', 'contract', 45000.00, 'Khobar', 'Business District', NULL, 2, 200.00, 2022,
 ARRAY['parking', 'elevator', 'security', 'central_ac'],
 ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
 'active'),

('r0000013-0000-4000-8000-000000000013', 'a0000001-0000-4000-8000-000000000010',
 'Annual Villa Lease in Riyadh',
 'Beautiful 5BR villa available on annual contract. Large living spaces, private garden, and driver''s room. Located in a premium compound with amenities. Annual contract with option to renew.',
 'villa', 'contract', 60000.00, 'Riyadh', 'Al-Nakheel', 5, 5, 400.00, 2020,
 ARRAY['parking', 'pool', 'garden', 'security', 'central_ac', 'maid_room', 'driver_room'],
 ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'],
 'active'),

('r0000014-0000-4000-8000-000000000014', 'a0000002-0000-4000-8000-000000000011',
 'Commercial Office in Jeddah',
 'Open-plan office space perfect for co-working or medium business. Located on Al-Tahlia street. High foot traffic area, great for client-facing businesses.',
 'office', 'contract', 36000.00, 'Jeddah', 'Al-Tahlia', NULL, 1, 150.00, 2021,
 ARRAY['parking', 'elevator', 'security', 'central_ac'],
 ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
 'active'),

('r0000015-0000-4000-8000-000000000015', 'a0000001-0000-4000-8000-000000000010',
 'Annual 3BR Apartment in Tabuk',
 'Affordable annual contract for a 3-bedroom apartment in Tabuk. Growing city with new developments. Great for government employees and teachers relocating.',
 'apartment', 'contract', 24000.00, 'Tabuk', 'City Center', 3, 2, 140.00, 2018,
 ARRAY['parking', 'security', 'central_ac'],
 ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
 'active'),

('r0000016-0000-4000-8000-000000000016', 'a0000003-0000-4000-8000-000000000012',
 'Warehouse Space Annual Lease',
 'Large warehouse with loading dock and office area. Suitable for logistics, storage, or light manufacturing. Annual contract with competitive pricing.',
 'land', 'contract', 18000.00, 'Dammam', 'Industrial City', NULL, NULL, 500.00, 2015,
 ARRAY['parking', 'security'],
 ARRAY['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'],
 'active')

ON CONFLICT (id) DO NOTHING;

-- =============================================
-- PRODUCTS FOR SALE (UUIDs: p0xxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx)
-- Products remain buy-only (customers send buy requests)
-- =============================================

INSERT INTO public.products (id, agent_id, title, description, category, condition, price, city, images) VALUES

('p0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000010',
 'IKEA L-Shaped Sofa', 'Comfortable IKEA FRIHETEN corner sofa-bed with storage. Grey fabric. Perfect for small apartments.',
 'furniture', 'good', 1800.00, 'Riyadh',
 ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80']),

('p0000002-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000010',
 'Samsung Split AC 1.5 Ton', 'Samsung Digital Inverter split AC. Energy efficient, cools 20sqm room. 2 years old with warranty card.',
 'appliances', 'good', 1200.00, 'Riyadh',
 ARRAY['https://images.unsplash.com/photo-1631567091196-3b3f1b8d3adf?w=800&q=80']),

('p0000003-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000010',
 'Wooden Dining Table + 6 Chairs', 'Solid wood dining set. Seats 6 comfortably. Minor wear on surface. Moving sale — must go.',
 'furniture', 'fair', 900.00, 'Riyadh',
 ARRAY['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80']),

('p0000004-0000-4000-8000-000000000004', 'a0000002-0000-4000-8000-000000000011',
 'LG 55" Smart TV', 'LG 55 inch 4K UHD Smart TV with WebOS. Wall mount included. Perfect picture quality.',
 'electronics', 'like_new', 1500.00, 'Jeddah',
 ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80']),

('p0000005-0000-4000-8000-000000000005', 'a0000002-0000-4000-8000-000000000011',
 'Whirlpool Washing Machine 8kg', 'Front-load automatic washing machine. Multiple wash programs. Works perfectly, selling due to upgrade.',
 'appliances', 'good', 800.00, 'Jeddah',
 ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80']),

('p0000006-0000-4000-8000-000000000006', 'a0000002-0000-4000-8000-000000000011',
 'Complete Kitchen Utensils Set', 'Pots, pans, plates, cups, and cutlery for a full kitchen setup. Great for someone furnishing their first apartment.',
 'kitchen', 'good', 350.00, 'Jeddah',
 ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80']),

('p0000007-0000-4000-8000-000000000007', 'a0000003-0000-4000-8000-000000000012',
 'Office Desk + Chair Combo', 'Modern office desk with ergonomic chair. Cable management built-in. Perfect for home office setup.',
 'furniture', 'like_new', 650.00, 'Khobar',
 ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80']),

('p0000008-0000-4000-8000-000000000008', 'a0000003-0000-4000-8000-000000000012',
 'Dyson V11 Vacuum Cleaner', 'Cordless stick vacuum. Powerful suction, long battery life. Comes with all attachments.',
 'electronics', 'like_new', 1100.00, 'Dammam',
 ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80']),

('p0000009-0000-4000-8000-000000000009', 'a0000001-0000-4000-8000-000000000010',
 'Queen Size Mattress', 'Orthopedic spring mattress. Medium firmness. Used for 1 year only. No stains.',
 'furniture', 'good', 500.00, 'Riyadh',
 ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80']),

('p0000010-0000-4000-8000-000000000010', 'a0000003-0000-4000-8000-000000000012',
 'Garden BBQ Grill + Patio Set', 'Charcoal BBQ grill with 4 folding chairs and table. Great for outdoor gatherings.',
 'outdoor', 'good', 750.00, 'Khobar',
 ARRAY['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80']),

('p0000011-0000-4000-8000-000000000011', 'a0000002-0000-4000-8000-000000000011',
 'Kids Bedroom Set', 'Bunk bed + study desk + wardrobe. White and blue colors. Suitable for ages 5-14.',
 'furniture', 'good', 1300.00, 'Jeddah',
 ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80']),

('p0000012-0000-4000-8000-000000000012', 'a0000001-0000-4000-8000-000000000010',
 'Microwave + Toaster Bundle', 'Samsung microwave and Philips toaster. Both in working condition. Selling as bundle only.',
 'kitchen', 'fair', 200.00, 'Riyadh',
 ARRAY['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80'])

ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SAMPLE VISIT REQUESTS for rental properties
-- =============================================
INSERT INTO public.visit_requests (id, property_id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, status) VALUES
('f1000001-0000-4000-8000-000000000001', 'r0000005-0000-4000-8000-000000000005',
 'Mohammed Al-Harbi', 'mohammed@email.com', '+966511234567',
 CURRENT_DATE + interval '3 days', '10:00', 'pending'),

('f1000002-0000-4000-8000-000000000002', 'r0000006-0000-4000-8000-000000000006',
 'Aisha Al-Dosari', 'aisha@email.com', '+966522345678',
 CURRENT_DATE + interval '5 days', '14:00', 'pending'),

('f1000003-0000-4000-8000-000000000003', 'r0000008-0000-4000-8000-000000000008',
 'Omar Al-Shehri', 'omar@email.com', '+966533456789',
 CURRENT_DATE + interval '2 days', '11:00', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SAMPLE BUY REQUESTS for products
-- =============================================
INSERT INTO public.buy_requests (id, product_id, buyer_name, buyer_email, buyer_phone, message, status) VALUES
('b1000001-0000-4000-8000-000000000001', 'p0000001-0000-4000-8000-000000000001',
 'Fatima Al-Rashid', 'fatima.r@email.com', '+966544567890',
 'Is the sofa still available? Can I come see it this weekend?',
 'pending'),

('b1000002-0000-4000-8000-000000000002', 'p0000004-0000-4000-8000-000000000004',
 'Khalid Al-Mutairi', 'khalid.m@email.com', '+966555678901',
 'Will you accept SAR 1200 for the TV?',
 'pending')
ON CONFLICT (id) DO NOTHING;
