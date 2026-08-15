// ================================================================
// 🚀 MAIN - CSARIEL'S ECOSYSTEM (PUNTO DE ENTRADA)
// ================================================================
// Punto de entrada principal de la aplicación.
// Carga todo el ecosistema y lo inicializa.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
# 🚀 INICIALIZAR APLICACIÓN
// ================================================================

async function initApp() {
    console.log('🌟 Csariel\'s Ecosystem - Iniciando...');
    console.log('📍 Hecho en Puebla, México 🇲🇽');
    console.log(`🕐 ${new Date().toLocaleString()}`);

    try {
        // ================================================================
        # 🔌 INICIALIZAR SUPABASE
        // ================================================================
        
        let supabase = null;
        
        // Intentar usar window.supabase si existe
        if (window.supabase && typeof window.supabase.from === 'function') {
            supabase = window.supabase;
            console.log('✅ Supabase: reutilizando window.supabase');
        } else if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            supabase = window.supabaseClient;
            console.log('✅ Supabase: reutilizando window.supabaseClient');
        } else {
            // Intentar cargar desde CDN
            console.log('⏳ Cargando Supabase desde CDN...');
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
                script.onload = () => {
                    if (typeof supabase !== 'undefined' && supabase.createClient) {
                        const SUPABASE_URL = 'https://nvyyxgkladjauolvpzfp.supabase.co';
                        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NDA3NjMsImV4cCI6MjA5ODIxNjc2M30.3O6tea8l1UbGIlwR_2iyIS1M-dgoQC5G4G1S9YSiXL0';
                        supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                        window.supabase = supabase;
                        window.supabaseClient = supabase;
                        console.log('✅ Supabase: cargado desde CDN');
                        resolve();
                    } else {
                        reject(new Error('Supabase no se cargó correctamente'));
                    }
                };
                script.onerror = () => reject(new Error('Error cargando Supabase desde CDN'));
                document.head.appendChild(script);
            });
        }

        // ================================================================
        # 👤 OBTENER USUARIO
        // ================================================================
        
        let user = null;
        let profile = null;
        
        if (supabase) {
            try {
                const { data: { user: userData }, error } = await supabase.auth.getUser();
                if (error || !userData) {
                    // Crear sesión anónima
                    const { data, error: signError } = await supabase.auth.signInAnonymously();
                    if (signError) throw signError;
                    user = data.user;
                    console.log('👤 Sesión anónima creada');
                } else {
                    user = userData;
                    console.log(`👤 Usuario autenticado: ${user.email || user.id}`);
                }

                // Cargar perfil
                if (user) {
                    const { data: profileData } = await supabase
                        .from('perfiles')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();
                    
                    if (profileData) {
                        profile = profileData;
                        console.log(`👤 Perfil cargado: ${profile.nombre || 'Usuario'}`);
                    } else {
                        // Crear perfil si no existe
                        const { data: newProfile } = await supabase
                            .from('perfiles')
                            .insert({ user_id: user.id })
                            .select()
                            .single();
                        profile = newProfile;
                        console.log('✅ Perfil creado automáticamente');
                    }
                }
            } catch (e) {
                console.warn('⚠️ Error de autenticación:', e);
            }
        }

        // ================================================================
        # 📹 INICIALIZAR LIVEKIT
        // ================================================================
        
        try {
            if (typeof LivekitClient !== 'undefined') {
                console.log('✅ LiveKit SDK: ya cargado');
            } else {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/livekit-client@1.15.0/dist/livekit-client.umd.min.js';
                    script.onload = () => {
                        console.log('✅ LiveKit SDK: cargado desde CDN');
                        resolve();
                    };
                    script.onerror = () => reject(new Error('Error cargando LiveKit SDK'));
                    document.head.appendChild(script);
                });
            }
        } catch (e) {
            console.warn('⚠️ LiveKit no disponible:', e);
        }

        // ================================================================
        # 🌐 INICIALIZAR IDIOMA
        // ================================================================
        
        let idiomaActual = localStorage.getItem('csariels_idioma') || 'es';
        console.log(`🌐 Idioma: ${idiomaActual}`);

        // ================================================================
        # 🧭 INICIALIZAR ROUTER (si existe CsarielRouter)
        // ================================================================
        
        if (typeof CsarielRouter !== 'undefined') {
            CsarielRouter.init({
                containerId: 'app-container',
                defaultPage: 'home',
                useHash: true
            });
            console.log('✅ Router inicializado');
        } else {
            console.warn('⚠️ CsarielRouter no encontrado');
        }

        // ================================================================
        # 🎯 CONFIGURAR NAVEGACIÓN RÁPIDA
        // ================================================================
        
        document.addEventListener('keydown', (e) => {
            // Ctrl + N: Nueva publicación
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                const input = document.getElementById('nuevaPub');
                if (input) {
                    input.focus();
                    mostrarToast('✏️ Escribe tu publicación...');
                }
            }
            
            // Ctrl + K: Buscar
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                const input = document.querySelector('.busqueda-bar input, .search-bar, #buscar');
                if (input) {
                    input.focus();
                }
            }
            
            // Esc: Cerrar modales
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active, .m-ventana.abierta')
                    .forEach(el => {
                        el.classList.remove('active', 'abierta');
                    });
            }
        });

        // ================================================================
        # ✅ DETECTAR NAVEGADOR CSARIEL'S
        // ================================================================
        
        const isCsarielBrowser = window.navigator.userAgent.includes('CsarielBrowser') ||
                                window.navigator.userAgent.includes('Csariel\'s Browser');
        
        if (isCsarielBrowser) {
            console.log('🧠 Ejecutando en Csariel\'s Browser');
            document.body.classList.add('csariel-browser');
            
            if (window.csarielsAPI?.onReward) {
                window.csarielsAPI.onReward((data) => {
                    console.log(`🎁 Recompensa recibida: ${data.megas} MB`);
                    mostrarToast(`🎁 +${data.megas} MB por usar Csariel's Browser!`);
                });
            }
        }

        // ================================================================
        # ✅ LISTO
        // ================================================================
        
        console.log('✅ Csariel\'s Ecosystem listo!');
        document.dispatchEvent(new CustomEvent('csariel:ready'));

        // Mostrar toast de bienvenida
        setTimeout(() => {
            const nombre = profile?.nombre || 'Usuario';
            mostrarToast(`🌟 Bienvenido a Csariel's, ${nombre}!`);
        }, 800);

        return { user, profile, supabase, idioma: idiomaActual };

    } catch (error) {
        console.error('❌ Error al inicializar Csariel\'s:', error);
        mostrarToast('⚠️ Error al cargar la aplicación', 'error');
        throw error;
    }
}

