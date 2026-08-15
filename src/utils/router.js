// ================================================================
// 🧭 ROUTER ULTRARRÁPIDO - CSARIEL'S ECOSYSTEM
// ================================================================
// Modo "Single Page App" ligero para navegación sin recarga.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

const CsarielRouter = {
    // ================================================================
    // 📌 ESTADO ACTUAL
    // ================================================================
    
    currentPage: 'home',
    containerId: 'app-container',
    defaultPage: 'home',
    useHash: true,

    // ================================================================
    // 📋 PÁGINAS Y SUS RUTAS
    // ================================================================
    
    pages: {
        // === FEATURES PRINCIPALES ===
        home: { 
            title: 'Inicio', 
            file: 'index.html',
            icon: 'fa-home'
        },
        red: { 
            title: 'Mi Red', 
            file: 'features/red/index.html',
            icon: 'fa-users'
        },
        live: { 
            title: 'Muro Live', 
            file: 'features/live/index.html',
            icon: 'fa-rss'
        },
        trading: { 
            title: 'Trading', 
            file: 'features/trading/index.html',
            icon: 'fa-chart-line'
        },
        servicios: { 
            title: 'Servicios', 
            file: 'features/servicios/index.html',
            icon: 'fa-tools'
        },
        internet: { 
            title: 'Internet', 
            file: 'features/internet/index.html',
            icon: 'fa-satellite-dish'
        },
        tienda: { 
            title: 'Tienda CMT', 
            file: 'features/tienda/index.html',
            icon: 'fa-store'
        },
        wallet: { 
            title: 'Wallet', 
            file: 'features/wallet/index.html',
            icon: 'fa-wallet'
        },
        foro: { 
            title: 'Foro Social', 
            file: 'features/foro/index.html',
            icon: 'fa-comments'
        },

        // === ADMIN Y LEGALES ===
        admin: { 
            title: 'Panel de Control', 
            file: 'features/admin/index.html',
            icon: 'fa-cogs'
        },
        legal: { 
            title: 'Legal Hub', 
            file: 'features/legal-hub/index.html',
            icon: 'fa-gavel'
        },
        contrato: { 
            title: 'Contrato Creador', 
            file: 'features/contrato-creador/index.html',
            icon: 'fa-file-contract'
        },
        derechos: { 
            title: 'Derechos de Autor', 
            file: 'features/derechos-autor/index.html',
            icon: 'fa-copyright'
        },
        moderacion: { 
            title: 'Moderación', 
            file: 'features/moderacion/index.html',
            icon: 'fa-shield-halved'
        },
        talaverin: { 
            title: 'Talaverín', 
            file: 'features/talaverin/index.html',
            icon: 'fa-robot'
        },
        rewards: { 
            title: 'Recompensas', 
            file: 'features/rewards/index.html',
            icon: 'fa-gift'
        },
        takedown: { 
            title: 'Formulario Takedown', 
            file: 'features/takedown/index.html',
            icon: 'fa-triangle-exclamation'
        },
        hub_lealtad: { 
            title: 'Hub Lealtad', 
            file: 'features/hub-lealtad/index.html',
            icon: 'fa-handshake'
        },

        // === PÁGINAS LEGALES ===
        privacidad: { 
            title: 'Aviso de Privacidad', 
            file: 'aviso-privacidad.html',
            icon: 'fa-shield-alt'
        },
        terminos: { 
            title: 'Términos y Condiciones', 
            file: 'terminos-completos.html',
            icon: 'fa-file-contract'
        },
        terminos_servicios: { 
            title: 'Términos Servicios', 
            file: 'terminos-servicios.html',
            icon: 'fa-handshake'
        }
    },

    // ================================================================
    // 📋 ALIAS (NOMBRES ALTERNATIVOS)
    // ================================================================
    
    alias: {
        'mired': 'red',
        'muro-live': 'live',
        'servicios-comunitarios': 'servicios',
        'mi-internet': 'internet',
        'panel-web3': 'admin',
        'tiendita': 'tienda',
        'cartera': 'wallet',
        'terminos-uso': 'terminos',
        'lealtad': 'hub_lealtad'
    },

    // ================================================================
    // 🧭 NAVEGAR A UNA PÁGINA
    // ================================================================
    
    async navigateTo(pageKey, data = null) {
        const resolvedKey = this.alias[pageKey] || pageKey;
        const page = this.pages[resolvedKey];
        
        if (!page) {
            console.warn(`⚠️ Página "${pageKey}" no encontrada`);
            return this.navigateTo(this.defaultPage);
        }

        this.currentPage = resolvedKey;
        document.title = `◈ Csariel's | ${page.title}`;
        
        const mainContainer = document.getElementById(this.containerId);
        if (!mainContainer) {
            console.warn('⚠️ Contenedor no encontrado');
            return;
        }
        
        mainContainer.style.opacity = '0.4';
        mainContainer.style.transition = 'opacity 0.2s';

        try {
            const response = await fetch(page.file);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            let newContent = doc.querySelector('main');
            if (!newContent) {
                const body = doc.body.cloneNode(true);
                body.querySelectorAll('script, style, link[rel="stylesheet"]').forEach(el => el.remove());
                newContent = body;
            }
            
            mainContainer.innerHTML = newContent.innerHTML;
            mainContainer.style.opacity = '1';
            
            this._executeScripts(mainContainer);
            
            document.dispatchEvent(new CustomEvent('csariel:navigate', {
                detail: { page: resolvedKey, title: page.title, data }
            }));

            if (this.useHash) {
                window.history.pushState({ page: resolvedKey }, '', `#${resolvedKey}`);
            } else {
                window.history.pushState({ page: resolvedKey }, '', `/${resolvedKey}`);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log(`✅ Navegado a: ${page.title}`);

        } catch (error) {
            console.error('❌ Error cargando la página:', error);
            mainContainer.innerHTML = `
                <div style="text-align:center;padding:40px 20px;">
                    <div style="font-size:3rem;margin-bottom:16px;">⚠️</div>
                    <h2 style="color:var(--gold-cosmic);font-family:Orbitron;font-size:1.2rem;">Error al cargar</h2>
                    <p style="color:var(--text-muted);margin-top:8px;">No se pudo cargar "${page.title}"</p>
                    <button onclick="CsarielRouter.navigateTo('home')" 
                            style="margin-top:16px;padding:10px 24px;background:var(--gold-cosmic);color:#000;border:none;border-radius:20px;font-family:Orbitron;cursor:pointer;">
                        Volver al Inicio
                    </button>
                </div>
            `;
            mainContainer.style.opacity = '1';
        }
    },

    // ================================================================
    // 🔧 EJECUTAR SCRIPTS DEL CONTENIDO CARGADO
    // ================================================================
    
    _executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    },

    // ================================================================
    // 📋 OBTENER PÁGINA ACTUAL
    // ================================================================
    
    getCurrentPage() {
        return {
            key: this.currentPage,
            ...this.pages[this.currentPage]
        };
    },

    getPages() {
        return this.pages;
    },

    getPageKeys() {
        return Object.keys(this.pages);
    },

    // ================================================================
    // 🔍 BUSCAR PÁGINA POR TÍTULO
    // ================================================================
    
    findPageByTitle(title) {
        const lowerTitle = title.toLowerCase();
        for (const [key, page] of Object.entries(this.pages)) {
            if (page.title.toLowerCase().includes(lowerTitle)) {
                return key;
            }
        }
        return null;
    },

    // ================================================================
    // 🔄 RECARGAR PÁGINA ACTUAL
    // ================================================================
    
    reload() {
        if (this.currentPage) {
            this.navigateTo(this.currentPage);
        }
    },

    // ================================================================
    // 🧹 LIMPIAR CACHÉ
    // ================================================================
    
    clearCache() {
        if ('caches' in window) {
            caches.keys().then(keys => {
                keys.forEach(key => caches.delete(key));
            });
        }
        console.log('🧹 Caché limpiado');
    },

    // ================================================================
    // 🚀 INICIALIZAR ROUTER
    // ================================================================
    
    init(options = {}) {
        this.containerId = options.containerId || 'app-container';
        this.defaultPage = options.defaultPage || 'home';
        this.useHash = options.useHash !== undefined ? options.useHash : true;
        
        console.log(`🧭 CsarielRouter iniciado`);
        console.log(`📋 ${Object.keys(this.pages).length} páginas registradas`);
        console.log(`📌 Página por defecto: ${this.defaultPage}`);

        // Escuchar clicks en enlaces con data-csariel-page
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-csariel-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.csarielPage;
                const resolvedKey = this.alias[page] || page;
                if (this.pages[resolvedKey]) {
                    this.navigateTo(page);
                } else {
                    console.warn(`⚠️ Enlace a página no registrada: "${page}"`);
                    window.location.href = link.href;
                }
            }
        });

        // Escuchar el botón "Atrás" del navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                const resolvedKey = this.alias[e.state.page] || e.state.page;
                if (this.pages[resolvedKey]) {
                    this.navigateTo(resolvedKey);
                }
            }
        });

        // Cargar la página inicial desde la URL
        const hash = window.location.hash.replace('#', '');
        const path = window.location.pathname.replace(/^\//, '');
        
        let initialPage = this.defaultPage;
        
        if (this.useHash && hash && this.pages[hash]) {
            initialPage = hash;
        } else if (!this.useHash && path && this.pages[path]) {
            initialPage = path;
        }
        
        if (this.alias[initialPage]) {
            initialPage = this.alias[initialPage];
        }

        setTimeout(() => {
            this.navigateTo(initialPage);
        }, 50);

        document.dispatchEvent(new CustomEvent('csariel:router:ready', {
            detail: { pages: this.pages, defaultPage: this.defaultPage }
        }));

        console.log(`✅ Router listo. Página inicial: ${initialPage}`);
    }
};

// ================================================================
// 🚀 EXPORTAR
// ================================================================

export default CsarielRouter;

// ================================================================
// 📋 INICIALIZAR AUTOMÁTICAMENTE
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app-container');
    if (container) {
        CsarielRouter.init({
            containerId: 'app-container',
            defaultPage: 'home',
            useHash: true
        });
    } else {
        console.warn('⚠️ No se encontró #app-container, creando...');
        const app = document.querySelector('.app') || document.body;
        const newContainer = document.createElement('div');
        newContainer.id = 'app-container';
        if (app === document.body) {
            app.prepend(newContainer);
        } else {
            app.appendChild(newContainer);
        }
        CsarielRouter.init({
            containerId: 'app-container',
            defaultPage: 'home',
            useHash: true
        });
    }
});

console.log('🧭 CsarielRouter v3.0.0 cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');