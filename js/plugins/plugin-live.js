// js/plugins/plugin-live.js
// Módulo Live para Csariel's Ecosystem con LiveKit

// ================================================================
// DEPENDENCIAS
// ================================================================
// Este archivo debe cargarse después de client-config-loader.js
// El SDK de LiveKit se carga desde CDN o se importa dinámicamente

// ================================================================
// CONFIGURACIÓN
// ================================================================
const LIVEKIT_CONFIG = {
    url: null,
    token: null,
    roomName: null,
    participantIdentity: null
};

// ================================================================
// ESTADO
// ================================================================
let liveKitRoom = null;
let isConnected = false;
let isTransmitting = false;
let localStream = null;
let remoteStreams = new Map();
let eventCallbacks = {};
let isSDKLoaded = false;

// ================================================================
// FUNCIONES PRINCIPALES
// ================================================================

/**
 * Obtiene un token de LiveKit desde el endpoint serverless
 */
async function obtenerTokenLiveKit(roomName, participantName, participantIdentity) {
    try {
        const response = await fetch('/api/livekit-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomName,
                participantName,
                participantIdentity
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener token');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error obteniendo token LiveKit:', error);
        throw error;
    }
}

/**
 * Carga el SDK de LiveKit desde CDN
 */
function loadLiveKitSDK() {
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (typeof LivekitClient !== 'undefined') {
            isSDKLoaded = true;
            console.log('✅ LiveKit SDK ya estaba cargado');
            return resolve();
        }

        // Cargar desde CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/livekit-client@1.15.0/dist/livekit-client.umd.min.js';
        script.onload = () => {
            isSDKLoaded = true;
            console.log('✅ LiveKit SDK cargado desde CDN');
            resolve();
        };
        script.onerror = () => {
            reject(new Error('Error cargando LiveKit SDK desde CDN'));
        };
        document.head.appendChild(script);
    });
}

/**
 * Conecta a una sala de LiveKit
 */
async function connectToLiveKit(roomName, participantName, participantIdentity, options = {}) {
    try {
        // Asegurar que el SDK esté cargado
        if (!isSDKLoaded) {
            await loadLiveKitSDK();
        }

        // Verificar que el SDK esté disponible
        if (typeof LivekitClient === 'undefined') {
            throw new Error('SDK de LiveKit no disponible');
        }

        // Obtener token
        const { token, url } = await obtenerTokenLiveKit(
            roomName,
            participantName,
            participantIdentity
        );

        LIVEKIT_CONFIG.url = url;
        LIVEKIT_CONFIG.token = token;
        LIVEKIT_CONFIG.roomName = roomName;
        LIVEKIT_CONFIG.participantIdentity = participantIdentity;

        // Crear sala con opciones
        const roomOptions = {
            adaptiveStream: true,
            dynacast: true,
            ...options
        };

        liveKitRoom = new LivekitClient.Room(roomOptions);

        // Eventos de la sala
        liveKitRoom.on('connected', () => {
            isConnected = true;
            console.log('✅ Conectado a LiveKit:', roomName);
            emit('connected', { roomName, participantIdentity });
        });

        liveKitRoom.on('disconnected', () => {
            isConnected = false;
            isTransmitting = false;
            console.log('❌ Desconectado de LiveKit');
            emit('disconnected', { roomName });
        });

        liveKitRoom.on('participantConnected', (participant) => {
            console.log('👤 Participante conectado:', participant.identity);
            emit('participantConnected', participant);
        });

        liveKitRoom.on('participantDisconnected', (participant) => {
            console.log('👤 Participante desconectado:', participant.identity);
            emit('participantDisconnected', participant);
        });

        liveKitRoom.on('trackPublished', (publication, participant) => {
            console.log('📹 Track publicado:', publication.kind, 'por', participant.identity);
            emit('trackPublished', { publication, participant });
        });

        liveKitRoom.on('trackSubscribed', (publication, participant) => {
            console.log('📹 Track suscrito:', publication.kind, 'de', participant.identity);
            if (publication.track) {
                remoteStreams.set(participant.identity, publication.track);
                emit('trackSubscribed', { publication, participant });
            }
        });

        liveKitRoom.on('trackUnsubscribed', (publication, participant) => {
            console.log('📹 Track no suscrito:', publication.kind, 'de', participant.identity);
            remoteStreams.delete(participant.identity);
            emit('trackUnsubscribed', { publication, participant });
        });

        // Conectar a la sala
        await liveKitRoom.connect(url, token);

        return {
            room: liveKitRoom,
            token,
            url
        };

    } catch (error) {
        console.error('❌ Error conectando a LiveKit:', error);
        throw error;
    }
}

