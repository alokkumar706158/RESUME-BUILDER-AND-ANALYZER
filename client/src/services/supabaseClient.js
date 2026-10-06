import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) &&
  !rawUrl.includes('your_supabase_project_url')
);

// Fallback to valid placeholder URL and key if env variables are empty/unset so React never crashes on startup
const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
