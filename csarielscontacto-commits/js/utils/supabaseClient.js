📄 ARCHIVO 1 (Crea este archivo en la raíz: config.js)
================================================================================
// config.js - Archivo central de configuración
// 🔑 Aquí van todas tus llaves y URLs públicas

export const CONFIG = {
    // 🗄️ Supabase (Las que te dio Antropic)
    SUPABASE_URL: 'https://nvyyxgkladjauolvpzfp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NDA3NjMsImV4cCI6MjA5ODIxNjc2M30.3O6tea8l1UbGIlwR_2iyIS1M-dgoQC5G4G1S9YSiXL0',
    
    // 🦊 Configuración de la Wallet (Cartera invisible)
    WALLET_STORAGE_KEY: 'csariels_wallet'
};
================================================================================

📄 ARCHIVO 2 (Crea esta ruta: js/utils/supabaseClient.js)
================================================================================
// js/utils/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
import { CONFIG } from '../../config.js'; // 👈 Sube dos niveles para encontrar config.js

const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔗 Supabase conectado desde config.js');
================================================================================