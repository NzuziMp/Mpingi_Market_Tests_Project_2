import { useEffect, useState } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category, Subcategory, Listing, ListingFilters } from '../lib/types';
import { getCategoryIcon } from '../lib/categoryIcons';
import ListingCard from '../components/listings/ListingCard';

interface ListingsPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  initialFilters?: ListingFilters;
  searchQuery: string;
}

const PAGE_SIZE = 20;

export default function ListingsPage({ onNavigate, initialFilters = {}, searchQuery }: ListingsPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({
    query: searchQuery,
    ...initialFilters,
    sortBy: 'newest',
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, query: searchQuery }));
    setPage(0);
  }, [searchQuery]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...initialFilters }));
    setPage(0);
  }, [initialFilters.category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function loadCats() {
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      if (cats) setCategories(cats as Category[]);
    }
    loadCats();
  }, []);

  useEffect(() => {
    if (filters.category) {
      supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categories.find((c) => c.slug === filters.category)?.id ?? '')
        .then(({ data }) => { if (data) setSubcategories(data as Subcategory[]); });
    } else {
      setSubcategories([]);
    }
  }, [filters.category, categories]);

  useEffect(() => {
    setPage(0);
  }, [filters]);

  useEffect(() => {
    loadListings();
  }, [filters, page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadListings() {
    setLoading(true);
    let query = supabase
      .from('listings')
      .select('*, categories(name, slug, icon, color)', { count: 'exact' })
      .eq('status', 'active');

    if (filters.query) {
      query = query.ilike('title', `%${filters.query}%`);
    }
    if (filters.category) {
      const cat = categories.find((c) => c.slug === filters.category);
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.minPrice != null) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice != null) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.country) {
      query = query.ilike('country', `%${filters.country}%`);
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.sortBy === 'newest') query = query.order('created_at', { ascending: false });
    else if (filters.sortBy === 'oldest') query = query.order('created_at', { ascending: true });
    else if (filters.sortBy === 'price_asc') query = query.order('price', { ascending: true });
    else if (filters.sortBy === 'price_desc') query = query.order('price', { ascending: false });

    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count } = await query;
    if (data) setListings(data as unknown as Listing[]);
    if (count != null) setTotal(count);
    setLoading(false);
  }

  function updateFilter(key: keyof ListingFilters, value: string | number | undefined) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }

  function clearFilters() {
    setFilters({ sortBy: 'newest', query: searchQuery });
    setPage(0);
  }

  const activeFilterCount = [filters.category, filters.condition, filters.country, filters.city, filters.minPrice, filters.maxPrice]
    .filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex-1 overflow-x-auto flex items-center gap-2 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const active = filters.category === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', active ? undefined : cat.slug)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${active ? 'border-transparent text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                  style={active ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-100 bg-white px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {filters.category && subcategories.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subcategory</label>
                  <select
                    value={filters.subcategory ?? ''}
                    onChange={(e) => updateFilter('subcategory', e.target.value || undefined)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.slug}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
                <select
                  value={filters.condition ?? ''}
                  onChange={(e) => updateFilter('condition', e.target.value || undefined)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Min Price (USD)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Price (USD)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Any"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                <input
                  type="text"
                  placeholder="Any country"
                  value={filters.country ?? ''}
                  onChange={(e) => updateFilter('country', e.target.value || undefined)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${total.toLocaleString()} listing${total !== 1 ? 's' : ''} found`}
            {filters.query && <span className="ml-1">for "<span className="font-medium text-gray-800">{filters.query}</span>"</span>}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-semibold text-lg mb-2">No listings found</h3>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onView={(id) => onNavigate('listing-detail', { id })}
                />
              ))}
            </div>

            {total > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">
                  Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * PAGE_SIZE >= total}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
