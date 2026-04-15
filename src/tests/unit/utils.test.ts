import { describe, it, expect } from 'vitest';
import {
  formatDistanceToNow,
  formatPrice,
  slugify,
  checkUserAge,
  validateListingPrice,
  truncateText,
  buildLocationString,
} from '../../lib/utils';

// ─── formatDistanceToNow ────────────────────────────────────────────────────

describe('formatDistanceToNow', () => {
  it('returns "just now" for a date less than 1 minute ago', () => {
    const date = new Date(Date.now() - 30 * 1000).toISOString();
    expect(formatDistanceToNow(date)).toBe('just now');
  });

  it('returns minutes label for a date 5 minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatDistanceToNow(date)).toBe('5m ago');
  });

  it('returns hours label for a date 3 hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatDistanceToNow(date)).toBe('3h ago');
  });

  it('returns days label for a date 2 days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatDistanceToNow(date)).toBe('2d ago');
  });

  it('returns weeks label for a date 2 weeks ago', () => {
    const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatDistanceToNow(date)).toBe('2w ago');
  });

  it('returns months label for a date 2 months ago', () => {
    const date = new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatDistanceToNow(date)).toBe('2mo ago');
  });
});

// ─── formatPrice ────────────────────────────────────────────────────────────

describe('formatPrice', () => {
  it('returns "Free" when price is null', () => {
    expect(formatPrice(null)).toBe('Free');
  });

  it('returns "Free" when price is explicitly null with a currency', () => {
    expect(formatPrice(null, 'EUR')).toBe('Free');
  });

  it('formats a price with default USD currency', () => {
    expect(formatPrice(250)).toBe('USD 250');
  });

  it('formats a price with a custom currency', () => {
    expect(formatPrice(1500, 'CAD')).toBe('CAD 1,500');
  });

  it('formats zero price correctly', () => {
    expect(formatPrice(0)).toBe('USD 0');
  });

  it('formats large prices with locale separators', () => {
    expect(formatPrice(1000000, 'USD')).toBe('USD 1,000,000');
  });
});

// ─── slugify ────────────────────────────────────────────────────────────────

describe('slugify', () => {
  it('converts spaces to hyphens and lowercases the text', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Cars & Trucks!')).toBe('cars--trucks');
  });

  it('handles already lowercased text without modification', () => {
    expect(slugify('electronics')).toBe('electronics');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('collapses multiple spaces into a single hyphen', () => {
    expect(slugify('Sports  Equipment')).toBe('sports-equipment');
  });
});

// ─── checkUserAge ────────────────────────────────────────────────────────────

describe('checkUserAge', () => {
  it('returns true for a user who is exactly 18 years old today', () => {
    const today = new Date();
    const dob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0];
    expect(checkUserAge(dob)).toBe(true);
  });

  it('returns false for a user who is 17 years old', () => {
    const today = new Date();
    const dob = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0];
    expect(checkUserAge(dob)).toBe(false);
  });

  it('returns true for a user who is 30 years old', () => {
    const dob = new Date(new Date().getFullYear() - 30, 0, 1).toISOString().split('T')[0];
    expect(checkUserAge(dob)).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(checkUserAge('')).toBe(false);
  });

  it('returns false for an invalid date string', () => {
    expect(checkUserAge('not-a-date')).toBe(false);
  });

  it('respects a custom minimum age', () => {
    const dob = new Date(new Date().getFullYear() - 16, 0, 1).toISOString().split('T')[0];
    expect(checkUserAge(dob, 16)).toBe(true);
    expect(checkUserAge(dob, 18)).toBe(false);
  });
});

// ─── validateListingPrice ────────────────────────────────────────────────────

describe('validateListingPrice', () => {
  it('returns null when isFree is true regardless of price', () => {
    expect(validateListingPrice('abc', true)).toBeNull();
    expect(validateListingPrice('-50', true)).toBeNull();
  });

  it('returns null for a valid positive price', () => {
    expect(validateListingPrice('250', false)).toBeNull();
    expect(validateListingPrice('0', false)).toBeNull();
  });

  it('returns an error for a non-numeric price string', () => {
    const result = validateListingPrice('abc', false);
    expect(result).toBe('Price must be a valid number');
  });

  it('returns an error for a negative price', () => {
    const result = validateListingPrice('-10', false);
    expect(result).toBe('Price cannot be negative');
  });

  it('returns an error when price exceeds the maximum allowed value', () => {
    const result = validateListingPrice('1000000000', false);
    expect(result).toBe('Price exceeds maximum allowed value');
  });

  it('returns null for an empty price string (treated as unset)', () => {
    expect(validateListingPrice('', false)).toBeNull();
  });
});

// ─── truncateText ────────────────────────────────────────────────────────────

describe('truncateText', () => {
  it('returns the original text when it is within the limit', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates and appends ellipsis when text exceeds the limit', () => {
    const result = truncateText('This is a long description text', 15);
    expect(result).toContain('...');
    expect(result.length).toBeLessThanOrEqual(18);
  });

  it('returns the original text when length equals the limit', () => {
    const text = 'Hello';
    expect(truncateText(text, 5)).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

// ─── buildLocationString ─────────────────────────────────────────────────────

describe('buildLocationString', () => {
  it('returns a full location string when all parts are provided', () => {
    expect(buildLocationString('Toronto', 'Ontario', 'Canada')).toBe('Toronto, Ontario, Canada');
  });

  it('returns only non-empty parts joined by comma', () => {
    expect(buildLocationString('Montreal', '', 'Canada')).toBe('Montreal, Canada');
  });

  it('returns "Worldwide" when all parts are empty', () => {
    expect(buildLocationString('', '', '')).toBe('Worldwide');
  });

  it('returns just the country when city and region are empty', () => {
    expect(buildLocationString('', '', 'France')).toBe('France');
  });
});
