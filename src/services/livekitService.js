// ================================================================
// 📹 LIVEKIT SERVICE - CSARIEL'S ECOSYSTEM (ESCALA MUNDIAL)
// ================================================================
// Servicio unificado para transmisiones en vivo con LiveKit.
// Soporte para WebRTC, SFU, y escala global.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// 📦 DEPENDENCIAS
// ================================================================

let LivekitClient = null;
let isSDKLoaded = false;

// ================================================================
// 🔌 CONFIGURACIÓN
// ================================================================

const LIVEKIT_CONFIG = {
    url: null,
    token: null,
    roomName: null,
    participantIdentity: null
};

// ================================================================
// 📊 ESTADO
// ================================================================

let liveKitRoom = null;
let isConnected = false;
let isTransmitting = false;
let localStream = null;
let remoteStreams = new Map();
let eventCallbacks = {};
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// ================================================================
// 🚀 CARGAR SDK DE LIVEKIT
// ================================================================

export function loadLiveKitSDK() {
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (typeof LivekitClient !== 'undefined') {
            isSDKLoaded = true;
            console.log('✅ LiveKit SDK ya estaba cargado');
            return resolve();
        }

        // Verificar en window
        if (window.LivekitClient) {
            LivekitClient = window.LivekitClient;
            isSDKLoaded = true;
            console.log('✅ LiveKit SDK encontrado en window');
            return resolve();
        }

        // Cargar desde CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/livekit-client@1.15.0/dist/livekit-client.umd.min.js';
        script.onload = () => {
            LivekitClient = window.LivekitClient || window.livekit;
            if (LivekitClient) {
                isSDKLoaded = true;
                console.log('✅ LiveKit SDK cargado desde CDN');
                resolve();
            } else {
                reject(new Error('LiveKit SDK no se cargó correctamente'));
            }
        };
        script.onerror = () => {
            reject(new Error('Error cargando LiveKit SDK desde CDN'));
        };
        document.head.appendChild(script);
    });
}

// ================================================================
// 🔑 OBTENER TOKEN (desde API serverless)
// ================================================================

export async function obtenerTokenLiveKit(roomName, participantName, participantIdentity) {
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

        const data = await response.json();
        console.log('🔑 Token LiveKit obtenido correctamente');
        return data;
    } catch (error) {
        console.error('❌ Error obteniendo token LiveKit:', error);
        throw error;
    }
}

// ================================================================
# 🔌 CONECTAR A SALA
// ================================================================

