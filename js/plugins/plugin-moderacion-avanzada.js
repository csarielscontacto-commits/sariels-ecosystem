// js/plugins/plugin-moderacion-avanzada.js
import { supabase } from '../utils/supabaseClient.js';

// ================================================================
// SISTEMA DE MODERACIÓN AVANZADA EN VIVO
// ================================================================

const CONFIG = {
    // Intervalo de captura (segundos)
    CAPTURE_INTERVAL: 3,
    
    // Umbral de confianza para IA
    UMBRAL_CONFIANZA: 0.7,
    
    // Tiempos (segundos)
    TIEMPOS: {
        ENTRE_ADVERTENCIAS: 15,
        CIERRE_AUTOMATICO: 180, // 3 minutos
        CIERRE_AUTOMATICO_MS: 180000,
        ENTRE_ADVERTENCIAS_MS: 15000
    },
    
    // Requisitos para monetización
    MONETIZACION: {
        MINIMO_SEGUIDORES: 1000,
        EDAD_MINIMA: 18,
        VERIFICACION_REQUERIDA: true
    },
    
    // Palabras clave para detección rápida
    PALABRAS_PROHIBIDAS: {
        DROGAS: ['droga', 'cocaína', 'marihuana', 'cannabis', 'pasto', 'hierba', 'porro', 'churro', 'crack', 'heroína'],
        ALCOHOL: ['alcohol', 'cerveza', 'whisky', 'vodka', 'ron', 'tequila', 'vino', 'champán', 'licor', 'bebida'],
        TABACO: ['fumar', 'cigarro', 'cigarrillo', 'vape', 'vapor', 'tabaco', 'puro', 'cigar', 'nicotina'],
        VIOLENCIA: ['violencia', 'golpe', 'pelea', 'arma', 'pistola', 'cuchillo', 'navaja', 'asesinato', 'muerte']
    }
};

// ================================================================
// CLASE PRINCIPAL
// ================================================================

export class ModeracionAvanzada {
    constructor() {
        this.transmisionActiva = false;
        this.roomName = null;
        this.userId = null;
        this.nivelAdvertencia = 0;
        this.ultimaDeteccion = null;
        this.timerCierre = null;
        this.capturaInterval = null;
        this.detecciones = [];
        this.alertasEnviadas = [];
        this.usuarioVerificado = false;
        this.edadUsuario = null;
        this.seguidores = 0;
        this.monetizacionActiva = false;
        this.campanaMarketing = null;
    }

    // ================================================================
    // VERIFICACIÓN DE USUARIO (EDAD + IDENTIDAD)
    // ================================================================
    async verificarUsuario(userId) {
        console.log(`🔍 Verificando usuario: ${userId}`);
        
        try {
            // Obtener datos del usuario desde Supabase
            const { data: user, error } = await supabase
                .from('perfiles')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (error) throw error;
            
            this.edadUsuario = user.edad;
            this.usuarioVerificado = user.verificado || false;
            this.seguidores = user.seguidores || 0;
            
            // Verificar si cumple requisitos para monetización
            this.monetizacionActiva = this.verificarMonetizacion();
            
            // Verificar edad mínima (18 años)
            if (this.edadUsuario < CONFIG.MONETIZACION.EDAD_MINIMA) {
                console.warn(`⚠️ Usuario menor de ${CONFIG.MONETIZACION.EDAD_MINIMA} años`);
                return {
                    verificado: false,
                    razon: 'MENOR_EDAD',
                    mensaje: `Debes tener al menos ${CONFIG.MONETIZACION.EDAD_MINIMA} años para transmitir`
                };
            }
            
            // Verificar identidad (documento)
            if (!this.usuarioVerificado && CONFIG.MONETIZACION.VERIFICACION_REQUERIDA) {
                console.warn('⚠️ Usuario no verificado');
                return {
                    verificado: false,
                    razon: 'NO_VERIFICADO',
                    mensaje: 'Debes verificar tu identidad para transmitir en vivo'
                };
            }
            
            return {
                verificado: true,
                edad: this.edadUsuario,
                seguidores: this.seguidores,
                monetizacion: this.monetizacionActiva
            };
            
        } catch (error) {
            console.error('❌ Error verificando usuario:', error);
            return {
                verificado: false,
                razon: 'ERROR',
                mensaje: 'Error al verificar usuario'
            };
        }
    }

