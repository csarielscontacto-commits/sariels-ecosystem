// ================================================================
// 🎨 useTheme - CSARIEL'S ECOSYSTEM
// ================================================================
// Hook personalizado para gestionar el tema (oscuro/claro) de la aplicación.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// 📦 TEMAS DISPONIBLES
// ================================================================

export const TEMAS = {
    OSCURO: {
        id: 'oscuro',
        nombre: 'Oscuro',
        icono: '🌙',
        variables: {
            '--space-deep': '#05080f',
            '--space-mid': '#0a1428',
            '--verde-bosque': '#0F2D1A',
            '--verde-bosque-light': '#1a4a2a',
            '--gold-cosmic': '#D4AF37',
            '--gold-dim': 'rgba(212,175,55,0.15)',
            '--gold-glow': 'rgba(212,175,55,0.25)',
            '--text-primary': '#e8f0f8',
            '--text-secondary': '#8ba3c7',
            '--text-muted': '#4a6a8a',
            '--border': 'rgba(212,175,55,0.08)',
            '--border-glow': 'rgba(212,175,55,0.25)'
        }
    },
    CLARO: {
        id: 'claro',
        nombre: 'Claro',
        icono: '☀️',
        variables: {
            '--space-deep': '#f0f4f8',
            '--space-mid': '#e2e8f0',
            '--verde-bosque': '#e8f0f8',
            '--verde-bosque-light': '#d4e0e8',
            '--gold-cosmic': '#D4AF37',
            '--gold-dim': 'rgba(212,175,55,0.15)',
            '--gold-glow': 'rgba(212,175,55,0.25)',
            '--text-primary': '#1a202c',
            '--text-secondary': '#2d3748',
            '--text-muted': '#4a6a8a',
            '--border': 'rgba(0,0,0,0.08)',
            '--border-glow': 'rgba(0,0,0,0.15)'
        }
    },
    VERDE: {
        id: 'verde',
        nombre: 'Verde',
        icono: '🌿',
        variables: {
            '--space-deep': '#0a1f0a',
            '--space-mid': '#0f2a0f',
            '--verde-bosque': '#1a4a2a',
            '--verde-bosque-light': '#2a5a3a',
            '--gold-cosmic': '#4CAF50',
            '--gold-dim': 'rgba(76,175,80,0.15)',
            '--gold-glow': 'rgba(76,175,80,0.25)',
            '--text-primary': '#e8f0e8',
            '--text-secondary': '#a0b8a0',
            '--text-muted': '#5a7a5a',
            '--border': 'rgba(76,175,80,0.08)',
            '--border-glow': 'rgba(76,175,80,0.25)'
        }
    },
    AZUL: {
        id: 'azul',
        nombre: 'Azul',
        icono: '🌊',
        variables: {
            '--space-deep': '#0a0a1f',
            '--space-mid': '#0f0f2a',
            '--verde-bosque': '#1a2a4a',
            '--verde-bosque-light': '#2a3a5a',
            '--gold-cosmic': '#2196F3',
            '--gold-dim': 'rgba(33,150,243,0.15)',
            '--gold-glow': 'rgba(33,150,243,0.25)',
            '--text-primary': '#e8f0f8',
            '--text-secondary': '#8ba3c7',
            '--text-muted': '#4a6a8a',
            '--border': 'rgba(33,150,243,0.08)',
            '--border-glow': 'rgba(33,150,243,0.25)'
        }
    },
    PURPURA: {
        id: 'purpura',
        nombre: 'Púrpura',
        icono: '🔮',
        variables: {
            '--space-deep': '#1a0a2a',
            '--space-mid': '#2a0f3a',
            '--verde-bosque': '#3a1a5a',
            '--verde-bosque-light': '#4a2a6a',
            '--gold-cosmic': '#9C27B0',
            '--gold-dim': 'rgba(156,39,176,0.15)',
            '--gold-glow': 'rgba(156,39,176,0.25)',
            '--text-primary': '#f0e8f8',
            '--text-secondary': '#c8a0d8',
            '--text-muted': '#8a5a9a',
            '--border': 'rgba(156,39,176,0.08)',
            '--border-glow': 'rgba(156,39,176,0.25)'
        }
    }
};

