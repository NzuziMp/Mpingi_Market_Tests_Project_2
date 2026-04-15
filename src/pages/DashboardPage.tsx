import { useEffect, useState, type ElementType } from 'react';
import { Plus, Eye, Trash2, CreditCard as Edit2, LayoutDashboard, Heart, User, Tag, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Listing } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from '../lib/utils';

interface DashboardPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type Tab = 'listings' | 'saved' | 'profile';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700',
  sold: 'bg-blue-100 text-blue-700',
  deleted: 'bg-red-100 text-red-700',
};

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState<Tab>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', country: '', city: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) { onNavigate('auth'); return; }
    loadListings();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === 'saved') loadSaved();
    if (tab === 'profile' && profile) {
      setProfileForm({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        country: profile.country ?? '',
        city: profile.city ?? '',
      });
    }
  }, [tab, profile]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadListings() {
    if (!user) return;
    setLoadingListings(true);
    const { data } = await supabase
      .from('listings')
      .select('*, categories(name, slug, icon, color)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setListings(data as unknown as Listing[]);
    setLoadingListings(false);
  }

  async function loadSaved() {
    if (!user) return;
    setLoadingSaved(true);
    const { data } = await supabase
      .from('saved_listings')
      .select('listing_id, listings(*, categories(name, slug, icon, color))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setSavedListings(data.map((d: { listings: Listing | null }) => d.listings).filter(Boolean) as Listing[]);
    }
    setLoadingSaved(false);
  }

  async function deleteListing(id: string) {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    setDeletingId(id);
    await supabase.from('listings').update({ status: 'deleted' }).eq('id', id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeletingId('');
  }

  async function markAsSold(id: string) {
    await supabase.from('listings').update({ status: 'sold' }).eq('id', id);
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: 'sold' } : l));
  }

  async function saveProfile() {
    if (!user) return;
    setSavingProfile(true);
    await supabase.from('profiles').update({
      full_name: profileForm.full_name,
      phone: profileForm.phone,
      country: profileForm.country,
      city: profileForm.city,
    }).eq('id', user.id);
    await refreshProfile();
    setEditProfile(false);
    setSavingProfile(false);
  }

  if (!user) return null;

  const activeListings = listings.filter((l) => l.status === 'active');
  const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome back, {profile?.full_name ?? user.email?.split('@')[0]}</p>
          </div>
          <button
            onClick={() => onNavigate('post-listing')}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> Post Ad
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Listings', value: activeListings.length, icon: Tag, color: 'blue' },
            { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'emerald' },
            { label: 'Total Listings', value: listings.length, icon: LayoutDashboard, color: 'orange' },
            { label: 'Saved Items', value: savedListings.length, icon: Heart, color: 'red' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-${stat.color}-100`}>
                <stat.icon className={`w-4.5 h-4.5 text-${stat.color}-600`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 mb-5">
          {([
            { id: 'listings', label: 'My Listings', icon: Tag },
            { id: 'saved', label: 'Saved', icon: Heart },
            { id: 'profile', label: 'Profile', icon: User },
          ] as { id: Tab; label: string; icon: ElementType }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {tab === 'listings' && (
          <div>
            {loadingListings ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-3">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">No listings yet</h3>
                <p className="text-gray-500 text-sm mb-4">Start by posting your first free ad</p>
                <button
                  onClick={() => onNavigate('post-listing')}
                  className="px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Post an Ad
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.filter((l) => l.status !== 'deleted').map((listing) => (
                  <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 hover:shadow-sm transition-shadow">
                    <div
                      className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                      onClick={() => onNavigate('listing-detail', { id: listing.id })}
                    >
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => onNavigate('listing-detail', { id: listing.id })}
                          className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 text-left"
                        >
                          {listing.title}
                        </button>
                        <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[listing.status] || ''}`}>
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-blue-600 mt-0.5">
                        {listing.price != null ? `${listing.currency} ${listing.price.toLocaleString()}` : 'Free'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.view_count}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(listing.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {listing.status === 'active' && (
                        <button
                          onClick={() => markAsSold(listing.id)}
                          title="Mark as sold"
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteListing(listing.id)}
                        disabled={deletingId === listing.id}
                        title="Delete"
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'saved' && (
          <div>
            {loadingSaved ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : savedListings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">No saved listings</h3>
                <p className="text-gray-500 text-sm mb-4">Save listings you like to view them later</p>
                <button
                  onClick={() => onNavigate('listings')}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Browse Listings
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {savedListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => onNavigate('listing-detail', { id: listing.id })}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Tag className="w-6 h-6 text-gray-300" /></div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{listing.title}</p>
                      <p className="text-xs font-bold text-blue-600 mt-1">
                        {listing.price != null ? `${listing.currency} ${listing.price.toLocaleString()}` : 'Free'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Profile Information</h2>
              <button
                onClick={() => setEditProfile(!editProfile)}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {editProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-2xl">
                  {profile?.full_name?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900">{profile?.full_name ?? 'User'}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Member since {profile ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            {editProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm((p) => ({ ...p, country: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm((p) => ({ ...p, city: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: profile?.full_name ?? '—' },
                  { label: 'Email', value: user.email ?? '—' },
                  { label: 'Phone', value: profile?.phone ?? '—' },
                  { label: 'Country', value: profile?.country || '—' },
                  { label: 'City', value: profile?.city || '—' },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">{f.label}</p>
                    <p className="text-sm text-gray-900">{f.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
