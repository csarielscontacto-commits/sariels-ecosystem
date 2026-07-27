// js/marquinhos-engine.js
import { M_CONFIG } from './marquinhos-config.js';
import { supabase } from './utils/supabaseClient.js';
import { chatPlugin } from './plugins/plugin-chat.js';
import { livePlugin } from './plugins/plugin-live.js';

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
    },

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
    // LLAMADAS Y TRANSMISIONES
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
        // Emitir evento DOM
        document.dispatchEvent(new CustomEvent('marquinhos:mensajes', {
            detail: this.mensajes
        }));
    },

    notificarLlamada(event) {
        document.dispatchEvent(new CustomEvent('marquinhos:llamada', {
            detail: event
        }));
    }
};

// Inicializar al cargar
Engine.conectar();