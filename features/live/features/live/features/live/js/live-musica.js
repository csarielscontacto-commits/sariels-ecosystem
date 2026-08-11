// ================================================================
// 🎵 Módulo de Música - Csariel's Live
// ================================================================

console.log('🎵 Módulo de música cargado');

// Aquí irá la lógica de reproducción sincronizada:
// - Sincronización con WebSockets
// - Control de reproducción (play/pause/next)
// - Lista de reproducción compartida
// - Peticiones de canciones con donaciones

// Funciones que se implementarán:
// - cargarPlaylist(canciones)
// - reproducir(indice)
// - pausar()
// - siguiente()
// - anterior()
// - sincronizarConStreamer()

export default {
    estado: {
        reproduciendo: false,
        cancionActual: null,
        tiempoActual: 0,
        sincronizado: false
    }
};