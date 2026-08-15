// ================================================================
// 🔐 authService - CSARIEL'S ECOSYSTEM
// ================================================================
// Servicio de autenticación unificado con Supabase.
// Maneja login, registro, sesión anónima y gestión de perfiles.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { supabase } from './supabaseClient';

// ================================================================
// 📦 TIPOS
// ================================================================

/**
 * @typedef {Object} User
 * @property {string} id - ID del usuario
 * @property {string} email - Correo electrónico
 * @property {string} [username] - Nombre de usuario
 * @property {string} [avatar] - URL del avatar
 * @property {boolean} isAnonymous - Si es usuario anónimo
 * @property {string} [createdAt] - Fecha de creación
 */

/**
 * @typedef {Object} AuthSession
 * @property {User} user - Datos del usuario
 * @property {string} accessToken - Token de acceso
 * @property {string} refreshToken - Token de refresco
 * @property {number} expiresAt - Timestamp de expiración
 */

// ================================================================
// 🔌 ESTADO GLOBAL DEL SERVICIO
// ================================================================

const AUTH_STATE = {
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

let listeners = [];

// ================================================================
// 🔔 SISTEMA DE LISTENERS
// ================================================================

function notifyListeners() {
    listeners.forEach((callback) => {
        try {
            callback({ ...AUTH_STATE });
        } catch (e) {
            console.warn('Error en listener de authService:', e);
        }
    });
}

// ================================================================
// 💾 PERSISTENCIA LOCAL
// ================================================================

function saveSession(session) {
    try {
        if (session) {
            localStorage.setItem('csariels_session', JSON.stringify(session));
        } else {
            localStorage.removeItem('csariels_session');
        }
    } catch (e) {
        console.warn('⚠️ No se pudo guardar la sesión:', e);
    }
}

function loadSession() {
    try {
        const saved = localStorage.getItem('csariels_session');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.warn('⚠️ No se pudo cargar la sesión:', e);
        return null;
    }
}

// ================================================================
// 🔐 FUNCIONES PRINCIPALES
// ================================================================

/**
 * Inicializa el servicio de autenticación
 * @returns {Promise<AuthSession>}
 */
export async function initAuth() {
    AUTH_STATE.isLoading = true;
    notifyListeners();

    try {
        // 1. Intentar recuperar sesión guardada
        const savedSession = loadSession();
        if (savedSession) {
            AUTH_STATE.session = savedSession;
            AUTH_STATE.user = savedSession.user;
            AUTH_STATE.isAuthenticated = true;
            
            // Validar sesión con Supabase
            const { data, error } = await supabase.auth.getUser();
            if (!error && data?.user) {
                AUTH_STATE.user = data.user;
                // Cargar perfil
                await loadProfile(data.user.id);
                AUTH_STATE.isLoading = false;
                notifyListeners();
                return AUTH_STATE.session;
            }
        }

        // 2. Si no hay sesión guardada, intentar sesión anónima
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;

        const session = {
            user: data.user,
            accessToken: data.session?.access_token,
            refreshToken: data.session?.refresh_token,
            expiresAt: data.session?.expires_at,
        };

        AUTH_STATE.session = session;
        AUTH_STATE.user = data.user;
        AUTH_STATE.isAuthenticated = true;
        AUTH_STATE.error = null;

        // Cargar o crear perfil
        await loadOrCreateProfile(data.user.id);

        saveSession(session);
        AUTH_STATE.isLoading = false;
        notifyListeners();

        console.log('🔐 authService inicializado (sesión anónima)');
        return session;

    } catch (error) {
        console.error('❌ Error inicializando authService:', error);
        AUTH_STATE.error = error.message;
        AUTH_STATE.isLoading = false;
        AUTH_STATE.isAuthenticated = false;
        notifyListeners();
        throw error;
    }
}

/**
 * Carga el perfil de un usuario
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function loadProfile(userId) {
    const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.warn('⚠️ Error cargando perfil:', error);
        return null;
    }

    AUTH_STATE.profile = data;
    return data;
}

/**
 * Carga o crea el perfil de un usuario
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function loadOrCreateProfile(userId) {
    const profile = await loadProfile(userId);
    if (profile) return profile;

    // Crear perfil si no existe
    const { data, error } = await supabase
        .from('perfiles')
        .insert({
            user_id: userId,
            nombre: 'Usuario',
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Error creando perfil:', error);
        throw error;
    }

    AUTH_STATE.profile = data;
    return data;
}

// ================================================================
// 🔐 LOGIN CON EMAIL
// ================================================================

/**
 * Inicia sesión con email y contraseña
 * @param {string} email
 * @param {string} password
 * @returns {Promise<AuthSession>}
 */
export async function loginWithEmail(email, password) {
    AUTH_STATE.isLoading = true;
    notifyListeners();

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        const session = {
            user: data.user,
            accessToken: data.session?.access_token,
            refreshToken: data.session?.refresh_token,
            expiresAt: data.session?.expires_at,
        };

        AUTH_STATE.session = session;
        AUTH_STATE.user = data.user;
        AUTH_STATE.isAuthenticated = true;
        AUTH_STATE.error = null;

        await loadOrCreateProfile(data.user.id);
        saveSession(session);
        AUTH_STATE.isLoading = false;
        notifyListeners();

        console.log(`🔐 Usuario autenticado: ${data.user.email}`);
        return session;

    } catch (error) {
        console.error('❌ Error en loginWithEmail:', error);
        AUTH_STATE.error = error.message;
        AUTH_STATE.isLoading = false;
        notifyListeners();
        throw error;
    }
}

// ================================================================
// 🔐 LOGIN CON GOOGLE
// ================================================================

