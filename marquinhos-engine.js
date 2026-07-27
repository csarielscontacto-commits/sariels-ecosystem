// js/marquinhos-engine.js
import { M_CONFIG } from './marquinhos-config.js';
import { supabase } from './utils/supabaseClient.js';
import { chatPlugin } from './plugins/plugin-chat.js';
import { livePlugin } from './plugins/plugin-live.js';
import { moderacionAvanzada } from './plugins/plugin-moderacion-avanzada.js';
import { configTransmision } from './plugins/plugin-configuracion-transmision.js';

export const Engine = {
    // ================================================================
    // CONFIGURACIÓN
    // ================================================================
    config: M_CONFIG,
    
    // ================================================================
    // CHAT - Mensajes
    // ================================================================
    mensajes: [],
    chatChannel: null,

    conectar() {
        console.log('🔗 Engine: Conectando a Supabase...');
        
        // Conectar chat en tiempo real
        this.chatChannel = chatPlugin.listenMessages((mensaje) => {
            if (Array.isArray(mensaje)) {
                // Historial inicial
                this.mensajes = mensaje;
                this.notificarActualizacion();
            } else {
                // Nuevo mensaje en tiempo real
                this.mensajes.push(mensaje);
                this.notificarActualizacion();
            }
        });
        
        // Escuchar eventos de llamadas
        livePlugin.onCallEvent((event) => {
            console.log('📞 Evento de llamada:', event);
            this.notificarLlamada(event);
        });

        // Escuchar eventos de moderación
        document.addEventListener('moderacion:evento', (e) => {
            console.log('🛡️ Evento de moderación:', e.detail);
            this.notificarModeracion(e.detail);
        });

        // Escuchar eventos de configuración de transmisión
        document.addEventListener('participante:agregado', (e) => {
            console.log('👤 Participante agregado:', e.detail);
            this.notificarParticipante(e.detail);
        });

        document.addEventListener('camara:toggle', (e) => {
            console.log('📷 Cámara toggled:', e.detail);
        });

        document.addEventListener('juego:detectado', (e) => {
            console.log('🎮 Juego detectado:', e.detail);
        });

        document.addEventListener('metricas:actualizadas', (e) => {
            console.log('📊 Métricas actualizadas:', e.detail);
        });

        console.log('✅ Engine conectado con todas las funcionalidades');
        console.log('📹 Transmisiones: Individual | Grupal | Juegos');
        console.log('🛡️ Moderación avanzada activa');
        console.log('🎮 Detección de juegos: Free Fire, COD, Roblox, etc.');
        console.log('📊 Métricas en tiempo real');
    },

    // ================================================================
    // CHAT - Envío de mensajes
    // ================================================================
    enviarMensaje(texto) {
        if (!texto || !texto.trim()) return;
        
        const userId = this.obtenerUserId();
        chatPlugin.sendText(userId, texto.trim());
    },

    enviarMensajeConTipo(texto, tipo = 'text') {
        if (!texto || !texto.trim()) return;
        
        const userId = this.obtenerUserId();
        switch(tipo) {
            case 'emoji':
                chatPlugin.sendEmoji(userId, texto.trim());
                break;
            case 'sticker':
                chatPlugin.sendSticker(userId, texto.trim());
                break;
            default:
                chatPlugin.sendText(userId, texto.trim());
        }
    },

    enviarArchivo(file) {
        const userId = this.obtenerUserId();
        return chatPlugin.uploadFile(userId, file);
    },

    agregarReaccion(messageId, emojiCode) {
        const userId = this.obtenerUserId();
        return chatPlugin.addReaction(userId, messageId, emojiCode);
    },

    buscarMensajes(query) {
        return chatPlugin.search(query);
    },

    recibirMensajes(callback) {
        if (typeof callback === 'function') {
            this._callback = callback;
            callback(this.mensajes);
        }
    },

    marcarComoLeido() {
        this.mensajes.forEach((m) => {
            m.leido = true;
        });
        console.log('📖 Mensajes marcados como leídos');
    },

    // ================================================================
    // LLAMADAS Y TRANSMISIONES (LivePlugin)
    // ================================================================
    iniciarLlamada(targetUserId, options = { video: false }) {
        const userId = this.obtenerUserId();
        return livePlugin.startCall(userId, targetUserId, options);
    },

    unirseLlamada(roomName) {
        const userId = this.obtenerUserId();
        return livePlugin.joinCall(userId, roomName);
    },

    terminarLlamada() {
        return livePlugin.endCall();
    },

    iniciarTransmision(titulo) {
        const userId = this.obtenerUserId();
        return livePlugin.startLiveStream(userId, titulo);
    },

    unirseTransmision(roomName) {
        const userId = this.obtenerUserId();
        return livePlugin.joinLiveStream(userId, roomName);
    },

    estaEnLlamada() {
        return livePlugin.isInCall();
    },

    obtenerRoom() {
        return livePlugin.getRoom();
    },

    // ================================================================
    // MODERACIÓN AVANZADA
    // ================================================================
    iniciarModeracion: (userId, roomName) => {
        return moderacionAvanzada.iniciarModeracion(userId, roomName);
    },
    
    detenerModeracion: () => {
        moderacionAvanzada.detenerModeracion();
    },
    
    getEstadoModeracion: () => {
        return {
            activa: moderacionAvanzada.transmisionActiva,
            nivelAdvertencia: moderacionAvanzada.nivelAdvertencia,
            detecciones: moderacionAvanzada.detecciones.length,
            alertas: moderacionAvanzada.alertasEnviadas.length,
            usuarioVerificado: moderacionAvanzada.usuarioVerificado,
            monetizacionActiva: moderacionAvanzada.monetizacionActiva
        };
    },

    verificarUsuario: (userId) => {
        return moderacionAvanzada.verificarUsuario(userId);
    },

    // ================================================================
    // CONFIGURACIÓN DE TRANSMISIÓN
    // ================================================================
    iniciarTransmisionConfigurada: (userId, roomName, config) => {
        return configTransmision.inicializar(userId, roomName, config);
    },
    
    setTipoTransmision: (tipo) => {
        return configTransmision.setTipo(tipo);
    },
    
    setCalidadVideo: (calidad) => {
        return configTransmision.setCalidad(calidad);
    },
    
    setFps: (fps) => {
        return configTransmision.setFps(fps);
    },
    
    setAudio: (activo) => {
        return configTransmision.setAudio(activo);
    },
    
    setCamara: (activo) => {
        return configTransmision.setCamara(activo);
    },
    
    setMic: (activo) => {
        return configTransmision.setMic(activo);
    },
    
    setCompartirPantalla: (activo) => {
        return configTransmision.setCompartirPantalla(activo);
    },
    
    toggleCamara: (userId, activo) => {
        return configTransmision.toggleCamara(userId, activo);
    },
    
    toggleMicrofono: (userId, activo) => {
        return configTransmision.toggleMicrofono(userId, activo);
    },
    
    agregarParticipante: (userId, nombre, config) => {
        return configTransmision.agregarParticipante(userId, nombre, config);
    },
    
    eliminarParticipante: (userId) => {
        return configTransmision.eliminarParticipante(userId);
    },
    
    toggleAllCamaras: (activo) => {
        return configTransmision.toggleAllCamaras(activo);
    },
    
    detectarJuego: () => {
        return configTransmision.detectarJuegoEnEjecucion();
    },
    
    getEstadoTransmision: () => {
        return configTransmision.getEstadoCompleto();
    },
    
    mostrarControlesTransmision: () => {
        return configTransmision.mostrarControles();
    },
    
    mostrarParticipantesUI: () => {
        return configTransmision.mostrarParticipantesUI();
    },
    
    detenerTransmision: () => {
        configTransmision.detener();
    },

    // ================================================================
    // MARKETING Y MÉTRICAS
    // ================================================================
    activarCampanaMarketing: (presupuesto, duracion) => {
        const userId = Engine.obtenerUserId();
        return moderacionAvanzada.activarCampanaMarketing(userId, presupuesto, duracion);
    },

    obtenerMetricas: () => {
        const userId = Engine.obtenerUserId();
        return moderacionAvanzada.obtenerMetricas(userId);
    },

    priorizarServicio: (servicioId, presupuesto) => {
        const userId = Engine.obtenerUserId();
        return moderacionAvanzada.priorizarServicio(userId, servicioId, presupuesto);
    },

    // ================================================================
    // UTILIDADES
    // ================================================================
    obtenerUserId() {
        try {
            const perfil = JSON.parse(localStorage.getItem('miPerfil_csariels') || '{}');
            return perfil.userId || perfil.wallet || 'usuario_' + Date.now();
        } catch {
            return 'usuario_' + Date.now();
        }
    },

    obtenerHorario() {
        const h = M_CONFIG.horario;
        return `Abrimos ${h.dias} de ${h.apertura} a ${h.cierre}.`;
    },

    obtenerEstadoPresencia() {
        return { conectado: true };
    },

    obtenerConfigVisual() {
        return M_CONFIG;
    },

    // ================================================================
    // NOTIFICACIONES
    // ================================================================
    notificarActualizacion() {
        if (this._callback) {
            this._callback(this.mensajes);
        }
        document.dispatchEvent(new CustomEvent('marquinhos:mensajes', {
            detail: this.mensajes
        }));
    },

    notificarLlamada(event) {
        document.dispatchEvent(new CustomEvent('marquinhos:llamada', {
            detail: event
        }));
    },

    notificarModeracion(event) {
        document.dispatchEvent(new CustomEvent('marquinhos:moderacion', {
            detail: event
        }));
        
        // Si es un cierre, mostrar notificación especial
        if (event.tipo === 'cierre') {
            console.log('🚫 TRANSMISIÓN CERRADA POR MODERACIÓN');
            this.mostrarNotificacion('🚫 Transmisión cerrada por moderación', '#ff3366');
        }
    },

    notificarParticipante(event) {
        document.dispatchEvent(new CustomEvent('marquinhos:participante', {
            detail: event
        }));
    },

    // ================================================================
    // NOTIFICACIÓN TOAST
    // ================================================================
    mostrarNotificacion(mensaje, color = '#f7d44a') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            background: rgba(0,0,0,0.95);
            border-left: 4px solid ${color};
            border-radius: 8px;
            padding: 16px 24px;
            max-width: 400px;
            color: white;
            font-family: 'Space Grotesk', sans-serif;
            animation: slideIn 0.5s ease-out;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        `;
        toast.innerHTML = `
            <style>
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            </style>
            <div style="font-size:0.9rem;font-weight:600;color:${color};">${mensaje}</div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            toast.style.transition = 'all 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }
};

// ================================================================
// INICIALIZAR AL CARGAR
// ================================================================
Engine.conectar();

console.log('🧠 Marquinhos Engine v2.0 - COMPLETO');
console.log('✅ Chat en tiempo real');
console.log('✅ Llamadas de voz y video');
console.log('✅ Transmisiones en vivo');
console.log('✅ Transmisiones grupales (hasta 10 participantes)');
console.log('✅ Transmisión de juegos (Free Fire, COD, Roblox, etc.)');
console.log('✅ Moderación avanzada con 3 advertencias');
console.log('✅ Verificación de edad y documentos');
console.log('✅ Marketing pagado (visibilidad tipo TikTok)');
console.log('✅ Métricas en tiempo real');
console.log('✅ Servicios priorizados (primera plana)');
console.log('🎮 Detección de juegos popular');
console.log('📷 Control de cámaras individual y grupal');