    // ================================================================
    // VERIFICAR MONETIZACIÓN (1000 seguidores + verificado)
    // ================================================================
    verificarMonetizacion() {
        const cumpleSeguidores = this.seguidores >= CONFIG.MONETIZACION.MINIMO_SEGUIDORES;
        const cumpleEdad = this.edadUsuario >= CONFIG.MONETIZACION.EDAD_MINIMA;
        const cumpleVerificacion = this.usuarioVerificado || !CONFIG.MONETIZACION.VERIFICACION_REQUERIDA;
        
        return cumpleSeguidores && cumpleEdad && cumpleVerificacion;
    }

    // ================================================================
    // INICIAR MODERACIÓN
    // ================================================================
    async iniciarModeracion(userId, roomName) {
        console.log(`🛡️ Iniciando moderación para: ${userId}`);
        
        // Verificar usuario primero
        const verificacion = await this.verificarUsuario(userId);
        
        if (!verificacion.verificado) {
            // Si no está verificado, NO permite transmitir
            this.mostrarNotificacionError(verificacion.mensaje);
            return {
                status: 'denegado',
                razon: verificacion.razon,
                mensaje: verificacion.mensaje
            };
        }
        
        this.transmisionActiva = true;
        this.userId = userId;
        this.roomName = roomName;
        this.nivelAdvertencia = 0;
        this.detecciones = [];
        this.alertasEnviadas = [];
        
        // Limpiar timers previos
        this.limpiarTimers();
        
        // Iniciar captura de frames
        this.iniciarCaptura();
        
        // Guardar estado
        await this.guardarEstadoModeracion('activa');
        
        // Notificar que la transmisión es apta
        this.mostrarNotificacion('✅ Transmisión verificada y autorizada', '#00b894');
        
        return {
            status: 'autorizado',
            userId: userId,
            roomName: roomName,
            verificacion: verificacion,
            monetizacion: this.monetizacionActiva
        };
    }

    // ================================================================
    // DETECCIÓN DE MENORES DE EDAD EN LA TRANSMISIÓN
    // ================================================================
    async detectarMenores(frame) {
        // SIMULACIÓN: En producción usarías face-api.js o Google Cloud Vision
        // para detectar edad aproximada
        
        // Por ahora, simulamos detección (solo para pruebas)
        const random = Math.random();
        if (random > 0.95) { // 5% de probabilidad (solo para pruebas)
            return {
                encontrado: true,
                edadEstimada: Math.floor(Math.random() * 12) + 6, // 6-17 años
                confianza: 0.75
            };
        }
        
        return {
            encontrado: false,
            confianza: 0
        };
    }

    // ================================================================
    // CAPTURA Y ANÁLISIS DE FRAMES
    // ================================================================
    iniciarCaptura() {
        console.log(`📸 Iniciando captura de frames cada ${CONFIG.CAPTURE_INTERVAL}s`);
        
        this.capturaInterval = setInterval(() => {
            if (!this.transmisionActiva) {
                this.detenerCaptura();
                return;
            }
            this.capturarFrame();
        }, CONFIG.CAPTURE_INTERVAL * 1000);
    }

    async capturarFrame() {
        try {
            const videoElement = document.querySelector('#live-video, #localVideo, .m-stream-video');
            if (!videoElement) return;

            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth || 640;
            canvas.height = videoElement.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Analizar múltiples aspectos
            await Promise.all([
                this.analizarContenidoInapropiado(imageData, canvas),
                this.detectarMenores(canvas)
            ]);
            
        } catch (error) {
            console.error('❌ Error capturando frame:', error);
        }
    }

