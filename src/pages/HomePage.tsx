import { useEffect, useState } from 'react';
import { Search, TrendingUp, Shield, Globe, ChevronRight, Zap, Star, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category, Listing } from '../lib/types';
import { getCategoryIcon } from '../lib/categoryIcons';
import ListingCard from '../components/listings/ListingCard';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
}

const HERO_STATS = [
  { value: '239+', label: 'Countries' },
  { value: '4,120', label: 'Regions' },
  { value: '47K+', label: 'Cities' },
  { value: '1M+', label: 'Listings' },
];

const HERO_IMAGE = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200';

export default function HomePage({ onNavigate, searchQuery, onSearchChange, onSearchSubmit }: HomePageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: listings }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('listings')
          .select('*, categories(name, slug, icon, color)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8),
      ]);
      if (cats) setCategories(cats as Category[]);
      if (listings) setRecentListings(listings as unknown as Listing[]);
      setLoadingCategories(false);
      setLoadingListings(false);
    }
    load();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') onSearchSubmit();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden"
        style={{ minHeight: '480px' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(${HERO_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/70 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/40 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-5">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              Free classifieds platform — Post your ad today
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              Buy & Sell Anything,<br />
              <span className="text-yellow-300">Anywhere in the World</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Mpingi Market connects millions of buyers and sellers across 239 countries. Find cars, electronics, fashion, real estate, jobs and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-lg"
                />
              </div>
              <button
                onClick={onSearchSubmit}
                className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-2xl transition-colors shadow-lg text-base flex-shrink-0"
              >
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Cars', 'Electronics', 'Fashion', 'Jobs', 'Real Estate'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => { onSearchChange(tag); onSearchSubmit(); }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-sm text-blue-100 hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-yellow-300">{stat.value}</p>
                <p className="text-blue-200 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #fef3e8 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
              <p className="text-gray-500 text-sm mt-1">Find exactly what you're looking for</p>
            </div>
            <button
              onClick={() => onNavigate('listings')}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white/70 rounded-2xl p-5 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl mb-3 mx-auto" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                return (
                  <button
                    key={cat.id}
                    onClick={() => onNavigate('listings', { category: cat.slug })}
                    className="bg-white rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-white/60 group shadow-sm"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: `${cat.color}25` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: cat.color }} />
                    </div>
                    <p className="text-xs font-semibold leading-tight" style={{ color: cat.color }}>{cat.name}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Listings</h2>
            <p className="text-gray-500 text-sm mt-1">Latest ads from around the world</p>
          </div>
          <button
            onClick={() => onNavigate('listings')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            See all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loadingListings ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : recentListings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">No listings yet</h3>
            <p className="text-gray-500 text-sm mb-4">Be the first to post an ad on Mpingi Market!</p>
            <button
              onClick={() => onNavigate('post-listing')}
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
            >
              Post an Ad
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onView={(id) => onNavigate('listing-detail', { id })}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Globe className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="font-bold text-lg">Global Reach</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Post your ad and reach buyers in 239 countries, 4,120 regions and 47,576 cities worldwide.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg">Safe & Secure</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Our platform verifies users and monitors listings to ensure a safe trading environment for everyone.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                <Star className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="font-bold text-lg">Free to Use</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Post your first ad for free. Our free plan gives you 31 days of visibility with no hidden fees.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to start selling?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Join millions of buyers and sellers on Mpingi Market. Post your first ad for free in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('post-listing')}
              className="px-8 py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-2xl transition-colors shadow-lg"
            >
              Post a Free Ad
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-2xl transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
