-- Seed script for predefined Telangana cities
-- Run this in your Supabase SQL Editor

INSERT INTO public.cities (name, is_active) VALUES
    ('Hyderabad', true),
    ('Warangal', true),
    ('Nizamabad', true),
    ('Khammam', true),
    ('Karimnagar', true),
    ('Ramagundam', true),
    ('Mahbubnagar', true),
    ('Nalgonda', true),
    ('Adilabad', true),
    ('Suryapet', true),
    ('Siddipet', true),
    ('Miryalaguda', true),
    ('Jagtial', true),
    ('Mancherial', true),
    ('Kothagudem', true),
    ('Bodhan', true),
    ('Palwancha', true),
    ('Mandamarri', true),
    ('Koratla', true),
    ('Sircilla', true),
    ('Tandur', true),
    ('Wanaparthy', true)
ON CONFLICT (name) DO NOTHING;
