// ================================================================
// 🎤 Módulo de Salas - Csariel's Live
// ================================================================

console.log('🎤 Módulo de salas cargado');

// Aquí irá la lógica de WebRTC para:
// - Crear salas de chat
// - Unirse a salas existentes
// - Transmisión de audio/video P2P
// - Mensajería en tiempo real

// Funciones que se implementarán:
// - crearSala(nombre, tipo, password)
// - unirseSala(salaId, password)
// - salirSala()
// - enviarMensajeSala(texto)
// - toggleMic()
// - toggleCam()

export default {
    estado: {
        salaActual: null,
        conectado: false,
        micActivo: false,
        camActiva: false
    }
};