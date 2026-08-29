import { createAdminClient } from './admin';
import { SEED_CATEGORIES, SEED_ITEMS } from '@/constants/waste';
import type { WasteCategory, WasteItem } from '@/types/database';

export async function getWasteCategories(): Promise<WasteCategory[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('waste_categories')
      .select('*')
      .eq('is_active', true)
      .order('name_ar');

    if (error || !data || data.length === 0) {
      return SEED_CATEGORIES;
    }

    return data as WasteCategory[];
  } catch (err) {
    console.warn('Using fallback seed categories:', err);
    return SEED_CATEGORIES;
  }
}

export async function getWasteItems(categoryId?: string): Promise<WasteItem[]> {
  try {
    const supabase = createAdminClient();
    let query = supabase.from('waste_items').select('*').eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.order('points_per_kg', { ascending: false });

    if (error || !data || data.length === 0) {
      if (categoryId) {
        return SEED_ITEMS.filter((i) => i.category_id === categoryId);
      }
      return SEED_ITEMS;
    }

    return data as WasteItem[];
  } catch (err) {
    console.warn('Using fallback seed items:', err);
    if (categoryId) {
      return SEED_ITEMS.filter((i) => i.category_id === categoryId);
    }
    return SEED_ITEMS;
  }
}

export async function getWasteItemById(itemId: string): Promise<WasteItem | null> {
  const all = await getWasteItems();
  return all.find((item) => item.id === itemId) || null;
}
