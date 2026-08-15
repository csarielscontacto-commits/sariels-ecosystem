// ================================================================
// 🌐 API - CSARIEL'S ECOSYSTEM
// ================================================================
// Cliente API unificado para llamadas a endpoints internos y externos.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { getSupabase } from '../services/supabaseClient.js';
import { APP_CONFIG } from '../config/constants.js';

// ================================================================
// 📦 CONFIGURACIÓN
// ================================================================

const API_CONFIG = {
    BASE_URL: APP_CONFIG.URL || window.location.origin,
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// ================================================================
# 🔌 CLIENTE API
// ================================================================

class ApiClient {
    constructor() {
        this.supabase = null;
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
        this.retryDelay = API_CONFIG.RETRY_DELAY;
    }

    // ================================================================
    # 🔌 INICIALIZAR SUPABASE
    // ================================================================

    async init() {
        if (!this.supabase) {
            this.supabase = getSupabase();
        }
        return this.supabase;
    }

    // ================================================================
    # 📡 REQUEST CON RETRY
    // ================================================================

    async request(url, options = {}, retries = this.retryAttempts) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            if (retries > 0 && error.name !== 'AbortError') {
                console.warn(`🔄 Reintentando (${this.retryAttempts - retries + 1}/${this.retryAttempts}): ${url}`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.request(url, options, retries - 1);
            }
            throw error;
        }
    }

    // ================================================================
    # 📡 MÉTODOS HTTP
    // ================================================================

    async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }

    async post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async patch(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }

    // ================================================================
    # 🔌 SUPABASE QUERIES
    // ================================================================

    async query(table, options = {}) {
        await this.init();
        let query = this.supabase.from(table).select(options.select || '*');

        if (options.eq) {
            for (const [key, value] of Object.entries(options.eq)) {
                query = query.eq(key, value);
            }
        }

        if (options.order) {
            query = query.order(options.order.by, { ascending: options.order.ascending !== false });
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async insert(table, data) {
        await this.init();
        const { data: result, error } = await this.supabase
            .from(table)
            .insert(data)
            .select();
        if (error) throw error;
        return result;
    }

    async update(table, data, match) {
        await this.init();
        let query = this.supabase.from(table).update(data);
        
        for (const [key, value] of Object.entries(match)) {
            query = query.eq(key, value);
        }

        const { data: result, error } = await query.select();
        if (error) throw error;
        return result;
    }

    async deleteRows(table, match) {
        await this.init();
        let query = this.supabase.from(table).delete();
        
        for (const [key, value] of Object.entries(match)) {
            query = query.eq(key, value);
        }

        const { data: result, error } = await query.select();
        if (error) throw error;
        return result;
    }

    // ================================================================
    # 📡 ENDPOINTS DEL ECOSISTEMA
    // ================================================================

    // === AUTENTICACIÓN ===
    async getCurrentUser() {
        await this.init();
        const { data: { user }, error } = await this.supabase.auth.getUser();
        if (error) throw error;
        return user;
    }

    async signInAnonymously() {
        await this.init();
        const { data, error } = await this.supabase.auth.signInAnonymously();
        if (error) throw error;
        return data;
    }

    async signInWithGoogle() {
        await this.init();
        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });
        if (error) throw error;
        return data;
    }

    async signOut() {
        await this.init();
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
        return true;
    }

    // === PERFILES ===
    async getProfile(userId) {
        return this.query('perfiles', {
            eq: { user_id: userId },
            limit: 1
        }).then(data => data[0] || null);
    }

    async updateProfile(userId, data) {
        return this.update('perfiles', { ...data, updated_at: new Date().toISOString() }, { user_id: userId });
    }

    // === PUBLICACIONES ===
    async getPosts(options = {}) {
        return this.query('posts_muro', {
            order: { by: 'created_at', ascending: false },
            limit: options.limit || 50,
            offset: options.offset || 0,
            ...options
        });
    }

    async createPost(data) {
        return this.insert('posts_muro', {
            ...data,
            created_at: new Date().toISOString()
        });
    }

    async likePost(postId, userId) {
        // Implementar lógica de likes
        return this.insert('likes', { post_id: postId, user_id: userId });
    }

    // === COMENTARIOS ===
    async getComments(postId) {
        return this.query('comentarios', {
            eq: { post_id: postId },
            order: { by: 'created_at', ascending: true }
        });
    }

    async createComment(data) {
        return this.insert('comentarios', {
            ...data,
            created_at: new Date().toISOString()
        });
    }

    // === SERVICIOS ===
    async getServices(options = {}) {
        return this.query('servicios', {
            eq: options.categoria ? { categoria: options.categoria } : {},
            order: { by: 'created_at', ascending: false },
            limit: options.limit || 50
        });
    }

    async createService(data) {
        return this.insert('servicios', {
            ...data,
            created_at: new Date().toISOString(),
            verificado: false,
            activo: false
        });
    }

    // === eSIM ===
    async getPlanesESIM() {
        return this.query('planes_esim', {
            order: { by: 'precio', ascending: true }
        });
    }

    async activateESIM(userId, planId) {
        return this.insert('ordenes_esim', {
            user_id: userId,
            plan_id: planId,
            estado: 'pendiente',
            created_at: new Date().toISOString()
        });
    }

    // === WALLET ===
    async getWalletBalance(userId) {
        const transactions = await this.query('transacciones', {
            eq: { user_id: userId },
            order: { by: 'created_at', ascending: false }
        });
        const balance = transactions.reduce((acc, t) => {
            return t.tipo === 'ingreso' ? acc + t.monto : acc - t.monto;
        }, 0);
        return balance;
    }

    async createTransaction(data) {
        return this.insert('transacciones', {
            ...data,
            created_at: new Date().toISOString()
        });
    }

    // === TRADING ===
    async getTradingData(symbol = 'STOKS/CMT') {
        // Simular datos de trading (conectar con API real)
        return {
            symbol,
            price: 1.37 + (Math.random() - 0.5) * 0.1,
            change: (Math.random() - 0.5) * 0.05,
            volume: Math.floor(Math.random() * 10000) + 1000,
            high: 1.42,
            low: 1.32,
            timestamp: new Date().toISOString()
        };
    }

    // === NOTIFICACIONES ===
    async getNotifications(userId) {
        return this.query('notificaciones', {
            eq: { user_id: userId },
            order: { by: 'created_at', ascending: false },
            limit: 50
        });
    }

    async markNotificationRead(notificationId) {
        return this.update('notificaciones', { leida: true }, { id: notificationId });
    }
}

// ================================================================
# 🚀 INSTANCIA ÚNICA
// ================================================================

const api = new ApiClient();

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default api;

console.log('🌐 API Client cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');