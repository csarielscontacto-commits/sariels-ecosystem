// js/plugins/plugin-chat.js
import { supabase, CHAT_CHANNEL, broadcastMensaje, obtenerUserId } from '../utils/supabaseClient.js';

// ================================================================
// PLUGIN DE CHAT - Marquinhos
// ================================================================

const CACHE_KEY = 'marquinhos_mensajes';
let channelInstance = null;

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
     * Envía un sticker (URL desde Supabase Storage)
     */
    sendSticker: async (stickerUrl) => {
        const userId = await obtenerUserId();
        return await enviarMensaje({ user_id: userId, content: stickerUrl, type: 'sticker' });
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

            // Emitir en tiempo real
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
            
            // 1. Compresión con worker
            const compressed = await comprimirArchivo(file);

            // 2. Subir a Supabase Storage
            const filePath = `chat-archivos/${Date.now()}_${compressed.name}`;
            const { error: uploadErr } = await supabase.storage
                .from('chat-archivos')
                .upload(filePath, compressed.blob, {
                    cacheControl: '3600',
                    contentType: compressed.type,
                    upsert: false
                });

            if (uploadErr) throw uploadErr;

            // 3. Obtener URL pública
            const { data: urlData } = supabase.storage
                .from('chat-archivos')
                .getPublicUrl(filePath);

            const publicUrl = urlData.publicUrl;

            // 4. Guardar referencia en mensajes
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
        // 1. Primero cargar historial
        cargarHistorial(callback);

        // 2. Suscribirse a Realtime
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

    // 1. Guardar en localStorage (UI optimista)
    guardarLocal(mensaje);

    // 2. Guardar en Supabase
    try {
        const { data, error } = await supabase
            .from('mensajes')
            .insert(mensaje)
            .select();

        if (error) throw error;

        // 3. Emitir por Realtime
        if (channelInstance) {
            await broadcastMensaje(channelInstance, 'INSERT', mensaje);
        }

        return data[0];
    } catch (error) {
        console.warn('⚠️ Falló envío a Supabase, reintentando...', error);
        // Reintentar después de 5s
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
        // Mantener solo últimos 500 mensajes
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

        // También cargar reacciones
        const { data: reacciones, error: reaccErr } = await supabase
            .from('reacciones')
            .select('*');

        if (!reaccErr && reacciones) {
            // Agrupar reacciones por mensaje
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