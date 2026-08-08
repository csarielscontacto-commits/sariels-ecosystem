/**
 * ================================================================
 * 🛡️ PLUGIN DE MODERACIÓN AVANZADA - Csariel's Ecosystem
 * ================================================================
 * Plugin para gestionar la moderación de contenido en transmisiones
 * con sistema de advertencias, detección de contenido prohibido,
 * y herramientas de monetización y campañas.
 * 
 * Hecho en Puebla, México 🇲🇽
 * Versión: 2.1.0
 * ================================================================
 */

// ================================================================
// 📦 MODERACIÓN AVANZADA
// ================================================================

export const moderacionAvanzada = {
    // ================================================================
    // 🔧 ESTADO DE MODERACIÓN
    // ================================================================
    
    transmisionActiva: false,
    nivelAdvertencia: 0,
    detecciones: [],
    alertasEnviadas: [],
    usuarioVerificado: false,
    monetizacionActiva: false,
    campanasActivas: [],
    historialModeracion: [],
    usuariosBloqueados: [],
    palabrasProhibidas: [
        'odio', 'violencia', 'discriminacion', 'nazi', 'racista',
        'sexo', 'porno', 'desnudo', 'drogas', 'narcotrafico',
        'arma', 'suicidio', 'matar', 'asesinato', 'terrorismo'
    ],
    contenidoSensible: false,
    tiempoTranscurrido: 0,
    intervaloModeracion: null,

    // ================================================================
    // 📋 CONFIGURACIÓN DE MODERACIÓN
    // ================================================================
    
    CONFIG: {
        ADVERTENCIAS_MAX: 3,
        SILENCIO_1: 15,      // segundos
        SILENCIO_2: 30,      // segundos
        SILENCIO_3: 180,     // 3 minutos
        TIEMPO_CIERRE: 600,  // 10 minutos
        REVISION_AUTOMATICA: true,
        DETECCION_IA: true,
        REPORTE_AUTOMATICO: true
    },

    // ================================================================
    // 📋 CONTENIDO PROHIBIDO POR CATEGORÍA
    // ================================================================
    
    CATEGORIAS_PROHIBIDAS: {
        VIOLENCIA: ['violencia', 'agresion', 'pelea', 'golpe', 'arma'],
        DISCURSO_ODIO: ['odio', 'discriminacion', 'racista', 'homofobo', 'nazi'],
        SEXUAL: ['sexo', 'porno', 'desnudo', 'erotico', 'explicito'],
        DROGAS: ['drogas', 'narcotrafico', 'cocaína', 'marihuana', 'cristal'],
        JUEGOS_APOSTOL: ['apuesta', 'casino', 'poker', 'ruleta', 'loteria']
    },

    // ================================================================
    // 🛡️ INICIAR MODERACIÓN
    // ================================================================
    
    iniciarModeracion(userId, roomName) {
        if (this.transmisionActiva) {
            console.warn('⚠️ Moderación ya está activa');
            return false;
        }

        this.transmisionActiva = true;
        this.nivelAdvertencia = 0;
        this.detecciones = [];
        this.alertasEnviadas = [];
        this.historialModeracion = [];
        this.contenidoSensible = false;
        this.tiempoTranscurrido = 0;
        this.userId = userId;
        this.roomName = roomName || `room_${Date.now()}`;

        // Iniciar cronómetro de moderación
        this._iniciarCronometro();

        console.log(`🛡️ Moderación iniciada para ${userId} en ${this.roomName}`);
        console.log(`📋 Advertencias máximas: ${this.CONFIG.ADVERTENCIAS_MAX}`);
        
        // Registrar inicio
        this._registrarEvento('moderacion_iniciada', { userId, roomName });
        
        return true;
    },

    // ================================================================
    // ⏹️ DETENER MODERACIÓN
    // ================================================================
    
    detenerModeracion() {
        if (!this.transmisionActiva) {
            console.warn('⚠️ Moderación ya está inactiva');
            return false;
        }

        this.transmisionActiva = false;
        this.nivelAdvertencia = 0;
        this._detenerCronometro();
        
        console.log('🛡️ Moderación detenida');
        this._registrarEvento('moderacion_detenida', { 
            duracion: this.tiempoTranscurrido,
            detecciones: this.detecciones.length,
            alertas: this.alertasEnviadas.length
        });
        
        return true;
    },

    // ================================================================
    // ✅ VERIFICAR USUARIO
    // ================================================================
    
    verificarUsuario(userId) {
        // Verificación básica
        if (!userId || userId.length < 3) {
            this.usuarioVerificado = false;
            console.warn('⚠️ Usuario no verificado: ID inválido');
            return false;
        }

        // Verificar si está bloqueado
        if (this.usuariosBloqueados.includes(userId)) {
            this.usuarioVerificado = false;
            console.warn(`🚫 Usuario ${userId} está bloqueado`);
            return false;
        }

        // Verificación simulada (en producción, conectaría a Supabase)
        this.usuarioVerificado = true;
        console.log(`✅ Usuario ${userId} verificado`);
        return true;
    },

    // ================================================================
    // 🔍 ANALIZAR CONTENIDO
    // ================================================================
    
    analizarContenido(texto, userId) {
        if (!this.transmisionActiva) {
            console.warn('⚠️ Moderación inactiva, no se puede analizar contenido');
            return null;
        }

        if (!texto || texto.trim() === '') {
            return null;
        }

        const textoLower = texto.toLowerCase();
        const detecciones = [];
        let nivelRiesgo = 0;

        // Verificar palabras prohibidas
        for (const palabra of this.palabrasProhibidas) {
            if (textoLower.includes(palabra)) {
                detecciones.push({
                    palabra: palabra,
                    timestamp: new Date().toISOString(),
                    usuario: userId
                });
                nivelRiesgo++;
            }
        }

        // Verificar categorías completas
        for (const [categoria, palabras] of Object.entries(this.CATEGORIAS_PROHIBIDAS)) {
            for (const palabra of palabras) {
                if (textoLower.includes(palabra)) {
                    detecciones.push({
                        categoria: categoria,
                        palabra: palabra,
                        timestamp: new Date().toISOString(),
                        usuario: userId,
                        nivel: 'alto'
                    });
                    nivelRiesgo += 2;
                }
            }
        }

        // Si hay detecciones, procesarlas
        if (detecciones.length > 0) {
            this.detecciones.push(...detecciones);
            this._procesarDetecciones(detecciones, userId);
            this._registrarEvento('contenido_detectado', { 
                detecciones: detecciones.length, 
                usuario: userId,
                nivel_riesgo: nivelRiesgo
            });
        }

        return {
            detectado: detecciones.length > 0,
            detecciones: detecciones,
            nivel_riesgo: nivelRiesgo,
            nivel_advertencia: this.nivelAdvertencia
        };
    },

    // ================================================================
    // ⚠️ PROCESAR DETECCIONES
    // ================================================================
    
    _procesarDetecciones(detecciones, userId) {
        const nivelRiesgo = detecciones.length;
        
        // Incrementar nivel de advertencia según gravedad
        if (nivelRiesgo >= 3) {
            this.nivelAdvertencia += 2;
        } else if (nivelRiesgo >= 1) {
            this.nivelAdvertencia += 1;
        }

        // Verificar si se superó el límite
        if (this.nivelAdvertencia >= this.CONFIG.ADVERTENCIAS_MAX) {
            this._aplicarSancionMaxima(userId);
            return;
        }

        // Aplicar sanción según nivel
        this._aplicarSancionPorNivel(this.nivelAdvertencia, userId);
    },

    // ================================================================
    // ⚖️ APLICAR SANCIONES
    // ================================================================
    
    _aplicarSancionPorNivel(nivel, userId) {
        const mensajes = {
            1: `⚠️ Advertencia 1/3: Contenido inapropiado detectado. Silencio de ${this.CONFIG.SILENCIO_1} segundos.`,
            2: `⚠️ Advertencia 2/3: Contenido inapropiado nuevamente. Silencio de ${this.CONFIG.SILENCIO_2} segundos.`,
            3: `⚠️ Advertencia 3/3: Última advertencia. Silencio de ${this.CONFIG.SILENCIO_3} segundos.`
        };

        const silencios = {
            1: this.CONFIG.SILENCIO_1,
            2: this.CONFIG.SILENCIO_2,
            3: this.CONFIG.SILENCIO_3
        };

        const mensaje = mensajes[nivel] || mensajes[3];
        const tiempoSilencio = silencios[nivel] || silencios[3];

        this.alertasEnviadas.push({
            nivel: nivel,
            mensaje: mensaje,
            timestamp: new Date().toISOString(),
            usuario: userId
        });

        console.log(`🛑 ${mensaje}`);
        this._registrarEvento('sancion_aplicada', { 
            nivel, 
            usuario: userId, 
            tiempo_silencio: tiempoSilencio 
        });

        // Simular silencio (en producción, esto se aplicaría en el frontend)
        return {
            nivel: nivel,
            mensaje: mensaje,
            tiempo_silencio: tiempoSilencio
        };
    },

    _aplicarSancionMaxima(userId) {
        console.log(`🚨 SANCION MÁXIMA: Usuario ${userId} ha sido expulsado de la transmisión.`);
        this.alertasEnviadas.push({
            nivel: 'MAXIMA',
            mensaje: '🔴 Has sido expulsado por exceder el límite de advertencias.',
            timestamp: new Date().toISOString(),
            usuario: userId
        });
        
        // Bloquear usuario temporalmente
        if (!this.usuariosBloqueados.includes(userId)) {
            this.usuariosBloqueados.push(userId);
        }
        
        this._registrarEvento('sancion_maxima', { usuario: userId });
        
        return {
            nivel: 'MAXIMA',
            mensaje: '🔴 Has sido expulsado por exceder el límite de advertencias.',
            usuario: userId
        };
    },

    // ================================================================
    // 📢 ACTIVAR CAMPAÑA DE MARKETING
    // ================================================================
    
    activarCampanaMarketing(userId, presupuesto, duracion, datos = {}) {
        if (!presupuesto || presupuesto <= 0) {
            console.warn('⚠️ Presupuesto inválido para campaña');
            return null;
        }

        const campana = {
            id: `camp_${Date.now()}`,
            userId: userId,
            presupuesto: presupuesto,
            duracion: duracion || 30, // días
            activa: true,
            fecha_inicio: new Date().toISOString(),
            fecha_fin: new Date(Date.now() + (duracion || 30) * 24 * 60 * 60 * 1000).toISOString(),
            ...datos
        };

        this.campanasActivas.push(campana);
        this._registrarEvento('campana_activada', campana);
        console.log(`📢 Campaña de marketing activada:`, campana);
        return campana;
    },

    desactivarCampanaMarketing(campanaId) {
        const index = this.campanasActivas.findIndex(c => c.id === campanaId);
        if (index === -1) {
            console.warn(`⚠️ Campaña ${campanaId} no encontrada`);
            return false;
        }
        this.campanasActivas[index].activa = false;
        this.campanasActivas[index].fecha_fin = new Date().toISOString();
        console.log(`📢 Campaña ${campanaId} desactivada`);
        return true;
    },

    // ================================================================
    // 📊 OBTENER MÉTRICAS
    // ================================================================
    
    obtenerMetricas(userId = null) {
        const usuario = userId || this.userId;
        return {
            usuario: usuario,
            transmision_activa: this.transmisionActiva,
            nivel_advertencia: this.nivelAdvertencia,
            detecciones_totales: this.detecciones.length,
            alertas_enviadas: this.alertasEnviadas.length,
            usuarios_conectados: this._simularUsuariosConectados(),
            mensajes_por_minuto: this._calcularMensajesPorMinuto(),
            promedio_estancia: this._calcularPromedioEstancia(),
            campanas_activas: this.campanasActivas.filter(c => c.activa).length,
            usuarios_bloqueados: this.usuariosBloqueados.length
        };
    },

    // ================================================================
    // ⭐ PRIORIZAR SERVICIO
    // ================================================================
    
    priorizarServicio(userId, servicioId, presupuesto) {
        if (!userId || !servicioId) {
            console.warn('⚠️ Datos inválidos para priorizar servicio');
            return null;
        }

        const resultado = {
            servicioId: servicioId,
            usuario: userId,
            prioridad: presupuesto > 100 ? 'alta' : 'media',
            presupuesto: presupuesto || 0,
            timestamp: new Date().toISOString()
        };

        this._registrarEvento('servicio_priorizado', resultado);
        console.log(`⭐ Servicio priorizado: ${servicioId} con presupuesto ${presupuesto || 'no especificado'}`);
        return resultado;
    },

    // ================================================================
    // 🚫 GESTIÓN DE BLOQUEOS
    // ================================================================
    
    bloquearUsuario(userId, motivo = 'Violación de normas') {
        if (this.usuariosBloqueados.includes(userId)) {
            console.warn(`⚠️ Usuario ${userId} ya está bloqueado`);
            return false;
        }
        this.usuariosBloqueados.push(userId);
        this._registrarEvento('usuario_bloqueado', { userId, motivo });
        console.log(`🚫 Usuario ${userId} bloqueado. Motivo: ${motivo}`);
        return true;
    },

    desbloquearUsuario(userId) {
        const index = this.usuariosBloqueados.indexOf(userId);
        if (index === -1) {
            console.warn(`⚠️ Usuario ${userId} no está bloqueado`);
            return false;
        }
        this.usuariosBloqueados.splice(index, 1);
        this._registrarEvento('usuario_desbloqueado', { userId });
        console.log(`✅ Usuario ${userId} desbloqueado`);
        return true;
    },

    // ================================================================
    // 📋 FUNCIONES INTERNAS
    // ================================================================
    
    _registrarEvento(tipo, datos) {
        this.historialModeracion.push({
            tipo: tipo,
            datos: datos,
            timestamp: new Date().toISOString()
        });
        // Mantener historial limitado
        if (this.historialModeracion.length > 1000) {
            this.historialModeracion = this.historialModeracion.slice(-1000);
        }
    },

    _iniciarCronometro() {
        if (this.intervaloModeracion) {
            clearInterval(this.intervaloModeracion);
        }
        this.tiempoTranscurrido = 0;
        this.intervaloModeracion = setInterval(() => {
            this.tiempoTranscurrido++;
        }, 1000);
    },

    _detenerCronometro() {
        if (this.intervaloModeracion) {
            clearInterval(this.intervaloModeracion);
            this.intervaloModeracion = null;
        }
    },

    _simularUsuariosConectados() {
        // Simulación: entre 5 y 50 usuarios
        return Math.floor(Math.random() * 45) + 5;
    },

    _calcularMensajesPorMinuto() {
        // Simulación: entre 2 y 15 mensajes por minuto
        return Math.floor(Math.random() * 13) + 2;
    },

    _calcularPromedioEstancia() {
        // Simulación: entre 30s y 10m
        const minutos = Math.floor(Math.random() * 9) + 1;
        const segundos = Math.floor(Math.random() * 59);
        return `${minutos}m ${segundos}s`;
    },

    // ================================================================
    // 🔄 REINICIAR MODERACIÓN
    // ================================================================
    
    reiniciar() {
        this.detenerModeracion();
        this.nivelAdvertencia = 0;
        this.detecciones = [];
        this.alertasEnviadas = [];
        this.usuariosBloqueados = [];
        this.historialModeracion = [];
        this.campanasActivas = [];
        this.tiempoTranscurrido = 0;
        console.log('🔄 Moderación reiniciada completamente');
        return this;
    },

    // ================================================================
    // 📋 OBTENER HISTORIAL
    // ================================================================
    
    getHistorial(limit = 50) {
        return this.historialModeracion.slice(-limit);
    },

    getAlertas(limit = 20) {
        return this.alertasEnviadas.slice(-limit);
    },

    getDetecciones(limit = 20) {
        return this.detecciones.slice(-limit);
    }
};

// ================================================================
// 🚀 EXPORTAR POR DEFECTO
// ================================================================

export default moderacionAvanzada;

// ================================================================
// 📋 LOG DE INICIO
// ================================================================

console.log('🛡️ Plugin de Moderación Avanzada v2.1.0 cargado');
console.log('📍 Hecho en Puebla, México');
console.log('⚖️ Sistema de 3 advertencias y sanciones automáticas');