    // ================================================================
    // ANÁLISIS DE CONTENIDO INAPROPIADO
    // ================================================================
    async analizarContenidoInapropiado(imageData, canvas) {
        // 1. Detección por texto (palabras clave en overlay)
        const textoDetectado = await this.detectarTextoEnFrame(canvas);
        if (textoDetectado) {
            const resultado = this.analizarTexto(textoDetectado);
            if (resultado.encontrado) {
                await this.procesarDeteccion({
                    tipo: 'texto',
                    categoria: resultado.categoria,
                    confianza: 0.85,
                    detalles: resultado
                });
            }
        }

        // 2. Detección visual (IA - simulada)
        const resultadoVisual = await this.detectarVisualmente(canvas);
        if (resultadoVisual.encontrado) {
            await this.procesarDeteccion({
                tipo: 'visual',
                categoria: resultadoVisual.categoria,
                confianza: resultadoVisual.confianza,
                detalles: resultadoVisual
            });
        }

        // 3. Detección de menores (si hay niños en la transmisión)
        const resultadoMenores = await this.detectarMenores(canvas);
        if (resultadoMenores.encontrado) {
            await this.procesarDeteccion({
                tipo: 'menor_edad',
                categoria: 'menores',
                confianza: resultadoMenores.confianza,
                detalles: {
                    edadEstimada: resultadoMenores.edadEstimada,
                    mensaje: `Se detectó un menor de ${resultadoMenores.edadEstimada} años en la transmisión`
                }
            });
        }
    }

    // ================================================================
    // ANÁLISIS DE TEXTO CON PALABRAS CLAVE
    // ================================================================
    analizarTexto(texto) {
        const textoLower = texto.toLowerCase();
        const encontrados = {
            drogas: [],
            alcohol: [],
            tabaco: [],
            violencia: []
        };
        
        Object.entries(CONFIG.PALABRAS_PROHIBIDAS).forEach(([categoria, palabras]) => {
            palabras.forEach(palabra => {
                if (textoLower.includes(palabra)) {
                    encontrados[categoria].push(palabra);
                }
            });
        });
        
        const totalEncontrados = Object.values(encontrados).flat().length;
        
        if (totalEncontrados === 0) {
            return { encontrado: false };
        }
        
        // Determinar categoría principal
        let categoria = 'otro';
        if (encontrados.drogas.length > 0) categoria = 'drogas';
        else if (encontrados.alcohol.length > 0) categoria = 'alcohol';
        else if (encontrados.tabaco.length > 0) categoria = 'tabaco';
        else if (encontrados.violencia.length > 0) categoria = 'violencia';
        
        return {
            encontrado: true,
            categoria: categoria,
            palabras: encontrados,
            texto: texto
        };
    }

    // ================================================================
    // DETECCIÓN VISUAL (SIMULADA)
    // ================================================================
    async detectarVisualmente(canvas) {
        // SIMULACIÓN: En producción usar TensorFlow.js o API externa
        
        const random = Math.random();
        if (random > 0.90) { // 10% de probabilidad (para pruebas)
            const objetos = [
                { categoria: 'tabaco', tipo: 'cigarro', confianza: 0.75 },
                { categoria: 'alcohol', tipo: 'botella', confianza: 0.82 },
                { categoria: 'drogas', tipo: 'vape', confianza: 0.78 },
                { categoria: 'alcohol', tipo: 'lata_cerveza', confianza: 0.71 },
                { categoria: 'tabaco', tipo: 'vape', confianza: 0.73 }
            ];
            const seleccionado = objetos[Math.floor(Math.random() * objetos.length)];
            
            return {
                encontrado: true,
                categoria: seleccionado.categoria,
                tipo: seleccionado.tipo,
                confianza: seleccionado.confianza,
                detalles: `Detección de ${seleccionado.tipo} en el frame`
            };
        }
        
        return {
            encontrado: false,
            confianza: 0
        };
    }

    // ================================================================
    // DETECCIÓN DE TEXTO EN FRAME (OCR)
    // ================================================================
    async detectarTextoEnFrame(canvas) {
        // SIMULACIÓN: En producción usar Tesseract.js
        return null;
    }

