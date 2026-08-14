// ================================================================
// 🤖 MARQUINHOS API - Conexión con IA y Supabase
// ================================================================

(function() {
    'use strict';

    // ================================================================
    // 📋 CONFIGURACIÓN
    // ================================================================
    const SUPABASE_URL = window.SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_KEY = window.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

    let supabase = null;
    let marquinhos = null;
    let audioContext = null;
    let isListening = false;

    // ================================================================
    // 🔌 INICIALIZAR SUPABASE
    // ================================================================
    function initSupabase() {
        if (typeof supabaseJs !== 'undefined' && SUPABASE_URL && SUPABASE_KEY) {
            supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);
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
        // Esperar a que Marquinhos esté disponible
        if (typeof window.Marquinhos !== 'undefined') {
            marquinhos = window.Marquinhos;
            console.log('🤖 Marquinhos inicializado');
            return marquinhos;
        }

        // Si no está disponible, esperar
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
    // 🎤 CONECTAR CON MICRÓFONO (Reconocimiento de Voz)
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
                marquinhos?.setCaption(`👤 ${final}`);
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

        // ===== COMANDOS DEL SISTEMA =====
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

        // ===== COMANDOS DE NAVEGACIÓN =====
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

        // ===== COMANDOS DE INFORMACIÓN =====
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

        // ===== RESPUESTA POR DEFECTO =====
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

            // Por ahora, simulación
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

    console.log('🤖 Marquinhos API cargada');

})();