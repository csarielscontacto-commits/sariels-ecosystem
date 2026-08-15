// ================================================================
// 🚀 APP - CSARIEL'S ECOSYSTEM (NÚCLEO PRINCIPAL)
// ================================================================
// Componente principal que une todas las funcionalidades del ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { getSupabase } from '../services/supabaseClient.js';
import { initSeguridad } from '../utils/security.js';
import CsarielRouter from '../utils/router.js';
import { i18n } from '../utils/i18n.js';
import livekitService from '../services/livekitService.js';

// ================================================================
// 📦 ESTADO GLOBAL DE LA APP
// ================================================================

const AppState = {
    user: null,
    profile: null,
    isInitialized: false,
    isAuthenticated: false,
    currentPage: 'home',
    theme: 'dark',
    notifications: [],
    unreadCount: 0
};

// ================================================================
# 🔌 LISTENERS DE EVENTOS GLOBALES
// ================================================================

const eventListeners = {};

function on(event, callback) {
    if (!eventListeners[event]) {
        eventListeners[event] = [];
    }
    eventListeners[event].push(callback);
}

function emit(event, data) {
    if (eventListeners[event]) {
        eventListeners[event].forEach(cb => {
            try {
                cb(data);
            } catch (e) {
                console.error(`Error en evento ${event}:`, e);
            }
        });
    }
}

// ================================================================
# 🚀 INICIALIZAR APP
// ================================================================

export async function initApp() {
    if (AppState.isInitialized) {
        console.log('ℹ️ App ya inicializada');
        return;
    }

    console.log('🚀 Inicializando Csariel\'s Ecosystem...');

    try {
        // 1. Seguridad
        initSeguridad();
        console.log('✅ Seguridad activada');

        // 2. Supabase
        const supabase = getSupabase();
        console.log('✅ Supabase conectado');

        // 3. Usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            AppState.user = user;
            AppState.isAuthenticated = true;
            console.log(`👤 Usuario autenticado: ${user.email || user.id}`);
        } else {
            // Crear sesión anónima
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) throw error;
            AppState.user = data.user;
            console.log('👤 Sesión anónima creada');
        }

        // 4. Cargar perfil
        if (AppState.user) {
            const { data: profile } = await supabase
                .from('perfiles')
                .select('*')
                .eq('user_id', AppState.user.id)
                .single();
            
            if (profile) {
                AppState.profile = profile;
                console.log(`👤 Perfil cargado: ${profile.nombre || 'Usuario'}`);
            } else {
                // Crear perfil si no existe
                const { data: newProfile } = await supabase
                    .from('perfiles')
                    .insert({ user_id: AppState.user.id })
                    .select()
                    .single();
                AppState.profile = newProfile;
                console.log('✅ Perfil creado automáticamente');
            }
        }

        // 5. LiveKit
        await livekitService.loadLiveKitSDK();
        console.log('✅ LiveKit SDK cargado');

        // 6. Router
        CsarielRouter.init({
            containerId: 'app-container',
            defaultPage: 'home',
            useHash: true
        });

        // 7. Idioma
        i18n.aplicarAlDOM();
        console.log(`🌐 Idioma: ${i18n.getNombreIdioma()}`);

        // 8. Sistema de notificaciones
        initNotifications();

        AppState.isInitialized = true;
        console.log('✅ App inicializada correctamente');
        
        emit('app:ready', AppState);

        return AppState;

    } catch (error) {
        console.error('❌ Error inicializando app:', error);
        emit('app:error', { error });
        throw error;
    }
}

// ================================================================
# 🔔 SISTEMA DE NOTIFICACIONES
// ================================================================

function initNotifications() {
    // Escuchar notificaciones de Supabase
    const supabase = getSupabase();
    
    supabase
        .channel('notificaciones')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notificaciones'
        }, (payload) => {
            const notificacion = payload.new;
            AppState.notifications.unshift(notificacion);
            AppState.unreadCount++;
            
            emit('notification:new', notificacion);
            
            // Mostrar toast
            if (notificacion.tipo === 'like') {
                mostrarToast(`❤️ ${notificacion.usuario} le dio like a tu publicación`);
            } else if (notificacion.tipo === 'comment') {
                mostrarToast(`💬 ${notificacion.usuario} comentó tu publicación`);
            } else if (notificacion.tipo === 'friend') {
                mostrarToast(`👤 ${notificacion.usuario} te envió una solicitud de amistad`);
            }
        })
        .subscribe();
}

// ================================================================
# 📋 FUNCIONES DE UTILIDAD PARA LA APP
// ================================================================

export function getAppState() {
    return { ...AppState };
}

export function getCurrentUser() {
    return AppState.user;
}

export function getCurrentProfile() {
    return AppState.profile;
}

export function isAuthenticated() {
    return AppState.isAuthenticated;
}

export function getUnreadCount() {
    return AppState.unreadCount;
}

export function markNotificationsRead() {
    AppState.unreadCount = 0;
    emit('notifications:read');
}

// ================================================================
# 🛠️ TOAST (SISTEMA DE NOTIFICACIONES VISUALES)
// ================================================================

let toastTimeout = null;

export function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        const nuevoToast = document.createElement('div');
        nuevoToast.id = 'toast';
        nuevoToast.className = 'toast';
        nuevoToast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(80px);
            background: #0a1a12;
            color: #00d68f;
            padding: 12px 24px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 0.8rem;
            opacity: 0;
            transition: all 0.4s ease;
            z-index: 5000;
            pointer-events: none;
            font-family: 'Orbitron', monospace;
            border: 1px solid rgba(0,214,143,0.15);
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(nuevoToast);
    }
    
    const toastEl = document.getElementById('toast');
    const colores = {
        success: '#00d68f',
        error: '#ff3366',
        warning: '#ffd93d',
        info: '#00d4ff'
    };
    
    toastEl.textContent = mensaje;
    toastEl.style.borderColor = colores[tipo] || '#00d68f';
    toastEl.style.color = colores[tipo] || '#00d68f';
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translateX(-50%) translateY(0)';
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(-50%) translateY(80px)';
    }, 4000);
}

// ================================================================
# 🌐 EXPONER API GLOBAL
// ================================================================

// Exponer funciones globalmente para uso en HTML
window.CsarielApp = {
    initApp,
    getAppState,
    getCurrentUser,
    getCurrentProfile,
    isAuthenticated,
    getUnreadCount,
    markNotificationsRead,
    mostrarToast,
    on,
    emit
};

// Exponer i18n globalmente
window.CSARIELS_IDIOMA = i18n;

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    initApp,
    getAppState,
    getCurrentUser,
    getCurrentProfile,
    isAuthenticated,
    getUnreadCount,
    markNotificationsRead,
    mostrarToast,
    on,
    emit,
    AppState
};

// ================================================================
# 📋 LOG DE INICIO
// ================================================================

console.log('🚀 App v3.0.0 cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');
console.log('🌍 Ecosistema listo para escala mundial');