// ================================================================
# 🔔 TOAST
// ================================================================

let toastTimeout = null;

function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        const nuevoToast = document.createElement('div');
        nuevoToast.id = 'toast';
        nuevoToast.className = 'toast';
        nuevoToast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(80px);
            background: #0a1a12;
            color: #00d68f;
            padding: 12px 24px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 0.8rem;
            opacity: 0;
            transition: all 0.4s ease;
            z-index: 5000;
            pointer-events: none;
            font-family: 'Orbitron', monospace;
            border: 1px solid rgba(0,214,143,0.15);
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(nuevoToast);
    }
    
    const toastEl = document.getElementById('toast');
    const colores = {
        success: '#00d68f',
        error: '#ff3366',
        warning: '#ffd93d',
        info: '#00d4ff'
    };
    
    toastEl.textContent = mensaje;
    toastEl.style.borderColor = colores[tipo] || '#00d68f';
    toastEl.style.color = colores[tipo] || '#00d68f';
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translateX(-50%) translateY(0)';
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(-50%) translateY(80px)';
    }, 4000);
}

// ================================================================
# 🚀 EJECUTAR CUANDO EL DOM ESTÉ LISTO
// ================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ================================================================
# 📋 EXPORTAR
// ================================================================

window.CsarielApp = {
    initApp,
    mostrarToast
};

console.log('📦 main.js cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');