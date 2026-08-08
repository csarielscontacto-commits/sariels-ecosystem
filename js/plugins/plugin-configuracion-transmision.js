/**
 * ================================================================
 * 📹 PLUGIN DE CONFIGURACIÓN DE TRANSMISIÓN - Csariel's Ecosystem
 * ================================================================
 * Plugin para gestionar la configuración de transmisiones en vivo
 * con soporte para cámara, micrófono, calidad y participantes.
 * 
 * Hecho en Puebla, México 🇲🇽
 * Versión: 2.1.0
 * ================================================================
 */

// ================================================================
// 📦 CONFIGURACIÓN DE TRANSMISIÓN
// ================================================================

export const configTransmision = {
    // ================================================================
    // 🔧 CONFIGURACIÓN POR DEFECTO
    // ================================================================
    
    config: {
        tipo: 'individual',              // 'individual' | 'grupo' | 'evento'
        calidad: '1080p',                // '720p' | '1080p' | '4K'
        fps: 30,                         // 15 | 30 | 60
        audio: true,
        camara: true,
        mic: true,
        compartirPantalla: false,
        participantes: [],
        maxParticipantes: 10,
        duracionEstimada: 0,             // minutos
        grabacionAutomatica: false,
        chatActivo: true,
        moderacionIA: true,
        deteccionJuegos: true,
        etiquetas: [],
        es_18: false,
        privacidad: 'publico'            // 'publico' | 'privado' | 'suscriptores'
    },

    // ================================================================
    // 📋 CONFIGURACIONES PREESTABLECIDAS
    // ================================================================
    
    PRESETS: {
        GAMING: {
            calidad: '1080p',
            fps: 60,
            audio: true,
            camara: true,
            mic: true,
            deteccionJuegos: true,
            etiquetas: ['gaming', 'streamer']
        },
        MUSICA: {
            calidad: '720p',
            fps: 30,
            audio: true,
            camara: true,
            mic: true,
            etiquetas: ['musica', 'artista']
        },
        CHAT: {
            calidad: '720p',
            fps: 30,
            audio: true,
            camara: true,
            mic: true,
            etiquetas: ['charla', 'comunidad']
        },
        EVENTO: {
            tipo: 'evento',
            calidad: '1080p',
            fps: 30,
            audio: true,
            camara: true,
            mic: true,
            maxParticipantes: 50,
            grabacionAutomatica: true,
            etiquetas: ['evento', 'especial']
        }
    },

    // ================================================================
    // 🎬 INICIALIZAR
    // ================================================================
    
    inicializar(userId, roomName, config = {}) {
        // Validar userId
        if (!userId) {
            console.error('❌ userId es requerido para inicializar la transmisión');
            return null;
        }

        // Guardar userId y roomName
        this.userId = userId;
        this.roomName = roomName || `stream_${Date.now()}`;
        
        // Mezclar configuración
        this.config = { ...this.config, ...config };
        
        // Agregar metadatos
        this.config.iniciado_por = userId;
        this.config.room_name = this.roomName;
        this.config.inicio_timestamp = new Date().toISOString();
        this.config.activo = true;
        this.config.tiempo_transcurrido = 0;

        console.log('⚙️ Configuración de transmisión inicializada:', this.config);
        console.log(`📹 Room: ${this.roomName} | Usuario: ${userId}`);
        
        return this.config;
    },

    // ================================================================
    // 🔧 APLICAR PRESET
    // ================================================================
    
    aplicarPreset(nombrePreset) {
        const preset = this.PRESETS[nombrePreset.toUpperCase()];
        if (!preset) {
            console.warn(`⚠️ Preset "${nombrePreset}" no encontrado`);
            return this.config;
        }
        
        this.config = { ...this.config, ...preset };
        console.log(`📋 Preset "${nombrePreset}" aplicado:`, this.config);
        return this.config;
    },

    // ================================================================
    // 📹 TIPO DE TRANSMISIÓN
    // ================================================================
    
    setTipo(tipo) {
        const tiposValidos = ['individual', 'grupo', 'evento'];
        if (!tiposValidos.includes(tipo)) {
            console.warn(`⚠️ Tipo "${tipo}" no válido. Usando "individual"`);
            tipo = 'individual';
        }
        this.config.tipo = tipo;
        console.log('📹 Tipo de transmisión:', tipo);
        return this.config;
    },

    // ================================================================
    // 🎥 CALIDAD Y FPS
    // ================================================================
    
    setCalidad(calidad) {
        const calidadesValidas = ['720p', '1080p', '4K'];
        if (!calidadesValidas.includes(calidad)) {
            console.warn(`⚠️ Calidad "${calidad}" no válida. Usando "1080p"`);
            calidad = '1080p';
        }
        this.config.calidad = calidad;
        console.log('🎥 Calidad:', calidad);
        return this.config;
    },

    setFps(fps) {
        const fpsValidos = [15, 30, 60];
        if (!fpsValidos.includes(fps)) {
            console.warn(`⚠️ FPS "${fps}" no válido. Usando 30`);
            fps = 30;
        }
        this.config.fps = fps;
        console.log('🎬 FPS:', fps);
        return this.config;
    },

    // ================================================================
    // 📷 CÁMARA Y MICRÓFONO
    // ================================================================
    
    toggleCamara(userId, activo) {
        this.config.camara = activo !== undefined ? activo : !this.config.camara;
        console.log(`📷 Cámara: ${this.config.camara ? 'ON' : 'OFF'} ${userId ? `(Usuario: ${userId})` : ''}`);
        return this.config.camara;
    },

    toggleMicrofono(userId, activo) {
        this.config.mic = activo !== undefined ? activo : !this.config.mic;
        console.log(`🎤 Micrófono: ${this.config.mic ? 'ON' : 'OFF'} ${userId ? `(Usuario: ${userId})` : ''}`);
        return this.config.mic;
    },

    toggleAudio(userId, activo) {
        this.config.audio = activo !== undefined ? activo : !this.config.audio;
        console.log(`🔊 Audio: ${this.config.audio ? 'ON' : 'OFF'} ${userId ? `(Usuario: ${userId})` : ''}`);
        return this.config.audio;
    },

    togglePantallaCompartida(userId, activo) {
        this.config.compartirPantalla = activo !== undefined ? activo : !this.config.compartirPantalla;
        console.log(`🖥️ Compartir pantalla: ${this.config.compartirPantalla ? 'ON' : 'OFF'} ${userId ? `(Usuario: ${userId})` : ''}`);
        return this.config.compartirPantalla;
    },

    // ================================================================
    // 👥 PARTICIPANTES
    // ================================================================
    
    agregarParticipante(userId, nombre, config = {}) {
        // Validar límite de participantes
        if (this.config.participantes.length >= this.config.maxParticipantes) {
            console.warn(`⚠️ Límite de participantes alcanzado (${this.config.maxParticipantes})`);
            return null;
        }

        // Verificar si ya existe
        const existe = this.config.participantes.find(p => p.userId === userId);
        if (existe) {
            console.warn(`⚠️ Participante ${nombre} ya está en la transmisión`);
            return existe;
        }

        const participante = {
            userId,
            nombre: nombre || `Usuario_${userId.slice(0, 6)}`,
            joined_at: new Date().toISOString(),
            ...config
        };

        this.config.participantes.push(participante);
        console.log(`👤 Participante agregado: ${nombre} (${userId})`);
        return participante;
    },

    eliminarParticipante(userId) {
        const index = this.config.participantes.findIndex(p => p.userId === userId);
        if (index === -1) {
            console.warn(`⚠️ Participante ${userId} no encontrado`);
            return null;
        }
        const eliminado = this.config.participantes.splice(index, 1)[0];
        console.log(`👤 Participante eliminado: ${eliminado.nombre} (${userId})`);
        return eliminado;
    },

    getParticipantes() {
        return this.config.participantes;
    },

    getParticipante(userId) {
        return this.config.participantes.find(p => p.userId === userId);
    },

    // ================================================================
    // 🏷️ ETIQUETAS Y MODO
    // ================================================================
    
    agregarEtiqueta(etiqueta) {
        if (!this.config.etiquetas.includes(etiqueta)) {
            this.config.etiquetas.push(etiqueta);
            console.log(`🏷️ Etiqueta agregada: ${etiqueta}`);
        }
        return this.config.etiquetas;
    },

    quitarEtiqueta(etiqueta) {
        this.config.etiquetas = this.config.etiquetas.filter(e => e !== etiqueta);
        console.log(`🏷️ Etiqueta eliminada: ${etiqueta}`);
        return this.config.etiquetas;
    },

    setModo18(activo) {
        this.config.es_18 = activo !== undefined ? activo : !this.config.es_18;
        console.log(`🔞 Modo 18+: ${this.config.es_18 ? 'ON' : 'OFF'}`);
        return this.config.es_18;
    },

    setPrivacidad(privacidad) {
        const opciones = ['publico', 'privado', 'suscriptores'];
        if (!opciones.includes(privacidad)) {
            console.warn(`⚠️ Privacidad "${privacidad}" no válida. Usando "publico"`);
            privacidad = 'publico';
        }
        this.config.privacidad = privacidad;
        console.log(`🔒 Privacidad: ${privacidad}`);
        return this.config.privacidad;
    },

    // ================================================================
    // 🎮 DETECCIÓN DE JUEGOS
    // ================================================================
    
    detectarJuegoEnEjecucion() {
        // Simulación de detección de juegos
        const juegos = [
            'Free Fire', 'Call of Duty', 'Roblox', 
            'Minecraft', 'Fortnite', 'Valorant', 
            'League of Legends', 'GTA V', 'FIFA'
        ];
        const juego = juegos[Math.floor(Math.random() * juegos.length)];
        console.log(`🎮 Juego detectado: ${juego}`);
        return juego;
    },

    // ================================================================
    // 📊 ESTADO DE LA TRANSMISIÓN
    // ================================================================
    
    getEstadoCompleto() {
        return {
            ...this.config,
            participantes_activos: this.config.participantes.length,
            tiempo_transcurrido: this.config.tiempo_transcurrido,
            activo: this.config.activo,
            room_name: this.roomName,
            iniciado_por: this.userId
        };
    },

    getEstadoResumido() {
        return {
            room: this.roomName,
            tipo: this.config.tipo,
            calidad: this.config.calidad,
            fps: this.config.fps,
            participantes: this.config.participantes.length,
            activo: this.config.activo,
            privacidad: this.config.privacidad,
            es_18: this.config.es_18
        };
    },

    // ================================================================
    // ⏱️ TIEMPO DE TRANSMISIÓN
    // ================================================================
    
    iniciarCronometro() {
        if (this.intervalo) {
            clearInterval(this.intervalo);
        }
        this.config.tiempo_transcurrido = 0;
        this.intervalo = setInterval(() => {
            this.config.tiempo_transcurrido++;
        }, 1000);
        console.log('⏱️ Cronómetro iniciado');
        return this.intervalo;
    },

    detenerCronometro() {
        if (this.intervalo) {
            clearInterval(this.intervalo);
            this.intervalo = null;
            console.log('⏱️ Cronómetro detenido');
        }
        return this.config.tiempo_transcurrido;
    },

    // ================================================================
    // ⏹️ DETENER TRANSMISIÓN
    // ================================================================
    
    detener() {
        this.config.activo = false;
        this.detenerCronometro();
        console.log('⏹️ Transmisión detenida');
        return {
            ...this.config,
            duracion_total: this.config.tiempo_transcurrido
        };
    },

    // ================================================================
    // 💾 GUARDAR Y CARGAR CONFIGURACIÓN
    // ================================================================
    
    guardarConfiguracion() {
        try {
            const data = {
                config: this.config,
                userId: this.userId,
                roomName: this.roomName,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('csariels_stream_config', JSON.stringify(data));
            console.log('💾 Configuración guardada');
            return data;
        } catch (e) {
            console.warn('⚠️ Error guardando configuración:', e);
            return null;
        }
    },

    cargarConfiguracion() {
        try {
            const stored = localStorage.getItem('csariels_stream_config');
            if (stored) {
                const data = JSON.parse(stored);
                this.config = data.config || this.config;
                this.userId = data.userId || this.userId;
                this.roomName = data.roomName || this.roomName;
                console.log('📂 Configuración cargada');
                return data;
            }
        } catch (e) {
            console.warn('⚠️ Error cargando configuración:', e);
        }
        return null;
    },

    // ================================================================
    // 🔄 REINICIAR CONFIGURACIÓN
    // ================================================================
    
    reiniciar() {
        this.config = {
            tipo: 'individual',
            calidad: '1080p',
            fps: 30,
            audio: true,
            camara: true,
            mic: true,
            compartirPantalla: false,
            participantes: [],
            maxParticipantes: 10,
            duracionEstimada: 0,
            grabacionAutomatica: false,
            chatActivo: true,
            moderacionIA: true,
            deteccionJuegos: true,
            etiquetas: [],
            es_18: false,
            privacidad: 'publico'
        };
        this.userId = null;
        this.roomName = null;
        this.detenerCronometro();
        console.log('🔄 Configuración reiniciada');
        return this.config;
    }
};

// ================================================================
// 🚀 EXPORTAR POR DEFECTO
// ================================================================

export default configTransmision;

// ================================================================
// 📋 LOG DE INICIO
// ================================================================

console.log('📹 Plugin de Configuración de Transmisión v2.1.0 cargado');
console.log('📍 Hecho en Puebla, México');
console.log('🎥 Compatible con LiveKit y transmisiones en vivo');