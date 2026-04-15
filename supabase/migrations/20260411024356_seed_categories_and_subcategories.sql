
/*
  # Seed Categories and Subcategories

  ## Overview
  Populates the categories and subcategories tables with the 12 main categories
  and 40 subcategories used by Mpingi Market.

  ## Categories
  1. Vehicles - Cars, trucks, motorcycles, boats, parts
  2. Electronics - Phones, computers, TVs, cameras, audio
  3. Fashion - Clothing, shoes, accessories, jewelry
  4. Real Estate - Houses, apartments, land, commercial
  5. Jobs - Full-time, part-time, freelance, internships
  6. Services - Home, professional, education, health
  7. Sports & Hobbies - Equipment, collectibles, games, music
  8. Home & Garden - Furniture, appliances, tools, decor
  9. Pets - Animals, supplies, services
  10. Food & Agriculture - Produce, livestock, equipment
  11. Business & Industry - Equipment, supplies, B2B
  12. Community - Events, activities, lost & found, free items
*/

INSERT INTO categories (name, slug, icon, color, description) VALUES
  ('Vehicles', 'vehicles', 'car', '#EF4444', 'Cars, trucks, motorcycles, boats and auto parts'),
  ('Electronics', 'electronics', 'smartphone', '#3B82F6', 'Phones, computers, TVs, cameras and more'),
  ('Fashion', 'fashion', 'shirt', '#EC4899', 'Clothing, shoes, accessories and jewelry'),
  ('Real Estate', 'real-estate', 'home', '#10B981', 'Houses, apartments, land and commercial properties'),
  ('Jobs', 'jobs', 'briefcase', '#F59E0B', 'Full-time, part-time, freelance and internship opportunities'),
  ('Services', 'services', 'wrench', '#8B5CF6', 'Home, professional, education and health services'),
  ('Sports & Hobbies', 'sports-hobbies', 'trophy', '#06B6D4', 'Equipment, collectibles, games and musical instruments'),
  ('Home & Garden', 'home-garden', 'sofa', '#84CC16', 'Furniture, appliances, tools and garden items'),
  ('Pets', 'pets', 'paw-print', '#F97316', 'Animals, supplies and pet services'),
  ('Food & Agriculture', 'food-agriculture', 'wheat', '#A3E635', 'Produce, livestock, farming equipment'),
  ('Business & Industry', 'business-industry', 'building-2', '#6366F1', 'Industrial equipment, business supplies and B2B'),
  ('Community', 'community', 'users', '#14B8A6', 'Events, activities, lost & found and free items')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug) VALUES
  ((SELECT id FROM categories WHERE slug = 'vehicles'), 'Cars & Trucks', 'cars-trucks'),
  ((SELECT id FROM categories WHERE slug = 'vehicles'), 'Motorcycles & Scooters', 'motorcycles-scooters'),
  ((SELECT id FROM categories WHERE slug = 'vehicles'), 'Boats & Watercraft', 'boats-watercraft'),
  ((SELECT id FROM categories WHERE slug = 'vehicles'), 'Auto Parts & Accessories', 'auto-parts'),
  ((SELECT id FROM categories WHERE slug = 'electronics'), 'Mobile Phones & Tablets', 'mobile-phones'),
  ((SELECT id FROM categories WHERE slug = 'electronics'), 'Computers & Laptops', 'computers-laptops'),
  ((SELECT id FROM categories WHERE slug = 'electronics'), 'TVs & Audio', 'tvs-audio'),
  ((SELECT id FROM categories WHERE slug = 'electronics'), 'Cameras & Photography', 'cameras'),
  ((SELECT id FROM categories WHERE slug = 'electronics'), 'Gaming', 'gaming'),
  ((SELECT id FROM categories WHERE slug = 'fashion'), 'Men''s Clothing', 'mens-clothing'),
  ((SELECT id FROM categories WHERE slug = 'fashion'), 'Women''s Clothing', 'womens-clothing'),
  ((SELECT id FROM categories WHERE slug = 'fashion'), 'Shoes & Footwear', 'shoes'),
  ((SELECT id FROM categories WHERE slug = 'fashion'), 'Bags & Accessories', 'bags-accessories'),
  ((SELECT id FROM categories WHERE slug = 'fashion'), 'Jewelry & Watches', 'jewelry-watches'),
  ((SELECT id FROM categories WHERE slug = 'real-estate'), 'Houses & Villas', 'houses-villas'),
  ((SELECT id FROM categories WHERE slug = 'real-estate'), 'Apartments & Flats', 'apartments'),
  ((SELECT id FROM categories WHERE slug = 'real-estate'), 'Land & Plots', 'land-plots'),
  ((SELECT id FROM categories WHERE slug = 'real-estate'), 'Commercial Properties', 'commercial-properties'),
  ((SELECT id FROM categories WHERE slug = 'jobs'), 'Full-Time Jobs', 'full-time-jobs'),
  ((SELECT id FROM categories WHERE slug = 'jobs'), 'Part-Time & Freelance', 'part-time-freelance'),
  ((SELECT id FROM categories WHERE slug = 'jobs'), 'Internships', 'internships'),
  ((SELECT id FROM categories WHERE slug = 'services'), 'Home Services', 'home-services'),
  ((SELECT id FROM categories WHERE slug = 'services'), 'Professional Services', 'professional-services'),
  ((SELECT id FROM categories WHERE slug = 'services'), 'Education & Tutoring', 'education-tutoring'),
  ((SELECT id FROM categories WHERE slug = 'services'), 'Health & Beauty', 'health-beauty'),
  ((SELECT id FROM categories WHERE slug = 'sports-hobbies'), 'Sports Equipment', 'sports-equipment'),
  ((SELECT id FROM categories WHERE slug = 'sports-hobbies'), 'Musical Instruments', 'musical-instruments'),
  ((SELECT id FROM categories WHERE slug = 'sports-hobbies'), 'Collectibles & Art', 'collectibles-art'),
  ((SELECT id FROM categories WHERE slug = 'sports-hobbies'), 'Books & Games', 'books-games'),
  ((SELECT id FROM categories WHERE slug = 'home-garden'), 'Furniture', 'furniture'),
  ((SELECT id FROM categories WHERE slug = 'home-garden'), 'Home Appliances', 'home-appliances'),
  ((SELECT id FROM categories WHERE slug = 'home-garden'), 'Tools & Equipment', 'tools-equipment'),
  ((SELECT id FROM categories WHERE slug = 'home-garden'), 'Garden & Outdoor', 'garden-outdoor'),
  ((SELECT id FROM categories WHERE slug = 'pets'), 'Dogs & Cats', 'dogs-cats'),
  ((SELECT id FROM categories WHERE slug = 'pets'), 'Pet Supplies', 'pet-supplies'),
  ((SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Fresh Produce', 'fresh-produce'),
  ((SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Livestock & Poultry', 'livestock-poultry'),
  ((SELECT id FROM categories WHERE slug = 'business-industry'), 'Industrial Equipment', 'industrial-equipment'),
  ((SELECT id FROM categories WHERE slug = 'business-industry'), 'Office Supplies', 'office-supplies'),
  ((SELECT id FROM categories WHERE slug = 'community'), 'Events & Activities', 'events-activities')
ON CONFLICT (slug) DO NOTHING;
