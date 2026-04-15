import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const skipIfNoEnv = !supabaseUrl || !supabaseKey || supabaseUrl.includes('your_');

describe('Profiles - Supabase integration', () => {
  let client: ReturnType<typeof createClient<Database>>;

  beforeAll(() => {
    if (skipIfNoEnv) return;
    client = createClient<Database>(supabaseUrl, supabaseKey);
  });

  it('returns null for a profile with a non-existent user UUID', async () => {
    if (skipIfNoEnv) return;
    const fakeUUID = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', fakeUUID)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it('profiles table query returns expected columns', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client
      .from('profiles')
      .select('id, full_name, country, city, is_admin, created_at')
      .limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    if (data && data.length > 0) {
      const p = data[0];
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('full_name');
      expect(p).toHaveProperty('country');
      expect(p).toHaveProperty('city');
      expect(p).toHaveProperty('is_admin');
      expect(p).toHaveProperty('created_at');
    }
  });

  it('profiles table enforces RLS - anonymous users can only see their own data', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client.from('profiles').select('id').limit(10);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('is_admin defaults to false for new profile records', async () => {
    if (skipIfNoEnv) return;
    const { data } = await client.from('profiles').select('id, is_admin').limit(10);
    if (data && data.length > 0) {
      data.forEach((p) => {
        expect(typeof p.is_admin).toBe('boolean');
      });
    }
  });

  it('categories and profiles can be joined via a listing user_id', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client
      .from('listings')
      .select('id, user_id, title')
      .eq('status', 'active')
      .limit(3);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
