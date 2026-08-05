// js/plugins/plugin-chat.js
import { supabase } from '../utils/supabaseClient.js';

export const chatPlugin = {
    channel: null,

    listenMessages(callback) {
        this.channel = supabase.channel('chat_messages');
        this.channel.on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'mensajes_chat' 
        }, (payload) => {
            callback(payload.new);
        }).subscribe();

        // Cargar mensajes iniciales
        this.getHistory().then(mensajes => callback(mensajes));

        return this.channel;
    },

    async getHistory(limit = 50, offset = 0) {
        const { data, error } = await supabase
            .from('mensajes_chat')
            .select('*')
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);
        if (error) return [];
        return data || [];
    },

    async sendText(userId, texto, extra = null) {
        const mensaje = {
            user_id: userId,
            content: texto,
            type: 'text',
            created_at: new Date().toISOString()
        };
        if (extra) mensaje.extra = extra;
        const { data, error } = await supabase.from('mensajes_chat').insert(mensaje);
        if (error) console.error('Error enviando mensaje:', error);
        return data;
    },

    async addReaction(userId, messageId, emoji) {
        // Implementación pendiente
        console.log('Reacción agregada:', emoji);
    },

    search(query) {
        return new Promise((resolve) => {
            resolve([]); // Implementación pendiente
        });
    }
};