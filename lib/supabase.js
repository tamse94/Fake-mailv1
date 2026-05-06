import { createClient } from '@supabase/supabase-js';

// Memanggil kunci yang sudah kamu pasang di dashboard Vercel tadi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Pastikan koneksi hanya dibuat jika kunci tersedia
export const supabase = createClient(supabaseUrl, supabaseKey);
