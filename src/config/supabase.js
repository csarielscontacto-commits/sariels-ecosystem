// ================================================================
// 🗄️ CONFIGURACIÓN DE SUPABASE - CSARIEL'S ECOSYSTEM
// ================================================================
// Configuración centralizada de Supabase para todo el ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// 🔑 CREDENCIALES
// ================================================================

// URL y clave anónima de Supabase (fallback)
const FALLBACK_URL = 'https://nvyyxgkladjauolvpzfp.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NDA3NjMsImV4cCI6MjA5ODIxNjc2M30.3O6tea8l1UbGIlwR_2iyIS1M-dgoQC5G4G1S9YSiXL0';

// ================================================================
// 📦 TABLAS DEL ECOSISTEMA
// ================================================================

export const TABLAS = {
    PERFILES: 'perfiles',
    POSTS: 'posts_muro',
    COMENTARIOS: 'comentarios',
    MENSAJES_CHAT: 'mensajes_chat',
    SERVICIOS: 'servicios',
    TRANSACCIONES: 'transacciones',
    ORDENES_ESIM: 'ordenes_esim',
    PLANES_ESIM: 'planes_esim',
    SUSCRIPCIONES_ESIM: 'suscripciones_esim',
    TIENDA_ORDERS: 'tienda_orders',
    OFERTAS_MURO: 'ofertas_muro',
    ACTIVIDAD_P2P: 'actividad_p2p',
    PUBLICIDAD_MARQUINHOS: 'publicidad_marquinhos',
    RELACIONES_CONTACTOS: 'relaciones_contactos',
    PRESENCIAS: 'presencias'
};

// ================================================================
// 🔌 OBTENER CLIENTE DE SUPABASE
// ================================================================

/**
 * Obtiene el cliente de Supabase (reutiliza window.supabase si existe)
 * @returns {Object} Cliente de Supabase
 */
export function getSupabaseClient() {
    // 1. Si ya existe window.supabase, lo usamos
    if (window.supabase && typeof window.supabase.from === 'function') {
        console.log('🔄 Reutilizando window.supabase');
        return window.supabase;
    }

    // 2. Si existe window.supabaseClient (compatibilidad)
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
        console.log('🔄 Reutilizando window.supabaseClient');
        return window.supabaseClient;
    }

    // 3. Si window.CONFIG tiene credenciales
    if (window.CONFIG?.SUPABASE_URL && window.CONFIG?.SUPABASE_ANON_KEY) {
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

    // 4. Fallback: usar credenciales duras
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        const client = supabase.createClient(FALLBACK_URL, FALLBACK_ANON_KEY);
        window.supabase = client;
        window.supabaseClient = client;
        return client;
    }

    throw new Error('❌ No se pudo inicializar Supabase');
}

// ================================================================
// 🌐 CONFIGURACIÓN POR DEFECTO
// ================================================================

export const SUPABASE_CONFIG = {
    url: FALLBACK_URL,
    anonKey: FALLBACK_ANON_KEY,
    tablas: TABLAS
};

// ================================================================
// 📦 EXPORTAR CLIENTE POR DEFECTO
// ================================================================

export default getSupabaseClient();

// ================================================================
// 📋 LOG DE INICIO
// ================================================================

console.log('🗄️ Configuración de Supabase cargada');
console.log(`📋 ${Object.keys(TABLAS).length} tablas registradas`);