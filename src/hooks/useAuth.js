// ================================================================
// 🔐 useAuth - CSARIEL'S ECOSYSTEM
// ================================================================
// Hook personalizado para autenticación con Supabase.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { getSupabase } from '../services/supabaseClient.js';

// ================================================================
// 📦 ESTADO DE AUTENTICACIÓN
// ================================================================

let authState = {
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
};

let listeners = [];

// ================================================================
# 🔐 FUNCIONES DE AUTENTICACIÓN
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
            callback({ ...authState });
        } catch (e) {
            console.warn('Error en listener de auth:', e);
        }
    });
}

// ================================================================
# 👤 INICIALIZAR AUTENTICACIÓN
// ================================================================

export async function initAuth() {
    authState.isLoading = true;
    notifyListeners();

    try {
        const supabase = getClient();
        
        // Obtener sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
            authState.session = session;
            authState.user = session.user;
            authState.isAuthenticated = true;

            // Cargar perfil
            const { data: profile, error: profileError } = await supabase
                .from('perfiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.warn('Error cargando perfil:', profileError);
            }

            if (profile) {
                authState.profile = profile;
            } else {
                // Crear perfil si no existe
                const { data: newProfile, error: createError } = await supabase
                    .from('perfiles')
                    .insert({ user_id: session.user.id })
                    .select()
                    .single();

                if (createError) {
                    console.warn('Error creando perfil:', createError);
                } else {
                    authState.profile = newProfile;
                }
            }
        } else {
            // Intentar sesión anónima
            const { data, error: signError } = await supabase.auth.signInAnonymously();
            if (signError) throw signError;

            authState.session = data.session;
            authState.user = data.user;
            authState.isAuthenticated = true;

            // Crear perfil para usuario anónimo
            const { data: newProfile, error: createError } = await supabase
                .from('perfiles')
                .insert({ user_id: data.user.id })
                .select()
                .single();

            if (createError) {
                console.warn('Error creando perfil anónimo:', createError);
            } else {
                authState.profile = newProfile;
            }
        }

        authState.error = null;
        console.log('✅ Autenticación inicializada');

    } catch (error) {
        console.error('❌ Error en initAuth:', error);
        authState.error = error.message;
        authState.isAuthenticated = false;
        authState.user = null;
        authState.profile = null;
        authState.session = null;
    }

    authState.isLoading = false;
    notifyListeners();
    return { ...authState };
}

// ================================================================
# 🔐 INICIAR SESIÓN CON GOOGLE
// ================================================================

export async function signInWithGoogle() {
    try {
        const supabase = getClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error en Google OAuth:', error);
        throw error;
    }
}

// ================================================================
# 🔐 INICIAR SESIÓN CON EMAIL
// ================================================================

export async function signInWithEmail(email, password) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        authState.session = data.session;
        authState.user = data.user;
        authState.isAuthenticated = true;
        authState.error = null;

        // Recargar perfil
        const { data: profile, error: profileError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

        if (profile) {
            authState.profile = profile;
        }

        notifyListeners();
        return data;

    } catch (error) {
        console.error('❌ Error en signInWithEmail:', error);
        authState.error = error.message;
        notifyListeners();
        throw error;
    }
}

// ================================================================
# 📝 REGISTRARSE
// ================================================================

export async function signUp(email, password, userData = {}) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });

        if (error) throw error;

        // Crear perfil
        if (data.user) {
            const { error: profileError } = await supabase
                .from('perfiles')
                .insert({
                    user_id: data.user.id,
                    nombre: userData.nombre || 'Usuario',
                    email: email
                });

            if (profileError) {
                console.warn('Error creando perfil en signUp:', profileError);
            }
        }

        return data;

    } catch (error) {
        console.error('❌ Error en signUp:', error);
        throw error;
    }
}

// ================================================================
# 🔓 CERRAR SESIÓN
// ================================================================

export async function signOut() {
    try {
        const supabase = getClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        authState.user = null;
        authState.profile = null;
        authState.session = null;
        authState.isAuthenticated = false;
        authState.error = null;

        notifyListeners();
        return true;

    } catch (error) {
        console.error('❌ Error en signOut:', error);
        throw error;
    }
}

// ================================================================
# 🔄 ACTUALIZAR PERFIL
// ================================================================

export async function updateProfile(data) {
    try {
        if (!authState.user) {
            throw new Error('Usuario no autenticado');
        }

        const supabase = getClient();
        const { data: updated, error } = await supabase
            .from('perfiles')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('user_id', authState.user.id)
            .select()
            .single();

        if (error) throw error;

        authState.profile = updated;
        notifyListeners();
        return updated;

    } catch (error) {
        console.error('❌ Error actualizando perfil:', error);
        throw error;
    }
}

// ================================================================
# 🔄 RESTABLECER CONTRASEÑA
// ================================================================

export async function resetPassword(email) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password'
        });

        if (error) throw error;
        return data;

    } catch (error) {
        console.error('❌ Error en resetPassword:', error);
        throw error;
    }
}

// ================================================================
# 📊 OBTENER ESTADO
// ================================================================

export function useAuth() {
    return { ...authState };
}

export function getAuthState() {
    return { ...authState };
}

export function isAuthenticated() {
    return authState.isAuthenticated;
}

export function getCurrentUser() {
    return authState.user;
}

export function getCurrentProfile() {
    return authState.profile;
}

// ================================================================
# 👂 SUSCRIBIRSE A CAMBIOS
// ================================================================

export function subscribeToAuth(callback) {
    if (typeof callback === 'function') {
        listeners.push(callback);
        // Llamar inmediatamente con el estado actual
        callback({ ...authState });
    }
    return () => {
        listeners = listeners.filter(cb => cb !== callback);
    };
}

// ================================================================
# 🔄 REFRESCAR SESIÓN
// ================================================================

export async function refreshSession() {
    try {
        const supabase = getClient();
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) throw error;

        if (session) {
            authState.session = session;
            authState.user = session.user;
            authState.isAuthenticated = true;
            notifyListeners();
        }

        return session;

    } catch (error) {
        console.error('❌ Error refrescando sesión:', error);
        throw error;
    }
}

// ================================================================
# 🚀 INICIALIZAR AUTOMÁTICAMENTE
// ================================================================

// Inicializar al cargar el módulo
initAuth().catch(console.error);

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    initAuth,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    useAuth,
    getAuthState,
    isAuthenticated,
    getCurrentUser,
    getCurrentProfile,
    subscribeToAuth,
    refreshSession
};

console.log('🔐 useAuth cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');