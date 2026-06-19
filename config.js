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
        URL: 'https://gist.githubusercontent.com/csarielscontacto-commits/57c5f86f3a3cdd9da552f3fe08bb0fa4/raw/ventas-centralizadas.json',
        SYNC_INTERVAL: 5000,
        TIMEOUT: 10000
    },
    
    // ============================================
    // CONFIGURACIÓN DE ALMACENAMIENTO LOCAL
    // ============================================
    STORAGE: {
        VENTAS_KEY: 'ventas_centralizadas',
        VENDEDOR_KEY: 'vendedor_actual',
        VENDEDORES_KEY: 'vendedores_registrados',
        CACHE_KEY: 'cache_dashboard',
        LAST_SYNC_KEY: 'ultimo_sincronismo',
        NFT_CLIENTES_KEY: 'estado_nft_clientes'
    },
    
    // ============================================
    // CONFIGURACIÓN DE FIDELIZACIÓN
    // ============================================
    TOKENS: {
        TOKS_POR_VENTA: 10,
        TOKS_POR_REFERIDO: 25,
        TOKS_POR_REGISTRO: 50,
        NFT_BRONCE_MIN: 100,
        NFT_PLATA_MIN: 300,
        NFT_ORO_MIN: 600,
        NFT_DIAMANTE_MIN: 1000,
        DESCUENTO_BRONCE: 5,
        DESCUENTO_PLATA: 10,
        DESCUENTO_ORO: 15,
        DESCUENTO_DIAMANTE: 20,
        STORAGE_CLIENTES: 'clientes_fidelizacion',
        STORAGE_NFTS: 'nfts_emitidos'
    },

    // ============================================
    // CONFIGURACIÓN WEB3 RECOMPENSAS (AMOY)
    // ============================================
    WEB3_REWARDS: {
        ADMIN_WALLET: '0x8F742964244AE588dF7C5B2b27Ded374fDdAd69b',
        ROYALTY_BPS: 1000,
        TOKS_POR_GALLETA: 1,
        TOKS_UMBRAL_CANJE: 12,
        CHAIN: {
            ID: 80002,
            HEX_ID: '0x13882',
            NAME: 'Polygon Amoy',
            SYMBOL: 'POL',
            RPC_URL: 'https://rpc-amoy.polygon.technology',
            EXPLORER: 'https://amoy.polygonscan.com'
        },
        WALLETCONNECT_PROJECT_ID: 'bdb1ed42d90dc3ee390251a83230bf9b',
        REWARD_NFT_ADDRESS: '0x0000000000000000000000000000000000000000'
    },
    
    // ============================================
    // CONFIGURACIÓN DE METAS Y OBJETIVOS
    // ============================================
    METAS: {
        DIARIA: 10000,
        SEMANAL: 70000,
        MENSUAL: 300000
    },
    
    // ============================================
    // CONFIGURACIÓN DE INTERFAZ
    // ============================================
    UI: {
        COLORES: {
            PRIMARY: '#667eea',
            SECONDARY: '#764ba2',
            SUCCESS: '#26a69a',
            WARNING: '#ffa726',
            DANGER: '#ef5350',
            INFO: '#2196f3'
        },
        FORMATO_FECHA: 'es-MX',
        FORMATO_HORA: 'HH:mm:ss'
    },
    
    // ============================================
    // CONFIGURACIÓN DE LOGS
    // ============================================
    DEBUG: true
};

function formatearPrecio(cantidad = 1) {
    const total = cantidad * CONFIG.PRECIO_UNITARIO;
    return `${CONFIG.SIMBOLO_MONEDA}${total.toLocaleString('es-MX')} ${CONFIG.MONEDA}`;
}

function log(mensaje, datos = null) {
    if (CONFIG.DEBUG) {
        console.log(`[${new Date().toLocaleTimeString()}] ${mensaje}`, datos || '');
    }
}

function logError(mensaje, error = null) {
    console.error(`[ERROR] ${mensaje}`, error || '');
}
