// ================================================================
// 🗄️ SUPABASE CLIENT - CSARIEL'S ECOSYSTEM
// ================================================================
// Cliente unificado de Supabase para todo el ecosistema.
// Soporte para RLS, Realtime, y escala global.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { SUPABASE_CONFIG } from '../config/supabase.js';

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

    // 4. Fallback: usar credenciales de configuración
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        const client = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        window.supabase = client;
        window.supabaseClient = client;
        return client;
    }

    // 5. Intentar cargar Supabase desde CDN
    console.warn('⚠️ Supabase no cargado, intentando cargar desde CDN...');
    loadSupabaseFromCDN();
    
    throw new Error('❌ No se pudo inicializar Supabase');
}

// ================================================================
// 📦 CARGAR SUPABASE DESDE CDN
// ================================================================

export function loadSupabaseFromCDN() {
    return new Promise((resolve, reject) => {
        if (typeof supabase !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = () => {
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                const client = supabase.createClient(
                    SUPABASE_CONFIG.url,
                    SUPABASE_CONFIG.anonKey
                );
                window.supabase = client;
                window.supabaseClient = client;
                console.log('✅ Supabase cargado desde CDN');
                resolve(client);
            } else {
                reject(new Error('Supabase no se cargó correctamente'));
            }
        };
        script.onerror = () => {
            reject(new Error('Error cargando Supabase desde CDN'));
        };
        document.head.appendChild(script);
    });
}

// ================================================================
# 📊 TABLAS DEL ECOSISTEMA
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
    PRESENCIAS: 'presencias',
    TRANSMISIONES: 'transmisiones',
    NOTIFICACIONES: 'notificaciones'
};

// ================================================================
# 🔌 FUNCIONES DE AYUDA
// ================================================================

/**
 * Obtiene el usuario actual (sesión anónima o autenticada)
 * @returns {Promise<Object>} Usuario de Supabase
 */
export async function getCurrentUser() {
    try {
        const client = getSupabaseClient();
        const { data: { user }, error } = await client.auth.getUser();
        if (error || !user) {
            // Crear sesión anónima
            const { data, error: signError } = await client.auth.signInAnonymously();
            if (signError) throw signError;
            return data.user;
        }
        return user;
    } catch (e) {
        console.error('❌ Error obteniendo usuario:', e);
        return null;
    }
}

/**
 * Obtiene el perfil de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Perfil del usuario
 */
export async function getProfile(userId) {
    try {
        const client = getSupabaseClient();
        const { data, error } = await client
            .from(TABLAS.PERFILES)
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (e) {
        console.error('❌ Error obteniendo perfil:', e);
        return null;
    }
}

/**
 * Actualiza el perfil de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export async function updateProfile(userId, data) {
    try {
        const client = getSupabaseClient();
        const { data: result, error } = await client
            .from(TABLAS.PERFILES)
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return result;
    } catch (e) {
        console.error('❌ Error actualizando perfil:', e);
        throw e;
    }
}

// ================================================================
# 🔌 FUNCIONES DE REALTIME
// ================================================================

/**
 * Suscribe a cambios en una tabla
 * @param {string} tabla - Nombre de la tabla
 * @param {Function} callback - Función a ejecutar en cada cambio
 * @param {string} evento - 'INSERT', 'UPDATE', 'DELETE', o '*' para todos
 * @returns {Object} Canal de suscripción
 */
export function subscribeToTable(tabla, callback, evento = '*') {
    try {
        const client = getSupabaseClient();
        const channel = client.channel(`public:${tabla}`);
        
        channel.on('postgres_changes', {
            event: evento,
            schema: 'public',
            table: tabla
        }, (payload) => {
            callback(payload);
        }).subscribe();
        
        return channel;
    } catch (e) {
        console.error('❌ Error suscribiendo a tabla:', e);
        return null;
    }
}

/**
 * Cancela una suscripción
 * @param {Object} channel - Canal a cancelar
 */
export function unsubscribe(channel) {
    if (channel) {
        channel.unsubscribe();
        console.log('🔌 Suscripción cancelada');
    }
}

// ================================================================
# 🚀 EXPORTAR CLIENTE POR DEFECTO
// ================================================================

// Crear y exportar una instancia única
let supabaseInstance = null;

export function getSupabase() {
    if (!supabaseInstance) {
        supabaseInstance = getSupabaseClient();
    }
    return supabaseInstance;
}

// ================================================================
# 📦 EXPORTAR TODO
// ================================================================

export default {
    getSupabaseClient,
    getSupabase,
    loadSupabaseFromCDN,
    getCurrentUser,
    getProfile,
    updateProfile,
    subscribeToTable,
    unsubscribe,
    TABLAS
};

// ================================================================
# 📋 LOG DE INICIO
// ================================================================

console.log('🗄️ Supabase Client v3.0.0 cargado');
console.log(`📋 ${Object.keys(TABLAS).length} tablas registradas`);
console.log('📍 Hecho en Puebla, México 🇲🇽');