// js/marquinhos-engine.js
import { M_CONFIG } from './marquinhos-config.js';
import { supabase } from './utils/supabaseClient.js';
import { chatPlugin } from './plugins/plugin-chat.js';
import { livePlugin } from './plugins/plugin-live.js';
import { moderacionAvanzada } from './plugins/plugin-moderacion-avanzada.js';
import { configTransmision } from './plugins/plugin-configuracion-transmision.js';

export const Engine = {
    // ================================================================
    // CONFIGURACIÓN
    // ================================================================
    config: M_CONFIG,
    
    // ================================================================
    // CHAT - Mensajes
    // ================================================================
    mensajes: [],
    chatChannel: null,

    conectar() {
        console.log('🔗 Engine: Conectando a Supabase...');
        
        // Conectar chat en tiempo real
        this.chatChannel = chatPlugin.listenMessages((mensaje) => {
            if (Array.isArray(mensaje)) {
                // Historial inicial
                this.mensajes = mensaje;
                this.notificarActualizacion();
            } else {
                // Nuevo mensaje en tiempo real
                this.mensajes.push(mensaje);
                this.notificarActualizacion();
            }
        });
        
        // Escuchar eventos de llamadas
        livePlugin.onCallEvent((event) => {
            console.log('📞 Evento de llamada:', event);
            this.notificarLlamada(event);
        });

        // Escuchar eventos de moderación
        document.addEventListener('moderacion:evento', (e) => {
            console.log('🛡️ Evento de moderación:', e.detail);
            this.notificarModeracion(e.detail);
        });

        // Escuchar eventos de configuración de transmisión
        document.addEventListener('participante:agregado', (e) => {
            console.log('👤 Participante agregado:', e.detail);
            this.notificarParticipante(e.detail);
        });

        document.addEventListener('camara:toggle', (e) => {
            console.log('📷 Cámara toggled:', e.detail);
        });

        document.addEventListener('juego:detectado', (e) => {
            console.log('🎮 Juego detectado:', e.detail);
        });

        document.addEventListener('metricas:actualizadas', (e) => {
            console.log('📊 Métricas actualizadas:', e.detail);
        });

        console.log('✅ Engine conectado con todas las funcionalidades');
        console.log('📹 Transmisiones: Individual | Grupal | Juegos');
        console.log('🛡️ Moderación avanzada activa');
        console.log('🎮 Detección de juegos: Free Fire, COD, Roblox, etc.');
        console.log('📊 Métricas en tiempo real');
        console.log('📨 Chat avanzado: Estados de mensaje, editar, eliminar, responder');
    },

    // ================================================================
    // CHAT - Envío de mensajes (ACTUALIZADO)
    // ================================================================
    
    /**
     * Envía un mensaje de texto
     */
    enviarMensaje(texto) {
        if (!texto || !texto.trim()) return;
        const userId = this.obtenerUserId();
        chatPlugin.sendText(userId, texto.trim());
    },

    /**
     * 🆕 Envía un mensaje respondiendo a otro
     */
    enviarMensajeConRespuesta(texto, messageId, textoRespondido) {
        if (!texto || !texto.trim()) return;
        const userId = this.obtenerUserId();
        return chatPlugin.sendText(userId, texto.trim(), { id: messageId, texto: textoRespondido });
    },

    enviarMensajeConTipo(texto, tipo = 'text') {
        if (!texto || !texto.trim()) return;
        const userId = this.obtenerUserId();
        switch(tipo) {
            case 'emoji':
                chatPlugin.sendEmoji(userId, texto.trim());
                break;
            case 'sticker':
                chatPlugin.sendSticker(userId, texto.trim());
                break;
            default:
                chatPlugin.sendText(userId, texto.trim());
        }
    },

    enviarArchivo(file) {
        const userId = this.obtenerUserId();
        return chatPlugin.uploadFile(userId, file);
    },

    agregarReaccion(messageId, emojiCode) {
        const userId = this.obtenerUserId();
        return chatPlugin.addReaction(userId, messageId, emojiCode);
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
        this.mensajes.forEach((m) => {
            m.leido = true;
        });
        console.log('📖 Mensajes marcados como leídos');
    },

    // ================================================================
    // 🆕 CHAT AVANZADO - Nuevas funciones
    // ================================================================

    /**
     * Edita un mensaje enviado
     */
    editarMensaje: async (messageId, nuevoTexto) => {
        const userId = Engine.obtenerUserId();
        return chatPlugin.editMessage(messageId, nuevoTexto);
    },

    /**
     * Elimina un mensaje para todos
     */
    eliminarMensaje: async (messageId) => {
        const userId = Engine.obtenerUserId();
        return chatPlugin.deleteMessageForEveryone(messageId);
    },

    /**
     * Marca un mensaje como leído
     */
    marcarMensajeLeido: async (messageId) => {
        return chatPlugin.markAsRead(messageId);
    },

    /**
     * Envía indicador "escribiendo..."
     */
    enviarTypingIndicator: async (targetUserId) => {
        return chatPlugin.sendTypingIndicator(targetUserId);
    },

    /**
     * Envía indicador "grabando audio..."
     */
    enviarRecordingIndicator: async (targetUserId) => {
        return chatPlugin.sendRecordingIndicator(targetUserId);
    },

    /**
     * Obtiene historial de mensajes con paginación
     */
    obtenerHistorial: async (limit = 50, offset = 0) => {
        return chatPlugin.getHistory(limit, offset);
    },

    // ================================================================
    // STICKERS CON COMMIT
    // ================================================================

    /**
     * Envía un sticker con COMMIT (CMT)
     */
    enviarStickerCommit: async (receiverId, assetType, descripcion) => {
        const userId = Engine.obtenerUserId();
        return chatPlugin.sendStickerCommit(userId, receiverId, assetType, descripcion);
    },

    /**
     * Envía un regalo P2P con COMMIT (CMT)
     */
    enviarGiftCommit: async (receiverId, monto, descripcion) => {
        const userId = Engine.obtenerUserId();
        return chatPlugin.sendGiftCommit(userId, receiverId, monto, descripcion);
    },

    /**
     * Obtiene el saldo COMMIT de un usuario
     */
    obtenerSaldoCommit: async (userId) => {
        return chatPlugin.getBalanceCommit(userId);
    },

    /**
     * Lista stickers disponibles
     */
    listarStickersCommit: async () => {
        return chatPlugin.listarStickersCommit();
    },

    // ================================================================
    // LLAMADAS Y TRANSMISIONES (LivePlugin)
    // ================================================================
    iniciarLlamada(targetUserId, options = { video: false }) {
        const userId = this.obtenerUserId();
        return livePlugin.startCall(userId, targetUserId, options);
    },

    unirseLlamada(roomName) {
        const userId = this.obtenerUserId();
        return livePlugin.joinCall(userId, roomName);
    },

    terminarLlamada() {
        return livePlugin.endCall();
    },

    iniciarTransmision(titulo) {
        const userId = this.obtenerUserId();
        return livePlugin.startLiveStream(userId, titulo);
    },

    unirseTransmision(roomName) {
        const userId = this.obtenerUserId();
        return livePlugin.joinLiveStream(userId, roomName);
    },

    estaEnLlamada() {
        return livePlugin.isInCall();
    },

    obtenerRoom() {
        return livePlugin.getRoom();
    },

    // ================================================================
    // MODERACIÓN AVANZADA
    // ================================================================
    iniciarModeracion: (userId, roomName) => {
        return moderacionAvanzada.iniciarModeracion(userId, roomName);
    },
    
    detenerModeracion: () => {
        moderacionAvanzada.detenerModeracion();
    },
    
    getEstadoModeracion: () => {
        return {
            activa: moderacionAvanzada.transmisionActiva,
            nivelAdvertencia: moderacionAvanzada.nivelAdvertencia,
            detecciones: moderacionAvanzada.detecciones.length,
            alertas: moderacionAvanzada.alertasEnviadas.length,
            usuarioVerificado: moderacionAvanzada.usuarioVerificado,
            monetizacionActiva: moderacionAvanzada.monetizacionActiva
        };
    },

    verificarUsuario: (userId) => {
        return moderacionAvanzada.verificarUsuario(userId);
    },

    // ================================================================
    // CONFIGURACIÓN DE TRANSMISIÓN
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
    
    setFps: (fps) => {
        return configTransmision.setFps(fps);
    },
    
    setAudio: (activo) => {
        return configTransmision.setAudio(activo);
    },
    
    setCamara: (activo) => {
        return configTransmision.setCamara(activo);
    },
    
    setMic: (activo) => {
        return configTransmision.setMic(activo);
    },
    
    setCompartirPantalla: (activo) => {
        return configTransmision.setCompartirPantalla(activo);
    },
    
    toggleCamara: (userId, activo) => {
        return configTransmision.toggleCamara(userId, activo);
    },
    
    toggleMicrofono: (userId, activo) => {
        return configTransmision.toggleMicrofono(userId, activo);
    },
    
    agregarParticipante: (userId, nombre, config) => {
        return configTransmision.agregarParticipante(userId, nombre, config);
    },
    
    eliminarParticipante: (userId) => {
        return configTransmision.eliminarParticipante(userId);
    },
    
    toggleAllCamaras: (activo) => {
        return configTransmision.toggleAllCamaras(activo);
    },
    
    detectarJuego: () => {
        return configTransmision.detectarJuegoEnEjecucion();
    },
    
    getEstadoTransmision: () => {
        return configTransmision.getEstadoCompleto();
    },
    
    mostrarControlesTransmision: () => {
        return configTransmision.mostrarControles();
    },
    
    mostrarParticipantesUI: () => {
        return configTransmision.mostrarParticipantesUI();
    },
    
    detenerTransmision: () => {
        configTransmision.detener();
    },

    // ================================================================
    // MARKETING Y MÉTRICAS
    // ================================================================
    activarCampanaMarketing: (presupuesto, duracion) => {
        const userId = Engine.obtenerUserId();
        return moderacionAvanzada.activarCampanaMarketing(userId, presupuesto, duracion);
    },

    obtenerMetricas: () => {
        const userId = Engine.obtenerUserId();
        return moderacionAvanzada.obtenerMetricas(userId);
    },

    priorizarServicio: (servicioId, presupuesto) => {
        const userId = Engine.obtenerUserId();
        return moderacionAvanzada.priorizarServicio(userId, servicioId, presupuesto);
    },

    // ================================================================
    // 🆕 PUBLICIDAD ALGORÍTMICA (Marquinhos Ads)
    // ================================================================

    // Niveles de publicidad: precio (MXN), peso (probabilidad relativa) y color
    NIVELES_PUBLICIDAD: {
        basico:       { precio: 49,  peso: 1, color: '#3ecf6e', label: 'Básico' },
        estandar:     { precio: 99,  peso: 2, color: '#f7d44a', label: 'Estándar' },
        premium:      { precio: 199, peso: 4, color: '#ff9a3c', label: 'Premium' },
        patrocinado:  { precio: 399, peso: 8, color: '#ff3366', label: 'Patrocinado' }
    },

    /**
     * Obtiene los anuncios activos y pagados (fecha vigente, pago confirmado)
     */
    obtenerAnunciosActivos: async () => {
        try {
            const ahora = new Date().toISOString();
            const { data, error } = await supabase
                .from('publicidad_marquinhos')
                .select('*')
                .eq('pago_confirmado', true)
                .lte('fecha_inicio', ahora)
                .gte('fecha_fin', ahora);

            if (error) {
                console.warn('⚠️ Error obteniendo anuncios activos:', error);
                return [];
            }
            return data || [];
        } catch (err) {
            console.warn('⚠️ Error obteniendo anuncios activos:', err);
            return [];
        }
    },

    /**
     * Selecciona un anuncio usando selección ponderada por "peso"
     * (a mayor nivel/peso, mayor probabilidad de ser elegido)
     */
    seleccionarAnuncio: (anuncios) => {
        if (!anuncios || anuncios.length === 0) return null;

        const pesoTotal = anuncios.reduce((sum, a) => sum + (a.peso || 1), 0);
        let punto = Math.random() * pesoTotal;

        for (const anuncio of anuncios) {
            punto -= (anuncio.peso || 1);
            if (punto <= 0) return anuncio;
        }
        // Fallback por redondeo flotante
        return anuncios[anuncios.length - 1];
    },

    /**
     * Obtiene el anuncio que debe mostrarse ahora mismo en la burbuja
     * (combina obtenerAnunciosActivos + seleccionarAnuncio + registrarVisualizacion)
     */
    getAnuncioParaBurbuja: async () => {
        const activos = await Engine.obtenerAnunciosActivos();
        const elegido = Engine.seleccionarAnuncio(activos);
        if (elegido) {
            Engine.registrarVisualizacion(elegido.id);
        }
        return elegido;
    },

    /**
     * Incrementa el contador de veces_mostrado de un anuncio
     */
    registrarVisualizacion: async (anuncioId) => {
        try {
            const { data: actual, error: errLectura } = await supabase
                .from('publicidad_marquinhos')
                .select('veces_mostrado')
                .eq('id', anuncioId)
                .single();

            if (errLectura || !actual) return;

            const { error } = await supabase
                .from('publicidad_marquinhos')
                .update({
                    veces_mostrado: (actual.veces_mostrado || 0) + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('id', anuncioId);

            if (error) console.warn('⚠️ Error registrando visualización:', error);
        } catch (err) {
            console.warn('⚠️ Error registrando visualización:', err);
        }
    },

    /**
     * Incrementa el contador de veces_click de un anuncio
     */
    registrarClick: async (anuncioId) => {
        try {
            const { data: actual, error: errLectura } = await supabase
                .from('publicidad_marquinhos')
                .select('veces_click')
                .eq('id', anuncioId)
                .single();

            if (errLectura || !actual) return;

            const { error } = await supabase
                .from('publicidad_marquinhos')
                .update({
                    veces_click: (actual.veces_click || 0) + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('id', anuncioId);

            if (error) console.warn('⚠️ Error registrando click:', error);
        } catch (err) {
            console.warn('⚠️ Error registrando click:', err);
        }
    },

    /**
     * Crea una solicitud de publicidad (queda con pago_confirmado = false
     * hasta que el admin la confirme manualmente desde dashboard-emerald.html)
     */
    comprarPublicidad: async ({ empresa, mensaje, url, nivel, duracionDias }) => {
        const infoNivel = Engine.NIVELES_PUBLICIDAD[nivel];
        if (!infoNivel) {
            throw new Error('Nivel de publicidad inválido');
        }

        const userId = Engine.obtenerUserId();
        const dias = duracionDias || 7;
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + dias);

        const { data, error } = await supabase
            .from('publicidad_marquinhos')
            .insert({
                usuario_id: userId,
                empresa: empresa,
                mensaje: mensaje,
                url: url || null,
                nivel: nivel,
                peso: infoNivel.peso,
                duracion_dias: dias,
                fecha_inicio: fechaInicio.toISOString(),
                fecha_fin: fechaFin.toISOString(),
                pago_confirmado: false,
                veces_mostrado: 0,
                veces_click: 0
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error creando solicitud de publicidad:', error);
            throw error;
        }

        console.log('📢 Solicitud de publicidad creada, pendiente de pago:', data.id);
        return data;
    },

    /**
     * Confirma el pago de una publicidad (uso desde el panel admin)
     */
    confirmarPagoPublicidad: async (anuncioId) => {
        const { data, error } = await supabase
            .from('publicidad_marquinhos')
            .update({
                pago_confirmado: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', anuncioId)
            .select()
            .single();

        if (error) {
            console.error('❌ Error confirmando pago de publicidad:', error);
            throw error;
        }

        console.log('✅ Pago de publicidad confirmado:', anuncioId);
        return data;
    },

    /**
     * Lista todas las solicitudes de publicidad (para el panel admin,
     * incluye pagadas y pendientes)
     */
    listarSolicitudesPublicidad: async () => {
        const { data, error } = await supabase
            .from('publicidad_marquinhos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('⚠️ Error listando solicitudes de publicidad:', error);
            return [];
        }
        return data || [];
    },

    // ================================================================
    // UTILIDADES
    // ================================================================
    obtenerUserId() {
        try {
            const perfil = JSON.parse(localStorage.getItem('miPerfil_csariels') || '{}');
            return perfil.userId || perfil.wallet || 'usuario_' + Date.now();
        } catch {
            return 'usuario_' + Date.now();
        }
    },

    obtenerHorario() {
        const h = M_CONFIG.horario;
        return `Abrimos ${h.dias} de ${h.apertura} a ${h.cierre}.`;
    },

    obtenerEstadoPresencia() {
        return { conectado: true };
    },

    obtenerConfigVisual() {
        return M_CONFIG;
    },

    // ================================================================
    // NOTIFICACIONES
    // ================================================================
    notificarActualizacion() {
        if (this._callback) {
            this._callback(this.mensajes);
        }
        document.dispatchEvent(new CustomEvent('marquinhos:mensajes', {
            detail: this.mensajes
        }));
    },

    notificarLlamada(event) {
        document.dispatchEvent(new CustomEvent('marquinhos:llamada', {
            detail: event
        }));
    },

    notificarModeracion(event) {
        document.dispatchEvent(new CustomEvent('marquinhos:moderacion', {
            detail: event
        }));
        
        if (event.tipo === 'cierre') {
            console.log('🚫 TRANSMISIÓN CERRADA POR MODERACIÓN');
            this.mostrarNotificacion('🚫 Transmisión cerrada por moderación', '#ff3366');
        }
    },

    notificarParticipante(event) {
        document.dispatchEvent(new CustomEvent('marquinhos:participante', {
            detail: event
        }));
    },

    // ================================================================
    // NOTIFICACIÓN TOAST
    // ================================================================
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
            max-width: 400px;
            color: white;
            font-family: 'Space Grotesk', sans-serif;
            animation: slideIn 0.5s ease-out;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        `;
        toast.innerHTML = `
            <style>
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            </style>
            <div style="font-size:0.9rem;font-weight:600;color:${color};">${mensaje}</div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            toast.style.transition = 'all 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }
};

// ================================================================
// INICIALIZAR AL CARGAR
// ================================================================
Engine.conectar();

console.log('🧠 Marquinhos Engine v3.1 - CHAT AVANZADO + PUBLICIDAD');
console.log('✅ Chat en tiempo real con estados de mensaje');
console.log('✏️ Editar y eliminar mensajes');
console.log('💬 Responder mensajes específicos');
console.log('🔄 Indicador "escribiendo..."');
console.log('✅ Llamadas de voz y video');
console.log('✅ Transmisiones en vivo');
console.log('✅ Transmisiones grupales (hasta 10 participantes)');
console.log('✅ Transmisión de juegos (Free Fire, COD, Roblox, etc.)');
console.log('✅ Moderación avanzada con 3 advertencias');
console.log('✅ Verificación de edad y documentos');
console.log('✅ Marketing pagado (visibilidad tipo TikTok)');
console.log('✅ Métricas en tiempo real');
console.log('✅ Servicios priorizados (primera plana)');
console.log('🎮 Detección de juegos popular');
console.log('📷 Control de cámaras individual y grupal');
console.log('💰 Sistema COMMIT (CMT) integrado');
console.log('📢 Publicidad algorítmica ponderada por nivel');