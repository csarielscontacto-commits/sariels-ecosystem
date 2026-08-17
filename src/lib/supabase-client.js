// ================================================================
// 🗄️ SUPABASE CLIENT - CSARIEL'S ECOSYSTEM
// Ruta: src/lib/supabase-client.js
// Versión: 3.0.1
// ================================================================

import { SUPABASE_CONFIG, TABLAS } from '../config/supabase.js';

export function getSupabaseClient() {
    if (window.supabase && typeof window.supabase.from === 'function') {
        return window.supabase;
    }
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
        return window.supabaseClient;
    }
    if (typeof supabase === 'undefined' || !supabase.createClient) {
        throw new Error('❌ supabase-js no está cargado todavía (revisa el <script> del CDN)');
    }

    const url = window.CONFIG?.SUPABASE_URL || SUPABASE_CONFIG.url;
    const key = window.CONFIG?.SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;
    const client = supabase.createClient(url, key);
    window.supabase = client;
    window.supabaseClient = client;
    return client;
}

export async function getCurrentUser() {
    try {
        const client = getSupabaseClient();
        const { data: { user }, error } = await client.auth.getUser();
        if (error || !user) {
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

export async function getProfile(userId) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from(TABLAS.PERFILES)
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error) throw error;
    return data;
}

export async function updateProfile(userId, data) {
    const client = getSupabaseClient();
    const { data: result, error } = await client
        .from(TABLAS.PERFILES)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return result;
}

export function subscribeToTable(tabla, callback, evento = '*') {
    const client = getSupabaseClient();
    const channel = client.channel(`public:${tabla}`);
    channel.on('postgres_changes', { event: evento, schema: 'public', table: tabla }, callback).subscribe();
    return channel;
}

export function unsubscribe(channel) {
    if (channel) channel.unsubscribe();
}

export default {
    getSupabaseClient,
    getCurrentUser,
    getProfile,
    updateProfile,
    subscribeToTable,
    unsubscribe,
    TABLAS
};