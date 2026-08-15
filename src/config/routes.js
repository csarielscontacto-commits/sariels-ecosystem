// ================================================================
// 🧭 RUTAS - CSARIEL'S ECOSYSTEM
// ================================================================
// Definición centralizada de todas las rutas del ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// 📋 RUTAS PRINCIPALES
// ================================================================

export const ROUTES = {
    // === FEATURES PRINCIPALES ===
    HOME: {
        path: '/',
        file: 'index.html',
        title: 'Inicio',
        icon: 'fa-home'
    },
    RED: {
        path: '/features/red',
        file: 'features/red/index.html',
        title: 'Mi Red',
        icon: 'fa-users'
    },
    LIVE: {
        path: '/features/live',
        file: 'features/live/index.html',
        title: 'Muro Live',
        icon: 'fa-rss'
    },
    FORO: {
        path: '/features/foro',
        file: 'features/foro/index.html',
        title: 'Foro Social',
        icon: 'fa-comments'
    },
    TRADING: {
        path: '/features/trading',
        file: 'features/trading/index.html',
        title: 'Trading STOKS',
        icon: 'fa-chart-line'
    },
    SERVICIOS: {
        path: '/features/servicios',
        file: 'features/servicios/index.html',
        title: 'Servicios',
        icon: 'fa-tools'
    },
    INTERNET: {
        path: '/features/internet',
        file: 'features/internet/index.html',
        title: 'Internet eSIM',
        icon: 'fa-satellite-dish'
    },
    TIENDA: {
        path: '/features/tienda',
        file: 'features/tienda/index.html',
        title: 'Tienda CMT',
        icon: 'fa-store'
    },
    WALLET: {
        path: '/features/wallet',
        file: 'features/wallet/index.html',
        title: 'Wallet',
        icon: 'fa-wallet'
    },

    // === ADMIN Y LEGALES ===
    ADMIN: {
        path: '/features/admin',
        file: 'features/admin/index.html',
        title: 'Panel de Control',
        icon: 'fa-cogs'
    },
    LEGAL_HUB: {
        path: '/features/legal-hub',
        file: 'features/legal-hub/index.html',
        title: 'Legal Hub',
        icon: 'fa-gavel'
    },
    HUB_LEALTAD: {
        path: '/features/hub-lealtad',
        file: 'features/hub-lealtad/index.html',
        title: 'Hub Lealtad',
        icon: 'fa-handshake'
    },
    TALAVERIN: {
        path: '/features/talaverin',
        file: 'features/talaverin/index.html',
        title: 'Talaverín',
        icon: 'fa-robot'
    },
    REWARDS: {
        path: '/features/rewards',
        file: 'features/rewards/index.html',
        title: 'Recompensas',
        icon: 'fa-gift'
    },
    MODERACION: {
        path: '/features/moderacion',
        file: 'features/moderacion/index.html',
        title: 'Moderación',
        icon: 'fa-shield-halved'
    },
    TAKEDOWN: {
        path: '/features/takedown',
        file: 'features/takedown/index.html',
        title: 'Formulario Takedown',
        icon: 'fa-triangle-exclamation'
    },
    DERECHOS_AUTOR: {
        path: '/features/derechos-autor',
        file: 'features/derechos-autor/index.html',
        title: 'Derechos de Autor',
        icon: 'fa-copyright'
    },
    CONTRATO_CREADOR: {
        path: '/features/contrato-creador',
        file: 'features/contrato-creador/index.html',
        title: 'Contrato Creador',
        icon: 'fa-file-contract'
    },

    // === PÁGINAS LEGALES ===
    TERMINOS: {
        path: '/terminos-completos',
        file: 'terminos-completos.html',
        title: 'Términos y Condiciones',
        icon: 'fa-file-contract'
    },
    PRIVACIDAD: {
        path: '/aviso-privacidad',
        file: 'aviso-privacidad.html',
        title: 'Aviso de Privacidad',
        icon: 'fa-shield-alt'
    },
    TERMINOS_SERVICIOS: {
        path: '/terminos-servicios',
        file: 'terminos-servicios.html',
        title: 'Términos Servicios',
        icon: 'fa-handshake'
    },
    FAQ_LEGAL: {
        path: '/features/faq-legal',
        file: 'features/faq-legal/index.html',
        title: 'FAQ Legal',
        icon: 'fa-question-circle'
    }
};

