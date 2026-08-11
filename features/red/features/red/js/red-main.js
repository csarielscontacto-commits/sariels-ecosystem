// ================================================================
// 🌐 CSARIEL'S - RED MAIN
// ================================================================

// ================================================================
// 🌟 SISTEMA DE IDIOMAS
// ================================================================
const CSARIELS_IDIOMA = {
    actual: 'es',
    traducciones: {},

    init: async function() {
        this.actual = localStorage.getItem('csariels_idioma') || 'es';
        await this.cargarTraducciones(this.actual);
        this.aplicarTraducciones();
        this.actualizarBotones();
        console.log(`🌐 Mi Red - Idioma: ${this.actual}`);
        return this.actual;
    },

    cargarTraducciones: async function(idioma) {
        const traduccionesInline = {
            es: {
                'titulo_red': 'Mi Red | Csariel\'s',
                'mi_red': 'Mi Red',
                'inicio': 'Inicio',
                'live': 'Live',
                'foro': 'Foro',
                'trading': 'Trading',
                'servicios': 'Servicios',
                'internet': 'Internet',
                'tienda': 'Tienda',
                'wallet': 'Wallet',
                'terminos': 'Términos',
                'footer_red': 'Mi Red · eSIM · Contactos',
                'detectando': 'Detectando...',
                'cargando_estado': 'Cargando estado de conexión...',
                'usuario': 'Usuario',
                'miembro_activo': '⚡ Csariel\'s · Miembro Activo',
                'miembro_desde': 'Miembro desde 2024',
                'no_verificado': 'No verificado',
                'verificar': 'Verificar',
                'editar_perfil': 'Editar perfil',
                'contactos': 'Contactos',
                'solicitudes': 'Solicitudes',
                'grupos': 'Grupos',
                'seguidores': 'Seguidores',
                'mb_restantes': 'MB Restantes',
                'mb_consumidos': 'MB Consumidos',
                'mb_total': 'MB Total',
                'activar_esim': 'Activar eSIM',
                'recargar': 'Recargar',
                'renovacion': 'Renovación:',
                'descubrir': 'Descubrir',
                'bloqueados': 'Bloqueados',
                'buscar_contactos': '🔍 Buscar contactos...',
                'todos': 'Todos',
                'en_linea': 'En línea',
                'mi_perfil': 'Mi Perfil'
            },
            en: {
                'titulo_red': 'My Network | Csariel\'s',
                'mi_red': 'My Network',
                'en_linea': 'Online',
                'inicio': 'Home',
                'live': 'Live',
                'foro': 'Forum',
                'trading': 'Trading',
                'servicios': 'Services',
                'internet': 'Internet',
                'tienda': 'Store',
                'wallet': 'Wallet',
                'terminos': 'Terms',
                'footer_red': 'My Network · eSIM · Contacts',
                'detectando': 'Detecting...',
                'cargando_estado': 'Loading connection status...',
                'usuario': 'User',
                'miembro_activo': '⚡ Csariel\'s · Active Member',
                'miembro_desde': 'Member since 2024',
                'no_verificado': 'Not verified',
                'verificar': 'Verify',
                'editar_perfil': 'Edit profile',
                'contactos': 'Contacts',
                'solicitudes': 'Requests',
                'grupos': 'Groups',
                'seguidores': 'Followers',
                'mb_restantes': 'MB Remaining',
                'mb_consumidos': 'MB Consumed',
                'mb_total': 'MB Total',
                'activar_esim': 'Activate eSIM',
                'recargar': 'Recharge',
                'renovacion': 'Renewal:',
                'descubrir': 'Discover',
                'bloqueados': 'Blocked',
                'buscar_contactos': '🔍 Search contacts...',
                'todos': 'All',
                'mi_perfil': 'My Profile'
            },
            fr: {
                'titulo_red': 'Mon Réseau | Csariel\'s',
                'mi_red': 'Mon Réseau',
                'en_linea': 'En ligne',
                'inicio': 'Accueil',
                'live': 'Live',
                'foro': 'Forum',
                'trading': 'Trading',
                'servicios': 'Services',
                'internet': 'Internet',
                'tienda': 'Magasin',
                'wallet': 'Portefeuille',
                'terminos': 'Termes',
                'footer_red': 'Mon Réseau · eSIM · Contacts',
                'detectando': 'Détection...',
                'cargando_estado': 'Chargement du statut de connexion...',
                'usuario': 'Utilisateur',
                'miembro_activo': '⚡ Csariel\'s · Membre Actif',
                'miembro_desde': 'Membre depuis 2024',
                'no_verificado': 'Non vérifié',
                'verificar': 'Vérifier',
                'editar_perfil': 'Modifier le profil',
                'contactos': 'Contacts',
                'solicitudes': 'Demandes',
                'grupos': 'Groupes',
                'seguidores': 'Abonnés',
                'mb_restantes': 'MB Restants',
                'mb_consumidos': 'MB Consommés',
                'mb_total': 'MB Total',
                'activar_esim': 'Activer eSIM',
                'recargar': 'Recharger',
                'renovacion': 'Renouvellement :',
                'descubrir': 'Découvrir',
                'bloqueados': 'Bloqués',
                'buscar_contactos': '🔍 Rechercher des contacts...',
                'todos': 'Tous',
                'mi_perfil': 'Mon Profil'
            }
        };
        this.traducciones = traduccionesInline[idioma] || traduccionesInline.es;
    },

    cambiar: function(idioma) {
        if (!idioma || idioma === this.actual) return;
        this.actual = idioma;
        localStorage.setItem('csariels_idioma', idioma);
        this.cargarTraducciones(idioma).then(() => {
            this.aplicarTraducciones();
            this.actualizarBotones();
            this.notificarCambio(idioma);
        });
    },

    aplicarTraducciones: function() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.traducciones[key]) el.textContent = this.traducciones[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (this.traducciones[key]) el.placeholder = this.traducciones[key];
        });
    },

    actualizarBotones: function() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            btn.classList.toggle('active', lang === this.actual);
        });
    },

    notificarCambio: function(idioma) {
        localStorage.setItem('csariels_idioma', idioma);
        try {
            window.dispatchEvent(new CustomEvent('idioma-cambiado', { detail: { idioma: idioma } }));
        } catch (e) { console.warn(e); }
        const nombres = { es: 'Español 🌎', en: 'English 🌍', fr: 'Français 🌏' };
        mostrarToast(`🌐 ${nombres[idioma] || idioma.toUpperCase()}`);
    }
};

