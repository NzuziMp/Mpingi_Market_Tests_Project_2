export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          country?: string;
          region?: string;
          city?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          country?: string;
          region?: string;
          city?: string;
          is_admin?: boolean;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          color: string;
          description: string;
          listing_count: number;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          icon?: string;
          color?: string;
          description?: string;
          listing_count?: number;
        };
        Update: {
          name?: string;
          slug?: string;
          icon?: string;
          color?: string;
          description?: string;
          listing_count?: number;
        };
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          category_id: string;
          name: string;
          slug: string;
        };
        Update: {
          category_id?: string;
          name?: string;
          slug?: string;
        };
      };
      listings: {
        Row: {
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
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string;
          price?: number | null;
          currency?: string;
          category_id?: string | null;
          subcategory_id?: string | null;
          condition?: 'new' | 'used' | 'refurbished';
          images?: string[];
          country?: string;
          region?: string;
          city?: string;
          plan_type?: 'free' | 'paid';
          status?: 'active' | 'expired' | 'pending' | 'sold' | 'deleted';
          is_negotiable?: boolean;
        };
        Update: {
          title?: string;
          description?: string;
          price?: number | null;
          currency?: string;
          category_id?: string | null;
          subcategory_id?: string | null;
          condition?: 'new' | 'used' | 'refurbished';
          images?: string[];
          country?: string;
          region?: string;
          city?: string;
          plan_type?: 'free' | 'paid';
          status?: 'active' | 'expired' | 'pending' | 'sold' | 'deleted';
          is_negotiable?: boolean;
          updated_at?: string;
        };
      };
      saved_listings: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          listing_id: string;
        };
        Update: never;
      };
    };
  };
}
