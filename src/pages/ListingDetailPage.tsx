import { useEffect, useState } from 'react';
import { MapPin, Clock, Eye, Heart, Share2, Flag, ChevronLeft, ChevronRight, Tag, Phone, MessageCircle, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Listing, Category, Profile } from '../lib/types';
import { formatDistanceToNow } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { getCategoryIcon } from '../lib/categoryIcons';

interface ListingDetailPageProps {
  listingId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const PLACEHOLDER_IMAGES = [
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const CONDITION_BADGES: Record<string, { label: string; class: string }> = {
  new: { label: 'New', class: 'bg-emerald-100 text-emerald-700' },
  used: { label: 'Used', class: 'bg-amber-100 text-amber-700' },
  refurbished: { label: 'Refurbished', class: 'bg-blue-100 text-blue-700' },
};

export default function ListingDetailPage({ listingId, onNavigate }: ListingDetailPageProps) {
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('listings')
        .select('*, categories(*)')
        .eq('id', listingId)
        .maybeSingle();

      if (!data) { setLoading(false); return; }
      setListing(data as unknown as Listing);
      if ((data as unknown as { categories: Category }).categories) setCategory((data as unknown as { categories: Category }).categories);

      const { data: sellerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user_id)
        .maybeSingle();
      if (sellerData) setSeller(sellerData as Profile);

      if (data.category_id) {
        const { data: rel } = await supabase
          .from('listings')
          .select('*, categories(name, slug, icon, color)')
          .eq('category_id', data.category_id)
          .eq('status', 'active')
          .neq('id', listingId)
          .limit(4);
        if (rel) setRelated(rel as unknown as Listing[]);
      }

      if (user) {
        const { data: saved } = await supabase
          .from('saved_listings')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
          .maybeSingle();
        setIsSaved(!!saved);
      }

      await supabase.from('listings').update({ view_count: (data.view_count || 0) + 1 }).eq('id', listingId);
      setLoading(false);
    }
    load();
  }, [listingId, user]);

  async function toggleSave() {
    if (!user) { onNavigate('auth'); return; }
    if (isSaved) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listingId);
      setIsSaved(false);
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listingId });
      setIsSaved(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Listing not found</h2>
          <button onClick={() => onNavigate('listings')} className="text-blue-600 hover:underline text-sm">
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : [PLACEHOLDER_IMAGES[Math.abs(listing.id.charCodeAt(0) - 48) % PLACEHOLDER_IMAGES.length]];
  const location = [listing.city, listing.region, listing.country].filter(Boolean).join(', ') || 'Worldwide';
  const CategoryIcon = category ? getCategoryIcon(category.icon) : Tag;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => onNavigate('listings')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="relative aspect-[16/10] bg-gray-100">
                <img
                  src={images[imageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[0]; }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setImageIndex((i) => Math.min(images.length - 1, i + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === imageIndex ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imageIndex ? 'border-blue-500' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {category && (
                    <button
                      onClick={() => onNavigate('listings', { category: category.slug })}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <CategoryIcon className="w-3 h-3" />
                      {category.name}
                    </button>
                  )}
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  {listing.price != null ? (
                    <span className="text-2xl font-extrabold text-blue-600">
                      {listing.currency} {listing.price.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-2xl font-extrabold text-emerald-600">Free</span>
                  )}
                  {listing.is_negotiable && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Negotiable</span>
                  )}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CONDITION_BADGES[listing.condition]?.class || ''}`}>
                  {CONDITION_BADGES[listing.condition]?.label}
                </span>
                {listing.plan_type === 'paid' && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">Featured</span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 pb-4 border-b border-gray-100 mb-4">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Posted {formatDistanceToNow(listing.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> {(listing.view_count + 1).toLocaleString()} views
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleSave}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${isSaved ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors ml-auto">
                  <Flag className="w-4 h-4" /> Report
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
              </p>
            </div>

            {related.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 mb-3">Similar Listings</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {related.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onNavigate('listing-detail', { id: rel.id })}
                      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                        <img
                          src={rel.images?.[0] || PLACEHOLDER_IMAGES[0]}
                          alt={rel.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[0]; }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{rel.title}</p>
                        <p className="text-xs font-bold text-blue-600 mt-0.5">
                          {rel.price != null ? `${rel.currency} ${rel.price.toLocaleString()}` : 'Free'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-28">
              <h2 className="font-bold text-gray-900 mb-4">Contact Seller</h2>
              {seller ? (
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-lg">
                      {seller.full_name?.charAt(0).toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{seller.full_name ?? 'User'}</p>
                    <p className="text-xs text-gray-500">Member since {new Date(seller.created_at).getFullYear()}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-11 h-11 bg-gray-200 rounded-full animate-pulse" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              )}

              {listing.price != null && (
                <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-gray-500">Asking Price</p>
                  <p className="text-xl font-bold text-blue-700">{listing.currency} {listing.price.toLocaleString()}</p>
                  {listing.is_negotiable && <p className="text-xs text-emerald-600 mt-0.5">Price is negotiable</p>}
                </div>
              )}

              <div className="space-y-2">
                {showContact ? (
                  <div className="space-y-2">
                    {seller?.phone && (
                      <a
                        href={`tel:${seller.phone}`}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        <Phone className="w-4 h-4" /> {seller.phone}
                      </a>
                    )}
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                      <MessageCircle className="w-4 h-4" /> Send Message
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { if (!user) { onNavigate('auth'); } else { setShowContact(true); } }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {user ? 'Show Contact Details' : 'Sign in to Contact'}
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Always meet in a safe public place. Never pay in advance.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
