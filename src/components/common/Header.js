// ================================================================
// 🧭 HEADER - CSARIEL'S ECOSYSTEM
// ================================================================
// Componente de navegación principal para todo el ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { getCurrentUser, getCurrentProfile, isAuthenticated } from '../../hooks/useAuth.js';
import { getUnreadCount, subscribeToNotificationsState } from '../../hooks/useNotifications.js';
import { getCurrentTheme, setTheme, toggleTheme } from '../../hooks/useTheme.js';
import { ROUTES } from '../../config/routes.js';

// ================================================================
// 📦 ESTADO DEL HEADER
// ================================================================

let headerState = {
    user: null,
    profile: null,
    isAuthenticated: false,
    unreadCount: 0,
    theme: 'oscuro',
    isMenuOpen: false,
    isMobile: window.innerWidth < 768
};

let headerListeners = [];
let headerElement = null;

// ================================================================
# 🔔 FUNCIONES DEL HEADER
// ================================================================

/**
 * Notifica a todos los listeners del cambio de estado
 */
function notifyHeaderListeners() {
    headerListeners.forEach(callback => {
        try {
            callback({ ...headerState });
        } catch (e) {
            console.warn('Error en listener del header:', e);
        }
    });
}

/**
 * Actualiza el estado del header
 */
async function updateHeaderState() {
    headerState.user = await getCurrentUser();
    headerState.profile = await getCurrentProfile();
    headerState.isAuthenticated = isAuthenticated();
    headerState.theme = getCurrentTheme();
    headerState.unreadCount = getUnreadCount();
    notifyHeaderListeners();
}

// ================================================================
# 🖥️ RENDERIZAR HEADER
// ================================================================

export function renderHeader(containerId = 'header-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('⚠️ Contenedor del header no encontrado');
        return;
    }

    // Verificar si ya existe un header
    if (headerElement) {
        container.innerHTML = '';
    }

    headerElement = document.createElement('header');
    headerElement.className = 'header';
    headerElement.id = 'main-header';

    // Construir HTML del header
    headerElement.innerHTML = `
        <a href="/" class="logo">
            <span class="logo-icon"><span class="hex">◈</span></span>
            <span class="logo-text">Csariel's</span>
            <span class="logo-badge" data-i18n="ecosistema">Ecosistema</span>
        </a>
        <div class="header-actions">
            <!-- Selector de idioma -->
            <div class="language-selector">
                <span class="lang-icon">🌐</span>
                <button class="lang-btn active" data-lang="es" onclick="window.cambiarIdioma('es')">ES</button>
                <button class="lang-btn" data-lang="en" onclick="window.cambiarIdioma('en')">EN</button>
                <button class="lang-btn" data-lang="fr" onclick="window.cambiarIdioma('fr')">FR</button>
            </div>

            <!-- Estado de conexión -->
            <div class="status-badge">
                <span class="status-dot online"></span>
                <span data-i18n="conectado">Conectado</span>
            </div>

            <!-- Botón de tema -->
            <button class="btn btn-outline btn-sm" id="theme-toggle" title="Cambiar tema">
                <i class="fas fa-moon"></i>
            </button>

            <!-- Notificaciones -->
            <button class="btn btn-outline btn-sm" id="notifications-toggle" title="Notificaciones">
                <i class="fas fa-bell"></i>
                <span class="badge-notificaciones" id="notif-badge" style="display:none;">0</span>
            </button>

            <!-- Navegación -->
            <a href="${ROUTES.RED.path}" class="btn btn-primary btn-sm" data-i18n="mi_red">
                <i class="fas fa-users"></i> Mi Red
            </a>
            <a href="${ROUTES.LIVE.path}" class="btn btn-live btn-sm" data-i18n="live">
                <span class="live-dot"></span> Live
            </a>
            <a href="${ROUTES.FORO.path}" class="btn btn-outline btn-sm" data-i18n="foro">
                <i class="fas fa-comments"></i> Foro
            </a>
            <a href="${ROUTES.TRADING.path}" class="btn btn-trading btn-sm" data-i18n="trading">
                <i class="fas fa-chart-line"></i> Trading
            </a>
            <a href="${ROUTES.SERVICIOS.path}" class="btn btn-gold btn-sm" data-i18n="servicios">
                <i class="fas fa-tools"></i> Servicios
            </a>
            <a href="${ROUTES.INTERNET.path}" class="btn btn-internet btn-sm" data-i18n="internet">
                <i class="fas fa-satellite-dish"></i> Internet
            </a>
            <a href="${ROUTES.TIENDA.path}" class="btn btn-tienda btn-sm" data-i18n="tienda">
                <i class="fas fa-store"></i> Tienda
            </a>
            <a href="${ROUTES.WALLET.path}" class="btn btn-wallet btn-sm" data-i18n="wallet">
                <i class="fas fa-wallet"></i> Wallet
            </a>

            <!-- Perfil / Login -->
            <div id="auth-section">
                <a href="/features/red/index.html" class="btn btn-outline btn-sm" id="profile-btn">
                    <i class="fas fa-user"></i> <span id="user-name">Usuario</span>
                </a>
            </div>

            <!-- Menú móvil -->
            <button class="btn btn-outline btn-sm" id="mobile-menu-toggle" style="display:none;">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    `;

    container.appendChild(headerElement);

    // Configurar eventos
    setupHeaderEvents();

    // Actualizar estado inicial
    updateHeaderState();

    // Suscribirse a cambios de notificaciones
    subscribeToNotificationsState((state) => {
        headerState.unreadCount = state.unreadCount || 0;
        updateNotificationBadge();
        notifyHeaderListeners();
    });

    // Detectar cambios de tema
    document.addEventListener('theme:changed', () => {
        headerState.theme = getCurrentTheme();
        updateThemeIcon();
        notifyHeaderListeners();
    });

    console.log('🧭 Header renderizado');
    return headerElement;
}

