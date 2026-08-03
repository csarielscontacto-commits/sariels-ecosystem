// js/plugins/plugin-configuracion-transmision.js
import { supabase } from '../utils/supabaseClient.js';

export const configTransmision = {
    // ================================================================
    // CONFIGURACIÓN
    // ================================================================
    config: {
        tipo: 'individual', // individual | grupal | juego
        calidad: '720p',    // 480p | 720p | 1080p
        fps: 30,
        audio: true,
        camara: true,
        microfono: true,
        compartirPantalla: false
    },
    participantes: [],
    estado: {
        activa: false,
        roomName: null,
        userId: null
    },

    // ================================================================
    // INICIALIZAR TRANSMISIÓN
    // ================================================================
    inicializar(userId, roomName, config = {}) {
        console.log(`📹 Inicializando transmisión para ${userId} en ${roomName}`);
        
        this.estado.activa = true;
        this.estado.roomName = roomName;
        this.estado.userId = userId;
        
        // Configuración
        this.config = {
            ...this.config,
            ...config
        };

        // Agregar al creador como primer participante
        this.agregarParticipante(userId, 'Creador', config);

        this._notificar('transmision_inicializada', {
            userId,
            roomName,
            config: this.config,
            participantes: this.participantes
        });

        return {
            success: true,
            message: 'Transmisión inicializada',
            config: this.config
        };
    },

    // ================================================================
    // CONFIGURACIONES
    // ================================================================
    setTipo(tipo) {
        if (['individual', 'grupal', 'juego'].includes(tipo)) {
            this.config.tipo = tipo;
            this._notificar('config_actualizada', { tipo });
            return { success: true, tipo };
        }
        return { success: false, error: 'Tipo inválido' };
    },

    setCalidad(calidad) {
        if (['480p', '720p', '1080p'].includes(calidad)) {
            this.config.calidad = calidad;
            this._notificar('config_actualizada', { calidad });
            return { success: true, calidad };
        }
        return { success: false, error: 'Calidad inválida' };
    },

    setFps(fps) {
        if ([15, 30, 60].includes(fps)) {
            this.config.fps = fps;
            this._notificar('config_actualizada', { fps });
            return { success: true, fps };
        }
        return { success: false, error: 'FPS inválido' };
    },

    setAudio(activo) {
        this.config.audio = activo;
        this._notificar('config_actualizada', { audio: activo });
        return { success: true, audio: activo };
    },

    setCamara(activo) {
        this.config.camara = activo;
        this._notificar('config_actualizada', { camara: activo });
        return { success: true, camara: activo };
    },

    setMic(activo) {
        this.config.microfono = activo;
        this._notificar('config_actualizada', { microfono: activo });
        return { success: true, microfono: activo };
    },

    setCompartirPantalla(activo) {
        this.config.compartirPantalla = activo;
        this._notificar('config_actualizada', { compartirPantalla: activo });
        return { success: true, compartirPantalla: activo };
    },

    // ================================================================
    // CONTROLES DE CÁMARA / MIC
    // ================================================================
    toggleCamara(userId, activo) {
        const participante = this.participantes.find(p => p.userId === userId);
        if (participante) {
            participante.camara = activo;
            this._notificar('camara_toggled', { userId, activo });
            document.dispatchEvent(new CustomEvent('camara:toggle', {
                detail: { userId, activo }
            }));
            return { success: true, userId, activo };
        }
        return { success: false, error: 'Participante no encontrado' };
    },

    toggleMicrofono(userId, activo) {
        const participante = this.participantes.find(p => p.userId === userId);
        if (participante) {
            participante.microfono = activo;
            this._notificar('microfono_toggled', { userId, activo });
            return { success: true, userId, activo };
        }
        return { success: false, error: 'Participante no encontrado' };
    },

    toggleAllCamaras(activo) {
        this.participantes.forEach(p => {
            p.camara = activo;
        });
        this._notificar('camaras_toggled', { activo });
        return { success: true, activo };
    },

    // ================================================================
    // PARTICIPANTES
    // ================================================================
    agregarParticipante(userId, nombre, config = {}) {
        // Verificar si ya existe
        const existe = this.participantes.find(p => p.userId === userId);
        if (existe) {
            return { success: false, error: 'Participante ya existe' };
        }

        const nuevoParticipante = {
            userId,
            nombre: nombre || 'Usuario',
            camara: config.camara !== undefined ? config.camara : true,
            microfono: config.microfono !== undefined ? config.microfono : true,
            unido: new Date().toISOString()
        };

        this.participantes.push(nuevoParticipante);

        // Notificar
        document.dispatchEvent(new CustomEvent('participante:agregado', {
            detail: nuevoParticipante
        }));

        this._notificar('participante_agregado', nuevoParticipante);

        return {
            success: true,
            participante: nuevoParticipante,
            total: this.participantes.length
        };
    },

    eliminarParticipante(userId) {
        const index = this.participantes.findIndex(p => p.userId === userId);
        if (index === -1) {
            return { success: false, error: 'Participante no encontrado' };
        }

        const eliminado = this.participantes.splice(index, 1)[0];
        this._notificar('participante_eliminado', eliminado);

        return {
            success: true,
            participante: eliminado,
            total: this.participantes.length
        };
    },

    // ================================================================
    // DETECCIÓN DE JUEGOS
    // ================================================================
    detectarJuegoEnEjecucion() {
        // Simulación de detección de juegos
        const juegos = ['Free Fire', 'Call of Duty', 'Roblox', 'Fortnite', 'Minecraft', 'Valorant'];
        const detectado = juegos[Math.floor(Math.random() * juegos.length)];
        
        // Si hay un juego detectado, cambiar tipo
        if (detectado) {
            this.config.tipo = 'juego';
            document.dispatchEvent(new CustomEvent('juego:detectado', {
                detail: { juego: detectado }
            }));
            this._notificar('juego_detectado', { juego: detectado });
        }

        return {
            success: true,
            juego: detectado || null
        };
    },

    // ================================================================
    // ESTADO
    // ================================================================
    getEstadoCompleto() {
        return {
            config: this.config,
            participantes: this.participantes,
            estado: this.estado,
            totalParticipantes: this.participantes.length
        };
    },

    // ================================================================
    // UI
    // ================================================================
    mostrarControles() {
        console.log('🎮 Mostrando controles de transmisión');
        this._notificar('controles_mostrados', {});
        return {
            success: true,
            message: 'Controles mostrados'
        };
    },

    mostrarParticipantesUI() {
        console.log('👥 Mostrando participantes:', this.participantes);
        this._notificar('participantes_mostrados', {
            participantes: this.participantes
        });
        return {
            success: true,
            participantes: this.participantes
        };
    },

    // ================================================================
    // DETENER
    // ================================================================
    detener() {
        console.log('⏹️ Deteniendo transmisión');
        
        this.estado.activa = false;
        this.participantes = [];
        this.estado.roomName = null;
        this.estado.userId = null;

        this._notificar('transmision_detenida', {});

        return {
            success: true,
            message: 'Transmisión detenida'
        };
    },

    // ================================================================
    // NOTIFICAR EVENTOS
    // ================================================================
    _notificar(evento, data) {
        document.dispatchEvent(new CustomEvent('transmision:evento', {
            detail: {
                tipo: evento,
                ...data
            }
        }));
    }
};

console.log('⚙️ Plugin de Configuración de Transmisión cargado');