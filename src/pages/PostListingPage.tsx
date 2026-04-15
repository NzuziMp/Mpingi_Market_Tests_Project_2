import { useEffect, useState } from 'react';
import { X, Plus, ChevronRight, Info, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category, Subcategory } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { getCategoryIcon } from '../lib/categoryIcons';
import { COUNTRIES, CURRENCIES } from '../lib/utils';

interface PostListingPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const STEPS = ['Category', 'Details', 'Location', 'Review'];

interface FormData {
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  condition: 'new' | 'used' | 'refurbished';
  isNegotiable: boolean;
  isFree: boolean;
  country: string;
  region: string;
  city: string;
  images: string[];
  planType: 'free' | 'paid';
}

export default function PostListingPage({ onNavigate }: PostListingPageProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newListingId, setNewListingId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [form, setForm] = useState<FormData>({
    categoryId: '',
    subcategoryId: '',
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    condition: 'used',
    isNegotiable: false,
    isFree: false,
    country: '',
    region: '',
    city: '',
    images: [],
    planType: 'free',
  });

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', form.categoryId)
        .then(({ data }) => { if (data) setSubcategories(data as Subcategory[]); });
    }
  }, [form.categoryId]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addImageUrl() {
    if (imageUrl && !form.images.includes(imageUrl)) {
      update('images', [...form.images, imageUrl]);
      setImageUrl('');
    }
  }

  function removeImage(idx: number) {
    update('images', form.images.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!user) { onNavigate('auth'); return; }
    setLoading(true);
    const { data, error } = await supabase.from('listings').insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      price: form.isFree ? null : (form.price ? parseFloat(form.price) : null),
      currency: form.currency,
      category_id: form.categoryId || null,
      subcategory_id: form.subcategoryId || null,
      condition: form.condition,
      is_negotiable: form.isNegotiable,
      images: form.images,
      country: form.country,
      region: form.region,
      city: form.city,
      plan_type: form.planType,
      status: 'active',
    }).select('id').single();

    if (!error && data) {
      setNewListingId(data.id);
      setSuccess(true);
    }
    setLoading(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-sm w-full">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to Post an Ad</h2>
          <p className="text-gray-500 text-sm mb-5">You need an account to post listings on Mpingi Market.</p>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('auth')}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-9 h-9 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ad Posted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your listing is now live on Mpingi Market and will be visible for 31 days.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('listing-detail', { id: newListingId })}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              View My Listing
            </button>
            <button
              onClick={() => { setSuccess(false); setStep(0); setForm({ categoryId: '', subcategoryId: '', title: '', description: '', price: '', currency: 'USD', condition: 'used', isNegotiable: false, isFree: false, country: '', region: '', city: '', images: [], planType: 'free' }); }}
              className="w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Post Another Ad
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Post a Free Ad</h1>
          <p className="text-gray-500 text-sm mt-1">Reach buyers across the world in minutes</p>
        </div>

        <div className="flex items-center gap-1 mb-7">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-blue-600' : i < step ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {step === 0 && (
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Choose a Category</h2>
              <p className="text-gray-500 text-sm mb-5">Select the category that best describes your item</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.icon);
                  const selected = form.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { update('categoryId', cat.id); update('subcategoryId', ''); }}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: cat.color }} />
                      </div>
                      <span className={`text-xs font-semibold ${selected ? 'text-blue-700' : 'text-gray-700'}`}>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
              {form.categoryId && subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory (optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => update('subcategoryId', form.subcategoryId === sub.id ? '' : sub.id)}
                        className={`text-left px-3 py-2 rounded-xl border text-sm transition-colors ${form.subcategoryId === sub.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-300 text-gray-700'}`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">Listing Details</h2>
                <p className="text-gray-500 text-sm mb-4">Describe your item clearly to attract buyers</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="e.g. iPhone 14 Pro Max 256GB - Excellent Condition"
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/100</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe your item in detail: condition, features, reason for selling..."
                  rows={5}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/2000</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <div className="flex gap-2">
                  {(['new', 'used', 'refurbished'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => update('condition', c)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-colors ${form.condition === c ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      checked={form.isFree}
                      onChange={(e) => update('isFree', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-600">Give for free</span>
                  </label>
                </div>
                {!form.isFree && (
                  <div className="flex gap-2">
                    <select
                      value={form.currency}
                      onChange={(e) => update('currency', e.target.value)}
                      className="px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => update('price', e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {!form.isFree && (
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isNegotiable}
                      onChange={(e) => update('isNegotiable', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-600">Price is negotiable</span>
                  </label>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos (URLs)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addImageUrl}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-400">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Add photo URLs. Use images from Pexels, Unsplash, or your own hosted images.
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">Location</h2>
                <p className="text-gray-500 text-sm mb-4">Help buyers find your listing by location</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <select
                  value={form.country}
                  onChange={(e) => update('country', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Region / State</label>
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => update('region', e.target.value)}
                  placeholder="e.g. Ontario, California, Île-de-France"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  placeholder="e.g. Toronto, Los Angeles, Paris"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Listing Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => update('planType', 'free')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.planType === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <p className={`font-bold text-base ${form.planType === 'free' ? 'text-blue-700' : 'text-gray-900'}`}>Free</p>
                    <p className="text-xs text-gray-500 mt-0.5">31-day visibility</p>
                  </button>
                  <button
                    onClick={() => update('planType', 'paid')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.planType === 'paid' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <p className={`font-bold text-base ${form.planType === 'paid' ? 'text-orange-700' : 'text-gray-900'}`}>Featured</p>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Popular</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Extended visibility & boost</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Review Your Ad</h2>
              <p className="text-gray-500 text-sm mb-5">Make sure everything looks correct before posting</p>
              <div className="space-y-3">
                {form.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {form.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                    ))}
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Title</span>
                    <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{form.title || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Price</span>
                    <span className="text-sm font-medium text-gray-900">{form.isFree ? 'Free' : form.price ? `${form.currency} ${form.price}` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Condition</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{form.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="text-sm font-medium text-gray-900 text-right">
                      {[form.city, form.country].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Plan</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{form.planType}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => {
                if (step === 1 && !form.title) return;
                setStep((s) => s + 1);
              }}
              disabled={step === 1 && !form.title}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !form.title}
              className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Posting...' : 'Post Ad Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
