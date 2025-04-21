import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Admin credentials
export const ADMIN_CREDENTIALS = {
  email: 'admin@ecoscan.ae',
  password: 'EcoScan@UAE2025'
};

// Admin credits - fetched from database
export const getAdminCredits = async () => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', ADMIN_CREDENTIALS.email)
      .single();

    if (error) {
      console.error('Error fetching admin credits:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getAdminCredits:', error);
    return null;
  }
};

// Check if a user is an admin
export const isAdmin = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isAdmin:', error);
    return false;
  }
};