// ================================================================
# 🎯 EVENTOS DEL HEADER
// ================================================================

function setupHeaderEvents() {
    if (!headerElement) return;

    // Toggle de tema
    const themeToggle = headerElement.querySelector('#theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = toggleTheme();
            updateThemeIcon();
            document.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme: newTheme } }));
        });
        updateThemeIcon();
    }

    // Notificaciones
    const notifToggle = headerElement.querySelector('#notifications-toggle');
    if (notifToggle) {
        notifToggle.addEventListener('click', () => {
            window.location.href = '/features/notificaciones/index.html';
        });
    }

    // Perfil
    const profileBtn = headerElement.querySelector('#profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (headerState.isAuthenticated) {
                window.location.href = '/features/perfil/index.html';
            } else {
                window.location.href = '/index.html';
            }
        });
    }

    // Menú móvil
    const mobileToggle = headerElement.querySelector('#mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            headerState.isMenuOpen = !headerState.isMenuOpen;
            const nav = headerElement.querySelector('.header-actions');
            if (nav) {
                nav.style.display = headerState.isMenuOpen ? 'flex' : '';
            }
            notifyHeaderListeners();
        });
    }

    // Detectar resize para móvil
    window.addEventListener('resize', () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile !== headerState.isMobile) {
            headerState.isMobile = isMobile;
            const mobileToggle = headerElement.querySelector('#mobile-menu-toggle');
            if (mobileToggle) {
                mobileToggle.style.display = isMobile ? 'inline-flex' : 'none';
            }
            if (!isMobile && headerState.isMenuOpen) {
                headerState.isMenuOpen = false;
                const nav = headerElement.querySelector('.header-actions');
                if (nav) {
                    nav.style.display = '';
                }
                notifyHeaderListeners();
            }
        }
    });
}

// ================================================================
# 🔔 ACTUALIZAR BADGE DE NOTIFICACIONES
// ================================================================

function updateNotificationBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;

    const count = headerState.unreadCount;
    if (count > 0) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// ================================================================
# 🎨 ACTUALIZAR ICONO DE TEMA
// ================================================================

function updateThemeIcon() {
    const themeToggle = headerElement?.querySelector('#theme-toggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    if (!icon) return;

    const theme = getCurrentTheme();
    if (theme === 'oscuro' || theme === 'dark') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

// ================================================================
# 📋 FUNCIONES PÚBLICAS
// ================================================================

export function updateHeader() {
    updateHeaderState();
}

export function getHeaderState() {
    return { ...headerState };
}

export function subscribeToHeader(callback) {
    if (typeof callback === 'function') {
        headerListeners.push(callback);
        callback({ ...headerState });
    }
    return () => {
        headerListeners = headerListeners.filter(cb => cb !== callback);
    };
}

// ================================================================
# 🚀 INICIALIZAR
// ================================================================

export function initHeader(containerId = 'header-container') {
    return renderHeader(containerId);
}

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    renderHeader,
    initHeader,
    updateHeader,
    getHeaderState,
    subscribeToHeader
};

console.log('🧭 Header cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');