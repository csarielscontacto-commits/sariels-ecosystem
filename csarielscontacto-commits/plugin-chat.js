// js/plugins/plugin-chat.js
import { supabase } from '../utils/supabaseClient.js';

export const chatPlugin = {
    // ================================================================
    // CONFIGURACIÓN
    // ================================================================
    channel: null,
    listeners: [],

    // ================================================================
    // ESCUCHAR MENSAJES EN TIEMPO REAL
    // ================================================================
    listenMessages(callback) {
        // Obtener historial inicial
        this.cargarHistorial().then(mensajes => {
            if (callback) callback(mensajes);
        });

        // Suscribirse a cambios en tiempo real
        this.channel = supabase
            .channel('mensajes_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes'
                },
                (payload) => {
                    const nuevoMensaje = payload.new;
                    // Si hay callback, notificar
                    if (callback) callback(nuevoMensaje);
                }
            )
            .subscribe((status) => {
                console.log('📨 Chat suscrito:', status);
            });

        return this.channel;
    },

    // ================================================================
    // CARGAR HISTORIAL DE MENSAJES
    // ================================================================
    async cargarHistorial(limit = 50) {
        try {
            const { data, error } = await supabase
                .from('mensajes')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error cargando historial:', error);
            return [];
        }
    },

    // ================================================================
    // ENVIAR MENSAJE DE TEXTO
    // ================================================================
    async sendText(userId, texto, responderA = null) {
        try {
            const mensaje = {
                user_id: userId,
                content: texto,
                type: 'text',
                estado: 'enviado',
                created_at: new Date().toISOString()
            };

            if (responderA) {
                mensaje.responder_a = responderA.id;
                mensaje.extra = { responder_a_texto: responderA.texto };
            }

            const { data, error } = await supabase
                .from('mensajes')
                .insert(mensaje)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            return null;
        }
    },

    // ================================================================
    // ENVIAR EMOJI
    // ================================================================
    async sendEmoji(userId, emoji) {
        try {
            const mensaje = {
                user_id: userId,
                content: emoji,
                type: 'emoji',
                estado: 'enviado',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('mensajes')
                .insert(mensaje)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error enviando emoji:', error);
            return null;
        }
    },

    // ================================================================
    // ENVIAR STICKER
    // ================================================================
    async sendSticker(userId, stickerUrl) {
        try {
            const mensaje = {
                user_id: userId,
                content: stickerUrl,
                type: 'sticker',
                estado: 'enviado',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('mensajes')
                .insert(mensaje)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error enviando sticker:', error);
            return null;
        }
    },

    // ================================================================
    // SUBIR ARCHIVO (imagen/video)
    // ================================================================
    async uploadFile(userId, file) {
        try {
            // Crear URL temporal para el archivo
            const url = URL.createObjectURL(file);
            const tipo = file.type.startsWith('image/') ? 'image' : 'video';

            const mensaje = {
                user_id: userId,
                content: url,
                type: tipo,
                estado: 'enviado',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('mensajes')
                .insert(mensaje)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error subiendo archivo:', error);
            return null;
        }
    },

    // ================================================================
    // AGREGAR REACCIÓN
    // ================================================================
    async addReaction(userId, messageId, emojiCode) {
        try {
            // Obtener mensaje actual
            const { data: mensaje, error: getError } = await supabase
                .from('mensajes')
                .select('reacciones')
                .eq('id', messageId)
                .single();

            if (getError) throw getError;

            const reacciones = mensaje.reacciones || [];
            // Evitar duplicados del mismo usuario con el mismo emoji
            const existing = reacciones.find(r => r.user_id === userId && r.emoji === emojiCode);
            if (existing) {
                // Si ya existe, la quitamos (toggle)
                const nuevas = reacciones.filter(r => !(r.user_id === userId && r.emoji === emojiCode));
                const { error: updateError } = await supabase
                    .from('mensajes')
                    .update({ reacciones: nuevas })
                    .eq('id', messageId);

                if (updateError) throw updateError;
                return { action: 'removed', reacciones: nuevas };
            } else {
                // Agregar nueva reacción
                const nuevas = [...reacciones, { user_id: userId, emoji: emojiCode }];
                const { error: updateError } = await supabase
                    .from('mensajes')
                    .update({ reacciones: nuevas })
                    .eq('id', messageId);

                if (updateError) throw updateError;
                return { action: 'added', reacciones: nuevas };
            }
        } catch (error) {
            console.error('❌ Error en reacción:', error);
            return null;
        }
    },

    // ================================================================
    // EDITAR MENSAJE
    // ================================================================
    async editMessage(messageId, nuevoTexto) {
        try {
            const { data, error } = await supabase
                .from('mensajes')
                .update({
                    content: nuevoTexto,
                    editado: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', messageId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error editando mensaje:', error);
            return null;
        }
    },

    // ================================================================
    // ELIMINAR MENSAJE PARA TODOS
    // ================================================================
    async deleteMessageForEveryone(messageId) {
        try {
            const { error } = await supabase
                .from('mensajes')
                .update({
                    eliminado_para_todos: true,
                    content: '[Mensaje eliminado]'
                })
                .eq('id', messageId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('❌ Error eliminando mensaje:', error);
            return null;
        }
    },

    // ================================================================
    // MARCAR COMO LEÍDO
    // ================================================================
    async markAsRead(messageId) {
        try {
            const { error } = await supabase
                .from('mensajes')
                .update({ estado: 'leido' })
                .eq('id', messageId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('❌ Error marcando como leído:', error);
            return null;
        }
    },

    // ================================================================
    // INDICADOR "ESCRIBIENDO..."
    // ================================================================
    async sendTypingIndicator(targetUserId) {
        // Esta función puede usar un canal de presencia o simplemente
        // emitir un evento local
        document.dispatchEvent(new CustomEvent('typing:start', {
            detail: { userId: targetUserId }
        }));
        return { success: true };
    },

    // ================================================================
    // INDICADOR "GRABANDO AUDIO..."
    // ================================================================
    async sendRecordingIndicator(targetUserId) {
        document.dispatchEvent(new CustomEvent('recording:start', {
            detail: { userId: targetUserId }
        }));
        return { success: true };
    },

    // ================================================================
    // BUSCAR MENSAJES
    // ================================================================
    async search(query) {
        try {
            const { data, error } = await supabase
                .from('mensajes')
                .select('*')
                .ilike('content', `%${query}%`)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error buscando mensajes:', error);
            return [];
        }
    },

    // ================================================================
    // OBTENER HISTORIAL CON PAGINACIÓN
    // ================================================================
    async getHistory(limit = 50, offset = 0) {
        try {
            const { data, error } = await supabase
                .from('mensajes')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error obteniendo historial:', error);
            return [];
        }
    },

    // ================================================================
    // STICKERS CON COMMIT (CMT)
    // ================================================================
    async sendStickerCommit(userId, receiverId, assetType, descripcion) {
        try {
            // Simular envío de sticker con COMMIT
            const mensaje = {
                user_id: userId,
                content: `🎁 Sticker enviado a ${receiverId}`,
                type: 'sticker_cmt',
                estado: 'enviado',
                created_at: new Date().toISOString(),
                extra: {
                    asset_type: assetType,
                    receiver_id: receiverId,
                    descripcion: descripcion || 'Sticker'
                }
            };

            const { data, error } = await supabase
                .from('mensajes')
                .insert(mensaje)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error enviando sticker CMT:', error);
            return null;
        }
    },

    // ================================================================
    // REGALO P2P CON COMMIT (CMT)
    // ================================================================
    async sendGiftCommit(userId, receiverId, monto, descripcion) {
        try {
            const mensaje = {
                user_id: userId,
                content: `🎁 Regalo de ${monto} CMT para ${receiverId}`,
                type: 'gift_cmt',
                estado: 'enviado',
                created_at: new Date().toISOString(),
                extra: {
                    amount: monto,
                    receiver_id: receiverId,
                    descripcion: descripcion || 'Regalo'
                }
            };

            const { data, error } = await supabase
                .from('mensajes')
                .insert(mensaje)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error enviando regalo CMT:', error);
            return null;
        }
    },

    // ================================================================
    // SALDO COMMIT (simulado)
    // ================================================================
    async getBalanceCommit(userId) {
        // Simulación - en producción se consultaría una tabla real
        return { balance: Math.floor(Math.random() * 1000) };
    },

    // ================================================================
    // LISTAR STICKERS DISPONIBLES
    // ================================================================
    async listarStickersCommit() {
        // Stickers predefinidos
        return [
            { asset_type: 'sticker_001', asset_name: '❤️ Corazón', emoji: '❤️', price_commit: 10, rarity: 'Común' },
            { asset_type: 'sticker_002', asset_name: '🔥 Fuego', emoji: '🔥', price_commit: 25, rarity: 'Raro' },
            { asset_type: 'sticker_003', asset_name: '✨ Estrella', emoji: '✨', price_commit: 50, rarity: 'Épico' },
            { asset_type: 'sticker_004', asset_name: '💎 Diamante', emoji: '💎', price_commit: 100, rarity: 'Legendario' }
        ];
    }
};

console.log('📨 Plugin de Chat cargado');