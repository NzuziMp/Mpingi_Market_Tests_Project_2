import { Heart, MapPin, Clock } from 'lucide-react';
import type { Listing } from '../../lib/types';
import { formatDistanceToNow } from '../../lib/utils';

interface ListingCardProps {
  listing: Listing;
  onView: (id: string) => void;
  isSaved?: boolean;
  onSave?: (id: string) => void;
}

const PLACEHOLDER_IMAGES = [
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=400',
];

const CONDITION_COLORS: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-700',
  used: 'bg-amber-100 text-amber-700',
  refurbished: 'bg-blue-100 text-blue-700',
};

export default function ListingCard({ listing, onView, isSaved = false, onSave }: ListingCardProps) {
  const imageSrc = listing.images?.[0] || PLACEHOLDER_IMAGES[Math.abs(listing.id.charCodeAt(0) - 48) % PLACEHOLDER_IMAGES.length];
  const location = [listing.city, listing.country].filter(Boolean).join(', ') || 'Worldwide';

  return (
    <div
      onClick={() => onView(listing.id)}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[0];
          }}
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_COLORS[listing.condition] || 'bg-gray-100 text-gray-600'}`}>
            {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
          </span>
          {listing.plan_type === 'paid' && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              Featured
            </span>
          )}
        </div>
        {onSave && (
          <button
            onClick={(e) => { e.stopPropagation(); onSave(listing.id); }}
            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1.5">{listing.title}</h3>
        <div className="flex items-center justify-between mb-2">
          {listing.price != null ? (
            <span className="text-base font-bold text-blue-600">
              {listing.currency} {listing.price.toLocaleString()}
              {listing.is_negotiable && <span className="text-xs font-normal text-gray-500 ml-1">(neg.)</span>}
            </span>
          ) : (
            <span className="text-base font-bold text-emerald-600">Free</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{location}</span>
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(listing.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
