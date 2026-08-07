// js/plugins/plugin-configuracion-transmision.js
export const configTransmision = {
    config: {
        tipo: 'individual',
        calidad: '1080p',
        fps: 30,
        audio: true,
        camara: true,
        mic: true,
        compartirPantalla: false,
        participantes: []
    },

    inicializar(userId, roomName, config) {
        this.config = { ...this.config, ...config };
        console.log('⚙️ Configuración de transmisión inicializada:', this.config);
    },

    setTipo(tipo) {
        this.config.tipo = tipo;
        console.log('📹 Tipo de transmisión:', tipo);
    },

    toggleCamara(userId, activo) {
        this.config.camara = activo;
        console.log('📷 Cámara:', activo ? 'ON' : 'OFF');
    },

    toggleMicrofono(userId, activo) {
        this.config.mic = activo;
        console.log('🎤 Micrófono:', activo ? 'ON' : 'OFF');
    },

    agregarParticipante(userId, nombre, config) {
        this.config.participantes.push({ userId, nombre, ...config });
        console.log('👤 Participante agregado:', nombre);
    },

    eliminarParticipante(userId) {
        this.config.participantes = this.config.participantes.filter(p => p.userId !== userId);
        console.log('👤 Participante eliminado:', userId);
    },

    getEstadoCompleto() {
        return this.config;
    },

    detener() {
        console.log('⏹️ Transmisión detenida');
    },

    detectarJuegoEnEjecucion() {
        // Simulación
        const juegos = ['Free Fire', 'COD', 'Roblox', 'Minecraft'];
        return juegos[Math.floor(Math.random() * juegos.length)];
    }
};