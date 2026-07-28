// js/plugins/plugin-chat.js
import { supabase, CHAT_CHANNEL, broadcastMensaje, obtenerUserId } from '../utils/supabaseClient.js';

// ================================================================
// PLUGIN DE CHAT AVANZADO - Marquinhos v3.0
// ================================================================

const CACHE_KEY = 'marquinhos_mensajes';
let channelInstance = null;

// ================================================================
// ESTADOS DEL MENSAJE
// ================================================================

const ESTADO_MENSAJE = {
    ENVIANDO: 'enviando',
    ENVIADO: 'enviado',
    RECIBIDO: 'recibido',
    LEIDO: 'leido',
    FALLIDO: 'fallido'
};

// ================================================================
// REFERENCIA AL SISTEMA COMMIT (CMT)
// ================================================================

const Commit = typeof window !== 'undefined' && window.Commit ? window.Commit : null;

if (!Commit) {
    console.warn('⚠️ window.Commit no disponible. Los stickers y regalos CMT no funcionarán.');
}

export const chatPlugin = {
    // ================================================================
    // ENVÍO DE MENSAJES
    // ================================================================

    /**
     * Envía un mensaje de texto con confirmación
     */
    sendText: async (text, responderA = null) => {
        const userId = await obtenerUserId();
        const payload = { 
            user_id: userId, 
            content: text, 
            type: 'text',
            estado: ESTADO_MENSAJE.ENVIANDO
        };
        
        // Si es respuesta a otro mensaje
        if (responderA) {
            payload.responder_a = responderA;
            payload.type = 'respuesta';
        }
        
        return await enviarMensaje(payload);
    },

    /**
     * Envía un emoji
     */
    sendEmoji: async (emojiCode) => {
        const userId = await obtenerUserId();
        return await enviarMensaje({ 
            user_id: userId, 
            content: emojiCode, 
            type: 'emoji',
            estado: ESTADO_MENSAJE.ENVIANDO
        });
    },

    /**
     * Envía un sticker (URL desde Supabase Storage) — LEGADO
     */
    sendSticker: async (stickerUrl) => {
        const userId = await obtenerUserId();
        return await enviarMensaje({ 
            user_id: userId, 
            content: stickerUrl, 
            type: 'sticker',
            estado: ESTADO_MENSAJE.ENVIANDO
        });
    },

    /**
     * 🆕 Envía un sticker con COMMIT (CMT)
     */
    sendStickerCommit: async (receiverId, assetType, descripcion) => {
        if (!Commit) {
            throw new Error('⚠️ Sistema COMMIT no disponible');
        }

        const userId = await obtenerUserId();

        await Commit.crearUsuarioSiNoExiste(userId);
        if (receiverId) {
            await Commit.crearUsuarioSiNoExiste(receiverId);
        }

        const result = await Commit.comprarSticker(
            userId,
            receiverId || null,
            assetType,
            descripcion || 'Regalo en el chat 🎁'
        );

        const mensaje = {
            user_id: userId,
            content: `🎁 ${result.asset_name} (${result.asset_code})`,
            type: 'sticker_cmt',
            estado: ESTADO_MENSAJE.ENVIADO,
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
     */
    sendGiftCommit: async (receiverId, monto, descripcion) => {
        if (!Commit) {
            throw new Error('⚠️ Sistema COMMIT no disponible');
        }
        if (!receiverId) {
            throw new Error('receiverId es requerido para enviar un regalo');
        }

        const userId = await obtenerUserId();

        await Commit.crearUsuarioSiNoExiste(userId);
        await Commit.crearUsuarioSiNoExiste(receiverId);

        const result = await Commit.enviarRegalo(
            userId,
            receiverId,
            monto,
            descripcion || 'Regalo P2P 💰'
        );

        const mensaje = {
            user_id: userId,
            content: `💰 ${monto} CMT enviados a ${receiverId}`,
            type: 'gift_cmt',
            estado: ESTADO_MENSAJE.ENVIADO,
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

    // ================================================================
    // REACCIONES Y COMENTARIOS
    // ================================================================

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
     * 🆕 Edita un mensaje enviado
     */
    editMessage: async (messageId, nuevoTexto) => {
        try {
            const userId = await obtenerUserId();
            
            const { data, error } = await supabase
                .from('mensajes')
                .update({ 
                    content: nuevoTexto,
                    editado: true,
                    editado_en: new Date().toISOString()
                })
                .eq('id', messageId)
                .eq('user_id', userId)
                .select();

            if (error) throw error;

            // Emitir evento de edición
            await broadcastMensaje(channelInstance || supabase.channel(CHAT_CHANNEL), 'EDIT_MESSAGE', {
                message_id: messageId,
                content: nuevoTexto,
                editado_en: new Date().toISOString()
            });

            return data[0];
        } catch (error) {
            console.error('❌ Error al editar mensaje:', error);
            throw error;
        }
    },

    /**
     * 🆕 Elimina un mensaje para todos
     */
    deleteMessageForEveryone: async (messageId) => {
        try {
            const userId = await obtenerUserId();
            
            const { error } = await supabase
                .from('mensajes')
                .update({ 
                    eliminado_para_todos: true,
                    eliminado_en: new Date().toISOString()
                })
                .eq('id', messageId)
                .eq('user_id', userId);

            if (error) throw error;

            // Emitir evento de eliminación
            await broadcastMensaje(channelInstance || supabase.channel(CHAT_CHANNEL), 'DELETE_MESSAGE', {
                message_id: messageId,
                eliminado_en: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Error al eliminar mensaje:', error);
            throw error;
        }
    },

    /**
     * 🆕 Marcar mensaje como leído
     */
    markAsRead: async (messageId) => {
        try {
            const { error } = await supabase
                .from('mensajes')
                .update({ 
                    leido: true,
                    leido_en: new Date().toISOString()
                })
                .eq('id', messageId);

            if (error) throw error;

            // Emitir evento de lectura
            await broadcastMensaje(channelInstance || supabase.channel(CHAT_CHANNEL), 'READ_MESSAGE', {
                message_id: messageId,
                leido_en: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Error al marcar mensaje como leído:', error);
            throw error;
        }
    },

    /**
     * 🆕 Buscar mensajes en el historial (mejorado)
     */
    search: async (query, userId = null) => {
        try {
            let searchQuery = supabase
                .from('mensajes')
                .select('*')
                .textSearch('content', query)
                .order('created_at', { ascending: false })
                .limit(50);

            if (userId) {
                searchQuery = searchQuery.eq('user_id', userId);
            }

            const { data, error } = await searchQuery;

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            return [];
        }
    },

    /**
     * 🆕 Obtener historial de mensajes (con paginación)
     */
    getHistory: async (limit = 50, offset = 0) => {
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

    /**
     * 🆕 Subir y enviar un archivo (imagen/video)
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
                estado: ESTADO_MENSAJE.ENVIADO,
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

    // ================================================================
    // INDICADORES EN TIEMPO REAL
    // ================================================================

    /**
     * 🆕 Envía indicador "escribiendo..."
     */
    sendTypingIndicator: async (targetUserId) => {
        try {
            await broadcastMensaje(supabase.channel(CHAT_CHANNEL), 'TYPING', {
                user_id: await obtenerUserId(),
                target: targetUserId,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.warn('⚠️ Error enviando indicador de escritura:', error);
        }
    },

    /**
     * 🆕 Envía indicador "grabando audio..."
     */
    sendRecordingIndicator: async (targetUserId) => {
        try {
            await broadcastMensaje(supabase.channel(CHAT_CHANNEL), 'RECORDING', {
                user_id: await obtenerUserId(),
                target: targetUserId,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.warn('⚠️ Error enviando indicador de grabación:', error);
        }
    },

    // ================================================================
    // ESCUCHA DE MENSAJES EN TIEMPO REAL
    // ================================================================

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
            .on('broadcast', { event: 'EDIT_MESSAGE' }, (payload) => {
                callback({ ...payload.payload, type: 'edit' });
            })
            .on('broadcast', { event: 'DELETE_MESSAGE' }, (payload) => {
                callback({ ...payload.payload, type: 'delete' });
            })
            .on('broadcast', { event: 'READ_MESSAGE' }, (payload) => {
                callback({ ...payload.payload, type: 'read' });
            })
            .on('broadcast', { event: 'TYPING' }, (payload) => {
                callback({ ...payload.payload, type: 'typing' });
            })
            .on('broadcast', { event: 'RECORDING' }, (payload) => {
                callback({ ...payload.payload, type: 'recording' });
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
        leido: false,
        estado: payload.estado || ESTADO_MENSAJE.ENVIANDO
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

        // Actualizar estado a ENVIADO
        const mensajeEnviado = { ...mensaje, estado: ESTADO_MENSAJE.ENVIADO, id: data[0].id };
        actualizarLocal(mensajeEnviado);

        // 3. Emitir por Realtime
        if (channelInstance) {
            await broadcastMensaje(channelInstance, 'INSERT', mensajeEnviado);
        }

        // 4. Marcar como RECIBIDO después de 1s (simulación)
        setTimeout(async () => {
            try {
                const recibido = { ...mensajeEnviado, estado: ESTADO_MENSAJE.RECIBIDO };
                actualizarLocal(recibido);
                await broadcastMensaje(channelInstance, 'RECEIVED', {
                    message_id: recibido.id,
                    estado: ESTADO_MENSAJE.RECIBIDO
                });
            } catch (e) {
                console.warn('⚠️ Error marcando como recibido:', e);
            }
        }, 1000);

        // 5. Marcar como LEIDO después de 3s (simulación)
        setTimeout(async () => {
            try {
                const leido = { ...mensajeEnviado, estado: ESTADO_MENSAJE.LEIDO };
                actualizarLocal(leido);
                await broadcastMensaje(channelInstance, 'READ', {
                    message_id: leido.id,
                    estado: ESTADO_MENSAJE.LEIDO
                });
            } catch (e) {
                console.warn('⚠️ Error marcando como leído:', e);
            }
        }, 3000);

        return data[0];
    } catch (error) {
        console.warn('⚠️ Falló envío a Supabase, reintentando...', error);
        // Marcar como FALLIDO
        const fallido = { ...mensaje, estado: ESTADO_MENSAJE.FALLIDO };
        actualizarLocal(fallido);
        
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
        if (cache.length > 500) cache.shift();
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('⚠️ Error guardando en localStorage:', e);
    }
}

/**
 * Actualiza un mensaje en localStorage
 */
function actualizarLocal(mensaje) {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
        const index = cache.findIndex(m => m.id === mensaje.id);
        if (index !== -1) {
            cache[index] = { ...cache[index], ...mensaje };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        }
    } catch (e) {
        console.warn('⚠️ Error actualizando localStorage:', e);
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