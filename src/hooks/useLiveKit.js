// ================================================================
// 📹 useLiveKit - CSARIEL'S ECOSYSTEM
// ================================================================
// Hook personalizado para gestionar LiveKit (transmisiones en vivo).
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import livekitService from '../services/livekitService.js';
import { getCurrentUser } from './useAuth.js';

// ================================================================
// 📦 ESTADO
// ================================================================

let liveKitState = {
    isConnected: false,
    isTransmitting: false,
    isScreenSharing: false,
    micEnabled: false,
    camEnabled: false,
    roomName: null,
    participants: [],
    localStream: null,
    remoteStreams: new Map(),
    error: null,
    isLoading: false
};

let listeners = [];
let roomInstance = null;

// ================================================================
# 🔔 FUNCIONES DE LIVEKIT
// ================================================================

/**
 * Notifica a todos los listeners del cambio de estado
 */
function notifyListeners() {
    listeners.forEach(callback => {
        try {
            callback({ ...liveKitState });
        } catch (e) {
            console.warn('Error en listener de LiveKit:', e);
        }
    });
}

// ================================================================
# 🚀 INICIAR TRANSMISIÓN
// ================================================================

export async function startLiveStream(titulo = 'Live Stream') {
    try {
        liveKitState.isLoading = true;
        liveKitState.error = null;
        notifyListeners();

        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const result = await livekitService.startLiveStream(user.id, titulo);
        
        // Actualizar estado
        liveKitState.isConnected = true;
        liveKitState.isTransmitting = true;
        liveKitState.roomName = result.roomName;
        liveKitState.participants = livekitService.getParticipants();
        liveKitState.localStream = livekitService.getLocalStream();
        liveKitState.micEnabled = true;
        liveKitState.camEnabled = true;
        liveKitState.error = null;
        liveKitState.isLoading = false;

        roomInstance = result.room;

        // Configurar eventos
        setupLiveKitEvents();

        notifyListeners();
        return result;

    } catch (error) {
        console.error('❌ Error iniciando live:', error);
        liveKitState.error = error.message;
        liveKitState.isLoading = false;
        notifyListeners();
        throw error;
    }
}

// ================================================================
# 🎬 UNIRSE A TRANSMISIÓN
// ================================================================

export async function joinLiveStream(roomName) {
    try {
        liveKitState.isLoading = true;
        liveKitState.error = null;
        notifyListeners();

        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const result = await livekitService.joinLiveStream(roomName);
        
        // Actualizar estado
        liveKitState.isConnected = true;
        liveKitState.isTransmitting = false;
        liveKitState.roomName = roomName;
        liveKitState.participants = livekitService.getParticipants();
        liveKitState.remoteStreams = livekitService.getRemoteStreams();
        liveKitState.error = null;
        liveKitState.isLoading = false;

        roomInstance = result.room;

        // Configurar eventos
        setupLiveKitEvents();

        notifyListeners();
        return result;

    } catch (error) {
        console.error('❌ Error uniéndose al live:', error);
        liveKitState.error = error.message;
        liveKitState.isLoading = false;
        notifyListeners();
        throw error;
    }
}

// ================================================================
# 📞 INICIAR LLAMADA
// ================================================================

export async function startCall(targetUserId, options = {}) {
    try {
        liveKitState.isLoading = true;
        liveKitState.error = null;
        notifyListeners();

        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const result = await livekitService.startCall(user.id, targetUserId, options);
        
        liveKitState.isConnected = true;
        liveKitState.isTransmitting = true;
        liveKitState.roomName = result.roomName;
        liveKitState.micEnabled = true;
        liveKitState.camEnabled = options.video || false;
        liveKitState.error = null;
        liveKitState.isLoading = false;

        roomInstance = result.room;
        setupLiveKitEvents();

        notifyListeners();
        return result;

    } catch (error) {
        console.error('❌ Error iniciando llamada:', error);
        liveKitState.error = error.message;
        liveKitState.isLoading = false;
        notifyListeners();
        throw error;
    }
}

// ================================================================
# 📞 UNIRSE A LLAMADA
// ================================================================

export async function joinCall(roomName) {
    try {
        liveKitState.isLoading = true;
        liveKitState.error = null;
        notifyListeners();

        const result = await livekitService.joinCall(roomName);
        
        liveKitState.isConnected = true;
        liveKitState.isTransmitting = false;
        liveKitState.roomName = roomName;
        liveKitState.error = null;
        liveKitState.isLoading = false;

        roomInstance = result.room;
        setupLiveKitEvents();

        notifyListeners();
        return result;

    } catch (error) {
        console.error('❌ Error uniéndose a llamada:', error);
        liveKitState.error = error.message;
        liveKitState.isLoading = false;
        notifyListeners();
        throw error;
    }
}

