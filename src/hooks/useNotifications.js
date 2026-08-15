// ================================================================
// 🔔 useNotifications - CSARIEL'S ECOSYSTEM
// ================================================================
// Hook personalizado para gestionar notificaciones en tiempo real.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { getSupabase } from '../services/supabaseClient.js';
import { getCurrentUser } from './useAuth.js';

// ================================================================
// 📦 ESTADO DE NOTIFICACIONES
// ================================================================

let notificationsState = {
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null
};

let listeners = [];
let subscription = null;

// ================================================================
# 🔔 FUNCIONES DE NOTIFICACIONES
// ================================================================

/**
 * Obtiene el cliente de Supabase
 */
function getClient() {
    return getSupabase();
}

/**
 * Notifica a todos los listeners del cambio de estado
 */
function notifyListeners() {
    listeners.forEach(callback => {
        try {
            callback({ ...notificationsState });
        } catch (e) {
            console.warn('Error en listener de notificaciones:', e);
        }
    });
}

// ================================================================
# 📥 CARGAR NOTIFICACIONES
// ================================================================

export async function loadNotifications(limit = 50) {
    try {
        notificationsState.isLoading = true;
        notifyListeners();

        const supabase = getClient();
        const user = await getCurrentUser();

        if (!user) {
            notificationsState.items = [];
            notificationsState.unreadCount = 0;
            notificationsState.isLoading = false;
            notifyListeners();
            return [];
        }

        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        notificationsState.items = data || [];
        notificationsState.unreadCount = data?.filter(n => !n.leida).length || 0;
        notificationsState.error = null;

        notifyListeners();
        return notificationsState.items;

    } catch (error) {
        console.error('❌ Error cargando notificaciones:', error);
        notificationsState.error = error.message;
        notificationsState.isLoading = false;
        notifyListeners();
        return [];
    }
}

// ================================================================
# 📡 SUSCRIBIRSE A NOTIFICACIONES EN TIEMPO REAL
// ================================================================

export function subscribeToNotifications() {
    // Limpiar suscripción anterior
    if (subscription) {
        subscription.unsubscribe();
        subscription = null;
    }

    const supabase = getClient();

    // Crear canal de notificaciones
    const channel = supabase.channel('notificaciones');

    channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones'
    }, async (payload) => {
        const notificacion = payload.new;
        
        // Verificar si la notificación es para el usuario actual
        const user = await getCurrentUser();
        if (notificacion.user_id === user?.id) {
            // Agregar al estado
            notificationsState.items.unshift(notificacion);
            notificationsState.unreadCount++;
            notifyListeners();

            // Emitir evento para mostrar toast
            document.dispatchEvent(new CustomEvent('notification:new', {
                detail: notificacion
            }));

            // Mostrar toast de notificación
            mostrarToastNotificacion(notificacion);
        }
    });

    channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log('🔔 Suscrito a notificaciones en tiempo real');
        }
    });

    subscription = channel;
    return channel;
}

// ================================================================
# 🔔 MOSTRAR TOAST DE NOTIFICACIÓN
// ================================================================

function mostrarToastNotificacion(notificacion) {
    const mensajes = {
        like: `❤️ ${notificacion.usuario} le dio like a tu publicación`,
        comment: `💬 ${notificacion.usuario} comentó tu publicación`,
        friend: `👤 ${notificacion.usuario} te envió una solicitud de amistad`,
        system: `⚙️ ${notificacion.mensaje || 'Notificación del sistema'}`,
        event: `📅 ${notificacion.mensaje || 'Nuevo evento'}`,
        group: `👥 ${notificacion.usuario} publicó en tu grupo`
    };

    const mensaje = mensajes[notificacion.tipo] || notificacion.mensaje || 'Nueva notificación';

    // Usar el toast global
    if (window.mostrarToast) {
        window.mostrarToast(mensaje, 'info');
    }
}

// ================================================================
# ✅ MARCAR COMO LEÍDA
// ================================================================

export async function markAsRead(notificationId) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('notificaciones')
            .update({ leida: true })
            .eq('id', notificationId)
            .select()
            .single();

        if (error) throw error;

        // Actualizar estado local
        const index = notificationsState.items.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            notificationsState.items[index].leida = true;
            notificationsState.unreadCount = Math.max(0, notificationsState.unreadCount - 1);
            notifyListeners();
        }

        return data;

    } catch (error) {
        console.error('❌ Error marcando notificación como leída:', error);
        throw error;
    }
}

// ================================================================
# ✅ MARCAR TODAS COMO LEÍDAS
// ================================================================

export async function markAllAsRead() {
    try {
        const supabase = getClient();
        const user = await getCurrentUser();

        if (!user) throw new Error('Usuario no autenticado');

        const { data, error } = await supabase
            .from('notificaciones')
            .update({ leida: true })
            .eq('user_id', user.id)
            .eq('leida', false)
            .select();

        if (error) throw error;

        // Actualizar estado local
        notificationsState.items.forEach(n => n.leida = true);
        notificationsState.unreadCount = 0;
        notifyListeners();

        return data;

    } catch (error) {
        console.error('❌ Error marcando todas como leídas:', error);
        throw error;
    }
}

// ================================================================
# 🗑️ ELIMINAR NOTIFICACIÓN
// ================================================================

export async function deleteNotification(notificationId) {
    try {
        const supabase = getClient();
        const { error } = await supabase
            .from('notificaciones')
            .delete()
            .eq('id', notificationId);

        if (error) throw error;

        // Actualizar estado local
        const item = notificationsState.items.find(n => n.id === notificationId);
        notificationsState.items = notificationsState.items.filter(n => n.id !== notificationId);
        if (item && !item.leida) {
            notificationsState.unreadCount = Math.max(0, notificationsState.unreadCount - 1);
        }
        notifyListeners();

        return true;

    } catch (error) {
        console.error('❌ Error eliminando notificación:', error);
        throw error;
    }
}

// ================================================================
# 🗑️ ELIMINAR TODAS LAS NOTIFICACIONES
// ================================================================

export async function deleteAllNotifications() {
    try {
        const supabase = getClient();
        const user = await getCurrentUser();

        if (!user) throw new Error('Usuario no autenticado');

        const { error } = await supabase
            .from('notificaciones')
            .delete()
            .eq('user_id', user.id);

        if (error) throw error;

        // Actualizar estado local
        notificationsState.items = [];
        notificationsState.unreadCount = 0;
        notifyListeners();

        return true;

    } catch (error) {
        console.error('❌ Error eliminando todas las notificaciones:', error);
        throw error;
    }
}

// ================================================================
# 📊 OBTENER ESTADO
// ================================================================

export function useNotifications() {
    return { ...notificationsState };
}

export function getNotificationsState() {
    return { ...notificationsState };
}

export function getUnreadCount() {
    return notificationsState.unreadCount;
}

// ================================================================
# 👂 SUSCRIBIRSE A CAMBIOS
// ================================================================

export function subscribeToNotificationsState(callback) {
    if (typeof callback === 'function') {
        listeners.push(callback);
        callback({ ...notificationsState });
    }
    return () => {
        listeners = listeners.filter(cb => cb !== callback);
    };
}

// ================================================================
# 🚀 INICIALIZAR
// ================================================================

export async function initNotifications() {
    await loadNotifications();
    subscribeToNotifications();
    console.log('🔔 Sistema de notificaciones inicializado');
}

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    loadNotifications,
    subscribeToNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    useNotifications,
    getNotificationsState,
    getUnreadCount,
    subscribeToNotificationsState,
    initNotifications
};

console.log('🔔 useNotifications cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');