export async function connectToLiveKit(roomName, participantName, participantIdentity, options = {}) {
    try {
        // Asegurar que el SDK esté cargado
        if (!isSDKLoaded) {
            await loadLiveKitSDK();
        }

        if (!LivekitClient) {
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

        // Crear sala con opciones optimizadas para escala mundial
        const roomOptions = {
            adaptiveStream: true,
            dynacast: true,
            stopLocalTrackOnUnpublish: true,
            publishDefaults: {
                videoSimulcastLayers: [
                    { width: 180, height: 120, bitrate: 40000 },
                    { width: 360, height: 240, bitrate: 150000 },
                    { width: 720, height: 480, bitrate: 500000 }
                ],
                videoCodec: 'vp8'
            },
            ...options
        };

        liveKitRoom = new LivekitClient.Room(roomOptions);

        // ===== EVENTOS DE LA SALA =====
        
        liveKitRoom.on('connected', () => {
            isConnected = true;
            reconnectAttempts = 0;
            console.log('✅ Conectado a LiveKit:', roomName);
            emit('connected', { roomName, participantIdentity });
        });

        liveKitRoom.on('disconnected', () => {
            isConnected = false;
            isTransmitting = false;
            console.log('❌ Desconectado de LiveKit');
            emit('disconnected', { roomName });
            
            // Intentar reconectar automáticamente
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(`🔄 Intento de reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
                setTimeout(() => {
                    if (!isConnected && liveKitRoom) {
                        liveKitRoom.reconnect();
                    }
                }, 2000 * reconnectAttempts);
            }
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

        liveKitRoom.on('connectionQualityChanged', (update) => {
            console.log(`📶 Calidad de conexión: ${update.quality}`);
            emit('connectionQualityChanged', update);
        });

        liveKitRoom.on('activeSpeakersChanged', (speakers) => {
            emit('activeSpeakersChanged', speakers);
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

// ================================================================
# ⏹️ DESCONECTAR
// ================================================================

export async function disconnectFromLiveKit() {
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

// ================================================================
# 📹 PUBLICAR STREAM
// ================================================================

export async function publishStream() {
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

        // Obtener track de video
        const videoTrack = liveKitRoom.localParticipant.getTrackPublication('video');
        if (videoTrack && videoTrack.track) {
            const stream = new MediaStream([videoTrack.track.mediaStreamTrack]);
            localStream = stream;
            emit('localStreamAvailable', { stream });
        }

        return true;
    } catch (error) {
        console.error('❌ Error publicando stream:', error);
        throw error;
    }
}

// ================================================================
# ⏹️ DEJAR DE PUBLICAR
// ================================================================

export async function stopPublishing() {
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

// ================================================================
# 🎤 CONTROLES
// ================================================================

export async function toggleMic(enabled) {
    try {
        if (!liveKitRoom || !isConnected) return;
        await liveKitRoom.localParticipant.setMicrophoneEnabled(enabled);
        console.log(`🎤 Micrófono ${enabled ? 'activado' : 'desactivado'}`);
        emit('micToggled', { enabled });
    } catch (error) {
        console.error('❌ Error alternando micrófono:', error);
    }
}

export async function toggleCam(enabled) {
    try {
        if (!liveKitRoom || !isConnected) return;
        await liveKitRoom.localParticipant.setCameraEnabled(enabled);
        console.log(`📷 Cámara ${enabled ? 'activada' : 'desactivada'}`);
        emit('camToggled', { enabled });
    } catch (error) {
        console.error('❌ Error alternando cámara:', error);
    }
}

export async function toggleScreenShare(enabled) {
    try {
        if (!liveKitRoom || !isConnected) return;
        if (enabled) {
            await liveKitRoom.localParticipant.setScreenShareEnabled(true);
        } else {
            await liveKitRoom.localParticipant.setScreenShareEnabled(false);
        }
        console.log(`🖥️ Compartir pantalla ${enabled ? 'activado' : 'desactivado'}`);
        emit('screenShareToggled', { enabled });
    } catch (error) {
        console.error('❌ Error alternando pantalla compartida:', error);
    }
}

// ================================================================
# 📊 OBTENER ESTADO
// ================================================================

export function getRoom() {
    return liveKitRoom;
}

export function isConnectedFn() {
    return isConnected;
}

export function isTransmittingFn() {
    return isTransmitting;
}

export function getLocalStream() {
    if (!liveKitRoom || !isConnected) return null;
    const videoTrack = liveKitRoom.localParticipant.getTrackPublication('video');
    if (videoTrack && videoTrack.track) {
        return new MediaStream([videoTrack.track.mediaStreamTrack]);
    }
    return null;
}

export function getRemoteStreams() {
    return remoteStreams;
}

export function getParticipants() {
    if (!liveKitRoom || !isConnected) return [];
    return Array.from(liveKitRoom.participants.values());
}

// ================================================================
# 📢 EVENTOS
// ================================================================

export function on(event, callback) {
    if (!eventCallbacks[event]) {
        eventCallbacks[event] = [];
    }
    eventCallbacks[event].push(callback);
}

export function off(event, callback) {
    if (eventCallbacks[event]) {
        eventCallbacks[event] = eventCallbacks[event].filter(cb => cb !== callback);
    }
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
# 🎬 MÉTODOS PARA LLAMADAS Y LIVE
// ================================================================

export async function startCall(userId, targetUserId, options = {}) {
    const roomName = `call_${userId}_${targetUserId}_${Date.now()}`;
    const participantIdentity = userId;
    const participantName = 'Usuario';
    return await connectToLiveKit(roomName, participantName, participantIdentity, options);
}

export async function joinCall(roomName) {
    const userId = localStorage.getItem('csariels_user_id') || 'user_' + Date.now();
    const participantIdentity = userId;
    const participantName = 'Usuario';
    return await connectToLiveKit(roomName, participantName, participantIdentity);
}

export async function endCall() {
    return await disconnectFromLiveKit();
}

export function isInCall() {
    return isConnected;
}

export async function startLiveStream(userId, titulo) {
    const roomName = `live_${userId}_${Date.now()}`;
    const participantIdentity = userId;
    const participantName = titulo || 'Live Stream';
    const result = await connectToLiveKit(roomName, participantName, participantIdentity);
    await publishStream();
    return result;
}

export async function joinLiveStream(roomName) {
    const userId = localStorage.getItem('csariels_user_id') || 'user_' + Date.now();
    const participantIdentity = userId;
    const participantName = 'Espectador';
    return await connectToLiveKit(roomName, participantName, participantIdentity);
}

// ================================================================
# 🚀 EXPORTAR API COMPLETA
// ================================================================

export const livekitService = {
    // Carga
    loadLiveKitSDK,
    
    // Conexión
    connect: connectToLiveKit,
    disconnect: disconnectFromLiveKit,
    isConnected: isConnectedFn,
    
    // Stream
    publishStream,
    stopPublishing,
    isTransmitting: isTransmittingFn,
    
    // Controles
    toggleMic,
    toggleCam,
    toggleScreenShare,
    
    // Estado
    getRoom,
    getLocalStream,
    getRemoteStreams,
    getParticipants,
    
    // Eventos
    on,
    off,
    
    // Llamadas
    startCall,
    joinCall,
    endCall,
    isInCall,
    
    // Live
    startLiveStream,
    joinLiveStream
};

// ================================================================
# 🚀 EXPORTAR POR DEFECTO
// ================================================================

export default livekitService;

// ================================================================
# 📋 LOG DE INICIO
// ================================================================

console.log('📹 LiveKit Service v3.0.0 cargado (Escala Mundial)');
console.log('📍 Hecho en Puebla, México 🇲🇽');
console.log('🌍 Compatible con WebRTC, SFU, y transmisiones globales');