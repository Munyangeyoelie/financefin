import { createClient } from '@supabase/supabase-js';

// Get the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Ensure that the environment variables are defined, otherwise throw an error
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or anonymous key is missing from environment variables');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
