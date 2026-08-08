/**
 * ================================================================
 * 💬 PLUGIN DE CHAT - Csariel's Ecosystem
 * ================================================================
 * Plugin para manejar mensajes de chat en tiempo real
 * con Supabase Realtime y almacenamiento local.
 * 
 * Hecho en Puebla, México 🇲🇽
 * Versión: 2.1.0
 * ================================================================
 */

// ================================================================
// 📦 IMPORTS
// ================================================================

import { supabase } from '../utils/supabaseClient.js';

// ================================================================
// 🧠 PLUGIN DE CHAT
// ================================================================

export const chatPlugin = {
    // ================================================================
    // 🔌 CANAL Y ESTADO
    // ================================================================
    
    channel: null,
    messages: [],
    listeners: [],
    isSubscribed: false,
    
    // ================================================================
    // 📡 CONFIGURACIÓN
    // ================================================================
    
    CONFIG: {
        MAX_MESSAGES: 100,
        TIPO_MENSAJE: {
            TEXT: 'text',
            IMAGEN: 'image',
            VIDEO: 'video',
            AUDIO: 'audio',
            SISTEMA: 'system'
        }
    },

    // ================================================================
    // 🎧 ESCUCHAR MENSAJES EN TIEMPO REAL
    // ================================================================
    
    listenMessages(callback) {
        if (this.isSubscribed) {
            // Ya está suscrito, agregar callback
            this.listeners.push(callback);
            callback(this.messages);
            return this.channel;
        }

        // Crear canal de Supabase
        this.channel = supabase.channel('chat_messages');
        
        // Escuchar nuevos mensajes
        this.channel.on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'mensajes_chat' 
        }, (payload) => {
            const nuevoMensaje = payload.new;
            // Agregar al caché
            this.messages.push(nuevoMensaje);
            // Mantener límite
            if (this.messages.length > this.CONFIG.MAX_MESSAGES) {
                this.messages = this.messages.slice(-this.CONFIG.MAX_MESSAGES);
            }
            // Notificar a todos los listeners
            this.listeners.forEach(fn => fn(nuevoMensaje));
        }).subscribe();

        this.isSubscribed = true;
        this.listeners.push(callback);

        // Cargar mensajes iniciales
        this.getHistory().then(mensajes => {
            this.messages = mensajes;
            callback(mensajes);
        });

        return this.channel;
    },

    // ================================================================
    // 📜 OBTENER HISTORIAL
    // ================================================================
    
    async getHistory(limit = 50, offset = 0) {
        try {
            const { data, error } = await supabase
                .from('mensajes_chat')
                .select('*')
                .order('created_at', { ascending: true })
                .range(offset, offset + limit - 1);
            
            if (error) {
                console.error('❌ Error en getHistory:', error);
                return this.getHistoryLocal(limit);
            }
            
            // Guardar en caché local
            this.messages = data || [];
            return data || [];
        } catch (error) {
            console.error('❌ Error en getHistory:', error);
            return this.getHistoryLocal(limit);
        }
    },

    // ================================================================
    // 💾 HISTORIAL LOCAL (FALLBACK)
    // ================================================================
    
    getHistoryLocal(limit = 50) {
        try {
            const stored = localStorage.getItem('csariels_chat_history');
            if (stored) {
                const data = JSON.parse(stored);
                return data.slice(-limit);
            }
        } catch (e) {
            console.warn('⚠️ Error leyendo historial local:', e);
        }
        return [];
    },

    saveHistoryLocal(mensaje) {
        try {
            let history = [];
            const stored = localStorage.getItem('csariels_chat_history');
            if (stored) {
                history = JSON.parse(stored);
            }
            history.push(mensaje);
            if (history.length > 200) {
                history = history.slice(-200);
            }
            localStorage.setItem('csariels_chat_history', JSON.stringify(history));
        } catch (e) {
            console.warn('⚠️ Error guardando historial local:', e);
        }
    },

    // ================================================================
    // ✉️ ENVIAR MENSAJE
    // ================================================================
    
    async sendText(userId, texto, extra = null) {
        // Validaciones
        if (!userId) {
            console.error('❌ userId es requerido');
            return null;
        }
        if (!texto || texto.trim() === '') {
            console.error('❌ El mensaje no puede estar vacío');
            return null;
        }

        const mensaje = {
            user_id: userId,
            content: texto.trim(),
            type: this.CONFIG.TIPO_MENSAJE.TEXT,
            created_at: new Date().toISOString(),
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
        };
        
        if (extra) {
            mensaje.extra = extra;
        }

        try {
            const { data, error } = await supabase
                .from('mensajes_chat')
                .insert(mensaje)
                .select();

            if (error) {
                console.error('❌ Error enviando mensaje:', error);
                // Fallback: guardar localmente
                this.saveHistoryLocal(mensaje);
                return mensaje;
            }

            // Guardar en caché local
            this.saveHistoryLocal(mensaje);
            return data?.[0] || mensaje;
        } catch (error) {
            console.error('❌ Error en sendText:', error);
            this.saveHistoryLocal(mensaje);
            return mensaje;
        }
    },

    // ================================================================
    // 🖼️ ENVIAR MENSAJE CON IMAGEN
    // ================================================================
    
    async sendImage(userId, imageUrl, caption = '') {
        const mensaje = {
            user_id: userId,
            content: caption || '📷 Imagen compartida',
            type: this.CONFIG.TIPO_MENSAJE.IMAGEN,
            extra: { image_url: imageUrl },
            created_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase
                .from('mensajes_chat')
                .insert(mensaje)
                .select();

            if (error) throw error;
            return data?.[0] || mensaje;
        } catch (error) {
            console.error('❌ Error enviando imagen:', error);
            this.saveHistoryLocal(mensaje);
            return mensaje;
        }
    },

    // ================================================================
    // 🎬 ENVIAR MENSAJE CON VIDEO
    // ================================================================
    
    async sendVideo(userId, videoUrl, caption = '') {
        const mensaje = {
            user_id: userId,
            content: caption || '🎬 Video compartido',
            type: this.CONFIG.TIPO_MENSAJE.VIDEO,
            extra: { video_url: videoUrl },
            created_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase
                .from('mensajes_chat')
                .insert(mensaje)
                .select();

            if (error) throw error;
            return data?.[0] || mensaje;
        } catch (error) {
            console.error('❌ Error enviando video:', error);
            this.saveHistoryLocal(mensaje);
            return mensaje;
        }
    },

    // ================================================================
    // 🎧 ENVIAR MENSAJE DE SISTEMA
    // ================================================================
    
    async sendSystemMessage(texto) {
        const mensaje = {
            user_id: 'system',
            content: texto,
            type: this.CONFIG.TIPO_MENSAJE.SISTEMA,
            created_at: new Date().toISOString(),
            extra: { is_system: true }
        };

        try {
            const { data, error } = await supabase
                .from('mensajes_chat')
                .insert(mensaje)
                .select();

            if (error) throw error;
            return data?.[0] || mensaje;
        } catch (error) {
            console.error('❌ Error enviando mensaje de sistema:', error);
            return mensaje;
        }
    },

    // ================================================================
    // ❤️ REACCIONES
    // ================================================================
    
    async addReaction(userId, messageId, emoji) {
        try {
            // Buscar mensaje actual
            const { data: mensaje, error: fetchError } = await supabase
                .from('mensajes_chat')
                .select('reactions')
                .eq('id', messageId)
                .single();

            if (fetchError) throw fetchError;

            // Obtener reacciones actuales o inicializar
            let reactions = mensaje?.reactions || {};
            
            // Agregar o quitar reacción del usuario
            if (!reactions[emoji]) {
                reactions[emoji] = [];
            }
            
            const index = reactions[emoji].indexOf(userId);
            if (index > -1) {
                reactions[emoji].splice(index, 1);
                if (reactions[emoji].length === 0) {
                    delete reactions[emoji];
                }
            } else {
                reactions[emoji].push(userId);
            }

            // Actualizar en la base de datos
            const { data, error } = await supabase
                .from('mensajes_chat')
                .update({ reactions })
                .eq('id', messageId)
                .select();

            if (error) throw error;
            return data?.[0];
        } catch (error) {
            console.error('❌ Error en addReaction:', error);
            return null;
        }
    },

    // ================================================================
    // 🔍 BÚSQUEDA
    // ================================================================
    
    async search(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('mensajes_chat')
                .select('*')
                .ilike('content', `%${query.trim()}%`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            // Búsqueda local (fallback)
            const local = this.getHistoryLocal(200);
            return local.filter(msg => 
                msg.content?.toLowerCase().includes(query.toLowerCase())
            );
        }
    },

    // ================================================================
    // 📊 ESTADÍSTICAS
    // ================================================================
    
    async getStats(userId = null) {
        try {
            let query = supabase
                .from('mensajes_chat')
                .select('*', { count: 'exact' });

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { count, error } = await query;
            if (error) throw error;

            // Último mensaje
            const { data: ultimo, error: ultimoError } = await supabase
                .from('mensajes_chat')
                .select('created_at, user_id')
                .order('created_at', { ascending: false })
                .limit(1);

            if (ultimoError) throw ultimoError;

            return {
                total_mensajes: count || 0,
                ultimo_mensaje: ultimo?.[0] || null,
                cache_local: this.messages.length
            };
        } catch (error) {
            console.error('❌ Error en getStats:', error);
            return {
                total_mensajes: this.messages.length,
                ultimo_mensaje: this.messages[this.messages.length - 1] || null,
                cache_local: this.messages.length
            };
        }
    },

    // ================================================================
    // 🗑️ LIMPIAR CACHÉ LOCAL
    // ================================================================
    
    clearLocalCache() {
        this.messages = [];
        localStorage.removeItem('csariels_chat_history');
    },

    // ================================================================
    // 🔌 DESCONECTAR
    // ================================================================
    
    disconnect() {
        if (this.channel) {
            this.channel.unsubscribe();
            this.channel = null;
        }
        this.isSubscribed = false;
        this.listeners = [];
        console.log('🔌 Chat desconectado');
    },

    // ================================================================
    // 🔄 RECONECTAR
    // ================================================================
    
    reconnect(callback) {
        this.disconnect();
        return this.listenMessages(callback);
    },

    // ================================================================
    // 📋 OBTENER MENSAJES CACHEADOS
    // ================================================================
    
    getCachedMessages() {
        return this.messages;
    },

    // ================================================================
    // 🏷️ OBTENER TIPOS DE MENSAJE
    // ================================================================
    
    getTiposMensaje() {
        return this.CONFIG.TIPO_MENSAJE;
    }
};

// ================================================================
// 🚀 EXPORTAR POR DEFECTO
// ================================================================

export default chatPlugin;

// ================================================================
// 📋 LOG DE INICIO
// ================================================================

console.log('💬 Plugin de Chat v2.1.0 cargado');
console.log('📍 Hecho en Puebla, México');
console.log('📡 Conectado a Supabase Realtime');