    // ================================================================
    // PROCESAR DETECCIÓN - SISTEMA DE 3 ADVERTENCIAS
    // ================================================================
    async procesarDeteccion(deteccion) {
        // Si es menor de edad, acción inmediata
        if (deteccion.tipo === 'menor_edad') {
            await this.cerrarTransmisionPorModeracion('MENOR_EDAD_DETECTADO');
            return;
        }
        
        const ahora = Date.now();
        if (this.ultimaDeteccion && (ahora - this.ultimaDeteccion) < CONFIG.TIEMPOS.ENTRE_ADVERTENCIAS_MS) {
            console.log('⏳ Esperando antes de nueva detección');
            return;
        }
        
        this.ultimaDeteccion = ahora;
        this.detecciones.push({
            ...deteccion,
            timestamp: ahora
        });
        
        this.nivelAdvertencia++;
        
        console.log(`⚠️ Detección #${this.nivelAdvertencia}:`, deteccion);
        
        // Sistema de 3 advertencias
        switch(this.nivelAdvertencia) {
            case 1:
                await this.enviarAdvertencia('PRIMERA', deteccion);
                break;
            case 2:
                await this.enviarAdvertencia('SEGUNDA', deteccion);
                break;
            case 3:
                await this.enviarAdvertencia('TERCERA', deteccion);
                this.iniciarCuentaRegresivaCierre();
                break;
            default:
                await this.cerrarTransmisionPorModeracion('DEMASIADAS_ADVERTENCIAS');
                break;
        }
        
        await this.guardarDeteccion(deteccion);
    }

    // ================================================================
    // ENVIAR ADVERTENCIAS
    // ================================================================
    async enviarAdvertencia(nivel, deteccion) {
        const mensajes = {
            PRIMERA: {
                titulo: '⚠️ ADVERTENCIA #1',
                mensaje: `Hemos detectado ${deteccion.categoria} en tu transmisión. Por favor, elimina todo contenido inapropiado.`,
                color: '#f7d44a',
                tiempo: '15 segundos para corregir'
            },
            SEGUNDA: {
                titulo: '⚠️⚠️ ADVERTENCIA #2',
                mensaje: `SEGUNDA ADVERTENCIA: Continuamos detectando ${deteccion.categoria}. Esta es tu última oportunidad.`,
                color: '#ff8800',
                tiempo: '15 segundos para corregir'
            },
            TERCERA: {
                titulo: '⚠️⚠️⚠️ ADVERTENCIA FINAL',
                mensaje: `ADVERTENCIA FINAL: Has recibido 3 advertencias por ${deteccion.categoria}. Tu transmisión se cerrará en 3 MINUTOS.`,
                color: '#ff3366',
                tiempo: '3 minutos para corregir'
            }
        };
        
        const info = mensajes[nivel];
        if (!info) return;
        
        // Mostrar en UI
        this.mostrarNotificacionStreamer(info);
        
        // Enviar al chat
        await this.enviarMensajeChat(info);
        
        // Guardar en Supabase
        await this.guardarAdvertencia(nivel, deteccion);
        
        this.alertasEnviadas.push({
            nivel: nivel,
            ...deteccion,
            timestamp: Date.now()
        });
    }

    // ================================================================
    // INICIAR CUENTA REGRESIVA DE CIERRE (3 MINUTOS)
    // ================================================================
    iniciarCuentaRegresivaCierre() {
        console.log('⏰ Iniciando cuenta regresiva de 3 MINUTOS');
        this.mostrarCuentaRegresiva();
        
        this.timerCierre = setTimeout(() => {
            this.cerrarTransmisionPorModeracion('CIERRE_AUTOMATICO');
        }, CONFIG.TIEMPOS.CIERRE_AUTOMATICO_MS);
    }