// ================================================================
// 📋 ALIAS (NOMBRES ALTERNATIVOS)
// ================================================================

export const ROUTE_ALIAS = {
    'mired': 'RED',
    'muro-live': 'LIVE',
    'muro-memes': 'MEMES',
    'servicios-comunitarios': 'SERVICIOS',
    'mi-internet': 'INTERNET',
    'panel-web3': 'ADMIN',
    'dashboard-emerald': 'ADMIN',
    'tiendita': 'TIENDA',
    'cartera': 'WALLET',
    'terminos-uso': 'TERMINOS',
    'lealtad': 'HUB_LEALTAD',
    'es.stoks': 'HUB_LEALTAD',
    'stoks': 'HUB_LEALTAD'
};

// ================================================================
// 📋 RUTAS POR CATEGORÍA
// ================================================================

export const ROUTES_BY_CATEGORY = {
    PRINCIPALES: [
        'HOME', 'RED', 'LIVE', 'FORO', 'TRADING', 
        'SERVICIOS', 'INTERNET', 'TIENDA', 'WALLET'
    ],
    ADMIN: [
        'ADMIN', 'LEGAL_HUB', 'HUB_LEALTAD', 'TALAVERIN', 
        'REWARDS', 'MODERACION', 'TAKEDOWN'
    ],
    LEGALES: [
        'TERMINOS', 'PRIVACIDAD', 'TERMINOS_SERVICIOS', 
        'FAQ_LEGAL', 'DERECHOS_AUTOR', 'CONTRATO_CREADOR'
    ]
};

// ================================================================
// 🔍 FUNCIONES DE AYUDA
// ================================================================

/**
 * Obtiene una ruta por su clave
 * @param {string} key - Clave de la ruta
 * @returns {Object} Ruta o null si no existe
 */
export function getRoute(key) {
    const resolvedKey = ROUTE_ALIAS[key?.toLowerCase()] || key;
    return ROUTES[resolvedKey] || null;
}

/**
 * Obtiene todas las rutas como array
 * @returns {Array} Array de rutas
 */
export function getRoutes() {
    return Object.entries(ROUTES).map(([key, route]) => ({
        key,
        ...route
    }));
}

/**
 * Obtiene las rutas de una categoría
 * @param {string} category - Categoría (PRINCIPALES, ADMIN, LEGALES)
 * @returns {Array} Array de rutas
 */
export function getRoutesByCategory(category) {
    const keys = ROUTES_BY_CATEGORY[category] || [];
    return keys.map(key => ({
        key,
        ...ROUTES[key]
    })).filter(r => r.file);
}

/**
 * Busca una ruta por título
 * @param {string} title - Título a buscar
 * @returns {string} Clave de la ruta o null
 */
export function findRouteByTitle(title) {
    const lowerTitle = title.toLowerCase();
    for (const [key, route] of Object.entries(ROUTES)) {
        if (route.title.toLowerCase().includes(lowerTitle)) {
            return key;
        }
    }
    return null;
}

// ================================================================
// 📦 EXPORTAR TODO
// ================================================================

export default {
    ROUTES,
    ROUTE_ALIAS,
    ROUTES_BY_CATEGORY,
    getRoute,
    getRoutes,
    getRoutesByCategory,
    findRouteByTitle
};

console.log('🧭 Rutas cargadas');
console.log(`📋 ${Object.keys(ROUTES).length} rutas registradas`);
console.log(`📌 ${Object.keys(ROUTES_BY_CATEGORY).length} categorías`);