/**
 * Desconecta de la sala de LiveKit
 */
async function disconnectFromLiveKit() {
    try {
        if (liveKitRoom) {
            // Detener publicaciones
            if (isTransmitting) {
                await liveKitRoom.localParticipant.setCameraEnabled(false);
                await liveKitRoom.localParticipant.setMicrophoneEnabled(false);
                isTransmitting = false;
            }

            await liveKitRoom.disconnect();
            liveKitRoom = null;
            isConnected = false;
            remoteStreams.clear();
            emit('disconnected', {});
            console.log('✅ Desconectado de LiveKit');
        }
    } catch (error) {
        console.error('❌ Error desconectando de LiveKit:', error);
        throw error;
    }
}

/**
 * Publica el stream local (cámara y micrófono)
 */
async function publicarStream() {
    try {
        if (!liveKitRoom || !isConnected) {
            throw new Error('No conectado a una sala de LiveKit');
        }

        // Activar cámara y micrófono
        await liveKitRoom.localParticipant.setCameraEnabled(true);
        await liveKitRoom.localParticipant.setMicrophoneEnabled(true);
        
        isTransmitting = true;
        console.log('📹 Stream local publicado');
        emit('streamPublished', {});

        // ✅ CORREGIDO: Usar LivekitClient.Track.Source.Camera
        const videoTrack = liveKitRoom.localParticipant.getTrackPublication(LivekitClient.Track.Source.Camera);
        if (videoTrack && videoTrack.track) {
            const stream = new MediaStream([videoTrack.track.mediaStreamTrack]);
            localStream = stream;
            emit('localStreamAvailable', { stream });
        }

    } catch (error) {
        console.error('❌ Error publicando stream:', error);
        throw error;
    }
}

/**
 * Deja de publicar el stream local
 */
async function dejarDePublicar() {
    try {
        if (liveKitRoom && isConnected) {
            await liveKitRoom.localParticipant.setCameraEnabled(false);
            await liveKitRoom.localParticipant.setMicrophoneEnabled(false);
            isTransmitting = false;
            localStream = null;
            console.log('⏹️ Stream local detenido');
            emit('streamStopped', {});
        }
    } catch (error) {
        console.error('❌ Error deteniendo stream:', error);
        throw error;
    }
}

/**
 * Alterna el estado del micrófono
 */
async function toggleMic(enabled) {
    try {
        if (!liveKitRoom || !isConnected) return;
        await liveKitRoom.localParticipant.setMicrophoneEnabled(enabled);
        console.log(`🎤 Micrófono ${enabled ? 'activado' : 'desactivado'}`);
    } catch (error) {
        console.error('❌ Error alternando micrófono:', error);
    }
}

/**
 * Alterna el estado de la cámara
 */
async function toggleCam(enabled) {
    try {
        if (!liveKitRoom || !isConnected) return;
        await liveKitRoom.localParticipant.setCameraEnabled(enabled);
        console.log(`📷 Cámara ${enabled ? 'activada' : 'desactivada'}`);
    } catch (error) {
        console.error('❌ Error alternando cámara:', error);
    }
}

