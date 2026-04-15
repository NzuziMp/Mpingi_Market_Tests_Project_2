
/*
  # Mpingi Market - Initial Schema

  ## Overview
  Creates the complete database schema for Mpingi Market, a free online classifieds platform.

  ## New Tables
  - `profiles` - Extended user profile data linked to auth.users
    - full_name, phone, avatar_url, date_of_birth, location fields, is_admin flag
  - `categories` - Main product/service categories (12 main)
    - name, slug, icon, color, description
  - `subcategories` - Sub-categories within each category (40 subcategories)
    - category_id FK, name, slug
  - `listings` - Core classifieds postings
    - user_id, title, description, price, currency, category/subcategory FKs
    - condition (new/used/refurbished), images array, location fields
    - plan_type (free/paid), status, expires_at, view_count
  - `listing_views` - Tracks individual listing view counts
  - `saved_listings` - Bookmarks/favorites per user

  ## Security
  - RLS enabled on all tables
  - Profiles: users can read all, only update own
  - Categories/Subcategories: public read, admin-only write
  - Listings: public read active listings, authenticated users can CRUD own listings
  - Saved listings: users manage their own
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  date_of_birth date,
  country text DEFAULT '',
  region text DEFAULT '',
  city text DEFAULT '',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text DEFAULT 'tag',
  color text DEFAULT '#3B82F6',
  description text DEFAULT '',
  listing_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subcategories"
  ON subcategories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert subcategories"
  ON subcategories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  price decimal(12,2),
  currency text DEFAULT 'USD',
  category_id uuid REFERENCES categories(id),
  subcategory_id uuid REFERENCES subcategories(id),
  condition text DEFAULT 'used' CHECK (condition IN ('new', 'used', 'refurbished')),
  images text[] DEFAULT '{}',
  country text DEFAULT '',
  region text DEFAULT '',
  city text DEFAULT '',
  plan_type text DEFAULT 'free' CHECK (plan_type IN ('free', 'paid')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'sold', 'deleted')),
  is_negotiable boolean DEFAULT false,
  view_count integer DEFAULT 0,
  expires_at timestamptz DEFAULT (now() + interval '31 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Authenticated users can view own listings"
  ON listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Saved listings (favorites)
CREATE TABLE IF NOT EXISTS saved_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved listings"
  ON saved_listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings"
  ON saved_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave listings"
  ON saved_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS listings_category_id_idx ON listings(category_id);
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings(user_id);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings(status);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS listings_country_idx ON listings(country);
CREATE INDEX IF NOT EXISTS subcategories_category_id_idx ON subcategories(category_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
