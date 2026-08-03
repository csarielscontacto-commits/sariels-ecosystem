// js/plugins/plugin-live.js
import { supabase } from '../utils/supabaseClient.js';

export const livePlugin = {
    // ================================================================
    // CONFIGURACIÓN
    // ================================================================
    enLlamada: false,
    roomActual: null,
    streamActivo: false,
    callbacks: [],

    // ================================================================
    // INICIAR LLAMADA
    // ================================================================
    startCall(userId, targetUserId, options = { video: false }) {
        console.log(`📞 Iniciando llamada de ${userId} a ${targetUserId} (video: ${options.video})`);
        
        this.enLlamada = true;
        this.roomActual = `call_${userId}_${targetUserId}_${Date.now()}`;
        
        // Notificar a los listeners
        this._notificar('llamada_iniciada', {
            from: userId,
            to: targetUserId,
            room: this.roomActual,
            video: options.video || false
        });

        return {
            success: true,
            room: this.roomActual,
            message: 'Llamada iniciada'
        };
    },

    // ================================================================
    // UNIRSE A LLAMADA
    // ================================================================
    joinCall(userId, roomName) {
        console.log(`📞 ${userId} se unió a la sala ${roomName}`);
        
        this.enLlamada = true;
        this.roomActual = roomName;
        
        this._notificar('llamada_unida', {
            userId: userId,
            room: roomName
        });

        return {
            success: true,
            room: roomName,
            message: 'Te has unido a la llamada'
        };
    },

    // ================================================================
    // TERMINAR LLAMADA
    // ================================================================
    endCall() {
        console.log('📞 Terminando llamada');
        
        this.enLlamada = false;
        const room = this.roomActual;
        this.roomActual = null;
        
        this._notificar('llamada_terminada', {
            room: room
        });

        return {
            success: true,
            message: 'Llamada terminada'
        };
    },

    // ================================================================
    // INICIAR TRANSMISIÓN EN VIVO
    // ================================================================
    startLiveStream(userId, titulo) {
        console.log(`📹 ${userId} inició transmisión: "${titulo}"`);
        
        this.streamActivo = true;
        this.roomActual = `live_${userId}_${Date.now()}`;
        
        this._notificar('stream_iniciado', {
            userId: userId,
            titulo: titulo,
            room: this.roomActual
        });

        return {
            success: true,
            room: this.roomActual,
            message: 'Transmisión iniciada'
        };
    },

    // ================================================================
    // UNIRSE A TRANSMISIÓN
    // ================================================================
    joinLiveStream(userId, roomName) {
        console.log(`📹 ${userId} se unió a la transmisión ${roomName}`);
        
        this._notificar('stream_unido', {
            userId: userId,
            room: roomName
        });

        return {
            success: true,
            room: roomName,
            message: 'Te has unido a la transmisión'
        };
    },

    // ================================================================
    // ESTADO DE LLAMADA
    // ================================================================
    isInCall() {
        return this.enLlamada;
    },

    // ================================================================
    // OBTENER SALA ACTUAL
    // ================================================================
    getRoom() {
        return this.roomActual;
    },

    // ================================================================
    // ESCUCHAR EVENTOS DE LLAMADA
    // ================================================================
    onCallEvent(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    },

    // ================================================================
    // NOTIFICAR EVENTOS INTERNOS
    // ================================================================
    _notificar(evento, data) {
        // Notificar callbacks
        this.callbacks.forEach(cb => {
            try {
                cb({ evento, ...data });
            } catch (e) {
                console.warn('Error en callback de live:', e);
            }
        });

        // Notificar mediante evento DOM
        document.dispatchEvent(new CustomEvent('live:evento', {
            detail: { evento, ...data }
        }));
    }
};

console.log('📹 Plugin de Live cargado');