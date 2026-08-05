// js/utils/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

// 🔑 CREDENCIALES DE SUPABASE (Las que ya tienes en el proyecto)
const SUPABASE_URL = 'https://nvyyxgkladjauolvpzfp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NDA3NjMsImV4cCI6MjA5ODIxNjc2M30.3O6tea8l1UbGIlwR_2iyIS1M-dgoQC5G4G1S9YSiXL0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔗 Supabase conectado correctamente desde js/utils/supabaseClient.js');