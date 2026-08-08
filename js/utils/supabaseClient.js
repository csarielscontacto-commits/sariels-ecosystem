// js/utils/supabaseClient.js
// Cliente de Supabase unificado para todo el ecosistema.
// Reutiliza window.supabase si ya fue creado por client-config-loader.js.

// 🔑 CREDENCIALES DE SUPABASE (fallback)
const FALLBACK_URL = 'https://nvyyxgkladjauolvpzfp.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NDA3NjMsImV4cCI6MjA5ODIxNjc2M30.3O6tea8l1UbGIlwR_2iyIS1M-dgoQC5G4G1S9YSiXL0';

// Función para obtener o crear el cliente de Supabase
function getSupabaseClient() {
  // 1. Si ya existe window.supabase (creado por client-config-loader), lo usamos
  if (window.supabase && typeof window.supabase.from === 'function') {
    console.log('🔄 Reutilizando window.supabase (creado por client-config-loader)');
    return window.supabase;
  }

  // 2. Si existe window.supabaseClient (compatibilidad), lo usamos
  if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
    console.log('🔄 Reutilizando window.supabaseClient');
    return window.supabaseClient;
  }

  // 3. Si window.CONFIG tiene las credenciales, las usamos
  if (window.CONFIG?.SUPABASE_URL && window.CONFIG?.SUPABASE_ANON_KEY) {
    console.log('🔧 Creando cliente desde window.CONFIG');
    // Necesitamos la librería: si está disponible globalmente
    if (window.supabase?.createClient) {
      const client = window.supabase.createClient(
        window.CONFIG.SUPABASE_URL,
        window.CONFIG.SUPABASE_ANON_KEY
      );
      window.supabase = client;
      window.supabaseClient = client;
      return client;
    }
  }

  // 4. Fallback final: usar credenciales duras y crear el cliente
  console.log('⚠️ Usando fallback con credenciales duras de supabaseClient.js');
  // Importar la librería dinámicamente (solo si no está cargada)
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    const client = supabase.createClient(FALLBACK_URL, FALLBACK_ANON_KEY);
    window.supabase = client;
    window.supabaseClient = client;
    return client;
  }

  // Si llegamos aquí, algo está mal: intentamos cargar la librería desde CDN
  console.error('❌ No se pudo obtener un cliente de Supabase. Intentando cargar desde CDN...');
  // Esto es síncrono, pero la mayoría de las veces ya está cargado.
  // En caso extremo, lanzamos error.
  throw new Error('No se pudo inicializar Supabase. Verifica la conexión.');
}

// Exportar la instancia única
export const supabase = getSupabaseClient();

console.log('✅ Supabase cliente exportado desde js/utils/supabaseClient.js');