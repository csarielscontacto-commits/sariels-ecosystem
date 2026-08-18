// ================================================================
// 🤖 MARQUINHOS API - Conexión con IA y Supabase
// ================================================================

(function() {
    'use strict';

    // ================================================================
    // 📋 CONFIGURACIÓN - CORREGIDA
    // ================================================================
    // Usa las mismas credenciales que en el resto del proyecto
    const SUPABASE_URL = 'https://nvyyxgkladjauolvpzfp.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NDA3NjMsImV4cCI6MjA5ODIxNjc2M30.3O6tea8l1UbGIlwR_2iyIS1M-dgoQC5G4G1S9YSiXL0';

    let supabase = null;
    let marquinhos = null;
    let audioContext = null;
    let isListening = false;

    // ================================================================
    // 🔌 INICIALIZAR SUPABASE
    // ================================================================
    function initSupabase() {
        // Verificar si supabase ya está disponible globalmente
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase;
            console.log('🔌 Supabase ya está conectado (global)');
            return supabase;
        }

        // Si no, intentar crear el cliente
        if (typeof supabaseJs !== 'undefined' && SUPABASE_URL && SUPABASE_KEY) {
            supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);
            // Guardar en window para uso global
            window.supabase = supabase;
            console.log('🔌 Supabase conectado para Marquinhos');
            return supabase;
        }

        console.warn('⚠️ Supabase no disponible para Marquinhos');
        return null;
    }

    // ================================================================
    // 🚀 INICIALIZAR MARQUINHOS
    // ================================================================
    function initMarquinhos() {
        if (typeof window.Marquinhos !== 'undefined') {
            marquinhos = window.Marquinhos;
            console.log('🤖 Marquinhos inicializado');
            return marquinhos;
        }

        return new Promise((resolve) => {
            const check = () => {
                if (typeof window.Marquinhos !== 'undefined') {
                    marquinhos = window.Marquinhos;
                    console.log('🤖 Marquinhos inicializado');
                    resolve(marquinhos);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    // ================================================================
    // 🎤 CONECTAR CON MICRÓFONO
    // ================================================================
    function iniciarEscucha() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            marquinhos?.setEmotion('sad', 'No soporto reconocimiento de voz.', 3000);
            console.warn('⚠️ Reconocimiento de voz no soportado');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'es-MX';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
            marquinhos?.setEmotion('listening', 'Escuchando...', 0);
            console.log('🎤 Escuchando...');
        };

        recognition.onresult = (event) => {
            let final = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript;
                } else {
                    interim += transcript;
                }
            }

            if (final) {
                console.log('🗣️ Usuario dijo:', final);
                // Usar la burbuja de texto de Marquinhos
                const bubble = document.getElementById('speech-bubble');
                if (bubble) {
                    bubble.textContent = `👤 ${final}`;
                    bubble.className = 'visible listening';
                    clearTimeout(bubble._timeout);
                    bubble._timeout = setTimeout(() => {
                        bubble.classList.remove('visible', 'listening');
                    }, 3000);
                }
                procesarComando(final);
            }
        };

        recognition.onerror = (event) => {
            console.error('❌ Error de reconocimiento:', event.error);
            marquinhos?.setEmotion('sad', 'No te escuché bien.', 2000);
        };

        recognition.onend = () => {
            isListening = false;
            if (!marquinhos?.speaking) {
                marquinhos?.setEmotion('caring', 'Listo para escucharte.', 1800);
            }
            console.log('🎤 Escucha finalizada');
        };

        recognition.start();
        return recognition;
    }

    // ================================================================
    // 🧠 PROCESAR COMANDOS
    // ================================================================
    function procesarComando(texto) {
        const lower = texto.toLowerCase();

        // Comandos del sistema
        if (lower.includes('hola') || lower.includes('buenas') || lower.includes('saludo')) {
            marquinhos?.react('greet');
            marquinhos?.speak('¡Hola! ¿Cómo puedo ayudarte hoy?', { emotion: 'waving' });
            return;
        }

        if (lower.includes('gracias') || lower.includes('excelente') || lower.includes('genial')) {
            marquinhos?.react('happy');
            marquinhos?.speak('¡Me alegra mucho!', { emotion: 'happy' });
            return;
        }

        if (lower.includes('cariño') || lower.includes('amor') || lower.includes('te quiero')) {
            marquinhos?.react('loving');
            marquinhos?.speak('Te acompaño con cariño.', { emotion: 'loving' });
            return;
        }

        if (lower.includes('triste') || lower.includes('problema') || lower.includes('mal')) {
            marquinhos?.react('sad');
            marquinhos?.speak('Lamento escuchar eso. Estoy aquí para ti.', { emotion: 'sad' });
            return;
        }

        if (lower.includes('wow') || lower.includes('increíble') || lower.includes('sorpresa')) {
            marquinhos?.react('surprised');
            marquinhos?.speak('¡Qué interesante!', { emotion: 'surprised' });
            return;
        }

        if (lower.includes('pensando') || lower.includes('analizando') || lower.includes('espera')) {
            marquinhos?.react('thinking');
            marquinhos?.speak('Estoy analizando eso...', { emotion: 'thinking' });
            return;
        }

        if (lower.includes('vamos') || lower.includes('celebrar') || lower.includes('adelante')) {
            marquinhos?.react('excited');
            marquinhos?.speak('¡Vamos!', { emotion: 'excited' });
            return;
        }

        // Comandos de navegación
        if (lower.includes('red') || lower.includes('mi red')) {
            marquinhos?.react('thinking');
            marquinhos?.speak('Abriendo tu Red.', { emotion: 'thinking' });
            setTimeout(() => {
                window.location.href = '/features/red/index.html';
            }, 1000);
            return;
        }

        if (lower.includes('live')) {
            marquinhos?.react('excited');
            marquinhos?.speak('¡Abriendo Live!', { emotion: 'excited' });
            setTimeout(() => {
                window.location.href = '/features/live/index.html';
            }, 1000);
            return;
        }

        if (lower.includes('foro')) {
            marquinhos?.react('thinking');
            marquinhos?.speak('Abriendo el Foro.', { emotion: 'thinking' });
            setTimeout(() => {
                window.location.href = '/features/foro/index.html';
            }, 1000);
            return;
        }

        if (lower.includes('trading')) {
            marquinhos?.react('excited');
            marquinhos?.speak('Abriendo Trading.', { emotion: 'excited' });
            setTimeout(() => {
                window.location.href = '/features/trading/index.html';
            }, 1000);
            return;
        }

        if (lower.includes('hub lealtad') || lower.includes('lealtad')) {
            marquinhos?.react('happy');
            marquinhos?.speak('Abriendo el Hub de Lealtad.', { emotion: 'happy' });
            setTimeout(() => {
                window.location.href = '/features/hub-lealtad/index.html';
            }, 1000);
            return;
        }

        // Comandos de información
        if (lower.includes('quien eres') || lower.includes('quién eres')) {
            marquinhos?.react('loving');
            marquinhos?.speak('Soy Marquinhos, tu asistente personal en Csariel\'s. Estoy aquí para ayudarte a navegar por el ecosistema.', { emotion: 'loving' });
            return;
        }

        if (lower.includes('que es es stoks') || lower.includes('es stoks')) {
            marquinhos?.react('thinking');
            marquinhos?.speak('Es.stoks son los tokens de lealtad de Csariel\'s. Se obtienen al comprar productos físicos y se pueden intercambiar entre usuarios. ¡Acumula 12 para canjear tu Tarjeta Digital!', { emotion: 'thinking' });
            return;
        }

        // Respuesta por defecto
        marquinhos?.react('caring');
        marquinhos?.speak(`Entendí que dijiste: "${texto}". ¿Puedes repetirlo o decirme algo más específico?`, { emotion: 'caring' });
    }

    // ================================================================
    // 🔄 CONECTAR CON API EXTERNA (IA)
    // ================================================================
    async function consultarIA(mensaje) {
        marquinhos?.setEmotion('thinking', 'Consultando...', 0);

        try {
            // Si tienes una API de IA, conéctala aquí
            // const response = await fetch('/api/ai/chat', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ mensaje })
            // });
            // const data = await response.json();
            // marquinhos?.speak(data.respuesta, { emotion: 'talking' });

            marquinhos?.speak('Estoy procesando tu solicitud. Dame un momento.', { emotion: 'thinking' });

        } catch (error) {
            console.error('❌ Error consultando IA:', error);
            marquinhos?.setEmotion('sad', 'Error al consultar la IA.', 2000);
        }
    }

    // ================================================================
    // 📦 EXPORTAR
    // ================================================================
    window.MarquinhosAPI = {
        initSupabase,
        initMarquinhos,
        iniciarEscucha,
        procesarComando,
        consultarIA,
        getMarquinhos: () => marquinhos,
        getSupabase: () => supabase,
        isListening: () => isListening
    };

    // ================================================================
    // 🚀 AUTO-INICIALIZACIÓN
    // ================================================================
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar Supabase
        initSupabase();
        // Esperar a que Marquinhos esté listo
        setTimeout(() => {
            initMarquinhos();
            console.log('🤖 Marquinhos API lista');
        }, 500);
    });

    console.log('🤖 Marquinhos API cargada');

})();