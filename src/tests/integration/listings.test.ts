import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const skipIfNoEnv = !supabaseUrl || !supabaseKey || supabaseUrl.includes('your_');

describe('Listings - Supabase integration', () => {
  let client: ReturnType<typeof createClient<Database>>;

  beforeAll(() => {
    if (skipIfNoEnv) return;
    client = createClient<Database>(supabaseUrl, supabaseKey);
  });

  it('fetches active listings from the database', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client
      .from('listings')
      .select('id, title, status, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    data!.forEach((l) => expect(l.status).toBe('active'));
  });

  it('fetches listings with their associated category in a single query', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client
      .from('listings')
      .select('id, title, categories(name, slug)')
      .eq('status', 'active')
      .limit(5);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('returns an empty array for a search query that matches nothing', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client
      .from('listings')
      .select('id')
      .eq('status', 'active')
      .ilike('title', '%xyznonexistenttitleqwerty%');
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it('returns listings filtered by price range', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client
      .from('listings')
      .select('id, price')
      .eq('status', 'active')
      .gte('price', 0)
      .lte('price', 1000);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    data!.forEach((l) => {
      if (l.price !== null) {
        expect(l.price).toBeGreaterThanOrEqual(0);
        expect(l.price).toBeLessThanOrEqual(1000);
      }
    });
  });

  it('returns listings ordered by created_at descending (newest first)', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client
      .from('listings')
      .select('id, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);
    expect(error).toBeNull();
    if (data && data.length >= 2) {
      for (let i = 1; i < data.length; i++) {
        expect(new Date(data[i - 1].created_at).getTime())
          .toBeGreaterThanOrEqual(new Date(data[i].created_at).getTime());
      }
    }
  });
});
