// js/utils/supabaseClient.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ================================================================
// CONFIGURACIÓN
// ================================================================
const SUPABASE_URL = 'https://nvyyxgkladjauolvpzfp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MTU2ODEsImV4cCI6MjA1NjE5MTY4MX0.c1Zk6QpI7m7tQnY4k8w9Tg5dDw2pXgFh1y3JkLmNpQo';

// ================================================================
// CLIENTE PRINCIPAL
// ================================================================
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// ================================================================
// CANALES REALTIME
// ================================================================
export const CHAT_CHANNEL = 'chat-messages';
export const LIVE_CHANNEL = 'live-events';

// ================================================================
// UTILIDADES PARA REALTIME
// ================================================================

/**
 * Crea o obtiene un canal Realtime con manejo de reconexión
 */
export function crearCanalRealtime(nombre, eventos = {}) {
    const channel = supabase.channel(nombre, {
        config: {
            broadcast: { ack: true },
            presence: { key: 'presence' }
        }
    });

    // Configurar eventos
    Object.entries(eventos).forEach(([evento, handler]) => {
        channel.on('broadcast', { event: evento }, handler);
    });

    // Manejar reconexión automática
    channel.subscribe((status) => {
        console.log(`📡 Canal ${nombre}:`, status);
        if (status === 'SUBSCRIBED') {
            console.log(`✅ Canal ${nombre} conectado`);
        } else if (status === 'CHANNEL_ERROR') {
            console.warn(`⚠️ Error en canal ${nombre}, reconectando...`);
            setTimeout(() => {
                channel.subscribe();
            }, 3000);
        }
    });

    return channel;
}

/**
 * Envía un mensaje broadcast con manejo de errores
 */
export async function broadcastMensaje(channel, evento, payload) {
    try {
        await channel.send({
            type: 'broadcast',
            event: evento,
            payload: payload
        });
        return true;
    } catch (error) {
        console.error('❌ Error enviando broadcast:', error);
        // Intentar reconectar y reenviar
        setTimeout(async () => {
            try {
                await channel.subscribe();
                await channel.send({
                    type: 'broadcast',
                    event: evento,
                    payload: payload
                });
            } catch (retryError) {
                console.error('❌ Error reenviando broadcast:', retryError);
            }
        }, 2000);
        return false;
    }
}

// ================================================================
// UTILIDADES PARA STORAGE
// ================================================================

/**
 * Sube un archivo a Supabase Storage con manejo de errores
 */
export async function subirArchivoStorage(bucket, path, file, options = {}) {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
                ...options
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error subiendo archivo:', error);
        throw error;
    }
}

/**
 * Obtiene la URL pública de un archivo en Storage
 */
export function obtenerUrlPublica(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Elimina un archivo de Storage
 */
export async function eliminarArchivoStorage(bucket, path) {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('❌ Error eliminando archivo:', error);
        return false;
    }
}

// ================================================================
// UTILIDADES PARA AUTENTICACIÓN
// ================================================================

/**
 * Obtiene el usuario actual
 */
export async function obtenerUsuarioActual() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.warn('⚠️ No hay usuario autenticado:', error);
        return null;
    }
}

/**
 * Obtiene el ID del usuario actual (o wallet)
 */
export async function obtenerUserId() {
    const user = await obtenerUsuarioActual();
    if (user) return user.id;
    
    // Fallback: usar wallet de localStorage
    try {
        const perfil = JSON.parse(localStorage.getItem('miPerfil_csariels') || '{}');
        return perfil.wallet || perfil.userId || 'anon_' + Date.now();
    } catch {
        return 'anon_' + Date.now();
    }
}

// ================================================================
// UTILIDADES PARA UBICACIÓN
// ================================================================

/**
 * Guarda la ubicación en tiempo real
 */
export async function guardarUbicacion(userId, lat, lng) {
    try {
        const { data, error } = await supabase
            .from('ubicaciones_tiempo_real')
            .upsert({
                user_id: userId,
                lat: lat,
                lng: lng,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error guardando ubicación:', error);
        return null;
    }
}

/**
 * Escucha cambios de ubicación en tiempo real
 */
export function escucharUbicaciones(callback) {
    const channel = supabase.channel('ubicaciones');
    channel
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'ubicaciones_tiempo_real'
        }, (payload) => {
            callback(payload);
        })
        .subscribe();
    return channel;
}

// ================================================================
// LOGGING
// ================================================================

console.log('🔗 Supabase cliente inicializado');
console.log(`📦 URL: ${SUPABASE_URL}`);
console.log(`📡 Canal chat: ${CHAT_CHANNEL}`);
console.log(`📡 Canal live: ${LIVE_CHANNEL}`);