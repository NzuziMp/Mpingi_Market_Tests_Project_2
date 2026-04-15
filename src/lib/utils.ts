export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function formatPrice(price: number | null, currency: string = 'USD'): string {
  if (price == null) return 'Free';
  return `${currency} ${price.toLocaleString()}`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export const COUNTRIES = [
  'Canada', 'United States', 'United Kingdom', 'France', 'Germany',
  'Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Ethiopia',
  'Democratic Republic of Congo', 'Tanzania', 'Egypt', 'Morocco', 'Algeria',
  'Brazil', 'Argentina', 'Mexico', 'Colombia', 'Peru',
  'India', 'China', 'Japan', 'South Korea', 'Australia',
  'Indonesia', 'Philippines', 'Vietnam', 'Thailand', 'Malaysia',
  'Other'
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CDF', 'NGN', 'ZAR', 'KES', 'GHS', 'EGP', 'MAD', 'BRL', 'INR', 'JPY', 'CNY'];

export function checkUserAge(dateOfBirth: string, minAge: number = 18): boolean {
  if (!dateOfBirth) return false;
  const birth = new Date(dateOfBirth);
  if (isNaN(birth.getTime())) return false;
  const today = new Date();
  const age =
    today.getFullYear() -
    birth.getFullYear() -
    (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  return age >= minAge;
}

export function validateListingPrice(price: string, isFree: boolean): string | null {
  if (isFree) return null;
  if (!price) return null;
  const num = parseFloat(price);
  if (isNaN(num)) return 'Price must be a valid number';
  if (num < 0) return 'Price cannot be negative';
  if (num > 999_999_999) return 'Price exceeds maximum allowed value';
  return null;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

export function buildLocationString(city: string, region: string, country: string): string {
  return [city, region, country].filter(Boolean).join(', ') || 'Worldwide';
}
