// js/plugins/plugin-moderacion-avanzada.js
import { supabase } from '../utils/supabaseClient.js';

export const moderacionAvanzada = {
    // ================================================================
    // CONFIGURACIÓN
    // ================================================================
    transmisionActiva: false,
    nivelAdvertencia: 0,
    detecciones: [],
    alertasEnviadas: [],
    usuarioVerificado: false,
    monetizacionActiva: false,
    MAX_ADVERTENCIAS: 3,

    // ================================================================
    // INICIAR MODERACIÓN
    // ================================================================
    iniciarModeracion(userId, roomName) {
        console.log(`🛡️ Moderación iniciada para ${userId} en ${roomName}`);
        
        this.transmisionActiva = true;
        this.nivelAdvertencia = 0;
        this.detecciones = [];
        this.alertasEnviadas = [];
        
        // Verificar usuario
        this.verificarUsuario(userId);
        
        // Notificar inicio
        this._notificar('moderacion_iniciada', {
            userId,
            roomName,
            nivelAdvertencia: this.nivelAdvertencia
        });

        return {
            success: true,
            message: 'Moderación iniciada'
        };
    },

    // ================================================================
    // DETENER MODERACIÓN
    // ================================================================
    detenerModeracion() {
        console.log('🛡️ Moderación detenida');
        
        this.transmisionActiva = false;
        this.nivelAdvertencia = 0;
        this.detecciones = [];
        this.alertasEnviadas = [];
        
        this._notificar('moderacion_detenida', {});

        return {
            success: true,
            message: 'Moderación detenida'
        };
    },

    // ================================================================
    // VERIFICAR USUARIO
    // ================================================================
    verificarUsuario(userId) {
        // Simulación de verificación
        // En producción se consultaría Supabase
        this.usuarioVerificado = true;
        console.log(`✅ Usuario ${userId} verificado`);
        return this.usuarioVerificado;
    },

    // ================================================================
    // DETECTAR CONTENIDO OFENSIVO
    // ================================================================
    detectarContenido(texto) {
        // Palabras prohibidas básicas
        const palabrasProhibidas = [
            'odio', 'violencia', 'discriminación', 'racismo', 'sexismo',
            'homofobia', 'transfobia', 'bullying', 'acoso', 'amenaza',
            'muerte', 'suicidio', 'arma', 'nazi', 'fascista'
        ];

        const textoLower = texto.toLowerCase();
        const detecciones = [];

        palabrasProhibidas.forEach(palabra => {
            if (textoLower.includes(palabra)) {
                detecciones.push({
                    palabra: palabra,
                    timestamp: new Date().toISOString()
                });
            }
        });

        if (detecciones.length > 0) {
            this.detecciones = [...this.detecciones, ...detecciones];
            this._procesarDetecciones(detecciones);
        }

        return detecciones;
    },

    // ================================================================
    // PROCESAR DETECCIONES
    // ================================================================
    _procesarDetecciones(detecciones) {
        // Cada detección aumenta el nivel de advertencia
        this.nivelAdvertencia += detecciones.length;

        // Crear alerta
        const alerta = {
            id: Date.now(),
            detecciones: detecciones,
            nivel: this.nivelAdvertencia,
            timestamp: new Date().toISOString()
        };
        this.alertasEnviadas.push(alerta);

        // Notificar
        this._notificar('contenido_detectado', {
            detecciones: detecciones,
            nivelAdvertencia: this.nivelAdvertencia,
            alerta: alerta
        });

        // Verificar si se superó el límite
        if (this.nivelAdvertencia >= this.MAX_ADVERTENCIAS) {
            this._cerrarTransmision();
        }
    },

    // ================================================================
    // CERRAR TRANSMISIÓN
    // ================================================================
    _cerrarTransmision() {
        console.log('🚫 TRANSMISIÓN CERRADA POR MODERACIÓN');
        
        this.transmisionActiva = false;
        
        this._notificar('cierre', {
            motivo: 'Excedió el límite de advertencias',
            nivelAdvertencia: this.nivelAdvertencia,
            detecciones: this.detecciones
        });

        // Disparar evento global
        document.dispatchEvent(new CustomEvent('moderacion:evento', {
            detail: {
                tipo: 'cierre',
                mensaje: 'Transmisión cerrada por moderación',
                nivelAdvertencia: this.nivelAdvertencia
            }
        }));
    },

    // ================================================================
    // ACTIVAR CAMPAÑA DE MARKETING
    // ================================================================
    activarCampanaMarketing(userId, presupuesto, duracion) {
        console.log(`📢 Campaña de marketing activada para ${userId}`);
        console.log(`💰 Presupuesto: $${presupuesto} MXN · Duración: ${duracion} días`);
        
        this.monetizacionActiva = true;
        
        this._notificar('campana_activada', {
            userId,
            presupuesto,
            duracion
        });

        return {
            success: true,
            message: 'Campaña de marketing activada',
            presupuesto,
            duracion
        };
    },

    // ================================================================
    // OBTENER MÉTRICAS
    // ================================================================
    obtenerMetricas(userId) {
        return {
            usuarioId: userId,
            transmisionActiva: this.transmisionActiva,
            nivelAdvertencia: this.nivelAdvertencia,
            totalDetecciones: this.detecciones.length,
            totalAlertas: this.alertasEnviadas.length,
            usuarioVerificado: this.usuarioVerificado,
            monetizacionActiva: this.monetizacionActiva,
            ultimaAlerta: this.alertasEnviadas[this.alertasEnviadas.length - 1] || null
        };
    },

    // ================================================================
    // PRIORIZAR SERVICIO
    // ================================================================
    priorizarServicio(userId, servicioId, presupuesto) {
        console.log(`⭐ Servicio ${servicioId} priorizado por ${userId}`);
        console.log(`💰 Presupuesto: $${presupuesto} MXN`);
        
        this._notificar('servicio_priorizado', {
            userId,
            servicioId,
            presupuesto
        });

        return {
            success: true,
            message: `Servicio ${servicioId} priorizado`,
            presupuesto
        };
    },

    // ================================================================
    // NOTIFICAR EVENTOS
    // ================================================================
    _notificar(evento, data) {
        document.dispatchEvent(new CustomEvent('moderacion:evento', {
            detail: {
                tipo: evento,
                ...data
            }
        }));
    }
};

console.log('🛡️ Plugin de Moderación Avanzada cargado');