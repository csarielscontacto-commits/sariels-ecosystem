// ================================================================
// 🦶 FOOTER - CSARIEL'S ECOSYSTEM
// ================================================================
// Componente de pie de página para todo el ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { ROUTES } from '../../config/routes.js';
import { APP_CONFIG } from '../../config/constants.js';

// ================================================================
// 📦 ESTADO DEL FOOTER
// ================================================================

let footerState = {
    year: new Date().getFullYear(),
    isVisible: true
};

let footerListeners = [];
let footerElement = null;

// ================================================================
# 🔔 FUNCIONES DEL FOOTER
// ================================================================

/**
 * Notifica a todos los listeners del cambio de estado
 */
function notifyFooterListeners() {
    footerListeners.forEach(callback => {
        try {
            callback({ ...footerState });
        } catch (e) {
            console.warn('Error en listener del footer:', e);
        }
    });
}

// ================================================================
# 🖥️ RENDERIZAR FOOTER
// ================================================================

export function renderFooter(containerId = 'footer-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('⚠️ Contenedor del footer no encontrado');
        return;
    }

    // Verificar si ya existe un footer
    if (footerElement) {
        container.innerHTML = '';
    }

    footerElement = document.createElement('footer');
    footerElement.className = 'footer';
    footerElement.id = 'main-footer';

    // Construir HTML del footer
    footerElement.innerHTML = `
        <div class="footer-top">
            <!-- Logo y descripción -->
            <div class="footer-brand">
                <span class="footer-logo">◈</span>
                <span class="footer-brand-name">Csariel's</span>
                <span class="footer-brand-badge">Ecosistema</span>
                <p class="footer-description">
                    Red Social Integral · eSIM · Trading · Web3
                </p>
            </div>

            <!-- Enlaces rápidos -->
            <div class="footer-links">
                <div class="footer-links-group">
                    <h4>🌐 Plataforma</h4>
                    <a href="${ROUTES.RED.path}">Mi Red</a>
                    <a href="${ROUTES.LIVE.path}">Live</a>
                    <a href="${ROUTES.FORO.path}">Foro</a>
                    <a href="${ROUTES.TRADING.path}">Trading</a>
                </div>
                <div class="footer-links-group">
                    <h4>🛠️ Servicios</h4>
                    <a href="${ROUTES.SERVICIOS.path}">Servicios</a>
                    <a href="${ROUTES.INTERNET.path}">Internet eSIM</a>
                    <a href="${ROUTES.TIENDA.path}">Tienda CMT</a>
                    <a href="${ROUTES.WALLET.path}">Wallet</a>
                </div>
                <div class="footer-links-group">
                    <h4>📜 Legal</h4>
                    <a href="/terminos-completos.html">Términos y Condiciones</a>
                    <a href="/aviso-privacidad.html">Aviso de Privacidad</a>
                    <a href="/terminos-servicios.html">Términos de Servicios</a>
                    <a href="/features/faq-legal/index.html">FAQ Legal</a>
                </div>
                <div class="footer-links-group">
                    <h4>🤝 Comunidad</h4>
                    <a href="/features/hub-lealtad/index.html">Hub Lealtad</a>
                    <a href="/features/rewards/index.html">Recompensas</a>
                    <a href="/features/talaverin/index.html">Talaverín</a>
                    <a href="/features/admin/index.html">Panel de Control</a>
                </div>
            </div>
        </div>

        <!-- Barra inferior -->
        <div class="footer-bottom">
            <span class="footer-copyright">
                © ${footerState.year} <span class="brand">Csariel's</span> — 
                <span data-i18n="footer_ecosistema">Ecosistema Integral · Puebla, México 🇲🇽</span>
            </span>
            <div class="footer-bottom-links">
                <a href="/" data-i18n="inicio">🏠 Inicio</a>
                <a href="/features/red/index.html" data-i18n="mi_red">👥 Mi Red</a>
                <a href="/features/live/index.html" data-i18n="live">📹 Live</a>
                <a href="/features/foro/index.html" data-i18n="foro">💬 Foro</a>
                <a href="/features/trading/index.html" data-i18n="trading">📈 Trading</a>
                <span class="footer-hex">◈</span>
                <span class="footer-version">v${APP_CONFIG.VERSION}</span>
            </div>
        </div>
    `;

    container.appendChild(footerElement);

    // Configurar eventos
    setupFooterEvents();

    console.log('🦶 Footer renderizado');
    return footerElement;
}

// ================================================================
# 🎯 EVENTOS DEL FOOTER
// ================================================================

function setupFooterEvents() {
    if (!footerElement) return;

    // Actualizar año automáticamente
    const yearElement = footerElement.querySelector('.footer-copyright .year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Detectar cambios de idioma
    document.addEventListener('i18n:changed', () => {
        // Los textos con data-i18n se actualizan automáticamente
        console.log('🌐 Footer: idioma actualizado');
    });
}

// ================================================================
# 📋 FUNCIONES PÚBLICAS
// ================================================================

export function updateFooter() {
    const yearElement = footerElement?.querySelector('.footer-copyright .year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    footerState.year = new Date().getFullYear();
    notifyFooterListeners();
}

export function getFooterState() {
    return { ...footerState };
}

export function subscribeToFooter(callback) {
    if (typeof callback === 'function') {
        footerListeners.push(callback);
        callback({ ...footerState });
    }
    return () => {
        footerListeners = footerListeners.filter(cb => cb !== callback);
    };
}

// ================================================================
# 🚀 INICIALIZAR
// ================================================================

export function initFooter(containerId = 'footer-container') {
    return renderFooter(containerId);
}

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    renderFooter,
    initFooter,
    updateFooter,
    getFooterState,
    subscribeToFooter
};

console.log('🦶 Footer cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');