/**
 * Inicia sesión con Google OAuth
 * @param {Object} options
 * @param {string} [options.redirectTo] - URL de redirección
 * @returns {Promise<{ provider: string, url: string }>}
 */
export async function loginWithGoogle(options = {}) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: options.redirectTo || window.location.origin,
            },
        });

        if (error) throw error;
        return { provider: 'google', url: data.url };

    } catch (error) {
        console.error('❌ Error en loginWithGoogle:', error);
        throw error;
    }
}

// ================================================================
// 📝 REGISTRO
// ================================================================

/**
 * Registra un nuevo usuario
 * @param {string} email
 * @param {string} password
 * @param {Object} userData
 * @param {string} userData.nombre
 * @param {string} [userData.username]
 * @returns {Promise<AuthSession>}
 */
export async function registerUser(email, password, userData = {}) {
    AUTH_STATE.isLoading = true;
    notifyListeners();

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre: userData.nombre || email.split('@')[0],
                    username: userData.username || null,
                },
            },
        });

        if (error) throw error;

        if (data.user) {
            await loadOrCreateProfile(data.user.id);
        }

        AUTH_STATE.user = data.user;
        AUTH_STATE.isAuthenticated = true;
        AUTH_STATE.error = null;

        const session = {
            user: data.user,
            accessToken: data.session?.access_token,
            refreshToken: data.session?.refresh_token,
            expiresAt: data.session?.expires_at,
        };

        AUTH_STATE.session = session;
        saveSession(session);
        AUTH_STATE.isLoading = false;
        notifyListeners();

        console.log(`📝 Usuario registrado: ${email}`);
        return session;

    } catch (error) {
        console.error('❌ Error en registerUser:', error);
        AUTH_STATE.error = error.message;
        AUTH_STATE.isLoading = false;
        notifyListeners();
        throw error;
    }
}

// ================================================================
// 🚪 CERRAR SESIÓN
// ================================================================

/**
 * Cierra la sesión actual
 * @returns {Promise<void>}
 */
export async function logout() {
    try {
        await supabase.auth.signOut();

        AUTH_STATE.user = null;
        AUTH_STATE.profile = null;
        AUTH_STATE.session = null;
        AUTH_STATE.isAuthenticated = false;
        AUTH_STATE.error = null;

        saveSession(null);
        notifyListeners();

        console.log('🚪 Sesión cerrada');

    } catch (error) {
        console.error('❌ Error en logout:', error);
        throw error;
    }
}

// ================================================================
// 👤 GESTIÓN DE PERFIL
// ================================================================

/**
 * Actualiza el perfil del usuario actual
 * @param {Object} data
 * @param {string} [data.nombre]
 * @param {string} [data.username]
 * @param {string} [data.bio]
 * @param {string} [data.foto_perfil_url]
 * @returns {Promise<Object>}
 */
export async function updateProfile(data) {
    if (!AUTH_STATE.user) {
        throw new Error('Usuario no autenticado');
    }

    try {
        const { data: updated, error } = await supabase
            .from('perfiles')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', AUTH_STATE.user.id)
            .select()
            .single();

        if (error) throw error;

        AUTH_STATE.profile = updated;
        notifyListeners();

        console.log('👤 Perfil actualizado');
        return updated;

    } catch (error) {
        console.error('❌ Error actualizando perfil:', error);
        throw error;
    }
}

/**
 * Obtiene el perfil de un usuario por ID
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;

    } catch (error) {
        console.error('❌ Error obteniendo perfil de usuario:', error);
        return null;
    }
}

// ================================================================
// 🔄 REFRESCAR SESIÓN
// ================================================================

/**
 * Refresca la sesión actual
 * @returns {Promise<AuthSession>}
 */
export async function refreshSession() {
    try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;

        if (data.session) {
            const session = {
                user: data.user,
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: data.session.expires_at,
            };

            AUTH_STATE.session = session;
            AUTH_STATE.user = data.user;
            AUTH_STATE.isAuthenticated = true;
            saveSession(session);
            notifyListeners();

            console.log('🔄 Sesión refrescada');
            return session;
        }

        return null;

    } catch (error) {
        console.error('❌ Error refrescando sesión:', error);
        throw error;
    }
}

// ================================================================
// 📊 GETTERS
// ================================================================

/**
 * Obtiene el estado actual de autenticación
 * @returns {Object}
 */
export function getAuthState() {
    return { ...AUTH_STATE };
}

/**
 * Obtiene el usuario actual
 * @returns {User|null}
 */
export function getCurrentUser() {
    return AUTH_STATE.user;
}

/**
 * Obtiene el perfil actual
 * @returns {Object|null}
 */
export function getCurrentProfile() {
    return AUTH_STATE.profile;
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
    return AUTH_STATE.isAuthenticated;
}

// ================================================================
// 👂 SUSCRIPCIÓN
// ================================================================

/**
 * Suscribe un callback a los cambios de autenticación
 * @param {Function} callback
 * @returns {Function}
 */
export function subscribeToAuth(callback) {
    if (typeof callback === 'function') {
        listeners.push(callback);
        callback({ ...AUTH_STATE });
    }
    return () => {
        listeners = listeners.filter((cb) => cb !== callback);
    };
}

// ================================================================
// 🚀 EXPORTAR
// ================================================================

export default {
    initAuth,
    loginWithEmail,
    loginWithGoogle,
    registerUser,
    logout,
    updateProfile,
    getUserProfile,
    refreshSession,
    getAuthState,
    getCurrentUser,
    getCurrentProfile,
    isAuthenticated,
    subscribeToAuth,
};

console.log('🔐 authService cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');