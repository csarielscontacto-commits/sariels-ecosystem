/**
 * CONFIGURACIÓN CENTRALIZADA DEL SISTEMA
 * Este archivo contiene todas las configuraciones globales
 * que se usan en todo el sistema de ventas
 */

// ============================================
// CONFIGURACIÓN DE PRECIOS
// ============================================
const CONFIG = {
    PRECIO_UNITARIO: 75, // Pesos mexicanos
    MONEDA: 'MXN',
    SIMBOLO_MONEDA: '$',
    
    // ============================================
    // CONFIGURACIÓN DE BASE DE DATOS CENTRALIZADA
    // ============================================
    DATABASE: {
        // URL de la base de datos centralizada (GitHub Gist)
        URL: 'https://gist.githubusercontent.com/csarielscontacto-commits/57c5f86f3a3cdd9da552f3fe08bb0fa4/raw/ventas-centralizadas.json',
        
        // Intervalo de sincronización (milisegundos)
        SYNC_INTERVAL: 5000, // 5 segundos
        
        // Tiempo de timeout para requests
        TIMEOUT: 10000
    },
    
    // ============================================
    // CONFIGURACIÓN DE ALMACENAMIENTO LOCAL
    // ============================================
    STORAGE: {
        // Claves para localStorage
        VENTAS_KEY: 'ventas_centralizadas',
        VENDEDOR_KEY: 'vendedor_actual',
        VENDEDORES_KEY: 'vendedores_registrados',
        CACHE_KEY: 'cache_dashboard',
        LAST_SYNC_KEY: 'ultimo_sincronismo',
        NFT_CLIENTES_KEY: 'estado_nft_clientes'
    },
    
    // ============================================
    // CONFIGURACIÓN DE METAS Y OBJETIVOS
    // ============================================
    METAS: {
        DIARIA: 10000, // Meta diaria en pesos
        SEMANAL: 70000,
        MENSUAL: 300000
    },
    
    // ============================================
    // CONFIGURACIÓN DE INTERFAZ
    // ============================================
    UI: {
        // Tema de colores
        COLORES: {
            PRIMARY: '#667eea',
            SECONDARY: '#764ba2',
            SUCCESS: '#26a69a',
            WARNING: '#ffa726',
            DANGER: '#ef5350',
            INFO: '#2196f3'
        },
        
        // Formato de fecha
        FORMATO_FECHA: 'es-MX',
        FORMATO_HORA: 'HH:mm:ss'
    },
    
    // ============================================
    // CONFIGURACIÓN DE LOGS
    // ============================================
    DEBUG: true // Mostrar logs en consola
};

/**
 * Función de utilidad para obtener el precio formateado
 */
function formatearPrecio(cantidad = 1) {
    const total = cantidad * CONFIG.PRECIO_UNITARIO;
    return `${CONFIG.SIMBOLO_MONEDA}${total.toLocaleString('es-MX')} ${CONFIG.MONEDA}`;
}

/**
 * Función para registrar eventos en consola (si DEBUG está activo)
 */
function log(mensaje, datos = null) {
    if (CONFIG.DEBUG) {
        console.log(`[${new Date().toLocaleTimeString()}] ${mensaje}`, datos || '');
    }
}

/**
 * Función para registrar errores
 */
function logError(mensaje, error = null) {
    console.error(`[ERROR] ${mensaje}`, error || '');
}