// ================================================================
// 🔔 TOAST GLOBAL
// ================================================================
let toastTimeout = null;

function mostrarToast(mensaje, tipo = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensaje;
    toast.className = `toast${tipo ? ' error' : ''}`;
    toast.classList.add('active');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('active'), 3000);
}

// ================================================================
// 🌟 ESTRELLAS (FONDO)
// ================================================================
function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    const STAR_COUNT = 200;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.3,
                speed: Math.random() * 0.015 + 0.005,
                opacity: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        for (let star of stars) {
            const opacity = star.opacity * (0.6 + 0.4 * Math.sin(star.twinklePhase));
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
            star.twinklePhase += star.twinkleSpeed;
            star.y += star.speed;
            if (star.y > height) {
                star.y = 0;
                star.x = Math.random() * width;
            }
        }
        requestAnimationFrame(draw);
    }
    resize();
    createStars();
    draw();
    window.addEventListener('resize', () => { resize();
        createStars(); });
}

// ================================================================
// 🚀 INICIALIZAR
// ================================================================
document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar estrellas
    initStars();

    // Inicializar idioma
    await CSARIELS_IDIOMA.init();

    console.log('🌐 Csariel\'s - Red Main cargado');
});

// Exponer funciones globales
window.CSARIELS_IDIOMA = CSARIELS_IDIOMA;
window.mostrarToast = mostrarToast;
window.initStars = initStars;