    // ================================================================
    // MOSTRAR CUENTA REGRESIVA
    // ================================================================
    mostrarCuentaRegresiva() {
        const overlay = document.createElement('div');
        overlay.id = 'cuenta-regresiva';
        overlay.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            background: rgba(0,0,0,0.95);
            border: 2px solid #ff3366;
            border-radius: 16px;
            padding: 20px 30px;
            text-align: center;
            min-width: 300px;
            box-shadow: 0 0 80px rgba(255,51,102,0.3);
        `;
        overlay.innerHTML = `
            <div style="font-family:'Orbitron',monospace;color:#ff3366;font-size:1.4rem;animation:pulse 1s infinite;">
                ⚠️ CIERRE AUTOMÁTICO
            </div>
            <div style="color:#e8f0f8;font-size:1rem;margin:8px 0;">
                Tu transmisión se cerrará en:
            </div>
            <div id="countdown-timer" style="font-family:'Orbitron',monospace;font-size:3rem;color:#ff3366;font-weight:900;">
                02:59
            </div>
            <div style="color:#8ba3c7;font-size:0.7rem;margin-top:8px;">
                Elimina el contenido inapropiado para cancelar el cierre
            </div>
            <button onclick="this.parentElement.remove(); document.dispatchEvent(new CustomEvent('moderacion:cancelar_cierre'))" 
                    style="margin-top:12px;padding:8px 24px;background:#ff3366;border:none;border-radius:8px;color:white;font-weight:700;cursor:pointer;font-family:'Orbitron',monospace;">
                ❌ Cancelar cierre
            </button>
        `;
        document.body.appendChild(overlay);
        
        // Escuchar cancelación
        document.addEventListener('moderacion:cancelar_cierre', () => {
            this.cancelarCierre();
            const el = document.getElementById('cuenta-regresiva');
            if (el) el.remove();
        }, { once: true });
        
        // Iniciar cuenta regresiva
        let tiempoRestante = CONFIG.TIEMPOS.CIERRE_AUTOMATICO;
        const timer = setInterval(() => {
            tiempoRestante--;
            if (tiempoRestante <= 0) {
                clearInterval(timer);
                return;
            }
            const minutos = String(Math.floor(tiempoRestante / 60)).padStart(2, '0');
            const segundos = String(tiempoRestante % 60).padStart(2, '0');
            const timerElement = document.getElementById('countdown-timer');
            if (timerElement) {
                timerElement.textContent = `${minutos}:${segundos}`;
                if (tiempoRestante < 30) {
                    timerElement.style.color = '#ff0000';
                    timerElement.style.animation = 'pulse 0.5s infinite';
                }
            }
        }, 1000);
    }

    // ================================================================
    // CANCELAR CIERRE
    // ================================================================
    cancelarCierre() {
        console.log('✅ Cierre cancelado por el streamer');
        if (this.timerCierre) {
            clearTimeout(this.timerCierre);
            this.timerCierre = null;
        }
        this.nivelAdvertencia = 0;
        this.ultimaDeteccion = null;
        this.mostrarNotificacion('✅ Cierre automático cancelado', '#00b894');
        this.guardarEstadoModeracion('cancelado');
    }

    // ================================================================
    // CERRAR TRANSMISIÓN
    // ================================================================
    async cerrarTransmisionPorModeracion(razon) {
        console.log(`🚫 Cerrando transmisión por: ${razon}`);
        
        this.limpiarTimers();
        
        // Mensaje según razón
        const mensajes = {
            'MENOR_EDAD_DETECTADO': '🚫 TRANSMISIÓN CERRADA - MENOR DE EDAD DETECTADO',
            'CIERRE_AUTOMATICO': '🚫 TRANSMISIÓN CERRADA - CONTENIDO INAPROPIADO',
            'DEMASIADAS_ADVERTENCIAS': '🚫 TRANSMISIÓN CERRADA - DEMASIADAS ADVERTENCIAS'
        };
        
        const titulo = mensajes[razon] || '🚫 TRANSMISIÓN CERRADA';
        
        this.mostrarNotificacion(titulo, '#ff3366');
        
        await this.enviarMensajeChat({
            titulo: titulo,
            mensaje: `La transmisión ha sido cerrada automáticamente. Razón: ${razon}`,
            color: '#ff3366',
            tiempo: 'Cierre inmediato'
        });
        
        // Cerrar transmisión
        try {
            const event = new CustomEvent('live:cerrar', {
                detail: { razon: razon }
            });
            document.dispatchEvent(event);
            
            const { livePlugin } = await import('./plugin-live.js');
            if (livePlugin && livePlugin.endCall) {
                await livePlugin.endCall();
            }
        } catch (error) {
            console.error('❌ Error cerrando transmisión:', error);
        }
        
        await this.guardarCierre(razon);
        this.transmisionActiva = false;
        this.guardarEstadoModeracion('cerrada');
        
        this.mostrarOverlayCierre(razon);
    }

    // ================================================================
    // MOSTRAR OVERLAY DE CIERRE
    // ================================================================
    mostrarOverlayCierre(razon) {
        const mensajes = {
            'MENOR_EDAD_DETECTADO': '⚠️ Se detectó un menor de edad en la transmisión',
            'CIERRE_AUTOMATICO': '⚠️ Contenido inapropiado detectado repetidamente',
            'DEMASIADAS_ADVERTENCIAS': '⚠️ Demasiadas advertencias ignoradas'
        };
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.95);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: white;
            font-family: 'Orbitron', monospace;
        `;
        overlay.innerHTML = `
            <div style="font-size:5rem;margin-bottom:20px;">🚫</div>
            <div style="font-size:2rem;color:#ff3366;font-weight:900;text-align:center;">
                TRANSMISIÓN CERRADA
            </div>
            <div style="font-size:1rem;color:#8ba3c7;margin-top:12px;text-align:center;max-width:400px;">
                ${mensajes[razon] || 'Transmisión cerrada por moderación'}<br><br>
                <span style="font-size:0.8rem;">
                    Si crees que es un error, contacta a soporte.
                </span>
            </div>
            <button onclick="this.parentElement.remove()" style="margin-top:24px;padding:12px 32px;background:#ff3366;border:none;border-radius:12px;color:white;font-weight:700;cursor:pointer;font-family:'Orbitron',monospace;font-size:0.9rem;">
                Entendido
            </button>
        `;
        document.body.appendChild(overlay);
    }

