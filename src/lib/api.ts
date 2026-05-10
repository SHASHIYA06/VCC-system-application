import { supabase, hasValidSupabaseConfig } from './supabase';

export async function uploadData(table: string, data: any[]) {
  if (!hasValidSupabaseConfig) {
    console.warn('Supabase not configured, mocking upload for', table);
    return { success: true, count: data.length };
  }
  
  const { error } = await supabase.from(table).insert(data);
  if (error) {
    console.error(`Failed to upload to ${table}`, error);
    return { success: false, error };
  }
  
  return { success: true, count: data.length };
}