// ================================================================
# ⏹️ TERMINAR TRANSMISIÓN/LLAMADA
// ================================================================

export async function endLive() {
    try {
        liveKitState.isLoading = true;
        notifyListeners();

        await livekitService.endCall();

        liveKitState.isConnected = false;
        liveKitState.isTransmitting = false;
        liveKitState.isScreenSharing = false;
        liveKitState.micEnabled = false;
        liveKitState.camEnabled = false;
        liveKitState.roomName = null;
        liveKitState.participants = [];
        liveKitState.localStream = null;
        liveKitState.remoteStreams = new Map();
        liveKitState.error = null;
        liveKitState.isLoading = false;

        roomInstance = null;

        notifyListeners();
        console.log('⏹️ Live/Llamada finalizada');

    } catch (error) {
        console.error('❌ Error finalizando:', error);
        liveKitState.error = error.message;
        liveKitState.isLoading = false;
        notifyListeners();
        throw error;
    }
}

// ================================================================
# 🎤 CONTROLES
// ================================================================

export async function toggleMic() {
    try {
        const enabled = !liveKitState.micEnabled;
        await livekitService.toggleMic(enabled);
        liveKitState.micEnabled = enabled;
        notifyListeners();
        return enabled;
    } catch (error) {
        console.error('❌ Error alternando micrófono:', error);
        throw error;
    }
}

export async function toggleCam() {
    try {
        const enabled = !liveKitState.camEnabled;
        await livekitService.toggleCam(enabled);
        liveKitState.camEnabled = enabled;
        notifyListeners();
        return enabled;
    } catch (error) {
        console.error('❌ Error alternando cámara:', error);
        throw error;
    }
}

export async function toggleScreenShare() {
    try {
        const enabled = !liveKitState.isScreenSharing;
        await livekitService.toggleScreenShare(enabled);
        liveKitState.isScreenSharing = enabled;
        notifyListeners();
        return enabled;
    } catch (error) {
        console.error('❌ Error alternando pantalla compartida:', error);
        throw error;
    }
}

// ================================================================
# 📊 OBTENER ESTADO
// ================================================================

export function useLiveKit() {
    return { ...liveKitState };
}

export function getLiveKitState() {
    return { ...liveKitState };
}

export function isConnected() {
    return liveKitState.isConnected;
}

export function isTransmitting() {
    return liveKitState.isTransmitting;
}

// ================================================================
# 👂 SUSCRIBIRSE A CAMBIOS
// ================================================================

export function subscribeToLiveKit(callback) {
    if (typeof callback === 'function') {
        listeners.push(callback);
        callback({ ...liveKitState });
    }
    return () => {
        listeners = listeners.filter(cb => cb !== callback);
    };
}

// ================================================================
# 🎬 EVENTOS DE LIVEKIT
// ================================================================

function setupLiveKitEvents() {
    if (!roomInstance) return;

    // Participante conectado
    livekitService.on('participantConnected', (participant) => {
        liveKitState.participants = livekitService.getParticipants();
        notifyListeners();
        console.log('👤 Participante conectado:', participant.identity);
    });

    // Participante desconectado
    livekitService.on('participantDisconnected', (participant) => {
        liveKitState.participants = livekitService.getParticipants();
        notifyListeners();
        console.log('👤 Participante desconectado:', participant.identity);
    });

    // Track suscrito (stream remoto)
    livekitService.on('trackSubscribed', (data) => {
        liveKitState.remoteStreams = livekitService.getRemoteStreams();
        notifyListeners();
        console.log('📹 Track suscrito:', data.participant.identity);
    });

    // Track no suscrito
    livekitService.on('trackUnsubscribed', (data) => {
        liveKitState.remoteStreams = livekitService.getRemoteStreams();
        notifyListeners();
        console.log('📹 Track no suscrito:', data.participant.identity);
    });

    // Desconexión
    livekitService.on('disconnected', () => {
        liveKitState.isConnected = false;
        liveKitState.isTransmitting = false;
        notifyListeners();
        console.log('❌ Desconectado de LiveKit');
    });
}

// ================================================================
# 🚀 INICIALIZAR
// ================================================================

export function initLiveKitHook() {
    try {
        livekitService.loadLiveKitSDK().then(() => {
            console.log('📹 LiveKit hook inicializado');
        }).catch(err => {
            console.warn('⚠️ LiveKit SDK no cargado:', err);
        });
    } catch (error) {
        console.error('❌ Error inicializando LiveKit hook:', error);
    }
}

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    startLiveStream,
    joinLiveStream,
    startCall,
    joinCall,
    endLive,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    useLiveKit,
    getLiveKitState,
    isConnected,
    isTransmitting,
    subscribeToLiveKit,
    initLiveKitHook
};

console.log('📹 useLiveKit cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');