// ================================================================
// 🎤 VOICE INTEGRATION - Conectar voz con Marquinhos
// ================================================================

(function() {
    'use strict';

    let recognition = null;
    let isListening = false;
    let audioElement = null;

    // ================================================================
    // 🔌 INICIALIZAR
    // ================================================================
    function initVoiceIntegration() {
        console.log('🎤 Voice Integration iniciada');

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('⚠️ Reconocimiento de voz no soportado');
            if (window.mostrarToast) {
                window.mostrarToast('⚠️ Reconocimiento de voz no soportado', 'error');
            }
            return;
        }

        const btnEscuchar = document.getElementById('btnEscuchar');
        if (btnEscuchar) {
            btnEscuchar.addEventListener('click', toggleListening);
            console.log('🎤 Botón de escucha configurado');
        } else {
            console.warn('⚠️ Botón #btnEscuchar no encontrado');
        }
    }

    // ================================================================
    // 🎤 INICIAR / DETENER ESCUCHA
    // ================================================================
    function toggleListening() {
        if (isListening) {
            detenerEscucha();
        } else {
            iniciarEscucha();
        }
    }

    function iniciarEscucha() {
        if (isListening) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            if (window.mostrarToast) {
                window.mostrarToast('⚠️ Reconocimiento de voz no soportado', 'error');
            }
            return;
        }

        recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
            // Usar la burbuja de texto de Marquinhos
            const bubble = document.getElementById('speech-bubble');
            if (bubble) {
                bubble.textContent = '🎤 Escuchando...';
                bubble.className = 'visible listening';
                clearTimeout(bubble._timeout);
                bubble._timeout = setTimeout(() => {
                    bubble.classList.remove('visible', 'listening');
                }, 3000);
            }
            actualizarBotonEscucha(true);
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
                console.log('🗣️ Usuario:', final);
                // Mostrar en burbuja
                const bubble = document.getElementById('speech-bubble');
                if (bubble) {
                    bubble.textContent = `👤 ${final}`;
                    bubble.className = 'visible listening';
                    clearTimeout(bubble._timeout);
                    bubble._timeout = setTimeout(() => {
                        bubble.classList.remove('visible', 'listening');
                    }, 3000);
                }
                // Procesar comando
                if (window.MarquinhosAPI && typeof window.MarquinhosAPI.procesarComando === 'function') {
                    window.MarquinhosAPI.procesarComando(final);
                } else if (window.Marquinhos && typeof window.Marquinhos.processCommand === 'function') {
                    window.Marquinhos.processCommand(final);
                } else {
                    console.warn('⚠️ No se encontró un procesador de comandos');
                }
            } else if (interim) {
                const bubble = document.getElementById('speech-bubble');
                if (bubble) {
                    bubble.textContent = `👤 ${interim}...`;
                    bubble.className = 'visible listening';
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('❌ Error:', event.error);
            if (event.error === 'not-allowed') {
                if (window.mostrarToast) {
                    window.mostrarToast('⚠️ Permiso de micrófono denegado', 'error');
                }
                const bubble = document.getElementById('speech-bubble');
                if (bubble) {
                    bubble.textContent = '🔇 Permiso de micrófono denegado';
                    bubble.className = 'visible';
                    clearTimeout(bubble._timeout);
                    bubble._timeout = setTimeout(() => {
                        bubble.classList.remove('visible');
                    }, 3000);
                }
            }
        };

        recognition.onend = () => {
            isListening = false;
            actualizarBotonEscucha(false);
            if (!window.Marquinhos?.speaking) {
                const bubble = document.getElementById('speech-bubble');
                if (bubble) {
                    bubble.textContent = '💬 Listo para escucharte';
                    bubble.className = 'visible';
                    clearTimeout(bubble._timeout);
                    bubble._timeout = setTimeout(() => {
                        bubble.classList.remove('visible');
                    }, 2000);
                }
            }
            console.log('🎤 Escucha finalizada');
        };

        recognition.start();
    }

    function detenerEscucha() {
        if (recognition && isListening) {
            recognition.stop();
            isListening = false;
            actualizarBotonEscucha(false);
            const bubble = document.getElementById('speech-bubble');
            if (bubble) {
                bubble.textContent = '⏸️ Escucha detenida';
                bubble.className = 'visible';
                clearTimeout(bubble._timeout);
                bubble._timeout = setTimeout(() => {
                    bubble.classList.remove('visible');
                }, 1500);
            }
        }
    }

    // ================================================================
    // 🎨 ACTUALIZAR UI
    // ================================================================
    function actualizarBotonEscucha(activo) {
        const btn = document.getElementById('btnEscuchar');
        if (!btn) return;
        if (activo) {
            btn.innerHTML = '<i class="fas fa-microphone-slash"></i> Detener';
            btn.className = 'btn btn-danger';
        } else {
            btn.innerHTML = '<i class="fas fa-microphone"></i> Hablar';
            btn.className = 'btn btn-primary';
        }
    }

    // ================================================================
    // 📦 EXPORTAR
    // ================================================================
    window.VoiceIntegration = {
        initVoiceIntegration,
        toggleListening,
        iniciarEscucha,
        detenerEscucha,
        isListening: () => isListening
    };

    // ================================================================
    // 🚀 AUTO-INICIALIZACIÓN
    // ================================================================
    document.addEventListener('DOMContentLoaded', function() {
        // Esperar a que Marquinhos y la API estén listos
        setTimeout(() => {
            initVoiceIntegration();
            console.log('🎤 Voice Integration cargada');
        }, 500);
    });

})();