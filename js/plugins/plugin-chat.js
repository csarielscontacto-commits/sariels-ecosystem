// js/plugins/plugin-chat.js
import { supabase, CHAT_CHANNEL, broadcastMensaje, obtenerUserId } from '../utils/supabaseClient.js';

// ================================================================
// PLUGIN DE CHAT - Marquinhos
// ================================================================

const CACHE_KEY = 'marquinhos_mensajes';
let channelInstance = null;

// ================================================================
// NUEVO: REFERENCIA AL SISTEMA COMMIT (CMT)
// ================================================================

// window.Commit debe estar cargado por commit-connector.js
// Si no está, mostramos advertencia pero no bloqueamos el chat

const Commit = typeof window !== 'undefined' && window.Commit ? window.Commit : null;

if (!Commit) {
    console.warn('⚠️ window.Commit no disponible. Los stickers y regalos CMT no funcionarán.');
}

export const chatPlugin = {
    /**
     * Envía un mensaje de texto
     */
    sendText: async (text) => {
        const userId = await obtenerUserId();
        return await enviarMensaje({ user_id: userId, content: text, type: 'text' });
    },

    /**
     * Envía un emoji
     */
    sendEmoji: async (emojiCode) => {
        const userId = await obtenerUserId();
        return await enviarMensaje({ user_id: userId, content: emojiCode, type: 'emoji' });
    },

    /**
     * Envía un sticker (URL desde Supabase Storage) — LEGADO
     * Para compatibilidad con stickers viejos
     */
    sendSticker: async (stickerUrl) => {
        const userId = await obtenerUserId();
        return await enviarMensaje({ user_id: userId, content: stickerUrl, type: 'sticker' });
    },

    /**
     * 🆕 Envía un sticker con COMMIT (CMT)
     * Usa el sistema de tokens para comprar stickers
     */
    sendStickerCommit: async (receiverId, assetType, descripcion) => {
        if (!Commit) {
            throw new Error('⚠️ Sistema COMMIT no disponible');
        }

        const userId = await obtenerUserId();

        // Validar que el usuario existe en el sistema
        await Commit.crearUsuarioSiNoExiste(userId);
        if (receiverId) {
            await Commit.crearUsuarioSiNoExiste(receiverId);
        }

        // Comprar sticker (aplica regla 50/50 automáticamente)
        const result = await Commit.comprarSticker(
            userId,
            receiverId || null,
            assetType,
            descripcion || 'Regalo en el chat 🎁'
        );

        // Emitir evento para mostrar en el chat
        const mensaje = {
            user_id: userId,
            content: `🎁 ${result.asset_name} (${result.asset_code})`,
            type: 'sticker_cmt',
            extra: {
                asset_type: result.asset_type || assetType,
                asset_code: result.asset_code,
                asset_name: result.asset_name,
                emoji: result.emoji || '🎁',
                color: result.color_hex || '#FFD700',
                animation_type: result.animation_type || 'none',
                amount: result.amount || 0,
                commission: result.commission_amount || 0,
                receiver_amount: result.receiver_amount || 0,
                receiver_id: receiverId || null,
                transaction_id: result.transaction_id
            }
        };

        return await enviarMensaje(mensaje);
    },

    /**
     * 🆕 Envía un regalo P2P con COMMIT (CMT)
     * Solo transferencia de tokens, sin sticker asociado
     */
    sendGiftCommit: async (receiverId, monto, descripcion) => {
        if (!Commit) {
            throw new Error('⚠️ Sistema COMMIT no disponible');
        }
        if (!receiverId) {
            throw new Error('receiverId es requerido para enviar un regalo');
        }

        const userId = await obtenerUserId();

        // Validar que los usuarios existen
        await Commit.crearUsuarioSiNoExiste(userId);
        await Commit.crearUsuarioSiNoExiste(receiverId);

        // Enviar regalo (aplica regla 50/50 automáticamente)
        const result = await Commit.enviarRegalo(
            userId,
            receiverId,
            monto,
            descripcion || 'Regalo P2P 💰'
        );

        // Emitir evento para mostrar en el chat
        const mensaje = {
            user_id: userId,
            content: `💰 ${monto} CMT enviados a ${receiverId}`,
            type: 'gift_cmt',
            extra: {
                amount: monto,
                commission: result.commission_amount || 0,
                receiver_amount: result.receiver_amount || 0,
                receiver_id: receiverId,
                transaction_id: result.transaction_id
            }
        };

        return await enviarMensaje(mensaje);
    },

    /**
     * 🆕 Obtener saldo de COMMIT de un usuario
     */
    getBalanceCommit: async (userId) => {
        if (!Commit) {
            throw new Error('⚠️ Sistema COMMIT no disponible');
        }

        const targetId = userId || await obtenerUserId();
        await Commit.crearUsuarioSiNoExiste(targetId);
        return await Commit.consultarSaldo(targetId);
    },

    /**
     * 🆕 Listar stickers disponibles para comprar
     */
    listarStickersCommit: async () => {
        if (!Commit) {
            throw new Error('⚠️ Sistema COMMIT no disponible');
        }
        return await Commit.listarStickers();
    },

    /**
     * Agrega una reacción a un mensaje
     */
    addReaction: async (messageId, emojiCode) => {
        try {
            const userId = await obtenerUserId();
            
            const { data, error } = await supabase
                .from('reacciones')
                .insert({ message_id: messageId, user_id: userId, emoji: emojiCode })
                .select();

            if (error) throw error;

            await broadcastMensaje(channelInstance || supabase.channel(CHAT_CHANNEL), 'REACTION', {
                message_id: messageId,
                user_id: userId,
                emoji: emojiCode,
                id: data[0].id
            });

            return data[0];
        } catch (error) {
            console.error('❌ Error al agregar reacción:', error);
            throw error;
        }
    },

    /**
     * Busca mensajes en el historial
     */
    search: async (query) => {
        try {
            const { data, error } = await supabase
                .from('mensajes')
                .select('*')
                .textSearch('content', query)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            return [];
        }
    },

    /**
     * Sube y envía un archivo (imagen/video)
     */
    uploadFile: async (file) => {
        try {
            const userId = await obtenerUserId();
            
            const compressed = await comprimirArchivo(file);

            const filePath = `chat-archivos/${Date.now()}_${compressed.name}`;
            const { error: uploadErr } = await supabase.storage
                .from('chat-archivos')
                .upload(filePath, compressed.blob, {
                    cacheControl: '3600',
                    contentType: compressed.type,
                    upsert: false
                });

            if (uploadErr) throw uploadErr;

            const { data: urlData } = supabase.storage
                .from('chat-archivos')
                .getPublicUrl(filePath);

            const publicUrl = urlData.publicUrl;

            const type = compressed.type.startsWith('image/') ? 'image' : 'video';
            return await enviarMensaje({
                user_id: userId,
                content: publicUrl,
                type: type,
                extra: {
                    filename: compressed.name,
                    size: compressed.size,
                    width: compressed.width || null,
                    height: compressed.height || null
                }
            });
        } catch (error) {
            console.error('❌ Error al subir archivo:', error);
            throw error;
        }
    },

    /**
     * Escucha mensajes en tiempo real
     */
    listenMessages: (callback) => {
        cargarHistorial(callback);

        channelInstance = supabase.channel(CHAT_CHANNEL);

        channelInstance
            .on('broadcast', { event: 'INSERT' }, (payload) => {
                callback(payload.payload);
            })
            .on('broadcast', { event: 'REACTION' }, (payload) => {
                callback({ ...payload.payload, type: 'reaction' });
            })
            .subscribe((status) => {
                console.log('📡 Chat channel status:', status);
            });

        return channelInstance;
    },

    /**
     * Obtiene el canal de chat
     */
    getChannel: () => channelInstance
};