// ================================================================
// 📦 ESTADO DEL TEMA
// ================================================================

let themeState = {
    current: 'oscuro',
    available: Object.keys(TEMAS),
    isLoading: false,
    error: null
};

let listeners = [];

// ================================================================
# 🔄 FUNCIONES DEL TEMA
// ================================================================

/**
 * Notifica a todos los listeners del cambio de estado
 */
function notifyListeners() {
    listeners.forEach(callback => {
        try {
            callback({ ...themeState });
        } catch (e) {
            console.warn('Error en listener de tema:', e);
        }
    });
}

/**
 * Aplica las variables CSS de un tema
 * @param {string} themeId - ID del tema a aplicar
 */
function applyThemeVariables(themeId) {
    const theme = TEMAS[themeId.toUpperCase()];
    if (!theme) return;

    const root = document.documentElement;
    const vars = theme.variables;

    for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(key, value);
    }

    // Aplicar color de fondo al body
    document.body.style.background = vars['--space-deep'] || '#05080f';
    
    // Guardar en localStorage
    localStorage.setItem('csariels_theme', themeId);
}

// ================================================================
# 🎨 CAMBIAR TEMA
// ================================================================

export function setTheme(themeId) {
    try {
        const themeKey = themeId.toUpperCase();
        if (!TEMAS[themeKey]) {
            console.warn(`⚠️ Tema "${themeId}" no encontrado, usando oscuro`);
            themeId = 'oscuro';
        }

        themeState.current = themeId.toLowerCase();
        themeState.error = null;

        applyThemeVariables(themeId);
        notifyListeners();

        console.log(`🎨 Tema cambiado a: ${TEMAS[themeKey]?.nombre || themeId}`);
        return themeState.current;

    } catch (error) {
        console.error('❌ Error cambiando tema:', error);
        themeState.error = error.message;
        notifyListeners();
        return themeState.current;
    }
}

// ================================================================
# 🎨 OBTENER TEMA ACTUAL
// ================================================================

export function getCurrentTheme() {
    return themeState.current;
}

export function getCurrentThemeObject() {
    return TEMAS[themeState.current.toUpperCase()] || TEMAS.OSCURO;
}

export function getAvailableThemes() {
    return Object.values(TEMAS);
}

// ================================================================
# 🔄 ALTERNAR TEMA (OSCURO/CLARO)
// ================================================================

export function toggleTheme() {
    const current = themeState.current;
    const next = current === 'oscuro' ? 'claro' : 'oscuro';
    return setTheme(next);
}

// ================================================================
# 📥 CARGAR TEMA GUARDADO
// ================================================================

export function loadSavedTheme() {
    try {
        const saved = localStorage.getItem('csariels_theme');
        if (saved && TEMAS[saved.toUpperCase()]) {
            themeState.current = saved.toLowerCase();
            applyThemeVariables(saved);
            notifyListeners();
            return themeState.current;
        }
    } catch (e) {
        console.warn('⚠️ Error cargando tema guardado:', e);
    }
    return themeState.current;
}

// ================================================================
# 📊 OBTENER ESTADO
// ================================================================

export function useTheme() {
    return { ...themeState };
}

export function getThemeState() {
    return { ...themeState };
}

// ================================================================
# 👂 SUSCRIBIRSE A CAMBIOS
// ================================================================

export function subscribeToTheme(callback) {
    if (typeof callback === 'function') {
        listeners.push(callback);
        callback({ ...themeState });
    }
    return () => {
        listeners = listeners.filter(cb => cb !== callback);
    };
}

// ================================================================
# 🚀 INICIALIZAR
// ================================================================

export function initTheme() {
    loadSavedTheme();
    console.log(`🎨 Tema inicializado: ${themeState.current}`);
}

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    TEMAS,
    setTheme,
    getCurrentTheme,
    getCurrentThemeObject,
    getAvailableThemes,
    toggleTheme,
    loadSavedTheme,
    useTheme,
    getThemeState,
    subscribeToTheme,
    initTheme
};

console.log('🎨 useTheme cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');