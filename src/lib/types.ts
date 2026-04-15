export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  listing_count: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  country: string;
  region: string;
  city: string;
  is_admin: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  category_id: string | null;
  subcategory_id: string | null;
  condition: 'new' | 'used' | 'refurbished';
  images: string[];
  country: string;
  region: string;
  city: string;
  plan_type: 'free' | 'paid';
  status: 'active' | 'expired' | 'pending' | 'sold' | 'deleted';
  is_negotiable: boolean;
  view_count: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  categories?: Category;
  profiles?: Profile;
}

export interface ListingFilters {
  category?: string;
  subcategory?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  country?: string;
  city?: string;
  query?: string;
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
}
