import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const skipIfNoEnv = !supabaseUrl || !supabaseKey || supabaseUrl.includes('your_');

describe('Categories - Supabase integration', () => {
  let client: ReturnType<typeof createClient<Database>>;

  beforeAll(() => {
    if (skipIfNoEnv) return;
    client = createClient<Database>(supabaseUrl, supabaseKey);
  });

  it('fetches all 12 seeded categories from the database', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client.from('categories').select('*').order('name');
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(12);
  });

  it('returns categories with the required fields (id, name, slug, icon, color)', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client.from('categories').select('id, name, slug, icon, color').limit(1);
    expect(error).toBeNull();
    const cat = data![0];
    expect(cat).toHaveProperty('id');
    expect(cat).toHaveProperty('name');
    expect(cat).toHaveProperty('slug');
    expect(cat).toHaveProperty('icon');
    expect(cat).toHaveProperty('color');
  });

  it('fetches a category by its slug', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client.from('categories').select('*').eq('slug', 'electronics').maybeSingle();
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.name).toBe('Electronics');
    expect(data!.slug).toBe('electronics');
  });

  it('returns null for a non-existent category slug', async () => {
    if (skipIfNoEnv) return;
    const { data, error } = await client.from('categories').select('*').eq('slug', 'non-existent-slug-xyz').maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it('fetches subcategories associated with the Electronics category', async () => {
    if (skipIfNoEnv) return;
    const { data: cat } = await client.from('categories').select('id').eq('slug', 'electronics').maybeSingle();
    expect(cat).not.toBeNull();
    const { data: subs, error } = await client.from('subcategories').select('*').eq('category_id', cat!.id);
    expect(error).toBeNull();
    expect(subs!.length).toBeGreaterThanOrEqual(1);
    subs!.forEach((s) => expect(s.category_id).toBe(cat!.id));
  });
});
