// js/plugins/plugin-live.js
import { supabase, CHAT_CHANNEL, broadcastMensaje, obtenerUserId } from '../utils/supabaseClient.js';

// ================================================================
// PLUGIN DE LLAMADAS Y TRANSMISIONES - Marquinhos
// ================================================================

let roomInstance = null;
let isInCall = false;
let callListeners = [];

export const livePlugin = {
    /**
     * Inicia una llamada de voz o video
     */
    startCall: async (targetUserId, options = { video: false }) => {
        try {
            const userId = await obtenerUserId();
            const roomName = generarRoomId(userId, targetUserId);
            
            // Notificar al otro usuario
            await notificarLlamada(userId, targetUserId, roomName, options.video);
            
            // Simular conexión (en producción usarías LiveKit)
            console.log(`📞 Llamada iniciada a ${targetUserId} en sala ${roomName}`);
            
            // Crear objeto de llamada simulado
            const call = {
                roomName: roomName,
                participants: [userId, targetUserId],
                isVideo: options.video || false,
                startTime: new Date().toISOString(),
                status: 'connecting'
            };
            
            // Guardar en localStorage
            guardarLlamadaLocal(call);
            
            // Emitir evento
            callListeners.forEach(fn => fn({ type: 'call_started', call }));
            
            // Simular conexión después de 1s
            setTimeout(() => {
                call.status = 'connected';
                callListeners.forEach(fn => fn({ type: 'call_connected', call }));
            }, 1000);
            
            return call;
        } catch (error) {
            console.error('❌ Error iniciando llamada:', error);
            throw error;
        }
    },

    /**
     * Se une a una llamada existente
     */
    joinCall: async (roomName) => {
        try {
            const userId = await obtenerUserId();
            console.log(`📞 Unido a llamada ${roomName} como ${userId}`);
            
            // Simular unión
            const call = {
                roomName: roomName,
                participants: [userId],
                isVideo: false,
                startTime: new Date().toISOString(),
                status: 'connected'
            };
            
            callListeners.forEach(fn => fn({ type: 'call_joined', call }));
            return call;
        } catch (error) {
            console.error('❌ Error uniéndose a llamada:', error);
            throw error;
        }
    },

    /**
     * Termina la llamada actual
     */
    endCall: async () => {
        try {
            if (roomInstance) {
                // En producción: roomInstance.disconnect()
                roomInstance = null;
            }
            isInCall = false;
            callListeners.forEach(fn => fn({ type: 'call_ended' }));
            console.log('📞 Llamada terminada');
            return true;
        } catch (error) {
            console.error('❌ Error terminando llamada:', error);
            return false;
        }
    },

    /**
     * Obtiene el estado de la llamada
     */
    isInCall: () => isInCall,

    /**
     * Obtiene la instancia del room
     */
    getRoom: () => roomInstance,

    /**
     * Registra un listener para eventos de llamada
     */
    onCallEvent: (callback) => {
        if (typeof callback === 'function') {
            callListeners.push(callback);
        }
    },

    /**
     * Remueve un listener
     */
    offCallEvent: (callback) => {
        callListeners = callListeners.filter(fn => fn !== callback);
    },

    /**
     * Inicia una transmisión en vivo (streaming)
     */
    startLiveStream: async (streamTitle) => {
        try {
            const userId = await obtenerUserId();
            const roomName = `live_${userId}_${Date.now()}`;
            
            console.log(`📹 Transmisión iniciada: ${streamTitle} en sala ${roomName}`);
            
            const stream = {
                roomName: roomName,
                title: streamTitle,
                streamer: userId,
                startTime: new Date().toISOString(),
                status: 'live',
                viewers: 0
            };
            
            // Notificar a todos los usuarios
            const liveMsg = {
                user_id: userId,
                type: 'live_started',
                room: roomName,
                title: streamTitle,
                created_at: new Date().toISOString()
            };
            
            await broadcastMensaje(supabase.channel(CHAT_CHANNEL), 'INSERT', liveMsg);
            
            // Simular conteo de viewers
            setInterval(() => {
                stream.viewers = Math.floor(Math.random() * 50) + 1;
                callListeners.forEach(fn => fn({ type: 'live_viewers', stream }));
            }, 5000);
            
            return stream;
        } catch (error) {
            console.error('❌ Error iniciando transmisión:', error);
            throw error;
        }
    },

    /**
     * Se une a una transmisión en vivo como espectador
     */
    joinLiveStream: async (roomName) => {
        try {
            const userId = await obtenerUserId();
            console.log(`📺 Unido a transmisión ${roomName} como ${userId}`);
            
            const stream = {
                roomName: roomName,
                viewer: userId,
                joinTime: new Date().toISOString(),
                status: 'watching'
            };
            
            callListeners.forEach(fn => fn({ type: 'live_joined', stream }));
            return stream;
        } catch (error) {
            console.error('❌ Error uniéndose a transmisión:', error);
            throw error;
        }
    }
};

// ================================================================
// FUNCIONES PRIVADAS
// ================================================================

/**
 * Genera un ID único para una sala
 */
function generarRoomId(userId1, userId2) {
    const ids = [userId1, userId2].sort();
    return `call_${ids.join('_')}_${Date.now()}`;
}

/**
 * Notifica una llamada al otro usuario via Realtime
 */
async function notificarLlamada(fromUserId, toUserId, roomName, isVideo) {
    const payload = {
        user_id: toUserId,
        type: 'call_invite',
        from: fromUserId,
        room: roomName,
        video: isVideo,
        created_at: new Date().toISOString()
    };

    try {
        await broadcastMensaje(supabase.channel(CHAT_CHANNEL), 'INSERT', payload);
        console.log('📞 Notificación de llamada enviada a:', toUserId);
    } catch (error) {
        console.error('❌ Error enviando notificación:', error);
    }
}

/**
 * Guarda llamada en localStorage
 */
function guardarLlamadaLocal(call) {
    try {
        const calls = JSON.parse(localStorage.getItem('marquinhos_llamadas') || '[]');
        calls.push(call);
        localStorage.setItem('marquinhos_llamadas', JSON.stringify(calls));
    } catch (e) {
        console.warn('⚠️ Error guardando llamada en localStorage:', e);
    }
}