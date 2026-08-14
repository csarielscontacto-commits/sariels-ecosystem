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
            return;
        }

        const btnEscuchar = document.getElementById('btnEscuchar');
        if (btnEscuchar) {
            btnEscuchar.addEventListener('click', toggleListening);
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
            mostrarToast('⚠️ Reconocimiento de voz no soportado', 'error');
            return;
        }

        recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
            window.Marquinhos?.setEmotion('listening', '🎤 Escuchando...', 0);
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
                window.Marquinhos?.setCaption(`👤 ${final}`);
                window.MarquinhosAPI?.procesarComando(final);
            } else if (interim) {
                window.Marquinhos?.setCaption(`👤 ${interim}...`);
            }
        };

        recognition.onerror = (event) => {
            console.error('❌ Error:', event.error);
            if (event.error === 'not-allowed') {
                mostrarToast('⚠️ Permiso de micrófono denegado', 'error');
                window.Marquinhos?.setEmotion('sad', 'No tengo acceso al micrófono.', 2000);
            }
        };

        recognition.onend = () => {
            isListening = false;
            actualizarBotonEscucha(false);
            if (!window.Marquinhos?.speaking) {
                window.Marquinhos?.setEmotion('caring', 'Listo para escucharte.', 1800);
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
            window.Marquinhos?.setEmotion('caring', 'Escucha detenida.', 1500);
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

    document.addEventListener('DOMContentLoaded', function() {
        initVoiceIntegration();
        console.log('🎤 Voice Integration cargada');
    });

})();