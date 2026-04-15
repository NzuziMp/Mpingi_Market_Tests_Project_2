import { describe, it, expect } from 'vitest';
import type { Listing } from '../../lib/types';

function buildLocation(listing: Pick<Listing, 'city' | 'region' | 'country'>): string {
  return [listing.city, listing.region, listing.country].filter(Boolean).join(', ') || 'Worldwide';
}

function getListingDisplayPrice(listing: Pick<Listing, 'price' | 'currency' | 'is_negotiable'>): string {
  if (listing.price == null) return 'Free';
  const formatted = `${listing.currency} ${listing.price.toLocaleString()}`;
  return listing.is_negotiable ? `${formatted} (neg.)` : formatted;
}

function isListingExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

function filterActiveListings(listings: Pick<Listing, 'status'>[]): Pick<Listing, 'status'>[] {
  return listings.filter((l) => l.status === 'active');
}

// ─── buildLocation ────────────────────────────────────────────────────────────

describe('buildLocation', () => {
  it('returns full location when all fields are set', () => {
    expect(buildLocation({ city: 'Paris', region: 'Île-de-France', country: 'France' }))
      .toBe('Paris, Île-de-France, France');
  });

  it('returns "Worldwide" when all location fields are empty', () => {
    expect(buildLocation({ city: '', region: '', country: '' })).toBe('Worldwide');
  });

  it('handles missing region gracefully', () => {
    expect(buildLocation({ city: 'Lagos', region: '', country: 'Nigeria' }))
      .toBe('Lagos, Nigeria');
  });
});

// ─── getListingDisplayPrice ───────────────────────────────────────────────────

describe('getListingDisplayPrice', () => {
  it('returns "Free" when price is null', () => {
    expect(getListingDisplayPrice({ price: null, currency: 'USD', is_negotiable: false }))
      .toBe('Free');
  });

  it('returns formatted price when price is set', () => {
    expect(getListingDisplayPrice({ price: 500, currency: 'USD', is_negotiable: false }))
      .toBe('USD 500');
  });

  it('appends negotiable indicator when is_negotiable is true', () => {
    const result = getListingDisplayPrice({ price: 1200, currency: 'EUR', is_negotiable: true });
    expect(result).toContain('EUR 1,200');
    expect(result).toContain('(neg.)');
  });

  it('does not append negotiable indicator when price is null', () => {
    expect(getListingDisplayPrice({ price: null, currency: 'USD', is_negotiable: true }))
      .toBe('Free');
  });
});

// ─── isListingExpired ────────────────────────────────────────────────────────

describe('isListingExpired', () => {
  it('returns true for a date in the past', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(isListingExpired(past)).toBe(true);
  });

  it('returns false for a date in the future', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(isListingExpired(future)).toBe(false);
  });

  it('returns true for a date exactly at now minus 1ms', () => {
    const justPast = new Date(Date.now() - 1).toISOString();
    expect(isListingExpired(justPast)).toBe(true);
  });
});

// ─── filterActiveListings ────────────────────────────────────────────────────

describe('filterActiveListings', () => {
  const listings = [
    { status: 'active' as const },
    { status: 'sold' as const },
    { status: 'active' as const },
    { status: 'expired' as const },
    { status: 'deleted' as const },
  ];

  it('returns only active listings from a mixed list', () => {
    const result = filterActiveListings(listings);
    expect(result).toHaveLength(2);
    result.forEach((l) => expect(l.status).toBe('active'));
  });

  it('returns an empty array when no listings are active', () => {
    const noActive = [{ status: 'sold' as const }, { status: 'expired' as const }];
    expect(filterActiveListings(noActive)).toHaveLength(0);
  });

  it('returns all listings when all are active', () => {
    const allActive = [{ status: 'active' as const }, { status: 'active' as const }];
    expect(filterActiveListings(allActive)).toHaveLength(2);
  });
});
