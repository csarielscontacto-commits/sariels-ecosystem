// js/plugins/plugin-live.js
import { supabase, CHAT_CHANNEL, broadcastMensaje, obtenerUserId } from '../utils/supabaseClient.js';

// ================================================================
// PLUGIN DE LLAMADAS Y TRANSMISIONES - Marquinhos
// ================================================================

let roomInstance = null;
let isInCall = false;
let callListeners = [];
let animacionActiva = false;

// ================================================================
// NUEVO: REFERENCIA AL SISTEMA COMMIT (CMT)
// ================================================================

const Commit = typeof window !== 'undefined' && window.Commit ? window.Commit : null;

if (!Commit) {
    console.warn('⚠️ window.Commit no disponible. Los stickers y animaciones no funcionarán en lives.');
}

export const livePlugin = {
    /**
     * Inicia una llamada de voz o video
     */
    startCall: async (targetUserId, options = { video: false }) => {
        try {
            const userId = await obtenerUserId();
            const roomName = generarRoomId(userId, targetUserId);
            
            await notificarLlamada(userId, targetUserId, roomName, options.video);
            
            console.log(`📞 Llamada iniciada a ${targetUserId} en sala ${roomName}`);
            
            const call = {
                roomName: roomName,
                participants: [userId, targetUserId],
                isVideo: options.video || false,
                startTime: new Date().toISOString(),
                status: 'connecting'
            };
            
            guardarLlamadaLocal(call);
            
            callListeners.forEach(fn => fn({ type: 'call_started', call }));
            
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
                roomInstance = null;
            }
            isInCall = false;
            callListeners.forEach(fn => fn({ type: 'call_ended' }));
            console.log('📞 Llamada terminada');
            
            // Limpiar animaciones
            limpiarAnimaciones();
            
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
            
            const liveMsg = {
                user_id: userId,
                type: 'live_started',
                room: roomName,
                title: streamTitle,
                created_at: new Date().toISOString()
            };
            
            await broadcastMensaje(supabase.channel(CHAT_CHANNEL), 'INSERT', liveMsg);
            
            // ===== SUSCRIBIRSE A EVENTOS DE STICKERS EN VIVO =====
            this.suscribirseEventosStickers(roomName);
            
            // Simular conteo de viewers
            const intervalId = setInterval(() => {
                stream.viewers = Math.floor(Math.random() * 50) + 1;
                callListeners.forEach(fn => fn({ type: 'live_viewers', stream }));
            }, 5000);
            
            // Guardar intervalo para limpiar después
            stream._intervalId = intervalId;
            
            return stream;
        } catch (error) {
            console.error('❌ Error iniciando transmisión:', error);
            throw error;
        }
    },

    /**
     * 🆕 Suscribirse a eventos de stickers en el live
     */
    suscribirseEventosStickers: (roomName) => {
        console.log(`🎁 Escuchando stickers en live: ${roomName}`);
        
        // Escuchar evento global de stickers
        document.addEventListener('sticker:enviado', (event) => {
            const { detail } = event;
            console.log(`🎁 Sticker recibido en live: ${detail.asset_name}`, detail);
            
            // Verificar que es para este live (si tiene room)
            if (detail.room && detail.room !== roomName) return;
            
            // Mostrar animación según el tipo
            switch (detail.animation_type) {
                case 'cohete':
                    this.mostrarAnimacionCohete(detail);
                    break;
                case 'legendario':
                    this.mostrarAnimacionLegendario(detail);
                    break;
                default:
                    this.mostrarNotificacionSticker(detail);
                    break;
            }
        });

        // Escuchar evento de regalos P2P
        document.addEventListener('regalo:enviado', (event) => {
            const { detail } = event;
            console.log(`💰 Regalo recibido en live: ${detail.amount} CMT`, detail);
            
            if (detail.room && detail.room !== roomName) return;
            
            this.mostrarNotificacionRegalo(detail);
        });
    },

    /**
     * 🆕 Mostrar animación del Diamante Cohete
     */
    mostrarAnimacionCohete: (detail) => {
        if (animacionActiva) {
            // Si hay una animación activa, esperar
            setTimeout(() => this.mostrarAnimacionCohete(detail), 1000);
            return;
        }
        
        animacionActiva = true;
        
        const { asset_name, emoji, sender, receiver, amount, color } = detail;
        
        // 1. Mostrar notificación de entrada
        this.mostrarNotificacionSticker(detail);
        
        // 2. Crear contenedor de animación
        const container = document.createElement('div');
        container.id = 'animacion-cohete';
        container.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99998;
            pointer-events: none;
            overflow: hidden;
        `;
        document.body.appendChild(container);
        
        // 3. Crear el cohete
        const cohete = document.createElement('div');
        cohete.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            font-size: 4rem;
            animation: cohete-subir 3s ease-out forwards;
            filter: drop-shadow(0 0 30px ${color || '#00BFFF'});
        `;
        cohete.textContent = '🚀';
        container.appendChild(cohete);
        
        // 4. Estilos de animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cohete-subir {
                0% { bottom: 0; transform: translateX(-50%) scale(0.5) rotate(-10deg); opacity: 0; }
                20% { bottom: 20%; transform: translateX(-50%) scale(1.2) rotate(5deg); opacity: 1; }
                60% { bottom: 60%; transform: translateX(-50%) scale(1) rotate(0deg); opacity: 1; }
                90% { bottom: 80%; transform: translateX(-50%) scale(1.5) rotate(10deg); opacity: 1; }
                100% { bottom: 90%; transform: translateX(-50%) scale(0) rotate(20deg); opacity: 0; }
            }
            @keyframes diamante-lluvia {
                0% { opacity: 1; transform: translateY(0) scale(1); }
                100% { opacity: 0; transform: translateY(200px) scale(0.5); }
            }
            @keyframes brillo-cohete {
                0%, 100% { filter: drop-shadow(0 0 30px ${color || '#00BFFF'}); }
                50% { filter: drop-shadow(0 0 60px ${color || '#00BFFF'}); }
            }
        `;
        document.head.appendChild(style);
        
        // 5. Explosión de diamantes (al llegar al centro)
        setTimeout(() => {
            const diamantes = ['💎', '✨', '🌟', '💠', '🔹', '🔷'];
            for (let i = 0; i < 30; i++) {
                const diamante = document.createElement('div');
                const angle = Math.random() * 360;
                const distance = 100 + Math.random() * 300;
                const x = Math.cos(angle * Math.PI / 180) * distance;
                const y = Math.sin(angle * Math.PI / 180) * distance;
                
                diamante.textContent = diamantes[Math.floor(Math.random() * diamantes.length)];
                diamante.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    font-size: ${1 + Math.random() * 2}rem;
                    animation: diamante-lluvia ${1 + Math.random()}s ease-out forwards;
                    transform: translate(${x}px, ${y}px);
                    opacity: 1;
                    filter: drop-shadow(0 0 10px ${color || '#00BFFF'});
                `;
                container.appendChild(diamante);
            }
            
            // 6. Mensaje de texto
            const texto = document.createElement('div');
            texto.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Orbitron', monospace;
                font-size: 2rem;
                font-weight: 700;
                color: ${color || '#00BFFF'};
                text-shadow: 0 0 40px ${color || '#00BFFF'};
                animation: fadeOut 2s ease-out forwards;
                pointer-events: none;
                text-align: center;
                line-height: 1.4;
            `;
            texto.innerHTML = `
                💎 ${asset_name || 'Diamante Cohete'}! 💎<br>
                <span style="font-size:1rem;color:white;">
                    ${sender || 'Alguien'} → ${receiver || 'el streamer'}
                </span>
                <br>
                <span style="font-size:0.8rem;color:${color || '#00BFFF'};">
                    ${amount || 0} CMT
                </span>
            `;
            container.appendChild(texto);
            
            // 7. Limpiar después de la animación
            setTimeout(() => {
                container.remove();
                animacionActiva = false;
            }, 4000);
            
        }, 2500); // Cuando el cohete está en el centro
    },

    /**
     * 🆕 Mostrar animación del Cubo Legendario
     */
    mostrarAnimacionLegendario: (detail) => {
        if (animacionActiva) {
            setTimeout(() => this.mostrarAnimacionLegendario(detail), 1500);
            return;
        }
        
        animacionActiva = true;
        
        const { asset_name, emoji, sender, receiver, amount, color } = detail;
        
        // 1. Mostrar notificación de entrada
        this.mostrarNotificacionSticker(detail);
        
        // 2. Crear contenedor
        const container = document.createElement('div');
        container.id = 'animacion-legendario';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99998;
            pointer-events: none;
            overflow: hidden;
            background: radial-gradient(circle, rgba(255,107,0,0.1), transparent 70%);
        `;
        document.body.appendChild(container);
        
        // 3. Cubo Legendario
        const cubo = document.createElement('div');
        cubo.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 8rem;
            animation: cubo-aparecer 1s ease-out forwards;
            filter: drop-shadow(0 0 60px ${color || '#FF6B00'});
        `;
        cubo.textContent = '⭐';
        container.appendChild(cubo);
        
        // 4. Destellos estelares
        const estilos = document.createElement('style');
        estilos.textContent = `
            @keyframes cubo-aparecer {
                0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.5) rotate(180deg); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1) rotate(360deg); opacity: 1; }
            }
            @keyframes destello-legendario {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.5); opacity: 1; }
                100% { transform: scale(2); opacity: 0; }
            }
            @keyframes particula-legendaria {
                0% { transform: translate(0,0) scale(0); opacity: 1; }
                100% { transform: translate(var(--tx), var(--ty)) scale(0.5); opacity: 0; }
            }
            @keyframes glow-legendario {
                0%, 100% { filter: drop-shadow(0 0 40px ${color || '#FF6B00'}); }
                50% { filter: drop-shadow(0 0 100px ${color || '#FF6B00'}); }
            }
            .glow-legendario {
                animation: glow-legendario 1s ease-in-out infinite alternate;
            }
        `;
        document.head.appendChild(estilos);
        
        // 5. Destello central (abrir el cubo)
        setTimeout(() => {
            const destello = document.createElement('div');
            destello.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 300px;
                height: 300px;
                background: radial-gradient(circle, ${color || '#FF6B00'}, transparent 70%);
                border-radius: 50%;
                animation: destello-legendario 1.5s ease-out forwards;
                opacity: 0;
            `;
            container.appendChild(destello);
            
            // 6. Partículas estelares (estrellas expandiéndose)
            const estrellas = ['⭐', '✨', '🌟', '💫', '✨', '⭐'];
            for (let i = 0; i < 40; i++) {
                const estrella = document.createElement('div');
                const angle = Math.random() * 360;
                const distance = 150 + Math.random() * 400;
                const tx = Math.cos(angle * Math.PI / 180) * distance;
                const ty = Math.sin(angle * Math.PI / 180) * distance;
                
                estrella.textContent = estrellas[Math.floor(Math.random() * estrellas.length)];
                estrella.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    font-size: ${0.8 + Math.random() * 1.5}rem;
                    --tx: ${tx}px;
                    --ty: ${ty}px;
                    animation: particula-legendaria ${1 + Math.random() * 2}s ease-out forwards;
                    color: ${['#FFD700', '#FF6B00', '#FF4500', '#FFD700', '#FFA500'][Math.floor(Math.random() * 5)]};
                    filter: drop-shadow(0 0 20px ${color || '#FF6B00'});
                `;
                container.appendChild(estrella);
            }
            
            // 7. Mensaje épico
            const texto = document.createElement('div');
            texto.style.cssText = `
                position: absolute;
                top: 55%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Orbitron', monospace;
                font-size: 2.5rem;
                font-weight: 900;
                color: ${color || '#FF6B00'};
                text-shadow: 0 0 60px ${color || '#FF6B00'};
                animation: fadeOut 3s ease-out forwards;
                pointer-events: none;
                text-align: center;
                line-height: 1.6;
            `;
            texto.innerHTML = `
                ⭐ ${asset_name || 'CUBO LEGENDARIO'}! ⭐<br>
                <span style="font-size:1.2rem;color:white;text-shadow:0 0 20px rgba(255,255,255,0.3);">
                    ${sender || 'Alguien'} → ${receiver || 'el streamer'}
                </span>
                <br>
                <span style="font-size:1rem;color:${color || '#FF6B00'};">
                    ✨ ${amount || 0} CMT ✨
                </span>
            `;
            container.appendChild(texto);
            
            // 8. Limpiar
            setTimeout(() => {
                container.remove();
                animacionActiva = false;
            }, 4000);
            
        }, 1000);
    },

    /**
     * 🆕 Mostrar notificación de sticker en pantalla
     */
    mostrarNotificacionSticker: (detail) => {
        const { asset_name, emoji, sender, receiver, amount, color } = detail;
        
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 20%;
            right: 20px;
            z-index: 99997;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(10px);
            border: 1px solid ${color || '#f7d44a'};
            border-radius: 12px;
            padding: 12px 20px;
            color: white;
            font-family: 'Space Grotesk', sans-serif;
            animation: slideInRight 0.5s ease-out forwards;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            max-width: 300px;
        `;
        notificacion.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:2rem;">${emoji || '🎁'}</span>
                <div>
                    <div style="font-weight:600;font-size:0.9rem;color:${color || '#f7d44a'};">
                        ${asset_name || 'Sticker'}
                    </div>
                    <div style="font-size:0.75rem;color:#8ba3c7;">
                        ${sender || 'Alguien'} → ${receiver || 'el streamer'}
                    </div>
                    <div style="font-size:0.65rem;color:${color || '#f7d44a'};font-family:'Orbitron',monospace;">
                        ${amount || 0} CMT
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(notificacion);
        
        // Estilo de animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            notificacion.style.opacity = '0';
            notificacion.style.transform = 'translateX(50px)';
            notificacion.style.transition = 'all 0.5s ease';
            setTimeout(() => notificacion.remove(), 500);
        }, 4000);
    },

    /**
     * 🆕 Mostrar notificación de regalo P2P
     */
    mostrarNotificacionRegalo: (detail) => {
        const { sender, receiver, amount, commission } = detail;
        
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 30%;
            right: 20px;
            z-index: 99997;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(10px);
            border: 1px solid #f7d44a;
            border-radius: 12px;
            padding: 12px 20px;
            color: white;
            font-family: 'Space Grotesk', sans-serif;
            animation: slideInRight 0.5s ease-out forwards;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            max-width: 300px;
        `;
        notificacion.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:2rem;">💰</span>
                <div>
                    <div style="font-weight:600;font-size:0.9rem;color:#f7d44a;">
                        ${amount || 0} CMT
                    </div>
                    <div style="font-size:0.75rem;color:#8ba3c7;">
                        ${sender || 'Alguien'} → ${receiver || 'el streamer'}
                    </div>
                    <div style="font-size:0.6rem;color:#4a6a8a;">
                        Comisión 50%: ${commission || 0} CMT
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.opacity = '0';
            notificacion.style.transform = 'translateX(50px)';
            notificacion.style.transition = 'all 0.5s ease';
            setTimeout(() => notificacion.remove(), 500);
        }, 4000);
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

/**
 * Limpia todas las animaciones activas
 */
function limpiarAnimaciones() {
    document.querySelectorAll('#animacion-cohete, #animacion-legendario').forEach(el => el.remove());
    animacionActiva = false;
}