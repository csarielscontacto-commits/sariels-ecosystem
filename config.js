/**
 * CONFIGURACIÓN CENTRALIZADA
 * Versión simplificada y estable
 */

const CONFIG = {
    // Precios y moneda
    PRECIO_UNITARIO: 75,
    MONEDA: 'MXN',
    
    // Metas
    METAS: {
        DIARIA: 10000,
        SEMANAL: 70000,
        MENSUAL: 300000
    },
    
    // Base de datos
    DATABASE: {
        SYNC_INTERVAL: 5000, // 5 segundos
        URL_GIST: 'https://api.github.com/gists/1234567890', // ¡CAMBIA ESTO!
        GIST_ID: '1234567890' // ¡CAMBIA ESTO!
    },
    
    // Almacenamiento local
    STORAGE_KEYS: {
        VENTAS: 'ventas_centralizadas',
        CACHE: 'cache_dashboard',
        LAST_SYNC: 'ultimo_sincronismo',
        VENDEDOR_ACTUAL: 'vendedor_actual'
    },
    
    // Web3 / Blockchain (opcional)
    WEB3_REWARDS: {
        REWARD_NFT_ADDRESS: '0x...',
        WALLETCONNECT_PROJECT_ID: '...',
        CHAIN_ID: 80002
    }
};

// Exponer para uso global
window.CONFIG = CONFIG;
console.log('✅ Configuración cargada correctamente');