// ================================================================
// FUNCIONES PRIVADAS
// ================================================================

/**
 * Envía un mensaje (optimistic UI + Supabase)
 */
async function enviarMensaje(payload) {
    const mensaje = {
        ...payload,
        created_at: new Date().toISOString(),
        leido: false
    };

    guardarLocal(mensaje);

    try {
        const { data, error } = await supabase
            .from('mensajes')
            .insert(mensaje)
            .select();

        if (error) throw error;

        if (channelInstance) {
            await broadcastMensaje(channelInstance, 'INSERT', mensaje);
        }

        return data[0];
    } catch (error) {
        console.warn('⚠️ Falló envío a Supabase, reintentando...', error);
        setTimeout(() => {
            enviarMensaje(payload);
        }, 5000);
        return null;
    }
}

/**
 * Guarda mensaje en localStorage (cache local)
 */
function guardarLocal(payload) {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
        cache.push({ ...payload, local: true });
        if (cache.length > 500) cache.shift();
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('⚠️ Error guardando en localStorage:', e);
    }
}

/**
 * Carga historial de mensajes desde Supabase
 */
async function cargarHistorial(callback) {
    try {
        const { data, error } = await supabase
            .from('mensajes')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) throw error;

        const { data: reacciones, error: reaccErr } = await supabase
            .from('reacciones')
            .select('*');

        if (!reaccErr && reacciones) {
            const reaccionesMap = {};
            reacciones.forEach(r => {
                if (!reaccionesMap[r.message_id]) reaccionesMap[r.message_id] = [];
                reaccionesMap[r.message_id].push(r);
            });
            data.forEach(msg => {
                msg.reacciones = reaccionesMap[msg.id] || [];
            });
        }

        if (callback) callback(data);
        return data;
    } catch (error) {
        console.error('❌ Error cargando historial:', error);
        return [];
    }
}

/**
 * Comprime un archivo usando el worker
 */
function comprimirArchivo(file) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('../workers/escaneo-worker.js', { type: 'module' });
        worker.postMessage({ file });
        worker.onmessage = (e) => {
            if (e.data.error) {
                reject(new Error(e.data.error));
            } else {
                resolve(e.data);
            }
            worker.terminate();
        };
        worker.onerror = (err) => {
            reject(err);
            worker.terminate();
        };
    });
}