    // ================================================================
    // MÉTRICAS Y MARKETING
    // ================================================================
    async obtenerMetricas(userId) {
        try {
            // Obtener métricas de la transmisión
            const { data: metricas, error } = await supabase
                .from('metricas_transmision')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (error) throw error;
            
            return {
                viewers: metricas.viewers || 0,
                likes: metricas.likes || 0,
                shares: metricas.shares || 0,
                comments: metricas.comments || 0,
                revenue: metricas.revenue || 0,
                seguidores: this.seguidores || 0,
                monetizacion: this.monetizacionActiva
            };
        } catch (error) {
            console.warn('⚠️ No se encontraron métricas:', error);
            return {
                viewers: 0,
                likes: 0,
                shares: 0,
                comments: 0,
                revenue: 0,
                seguidores: this.seguidores || 0,
                monetizacion: this.monetizacionActiva
            };
        }
    }

    // ================================================================
    // MARKETING PAGADO (Algoritmo de visibilidad tipo TikTok)
    // ================================================================
    async activarCampanaMarketing(userId, presupuesto, duracion) {
        console.log(`📢 Activando campaña de marketing para: ${userId}`);
        console.log(`💰 Presupuesto: $${presupuesto} | Duración: ${duracion} días`);
        
        try {
            // Crear campaña en Supabase
            const { data: campana, error } = await supabase
                .from('campanas_marketing')
                .insert({
                    user_id: userId,
                    presupuesto: presupuesto,
                    duracion: duracion,
                    estado: 'activa',
                    creado_en: new Date().toISOString(),
                    prioridad: this.calcularPrioridad(presupuesto)
                })
                .select()
                .single();
            
            if (error) throw error;
            
            this.campanaMarketing = campana;
            
            // Algoritmo de visibilidad (TikTok style)
            // 1. Mayor presupuesto = mayor prioridad en el feed
            // 2. Impulso inicial en los primeros 5 minutos
            // 3. Recomendación a usuarios similares
            
            const resultado = {
                campana: campana,
                prioridad: campana.prioridad,
                impulsoInicial: true,
                recomendaciones: await this.generarRecomendaciones(userId)
            };
            
            // Guardar métricas de la campaña
            await this.guardarMetricasMarketing(userId, resultado);
            
            this.mostrarNotificacion(
                `📢 Campaña activada! Prioridad: ${campana.prioridad}/10`,
                '#f7d44a'
            );
            
            return resultado;
            
        } catch (error) {
            console.error('❌ Error activando campaña:', error);
            return null;
        }
    }

    calcularPrioridad(presupuesto) {
        // Prioridad 1-10 según presupuesto
        if (presupuesto >= 1000) return 10;
        if (presupuesto >= 500) return 8;
        if (presupuesto >= 250) return 6;
        if (presupuesto >= 100) return 4;
        return 2;
    }

