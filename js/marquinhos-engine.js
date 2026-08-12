// js/marquinhos-engine.js
import { M_CONFIG } from './marquinhos-config.js';

// Importar plugins (deben existir en js/plugins/)
import { chatPlugin } from './plugins/plugin-chat.js';
import { livePlugin } from './plugins/plugin-live.js';
import { moderacionAvanzada } from './plugins/plugin-moderacion-avanzada.js';
import { configTransmision } from './plugins/plugin-configuracion-transmision.js';
import { voicePlugin } from './plugins/plugin-voice.js';

export const Engine = {
    config: M_CONFIG,

    // Mapa de rutas para comandos de voz
    mapaRutas: M_CONFIG.rutas,

    mensajes: [],
    chatChannel: null,

    conectar() {
        console.log('🔗 Engine: Conectando a Supabase...');

        // Verificar que Supabase esté disponible
        if (!window.supabase) {
            console.warn('⚠️ Supabase no disponible. Esperando...');
            setTimeout(() => this.conectar(), 1000);
            return;
        }

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

        // === PUBLICIDAD - VERSIÓN CON RPC ===
        this.cargarCampañaActiva();

        console.log('✅ Engine v1.0 FINAL conectado - Talaverín Voice');
    },

    // ================================================================
    // 📢 PUBLICIDAD MARQUINHOS - CON RPC
    // ================================================================

    // ⭐ NUEVA FUNCIÓN: Obtener campaña activa mediante RPC
    async obtenerCampañaActivaRPC() {
        try {
            const client = window.supabase;
            if (!client) return null;

            // Llamar a la función RPC creada por Antropic
            const { data, error } = await client.rpc('obtener_campana_marquinhos_activa');

            if (error) {
                console.warn('⚠️ Error en RPC obtener_campana_marquinhos_activa:', error);
                return null;
            }

            // Si data viene vacío o null, no hay campaña activa
            if (!data || data.length === 0) {
                console.log('📢 No hay campaña activa');
                return null;
            }

            // Si hay datos, tomar el primero (solo debería haber uno activo)
            const campaña = data[0];
            console.log('📢 Campaña activa encontrada:', campaña);
            return campaña;

        } catch (e) {
            console.warn('⚠️ Error al obtener campaña activa:', e);
            return null;
        }
    },

    // Función para aplicar la campaña al widget de Marquinhos
    async cargarCampañaActiva() {
        try {
            const campaña = await this.obtenerCampañaActivaRPC();

            // Disparar evento para que el widget de Marquinhos se actualice
            document.dispatchEvent(new CustomEvent('marquinhos:campana-actualizada', {
                detail: {
                    campaña: campaña,
                    tieneCampana: !!campaña
                }
            }));

            if (campaña) {
                console.log('📢 Aplicando campaña:', campaña.empresa, ' - ', campaña.mensaje);
                
                // También guardar en localStorage como respaldo
                localStorage.setItem('marquinhos_campana_activa', JSON.stringify(campaña));
                localStorage.setItem('marquinhos_campana_fecha', Date.now().toString());
            } else {
                // Si no hay campaña, usar estilo rosa por defecto
                console.log('📢 Usando estilo rosa por defecto');
                localStorage.removeItem('marquinhos_campana_activa');
                
                // Disparar evento para estilo por defecto
                document.dispatchEvent(new CustomEvent('marquinhos:campana-default', {
                    detail: { estilo: 'rosa' }
                }));
            }
        } catch (e) {
            console.warn('⚠️ Error al cargar campaña:', e);
            // Fallback: intentar usar localStorage
            this.cargarCampañaDesdeLocalStorage();
        }
    },

    // Fallback: cargar campaña desde localStorage (cache)
    cargarCampañaDesdeLocalStorage() {
        try {
            const saved = localStorage.getItem('marquinhos_campana_activa');
            if (saved) {
                const campaña = JSON.parse(saved);
                const fecha = parseInt(localStorage.getItem('marquinhos_campana_fecha') || '0');
                const expiracion = 24 * 60 * 60 * 1000; // 24 horas
                
                // Si la campaña está en caché y no ha expirado, usarla
                if (Date.now() - fecha < expiracion) {
                    document.dispatchEvent(new CustomEvent('marquinhos:campana-actualizada', {
                        detail: { campaña, tieneCampana: true }
                    }));
                    console.log('📢 Campaña cargada desde caché:', campaña);
                    return;
                }
            }
            // Si no hay caché válida, usar estilo por defecto
            document.dispatchEvent(new CustomEvent('marquinhos:campana-default', {
                detail: { estilo: 'rosa' }
            }));
            console.log('📢 Sin caché, usando estilo rosa por defecto');
        } catch (e) {
            console.warn('⚠️ Error al cargar campaña desde localStorage:', e);
        }
    },

    // ================================================================
    // 🎯 NIVELES DE PUBLICIDAD (Para comprar desde el panel)
    // ================================================================

    NIVELES_PUBLICIDAD: {
        basico: { precio: 49, peso: 1, color: '#3ecf6e', label: 'Básico' },
        estandar: { precio: 99, peso: 2, color: '#f7d44a', label: 'Estándar' },
        premium: { precio: 199, peso: 4, color: '#ff9a3c', label: 'Premium' },
        patrocinado: { precio: 399, peso: 8, color: '#ff3366', label: 'Patrocinado' }
    },

    // Método para obtener anuncios activos (fallback en caso de que RPC falle)
    obtenerAnunciosActivos: async () => {
        try {
            const ahora = new Date().toISOString();
            const { data } = await window.supabase
                .from('publicidad_marquinhos')
                .select('*')
                .eq('pago_confirmado', true)
                .lte('fecha_inicio', ahora)
                .gte('fecha_fin', ahora);
            return data || [];
        } catch { return []; }
    },

    // Método para comprar publicidad
    comprarPublicidad: async ({ empresa, mensaje, url, nivel, duracionDias }) => {
        const infoNivel = Engine.NIVELES_PUBLICIDAD[nivel];
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + (duracionDias || 7));
        
        const { data, error } = await window.supabase
            .from('publicidad_marquinhos')
            .insert({
                usuario_id: Engine.obtenerUserId(),
                empresa,
                mensaje,
                url,
                nivel,
                peso: infoNivel.peso,
                duracion_dias: duracionDias || 7,
                fecha_inicio: fechaInicio.toISOString(),
                fecha_fin: fechaFin.toISOString(),
                pago_confirmado: false, // ⚠️ Solo backend puede marcar como pagado
                veces_mostrado: 0,
                veces_click: 0
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // ================================================================
    // 🎤 VOZ PÚBLICO
    // ================================================================

    escuchar() {
        voicePlugin.recognition?.start();
        document.dispatchEvent(new CustomEvent('talaverin:escuchando'));
    },

    // ================================================================
    // 💬 CHAT
    // ================================================================

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
        if (tipo === 'emoji') chatPlugin.sendEmoji(userId, texto.trim());
        else if (tipo === 'sticker') chatPlugin.sendSticker(userId, texto.trim());
        else chatPlugin.sendText(userId, texto.trim());
    },

    enviarArchivo(file) {
        return chatPlugin.uploadFile(this.obtenerUserId(), file);
    },

    agregarReaccion(messageId, emojiCode) {
        return chatPlugin.addReaction(this.obtenerUserId(), messageId, emojiCode);
    },

    buscarMensajes(query) {
        return chatPlugin.search(query);
    },

    recibirMensajes(callback) {
        if (typeof callback === 'function') {
            this._callback = callback;
            callback(this.mensajes);
        }
    },

    marcarComoLeido() {
        this.mensajes.forEach((m) => { m.leido = true; });
    },

    editarMensaje: async (messageId, nuevoTexto) => {
        return chatPlugin.editMessage(messageId, nuevoTexto);
    },

    eliminarMensaje: async (messageId) => {
        return chatPlugin.deleteMessageForEveryone(messageId);
    },

    marcarMensajeLeido: async (messageId) => {
        return chatPlugin.markAsRead(messageId);
    },

    enviarTypingIndicator: async () => {
        return chatPlugin.sendTypingIndicator();
    },

    enviarRecordingIndicator: async () => {
        return chatPlugin.sendRecordingIndicator();
    },

    obtenerHistorial: async (limit = 50, offset = 0) => {
        return chatPlugin.getHistory(limit, offset);
    },

    // ================================================================
    // 📦 COMMIT STICKERS
    // ================================================================

    enviarStickerCommit: async (receiverId, assetType) => {
        return chatPlugin.sendStickerCommit(Engine.obtenerUserId(), receiverId, assetType);
    },

    enviarGiftCommit: async (receiverId, monto, descripcion) => {
        return chatPlugin.sendGiftCommit(Engine.obtenerUserId(), receiverId, monto, descripcion);
    },

    obtenerSaldoCommit: async (userId) => {
        return chatPlugin.getBalanceCommit(userId);
    },

    listarStickersCommit: async () => {
        return chatPlugin.listarStickersCommit();
    },

    // ================================================================
    // 📹 LIVE
    // ================================================================

    iniciarLlamada(targetUserId, options = { video: false }) {
        return livePlugin.startCall(this.obtenerUserId(), targetUserId, options);
    },

    unirseLlamada(roomName) {
        return livePlugin.joinCall(this.obtenerUserId(), roomName);
    },

    terminarLlamada() {
        return livePlugin.endCall();
    },

    iniciarTransmision(titulo) {
        return livePlugin.startLiveStream(this.obtenerUserId(), titulo);
    },

    unirseTransmision(roomName) {
        return livePlugin.joinLiveStream(this.obtenerUserId(), roomName);
    },

    estaEnLlamada() {
        return livePlugin.isInCall();
    },

    obtenerRoom() {
        return livePlugin.getRoom();
    },

    // ================================================================
    // 🛡️ MODERACIÓN
    // ================================================================

    iniciarModeracion: (userId, roomName) => {
        return moderacionAvanzada.iniciarModeracion(userId, roomName);
    },

    detenerModeracion: () => {
        return moderacionAvanzada.detenerModeracion();
    },

    getEstadoModeracion: () => ({
        activa: moderacionAvanzada.transmisionActiva,
        nivelAdvertencia: moderacionAvanzada.nivelAdvertencia,
        detecciones: moderacionAvanzada.detecciones.length
    }),

    // ================================================================
    // ⚙️ TRANSMISIÓN CONFIG
    // ================================================================

    iniciarTransmisionConfigurada: (userId, roomName, config) => {
        return configTransmision.inicializar(userId, roomName, config);
    },

    setTipoTransmision: (tipo) => {
        return configTransmision.setTipo(tipo);
    },

    setCalidadVideo: (calidad) => {
        return configTransmision.setCalidad(calidad);
    },

    toggleCamara: (userId, activo) => {
        return configTransmision.toggleCamara(userId, activo);
    },

    agregarParticipante: (userId, nombre, config) => {
        return configTransmision.agregarParticipante(userId, nombre, config);
    },

    getEstadoTransmision: () => {
        return configTransmision.getEstadoCompleto();
    },

    // ================================================================
    // 🛠️ UTILS
    // ================================================================

    obtenerUserId() {
        try {
            const perfil = JSON.parse(localStorage.getItem('miPerfil_csariels') || '{}');
            return perfil.userId || perfil.wallet || localStorage.getItem('csariels_user_id') || 'usuario_' + Date.now();
        } catch {
            return 'usuario_' + Date.now();
        }
    },

    obtenerHorario() {
        const h = M_CONFIG.horario;
        return `Abrimos ${h.dias} de ${h.apertura} a ${h.cierre}.`;
    },

    obtenerConfigVisual() {
        return M_CONFIG;
    },

    // ================================================================
    // 📢 NOTIFICACIONES
    // ================================================================

    notificarActualizacion() {
        if (this._callback) this._callback(this.mensajes);
        document.dispatchEvent(new CustomEvent('marquinhos:mensajes', { detail: this.mensajes }));
    },

    notificarLlamada(event) {
        document.dispatchEvent(new CustomEvent('marquinhos:llamada', { detail: event }));
    },

    notificarModeracion(event) {
        document.dispatchEvent(new CustomEvent('marquinhos:moderacion', { detail: event }));
    },

    notificarParticipante(event) {
        document.dispatchEvent(new CustomEvent('marquinhos:participante', { detail: event }));
    },

    mostrarNotificacion(mensaje, color = '#f7d44a') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; 
            top: 20px; 
            right: 20px; 
            z-index: 99999; 
            background: rgba(0,0,0,0.95); 
            border-left: 4px solid ${color}; 
            border-radius: 8px; 
            padding: 16px 24px; 
            color: white;
            max-width: 320px;
            font-family: 'Space Grotesk', sans-serif;
        `;
        toast.innerHTML = `
            <div style="font-size:0.9rem;font-weight:600;color:${color};">${mensaje}</div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
};

// ================================================================
// 🚀 AUTO-CONECTAR AL CARGAR
// ================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Engine.conectar());
} else {
    Engine.conectar();
}

console.log('🧠 Talaverín Engine v1.1 - Voice + Chat + Ads + RPC');