/**
 * Obtiene el stream local (para mostrar en video)
 */
function getLocalStream() {
    if (!liveKitRoom || !isConnected) return null;
    
    // ✅ CORREGIDO: Usar LivekitClient.Track.Source.Camera
    const videoTrack = liveKitRoom.localParticipant.getTrackPublication(LivekitClient.Track.Source.Camera);
    if (videoTrack && videoTrack.track) {
        return new MediaStream([videoTrack.track.mediaStreamTrack]);
    }
    return null;
}

/**
 * Obtiene la sala actual
 */
function getRoom() {
    return liveKitRoom;
}

/**
 * Verifica si está conectado
 */
function isConnectedFn() {
    return isConnected;
}

/**
 * Verifica si está transmitiendo
 */
function isTransmittingFn() {
    return isTransmitting;
}

/**
 * Obtiene los streams remotos
 */
function getRemoteStreams() {
    return remoteStreams;
}

// ================================================================
// EVENTOS
// ================================================================

function on(event, callback) {
    if (!eventCallbacks[event]) {
        eventCallbacks[event] = [];
    }
    eventCallbacks[event].push(callback);
}

function emit(event, data) {
    if (eventCallbacks[event]) {
        eventCallbacks[event].forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error('Error en callback de evento:', e);
            }
        });
    }
}

// ================================================================
// API PÚBLICA DEL PLUGIN
// ================================================================

const livePlugin = {
    // Conexión
    connect: connectToLiveKit,
    disconnect: disconnectFromLiveKit,
    isConnected: isConnectedFn,

    // Stream
    publishStream: publicarStream,
    stopStream: dejarDePublicar,
    isTransmitting: isTransmittingFn,

    // Controles
    toggleMic: toggleMic,
    toggleCam: toggleCam,

    // Obtener estado
    getRoom: getRoom,
    getLocalStream: getLocalStream,
    getRemoteStreams: getRemoteStreams,

    // Eventos
    on: on,

    // Callbacks legacy (para compatibilidad)
    onCallEvent: (callback) => {
        on('connected', callback);
        on('disconnected', callback);
        on('participantConnected', callback);
        on('participantDisconnected', callback);
    },

    // Métodos legacy (para compatibilidad con marquinhos-engine.js)
    startCall: async (userId, targetUserId, options = {}) => {
        const roomName = `call_${Date.now()}`;
        const participantIdentity = userId;
        const participantName = 'Usuario';
        return await connectToLiveKit(roomName, participantName, participantIdentity, options);
    },

    joinCall: async (roomName) => {
        const userId = localStorage.getItem('csariels_user_id') || 'user_' + Date.now();
        const participantIdentity = userId;
        const participantName = 'Usuario';
        return await connectToLiveKit(roomName, participantName, participantIdentity);
    },

    endCall: disconnectFromLiveKit,
    isInCall: isConnectedFn,

    startLiveStream: async (userId, titulo) => {
        const roomName = `live_${userId}_${Date.now()}`;
        const participantIdentity = userId;
        const participantName = titulo || 'Live';
        const result = await connectToLiveKit(roomName, participantName, participantIdentity);
        await publicarStream();
        return result;
    },

    joinLiveStream: async (roomName) => {
        const userId = localStorage.getItem('csariels_user_id') || 'user_' + Date.now();
        const participantIdentity = userId;
        const participantName = 'Espectador';
        return await connectToLiveKit(roomName, participantName, participantIdentity);
    }
};

// ================================================================
// EXPONER GLOBALMENTE (SIN "export")
// ================================================================
window.livePlugin = livePlugin;

// Cargar SDK en segundo plano si no está disponible
if (typeof window !== 'undefined' && typeof LivekitClient === 'undefined') {
    loadLiveKitSDK().catch(e => console.warn('⚠️ LiveKit SDK no cargado:', e.message));
}

console.log('📹 Plugin Live (LiveKit) cargado correctamente');