    async generarRecomendaciones(userId) {
        // Simular generación de recomendaciones
        // En producción: usar algoritmo de ML o consultar usuarios similares
        return {
            usuariosRecomendados: await this.obtenerUsuariosSimilares(userId),
            hashtags: ['#Csariels', '#LiveStreaming', '#Comunidad'],
            horarioOptimizado: '20:00 - 22:00'
        };
    }

    async obtenerUsuariosSimilares(userId) {
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select('user_id, intereses')
                .neq('user_id', userId)
                .limit(20);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.warn('⚠️ Error obteniendo usuarios similares:', error);
            return [];
        }
    }

    async guardarMetricasMarketing(userId, data) {
        try {
            await supabase
                .from('metricas_marketing')
                .insert({
                    user_id: userId,
                    campana_id: data.campana.id,
                    prioridad: data.prioridad,
                    impulso_inicial: data.impulsoInicial,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('❌ Error guardando métricas de marketing:', error);
        }
    }

    // ================================================================
    // SERVICIOS PRIORIZADOS (Pago por visibilidad)
    // ================================================================
    async priorizarServicio(userId, servicioId, presupuesto) {
        console.log(`⭐ Priorizando servicio: ${servicioId} con $${presupuesto}`);
        
        try {
            // Actualizar servicio con prioridad
            const { data, error } = await supabase
                .from('servicios_comunitarios')
                .update({
                    prioridad: this.calcularPrioridad(presupuesto),
                    presupuesto_marketing: presupuesto,
                    marketing_activo: true,
                    actualizado_en: new Date().toISOString()
                })
                .eq('id', servicioId)
                .select()
                .single();
            
            if (error) throw error;
            
            // Posicionar en primera plana
            this.mostrarNotificacion(
                `⭐ Servicio priorizado! Aparecerá en primera plana`,
                '#00b894'
            );
            
            return data;
            
        } catch (error) {
            console.error('❌ Error priorizando servicio:', error);
            return null;
        }
    }

    // ================================================================
    // NOTIFICACIONES UI
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
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
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

    mostrarNotificacionStreamer(info) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            background: rgba(0,0,0,0.9);
            border: 2px solid ${info.color};
            border-radius: 12px;
            padding: 20px 30px;
            max-width: 500px;
            text-align: center;
            animation: slideDown 0.5s ease-out;
            box-shadow: 0 0 60px rgba(255,0,0,0.3);
        `;
        overlay.innerHTML = `
            <style>
                @keyframes slideDown {
                    from { opacity: 0; transform: translateX(-50%) translateY(-50px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                .m-warning-title {
                    font-family: 'Orbitron', monospace;
                    font-size: 1.2rem;
                    color: ${info.color};
                    animation: pulse 1s infinite;
                }
                .m-warning-text {
                    color: #e8f0f8;
                    font-size: 0.9rem;
                    margin: 10px 0;
                }
                .m-warning-time {
                    color: ${info.color};
                    font-size: 0.8rem;
                    font-family: 'Orbitron', monospace;
                }
                .m-warning-close {
                    margin-top: 12px;
                    padding: 8px 20px;
                    background: ${info.color};
                    border: none;
                    border-radius: 8px;
                    color: #0a0c10;
                    font-weight: 700;
                    cursor: pointer;
                    font-family: 'Orbitron', monospace;
                }
            </style>
            <div class="m-warning-title">${info.titulo}</div>
            <div class="m-warning-text">${info.mensaje}</div>
            <div class="m-warning-time">⏱️ ${info.tiempo}</div>
            <button class="m-warning-close" onclick="this.parentElement.remove()">
                Entendido, lo corregiré
            </button>
        `;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            const el = overlay;
            if (el && el.parentElement) el.remove();
        }, 15000);
    }

    mostrarNotificacionError(mensaje) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.9);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: white;
            font-family: 'Orbitron', monospace;
            padding: 20px;
        `;
        overlay.innerHTML = `
            <div style="font-size:4rem;margin-bottom:20px;">🔒</div>
            <div style="font-size:1.8rem;color:#ff3366;font-weight:900;text-align:center;">
                TRANSMISIÓN NO AUTORIZADA
            </div>
            <div style="font-size:1rem;color:#8ba3c7;margin-top:12px;text-align:center;max-width:400px;">
                ${mensaje}
            </div>
            <button onclick="this.parentElement.remove()" style="margin-top:24px;padding:12px 32px;background:#ff3366;border:none;border-radius:12px;color:white;font-weight:700;cursor:pointer;font-family:'Orbitron',monospace;font-size:0.9rem;">
                Entendido
            </button>
        `;
        document.body.appendChild(overlay);
    }

    // ================================================================
    // ENVIAR MENSAJE AL CHAT
    // ================================================================
    async enviarMensajeChat(info) {
        try {
            const mensaje = {
                user_id: '🛡️ Moderación',
                content: `⚠️ ${info.titulo}\n${info.mensaje}`,
                type: 'text',
                created_at: new Date().toISOString(),
                leido: false,
                extra: {
                    tipo: 'moderacion',
                    nivel: info.titulo,
                    timestamp: Date.now()
                }
            };
            
            await supabase.from('mensajes').insert(mensaje);
            supabase.channel('chat-messages').broadcast('INSERT', mensaje);
            
        } catch (error) {
            console.error('❌ Error enviando mensaje al chat:', error);
        }
    }

    // ================================================================
    // GUARDAR EN SUPABASE
    // ================================================================
    async guardarDeteccion(deteccion) {
        try {
            await supabase
                .from('detecciones_moderacion')
                .insert({
                    user_id: this.userId,
                    room_name: this.roomName,
                    tipo: deteccion.tipo,
                    categoria: deteccion.categoria,
                    confianza: deteccion.confianza,
                    detalles: deteccion.detalles,
                    nivel_advertencia: this.nivelAdvertencia,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('❌ Error guardando detección:', error);
        }
    }

    async guardarAdvertencia(nivel, deteccion) {
        try {
            await supabase
                .from('advertencias_moderacion')
                .insert({
                    user_id: this.userId,
                    room_name: this.roomName,
                    nivel: nivel,
                    deteccion: deteccion,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('❌ Error guardando advertencia:', error);
        }
    }

    async guardarCierre(razon) {
        try {
            await supabase
                .from('cierres_moderacion')
                .insert({
                    user_id: this.userId,
                    room_name: this.roomName,
                    razon: razon,
                    alertas_enviadas: this.alertasEnviadas,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('❌ Error guardando cierre:', error);
        }
    }

    async guardarEstadoModeracion(estado) {
        try {
            await supabase
                .from('estados_moderacion')
                .upsert({
                    user_id: this.userId,
                    room_name: this.roomName,
                    estado: estado,
                    nivel_advertencia: this.nivelAdvertencia,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        } catch (error) {
            console.error('❌ Error guardando estado:', error);
        }
    }

    // ================================================================
    // UTILIDADES
    // ================================================================
    limpiarTimers() {
        if (this.capturaInterval) {
            clearInterval(this.capturaInterval);
            this.capturaInterval = null;
        }
        if (this.timerCierre) {
            clearTimeout(this.timerCierre);
            this.timerCierre = null;
        }
    }

    detenerCaptura() {
        if (this.capturaInterval) {
            clearInterval(this.capturaInterval);
            this.capturaInterval = null;
        }
        console.log('📸 Captura de frames detenida');
    }

    detenerModeracion() {
        this.transmisionActiva = false;
        this.limpiarTimers();
        this.guardarEstadoModeracion('detenida');
        console.log('🛡️ Moderación detenida');
    }

    // ================================================================
    // ACTUALIZAR MÉTRICAS EN TIEMPO REAL
    // ================================================================
    async actualizarMetricas(userId, metricas) {
        try {
            await supabase
                .from('metricas_transmision')
                .upsert({
                    user_id: userId,
                    ...metricas,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        } catch (error) {
            console.error('❌ Error actualizando métricas:', error);
        }
    }
}

// ================================================================
// EXPORTAR INSTANCIA ÚNICA
// ================================================================
export const moderacionAvanzada = new ModeracionAvanzada();