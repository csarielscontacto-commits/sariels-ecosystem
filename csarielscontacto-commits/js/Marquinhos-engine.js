// js/marquinhos-engine.js - Talaverín OS v1.0 FINAL - Voice Edition
import { M_CONFIG } from './marquinhos-config.js';
import { supabase } from './utils/supabaseClient.js';
import { chatPlugin } from './plugins/plugin-chat.js';
import { livePlugin } from './plugins/plugin-live.js';
import { moderacionAvanzada } from './plugins/plugin-moderacion-avanzada.js';
import { configTransmision } from './plugins/plugin-configuracion-transmision.js';
import { voicePlugin } from './plugins/plugin-voice.js';

export const Engine = {
    config: M_CONFIG,

    // === MAPA PARA VOZ - Windows Puebla ===
    mapaRutas: {
        "muro": "./features/mimuro/index.html",
        "red": "./features/mired/index.html",
        "tiendita": "./features/tiendita/index.html",
        "tienda": "./features/tiendita/index.html",
        "fotos": "./features/misfotos/index.html",
        "noticias": "./features/marquinews/index.html",
        "marquinews": "./features/marquinews/index.html",
        "80": "./features/80poniente/index.html"
    },

    mensajes: [],
    chatChannel: null,

    conectar() {
        console.log('🔗 Engine: Conectando a Supabase...');

        // Chat
        this.chatChannel = chatPlugin.listenMessages((mensaje) => {
            if (Array.isArray(mensaje)) {
                this.mensajes = mensaje;
                this.notificarActualizacion();
            } else {
                this.mensajes.push(mensaje);
                this.notificarActualizacion();
            }
        });

        // Llamadas
        livePlugin.onCallEvent((event) => {
            console.log('📞 Evento de llamada:', event);
            this.notificarLlamada(event);
        });

        // Moderación
        document.addEventListener('moderacion:evento', (e) => {
            this.notificarModeracion(e.detail);
        });

        // Transmisión
        document.addEventListener('participante:agregado', (e) => {
            this.notificarParticipante(e.detail);
        });

        // === VOZ ===
        voicePlugin.init();
        if (voicePlugin.recognition) {
            voicePlugin.recognition.onresult = (e) => {
                const textoCrudo = e.results[0][0].transcript;
                console.log('🎤 Dijiste:', textoCrudo);
                const destino = voicePlugin.interpretar(textoCrudo);
                if (destino && this.mapaRutas[destino]) {
                    voicePlugin.hablar(`Va, abriendo ${destino} en corto`);
                    setTimeout(() => window.location.href = this.mapaRutas[destino], 800);
                } else {
                    voicePlugin.hablar("No te entendí wey, ¿muro, red o tiendita?");
                }
            };
        }

        console.log('✅ Engine v1.0 FINAL conectado - Talaverín Voice');
    },

    // CHAT
    enviarMensaje(texto) {
        if (!texto?.trim()) return;
        chatPlugin.sendText(this.obtenerUserId(), texto.trim());
    },
    enviarMensajeConRespuesta(texto, messageId, textoRespondido) {
        if (!texto?.trim()) return;
        return chatPlugin.sendText(this.obtenerUserId(), texto.trim(), { id: messageId, texto: textoRespondido });
    },
    enviarMensajeConTipo(texto, tipo = 'text') {
        if (!texto?.trim()) return;
        const userId = this.obtenerUserId();
        if(tipo === 'emoji') chatPlugin.sendEmoji(userId, texto.trim());
        else if(tipo === 'sticker') chatPlugin.sendSticker(userId, texto.trim());
        else chatPlugin.sendText(userId, texto.trim());
    },
    enviarArchivo(file) { return chatPlugin.uploadFile(this.obtenerUserId(), file); },
    agregarReaccion(messageId, emojiCode) { return chatPlugin.addReaction(this.obtenerUserId(), messageId, emojiCode); },
    buscarMensajes(query) { return chatPlugin.search(query); },
    recibirMensajes(callback) { if (typeof callback === 'function') { this._callback = callback; callback(this.mensajes); } },
    marcarComoLeido() { this.mensajes.forEach((m) => { m.leido = true; }); },
    editarMensaje: async (messageId, nuevoTexto) => { return chatPlugin.editMessage(messageId, nuevoTexto); },
    eliminarMensaje: async (messageId) => { return chatPlugin.deleteMessageForEveryone(messageId); },
    marcarMensajeLeido: async (messageId) => { return chatPlugin.markAsRead(messageId); },
    enviarTypingIndicator: async () => { return chatPlugin.sendTypingIndicator(); },
    enviarRecordingIndicator: async () => { return chatPlugin.sendRecordingIndicator(); },
    obtenerHistorial: async (limit = 50, offset = 0) => { return chatPlugin.getHistory(limit, offset); },

    // COMMIT STICKERS
    enviarStickerCommit: async (receiverId, assetType) => { return chatPlugin.sendStickerCommit(Engine.obtenerUserId(), receiverId, assetType); },
    enviarGiftCommit: async (receiverId, monto, descripcion) => { return chatPlugin.sendGiftCommit(Engine.obtenerUserId(), receiverId, monto, descripcion); },
    obtenerSaldoCommit: async (userId) => { return chatPlugin.getBalanceCommit(userId); },
    listarStickersCommit: async () => { return chatPlugin.listarStickersCommit(); },

    // LIVE
    iniciarLlamada(targetUserId, options = { video: false }) { return livePlugin.startCall(this.obtenerUserId(), targetUserId, options); },
    unirseLlamada(roomName) { return livePlugin.joinCall(this.obtenerUserId(), roomName); },
    terminarLlamada() { return livePlugin.endCall(); },
    iniciarTransmision(titulo) { return livePlugin.startLiveStream(this.obtenerUserId(), titulo); },
    unirseTransmision(roomName) { return livePlugin.joinLiveStream(this.obtenerUserId(), roomName); },
    estaEnLlamada() { return livePlugin.isInCall(); },
    obtenerRoom() { return livePlugin.getRoom(); },

    // MODERACION
    iniciarModeracion: (userId, roomName) => moderacionAvanzada.iniciarModeracion(userId, roomName),
    detenerModeracion: () => moderacionAvanzada.detenerModeracion(),
    getEstadoModeracion: () => ({ activa: moderacionAvanzada.transmisionActiva, nivelAdvertencia: moderacionAvanzada.nivelAdvertencia, detecciones: moderacionAvanzada.detecciones.length }),

    // TRANSMISION CONFIG
    iniciarTransmisionConfigurada: (userId, roomName, config) => configTransmision.inicializar(userId, roomName, config),
    setTipoTransmision: (tipo) => configTransmision.setTipo(tipo),
    setCalidadVideo: (calidad) => configTransmision.setCalidad(calidad),
    toggleCamara: (userId, activo) => configTransmision.toggleCamara(userId, activo),
    agregarParticipante: (userId, nombre, config) => configTransmision.agregarParticipante(userId, nombre, config),
    getEstadoTransmision: () => configTransmision.getEstadoCompleto(),

    // VOZ PUBLICO
    escuchar() { voicePlugin.recognition?.start(); document.dispatchEvent(new CustomEvent('talaverin:escuchando')); },

    // PUBLICIDAD
    NIVELES_PUBLICIDAD: {
        basico: { precio: 49, peso: 1, color: '#3ecf6e', label: 'Básico' },
        estandar: { precio: 99, peso: 2, color: '#f7d44a', label: 'Estándar' },
        premium: { precio: 199, peso: 4, color: '#ff9a3c', label: 'Premium' },
        patrocinado: { precio: 399, peso: 8, color: '#ff3366', label: 'Patrocinado' }
    },
    obtenerAnunciosActivos: async () => {
        try {
            const ahora = new Date().toISOString();
            const { data } = await supabase.from('publicidad_marquinhos').select('*').eq('pago_confirmado', true).lte('fecha_inicio', ahora).gte('fecha_fin', ahora);
            return data || [];
        } catch { return []; }
    },
    seleccionarAnuncio: (anuncios) => {
        if (!anuncios?.length) return null;
        const pesoTotal = anuncios.reduce((sum, a) => sum + (a.peso || 1), 0);
        let punto = Math.random() * pesoTotal;
        for (const anuncio of anuncios) { punto -= (anuncio.peso || 1); if (punto <= 0) return anuncio; }
        return anuncios[anuncios.length - 1];
    },
    getAnuncioParaBurbuja: async () => {
        const activos = await Engine.obtenerAnunciosActivos();
        const elegido = Engine.seleccionarAnuncio(activos);
        if (elegido) Engine.registrarVisualizacion(elegido.id);
        return elegido;
    },
    registrarVisualizacion: async (anuncioId) => {
        try {
            const { data: actual } = await supabase.from('publicidad_marquinhos').select('veces_mostrado').eq('id', anuncioId).single();
            if(!actual) return;
            await supabase.from('publicidad_marquinhos').update({ veces_mostrado: (actual.veces_mostrado || 0) + 1 }).eq('id', anuncioId);
        } catch {}
    },
    registrarClick: async (anuncioId) => {
        try {
            const { data: actual } = await supabase.from('publicidad_marquinhos').select('veces_click').eq('id', anuncioId).single();
            if(!actual) return;
            await supabase.from('publicidad_marquinhos').update({ veces_click: (actual.veces_click || 0) + 1 }).eq('id', anuncioId);
        } catch {}
    },
    comprarPublicidad: async ({ empresa, mensaje, url, nivel, duracionDias }) => {
        const infoNivel = Engine.NIVELES_PUBLICIDAD[nivel];
        const fechaInicio = new Date(); const fechaFin = new Date(); fechaFin.setDate(fechaFin.getDate() + (duracionDias||7));
        const { data, error } = await supabase.from('publicidad_marquinhos').insert({ usuario_id: Engine.obtenerUserId(), empresa, mensaje, url, nivel, peso: infoNivel.peso, duracion_dias: duracionDias||7, fecha_inicio: fechaInicio.toISOString(), fecha_fin: fechaFin.toISOString(), pago_confirmado: false, veces_mostrado: 0, veces_click: 0 }).select().single();
        if(error) throw error; return data;
    },

    // UTILS
    obtenerUserId() {
        try {
            const perfil = JSON.parse(localStorage.getItem('miPerfil_csariels') || '{}');
            return perfil.userId || perfil.wallet || 'usuario_' + Date.now();
        } catch { return 'usuario_' + Date.now(); }
    },
    obtenerHorario() { const h = M_CONFIG.horario; return `Abrimos ${h.dias} de ${h.apertura} a ${h.cierre}.`; },
    obtenerConfigVisual() { return M_CONFIG; },
    notificarActualizacion() { if (this._callback) this._callback(this.mensajes); document.dispatchEvent(new CustomEvent('marquinhos:mensajes', { detail: this.mensajes })); },
    notificarLlamada(event) { document.dispatchEvent(new CustomEvent('marquinhos:llamada', { detail: event })); },
    notificarModeracion(event) { document.dispatchEvent(new CustomEvent('marquinhos:moderacion', { detail: event })); },
    notificarParticipante(event) { document.dispatchEvent(new CustomEvent('marquinhos:participante', { detail: event })); },
    mostrarNotificacion(mensaje, color = '#f7d44a') {
        const toast = document.createElement('div');
        toast.style.cssText = `position: fixed; top: 20px; right: 20px; z-index: 99999; background: rgba(0,0,0,0.95); border-left: 4px solid ${color}; border-radius: 8px; padding: 16px 24px; color: white;`;
        toast.innerHTML = `<div style="font-size:0.9rem;font-weight:600;color:${color};">${mensaje}</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
};

Engine.conectar();
console.log('🧠 Talaverín Engine v1.0 FINAL - Voice + Chat + Ads');