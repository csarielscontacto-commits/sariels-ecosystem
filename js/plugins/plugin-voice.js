/**
 * ================================================================
 * 🎤 PLUGIN DE VOZ - TALAVERÍN VOICE OS - Csariel's Ecosystem
 * ================================================================
 * Plugin para el asistente de voz Talaverín con reconocimiento
 * de voz (Speech Recognition) y síntesis de voz (Speech Synthesis).
 * Permite navegar por el ecosistema usando comandos de voz.
 * 
 * Hecho en Puebla, México 🇲🇽
 * Versión: 2.1.0
 * ================================================================
 */

// ================================================================
// 🎤 PLUGIN DE VOZ
// ================================================================

export const voicePlugin = {
    // ================================================================
    // 🔧 ESTADO
    // ================================================================
    
    recognition: null,
    synth: window.speechSynthesis,
    isListening: false,
    isSpeaking: false,
    commandHistory: [],
    maxHistory: 20,
    voiceActivated: false,
    currentLang: 'es-MX',
    listeners: [],
    wakeWord: 'talaverín',
    isWakeWordActive: false,

    // ================================================================
    // 📋 CONFIGURACIÓN
    // ================================================================
    
    CONFIG: {
        lang: 'es-MX',
        rate: 1.1,
        pitch: 1.0,
        continuous: false,
        interimResults: false,
        maxAlternatives: 1,
        autoRestart: true,
        restartDelay: 500,
        debug: false
    },

    // ================================================================
    // 📋 COMANDOS DISPONIBLES
    // ================================================================
    
    COMANDOS: {
        'muro': { accion: 'navegar', destino: '../live/index.html', mensaje: 'Abriendo Muro Live' },
        'live': { accion: 'navegar', destino: '../live/index.html', mensaje: 'Abriendo Muro Live' },
        'red': { accion: 'navegar', destino: '../red/index.html', mensaje: 'Abriendo Mi Red' },
        'mi red': { accion: 'navegar', destino: '../red/index.html', mensaje: 'Abriendo Mi Red' },
        'mired': { accion: 'navegar', destino: '../red/index.html', mensaje: 'Abriendo Mi Red' },
        'trading': { accion: 'navegar', destino: '../trading/index.html', mensaje: 'Abriendo Trading' },
        'comprar': { accion: 'navegar', destino: '../tienda/index.html', mensaje: 'Abriendo Tienda' },
        'tienda': { accion: 'navegar', destino: '../tienda/index.html', mensaje: 'Abriendo Tienda' },
        'tiendita': { accion: 'navegar', destino: '../tienda/index.html', mensaje: 'Abriendo Tiendita' },
        'servicios': { accion: 'navegar', destino: '../servicios/index.html', mensaje: 'Abriendo Servicios' },
        'internet': { accion: 'navegar', destino: '../internet/index.html', mensaje: 'Abriendo Internet' },
        'wallet': { accion: 'navegar', destino: '../wallet/index.html', mensaje: 'Abriendo Wallet' },
        'cartera': { accion: 'navegar', destino: '../wallet/index.html', mensaje: 'Abriendo Wallet' },
        'memes': { accion: 'navegar', destino: '../memes/index.html', mensaje: 'Abriendo Memes' },
        'inicio': { accion: 'navegar', destino: '../../index.html', mensaje: 'Volviendo al Inicio' },
        'home': { accion: 'navegar', destino: '../../index.html', mensaje: 'Volviendo al Inicio' },
        'admin': { accion: 'navegar', destino: '../admin/index.html', mensaje: 'Abriendo Panel de Control' },
        'panel': { accion: 'navegar', destino: '../admin/index.html', mensaje: 'Abriendo Panel de Control' },
        'términos': { accion: 'navegar', destino: '../../terminos-completos.html', mensaje: 'Abriendo Términos' },
        'privacidad': { accion: 'navegar', destino: '../../aviso-privacidad.html', mensaje: 'Abriendo Aviso de Privacidad' },
        'ayuda': { accion: 'ayuda', mensaje: 'Puedes decir: muro, red, trading, tienda, servicios, internet, wallet, memes, inicio, admin, términos o privacidad' },
        'qué puedes hacer': { accion: 'ayuda', mensaje: 'Puedes decir: muro, red, trading, tienda, servicios, internet, wallet, memes, inicio, admin, términos o privacidad' },
        'hola': { accion: 'saludo', mensaje: '¡Hola! Soy Talaverín, tu asistente de voz. ¿En qué puedo ayudarte?' },
        'gracias': { accion: 'saludo', mensaje: '¡De nada! Para eso estoy aquí.' }
    },

    // ================================================================
    // 🚀 INICIALIZAR
    // ================================================================
    
    init(config = {}) {
        // Cargar configuración
        this.CONFIG = { ...this.CONFIG, ...config };

        // Verificar soporte de voz
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('❌ Tu navegador no soporta reconocimiento de voz');
            this._emitEvent('talaverin:error', { mensaje: 'Voz no soportada' });
            return false;
        }

        // Inicializar reconocimiento
        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.CONFIG.lang;
        this.recognition.continuous = this.CONFIG.continuous;
        this.recognition.interimResults = this.CONFIG.interimResults;
        this.recognition.maxAlternatives = this.CONFIG.maxAlternatives;

        // Configurar eventos
        this._setupRecognitionEvents();

        // Inicializar síntesis de voz
        this.synth = window.speechSynthesis;

        // Cargar configuración guardada
        this._cargarConfiguracion();

        console.log('✅ Talaverín Voice OS listo');
        console.log(`🎤 Idioma: ${this.CONFIG.lang}`);
        console.log(`🔊 Palabra de activación: "${this.wakeWord}"`);
        
        this._emitEvent('talaverin:iniciado', { version: '2.1.0' });
        return true;
    },

    // ================================================================
    // 🎙️ CONFIGURAR EVENTOS DE RECONOCIMIENTO
    // ================================================================
    
    _setupRecognitionEvents() {
        if (!this.recognition) return;

        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('🎤 Escuchando...');
            this._emitEvent('talaverin:escuchando');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('🎤 Dejé de escuchar');
            this._emitEvent('talaverin:silenciado');
            
            // Reiniciar automáticamente si está activado
            if (this.CONFIG.autoRestart && this.voiceActivated) {
                setTimeout(() => {
                    this.escuchar();
                }, this.CONFIG.restartDelay);
            }
        };

        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const texto = event.results[last][0].transcript;
            const confianza = event.results[last][0].confidence;
            
            console.log(`🗣️ Dijiste: "${texto}" (confianza: ${Math.round(confianza * 100)}%)`);
            this._emitEvent('talaverin:resultado', { texto, confianza });
            
            // Procesar el comando
            this.procesarComando(texto);
        };

        this.recognition.onerror = (event) => {
            console.error('❌ Error de voz:', event.error);
            this._emitEvent('talaverin:error', { error: event.error });
            
            if (event.error === 'not-allowed') {
                this.hablar('Por favor, permite el acceso al micrófono.');
            }
        };
    },

    // ================================================================
    // 🎤 ESCUCHAR
    // ================================================================
    
    escuchar() {
        if (!this.recognition) {
            const iniciado = this.init();
            if (!iniciado) return;
        }

        // Si ya está escuchando, detener y reiniciar
        if (this.isListening) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.log('⚠️ Ya estaba escuchando');
            }
            setTimeout(() => {
                this._iniciarEscucha();
            }, 200);
            return;
        }

        this._iniciarEscucha();
    },

    _iniciarEscucha() {
        try {
            this.recognition.start();
            this.voiceActivated = true;
        } catch (e) {
            console.warn('⚠️ Error al iniciar escucha:', e);
            if (this.CONFIG.autoRestart) {
                setTimeout(() => {
                    this._iniciarEscucha();
                }, 500);
            }
        }
    },

    // ================================================================
    // 🗣️ HABLAR (SÍNTESIS DE VOZ)
    // ================================================================
    
    hablar(texto, callback = null) {
        if (!this.synth) {
            console.warn('⚠️ Síntesis de voz no disponible');
            return false;
        }

        // Cancelar cualquier discurso en curso
        this.synth.cancel();

        const utter = new SpeechSynthesisUtterance(texto);
        utter.lang = this.CONFIG.lang;
        utter.rate = this.CONFIG.rate;
        utter.pitch = this.CONFIG.pitch;

        // Buscar voz en español
        const voces = this.synth.getVoices();
        const vozES = voces.find(v => v.lang.startsWith('es'));
        if (vozES) {
            utter.voice = vozES;
        }

        this.isSpeaking = true;
        this._emitEvent('talaverin:hablando', { texto });

        utter.onend = () => {
            this.isSpeaking = false;
            this._emitEvent('talaverin:termino_hablar');
            if (callback) callback();
        };

        utter.onerror = () => {
            this.isSpeaking = false;
            console.warn('⚠️ Error al hablar');
        };

        this.synth.speak(utter);
        console.log(`🗣️ Talaverín dice: "${texto}"`);
        return true;
    },

    // ================================================================
    // 🧠 PROCESAR COMANDO
    // ================================================================
    
    procesarComando(texto) {
        if (!texto || texto.trim() === '') return;

        const textoLower = texto.toLowerCase().trim();
        
        // Guardar en historial
        this.commandHistory.push({
            texto: texto,
            timestamp: new Date().toISOString()
        });
        if (this.commandHistory.length > this.maxHistory) {
            this.commandHistory = this.commandHistory.slice(-this.maxHistory);
        }

        // Verificar palabra de activación
        if (this.isWakeWordActive) {
            if (!textoLower.includes(this.wakeWord)) {
                // Si no se activó, ignorar (modo wake word)
                return;
            }
            // Quitar la palabra de activación del comando
            const comandoLimpio = textoLower.replace(this.wakeWord, '').trim();
            if (comandoLimpio) {
                this._ejecutarComando(comandoLimpio);
            } else {
                this.hablar('Dime qué quieres hacer.');
            }
            return;
        }

        // Modo normal: procesar directamente
        this._ejecutarComando(textoLower);
    },

    _ejecutarComando(texto) {
        let comandoEncontrado = null;
        let mensajeEncontrado = null;

        // Buscar el comando más largo que coincida
        const comandosOrdenados = Object.keys(this.COMANDOS).sort((a, b) => b.length - a.length);
        
        for (const cmd of comandosOrdenados) {
            if (texto.includes(cmd)) {
                comandoEncontrado = this.COMANDOS[cmd];
                mensajeEncontrado = cmd;
                break;
            }
        }

        if (!comandoEncontrado) {
            this.hablar('No entendí eso. Di "ayuda" para ver qué puedo hacer.');
            this._emitEvent('talaverin:comando_no_reconocido', { texto });
            return;
        }

        this._emitEvent('talaverin:comando', { 
            comando: mensajeEncontrado, 
            accion: comandoEncontrado.accion,
            destino: comandoEncontrado.destino || null
        });

        // Ejecutar la acción
        switch (comandoEncontrado.accion) {
            case 'navegar':
                this.hablar(comandoEncontrado.mensaje, () => {
                    if (comandoEncontrado.destino) {
                        setTimeout(() => {
                            window.location.href = comandoEncontrado.destino;
                        }, 500);
                    }
                });
                break;

            case 'ayuda':
                this.hablar(comandoEncontrado.mensaje);
                break;

            case 'saludo':
                this.hablar(comandoEncontrado.mensaje);
                break;

            default:
                this.hablar('No sé cómo ejecutar ese comando.');
        }
    },

    // ================================================================
    // 🔑 PALABRA DE ACTIVACIÓN (WAKE WORD)
    // ================================================================
    
    activarWakeWord() {
        this.isWakeWordActive = true;
        this.hablar(`Palabra de activación "${this.wakeWord}" activada. Di ${this.wakeWord} para llamarme.`);
        console.log(`🔑 Wake word "${this.wakeWord}" activada`);
        this._emitEvent('talaverin:wake_word_activada');
        return this;
    },

    desactivarWakeWord() {
        this.isWakeWordActive = false;
        this.hablar('Palabra de activación desactivada. Escucharé todo lo que digas.');
        console.log('🔑 Wake word desactivada');
        this._emitEvent('talaverin:wake_word_desactivada');
        return this;
    },

    setWakeWord(palabra) {
        this.wakeWord = palabra.toLowerCase();
        this.hablar(`Palabra de activación cambiada a "${this.wakeWord}"`);
        console.log(`🔑 Nueva wake word: "${this.wakeWord}"`);
        this._guardarConfiguracion();
        return this;
    },

    // ================================================================
    // 🎵 VOZ - CONFIGURACIÓN
    // ================================================================
    
    setVoz(rate = 1.1, pitch = 1.0) {
        this.CONFIG.rate = rate;
        this.CONFIG.pitch = pitch;
        this.hablar(`Velocidad: ${rate}, Tono: ${pitch}`);
        this._guardarConfiguracion();
        return this;
    },

    setIdioma(lang) {
        this.CONFIG.lang = lang;
        this.recognition.lang = lang;
        this.hablar(`Idioma cambiado a ${lang}`);
        this._guardarConfiguracion();
        return this;
    },

    // ================================================================
    // 📊 OBTENER COMANDOS DISPONIBLES
    // ================================================================
    
    getComandos() {
        const comandos = [];
        const vistos = new Set();
        for (const [key, value] of Object.entries(this.COMANDOS)) {
            if (!vistos.has(value.accion)) {
                vistos.add(value.accion);
                comandos.push({
                    palabra: key,
                    accion: value.accion,
                    descripcion: value.mensaje || key
                });
            }
        }
        return comandos;
    },

    getHistorial() {
        return this.commandHistory;
    },

    getEstado() {
        return {
            isListening: this.isListening,
            isSpeaking: this.isSpeaking,
            voiceActivated: this.voiceActivated,
            isWakeWordActive: this.isWakeWordActive,
            wakeWord: this.wakeWord,
            lang: this.CONFIG.lang,
            rate: this.CONFIG.rate,
            pitch: this.CONFIG.pitch,
            commandHistory: this.commandHistory.length
        };
    },

    // ================================================================
    // 📢 EMITIR EVENTOS
    // ================================================================
    
    _emitEvent(evento, datos = {}) {
        document.dispatchEvent(new CustomEvent(evento, { detail: datos }));
        // Notificar a listeners
        for (const listener of this.listeners) {
            if (listener.event === evento) {
                listener.callback(datos);
            }
        }
    },

    on(evento, callback) {
        this.listeners.push({ event: evento, callback });
        document.addEventListener(evento, (e) => callback(e.detail));
        return this;
    },

    // ================================================================
    // 💾 GUARDAR/CARGAR CONFIGURACIÓN
    // ================================================================
    
    _guardarConfiguracion() {
        try {
            localStorage.setItem('talaverin_config', JSON.stringify({
                wakeWord: this.wakeWord,
                isWakeWordActive: this.isWakeWordActive,
                rate: this.CONFIG.rate,
                pitch: this.CONFIG.pitch,
                lang: this.CONFIG.lang
            }));
        } catch (e) {
            console.warn('⚠️ Error guardando configuración:', e);
        }
    },

    _cargarConfiguracion() {
        try {
            const stored = localStorage.getItem('talaverin_config');
            if (stored) {
                const config = JSON.parse(stored);
                if (config.wakeWord) this.wakeWord = config.wakeWord;
                if (config.isWakeWordActive !== undefined) this.isWakeWordActive = config.isWakeWordActive;
                if (config.rate) this.CONFIG.rate = config.rate;
                if (config.pitch) this.CONFIG.pitch = config.pitch;
                if (config.lang) {
                    this.CONFIG.lang = config.lang;
                    if (this.recognition) this.recognition.lang = config.lang;
                }
                console.log('📂 Configuración cargada:', config);
            }
        } catch (e) {
            console.warn('⚠️ Error cargando configuración:', e);
        }
    },

    // ================================================================
    // ⏹️ DETENER TODO
    // ================================================================
    
    detener() {
        if (this.isListening) {
            this.recognition.stop();
        }
        this.synth.cancel();
        this.isSpeaking = false;
        this.voiceActivated = false;
        console.log('⏹️ Talaverín detenido');
        this._emitEvent('talaverin:detenido');
        return this;
    },

    // ================================================================
    // 🔄 REINICIAR
    // ================================================================
    
    reiniciar() {
        this.detener();
        setTimeout(() => {
            this.init(this.CONFIG);
            console.log('🔄 Talaverín reiniciado');
            this._emitEvent('talaverin:reiniciado');
        }, 500);
        return this;
    },

    // ================================================================
    // 📋 COMANDO PERSONALIZADO
    // ================================================================
    
    agregarComando(palabra, accion, destino, mensaje) {
        this.COMANDOS[palabra.toLowerCase()] = {
            accion: accion,
            destino: destino || null,
            mensaje: mensaje || `Ejecutando ${accion}`
        };
        console.log(`📋 Comando agregado: "${palabra}" -> ${accion}`);
        return this;
    },

    eliminarComando(palabra) {
        delete this.COMANDOS[palabra.toLowerCase()];
        console.log(`📋 Comando eliminado: "${palabra}"`);
        return this;
    },

    // ================================================================
    // 🎤 PRUEBA DE MICRÓFONO
    // ================================================================
    
    testMicrofono() {
        if (!this.recognition) {
            this.init();
        }
        this.hablar('Probando micrófono. Di algo...');
        setTimeout(() => {
            this.escuchar();
        }, 1000);
        return this;
    }
};

// ================================================================
// 🚀 EXPORTAR POR DEFECTO
// ================================================================

export default voicePlugin;

// ================================================================
// 📋 LOG DE INICIO
// ================================================================

console.log('🎤 Plugin de Voz - Talaverín Voice OS v2.1.0');
console.log('📍 Hecho en Puebla, México 🇲🇽');
console.log('🗣️ Di "talaverín" o "ayuda" para empezar');