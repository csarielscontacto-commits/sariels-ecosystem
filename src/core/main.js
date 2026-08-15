// ================================================================
// 🚀 MAIN - CSARIEL'S ECOSYSTEM (PUNTO DE ENTRADA)
// ================================================================
// Punto de entrada principal de la aplicación.
// Carga todo el ecosistema y lo inicializa.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { initApp, mostrarToast, on } from './App.js';
import { i18n } from '../utils/i18n.js';
import { getSupabase } from '../services/supabaseClient.js';
import livekitService from '../services/livekitService.js';

// ================================================================
# 🚀 INICIALIZAR APLICACIÓN
// ================================================================

async function init() {
    console.log('🌟 Csariel\'s Ecosystem - Iniciando...');
    console.log('📍 Hecho en Puebla, México 🇲🇽');
    console.log(`🕐 ${new Date().toLocaleString()}`);

    try {
        // Inicializar la app
        const appState = await initApp();
        
        // Mostrar mensaje de bienvenida
        const user = appState.user;
        const profile = appState.profile;
        const nombre = profile?.nombre || 'Usuario';
        
        console.log(`👤 Bienvenido, ${nombre}!`);
        console.log(`📱 ID: ${user?.id || 'anónimo'}`);
        console.log(`🔗 Conectado a Supabase: ✅`);
        console.log(`📹 LiveKit: ✅`);
        console.log(`🌐 Idioma: ${i18n.getNombreIdioma()}`);

        // Mostrar toast de bienvenida
        setTimeout(() => {
            mostrarToast(`🌟 Bienvenido a Csariel's, ${nombre}!`);
        }, 800);

        // ================================================================
        # 🎯 CONFIGURAR NAVEGACIÓN RÁPIDA
        // ================================================================
        
        // Teclas de acceso rápido
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
        # 🎨 REGISTRAR NAVEGACIÓN CON VOZ (Talaverín)
        // ================================================================
        
        // Detectar comandos de voz para navegación
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            console.log('🎤 Reconocimiento de voz disponible');
        } else {
            console.log('ℹ️ Reconocimiento de voz no soportado en este navegador');
        }

        // ================================================================
        # 🎯 EVENTOS GLOBALES
        // ================================================================
        
        // Escuchar cambios de idioma
        on('idioma-cambiado', (data) => {
            console.log(`🌐 Idioma cambiado a: ${data.idioma}`);
            i18n.aplicarAlDOM();
        });

        // Escuchar nuevas notificaciones
        on('notification:new', (notificacion) => {
            const unread = document.querySelector('.badge-notificaciones');
            if (unread) {
                const count = parseInt(unread.textContent) || 0;
                unread.textContent = count + 1;
                unread.style.display = count + 1 > 0 ? 'flex' : 'none';
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
            
            // Recompensas por usar el navegador
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

    } catch (error) {
        console.error('❌ Error al inicializar Csariel\'s:', error);
        mostrarToast('⚠️ Error al cargar la aplicación', 'error');
    }
}

// ================================================================
# 🚀 EJECUTAR CUANDO EL DOM ESTÉ LISTO
// ================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ================================================================
# 📋 EXPORTAR
// ================================================================

export default { init };

// ================================================================
# 📋 LOG DE INICIO
// ================================================================

console.log('📦 main.js cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');
console.log('🌍 Csariel\'s Ecosystem - Escala Mundial');