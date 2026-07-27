// js/plugins/plugin-configuracion-transmision.js
import { supabase } from '../utils/supabaseClient.js';

// ================================================================
// CONFIGURACIÓN DE TRANSMISIÓN EN VIVO
// ================================================================

export const CONFIG_TRANSMISION = {
    // Tipos de transmisión
    TIPOS: {
        INDIVIDUAL: 'individual',
        GRUPAL: 'grupal',
        JUEGO: 'juego'
    },
    
    // Calidades de video
    CALIDADES: {
        BAJA: { label: '480p', width: 854, height: 480, bitrate: 800 },
        MEDIA: { label: '720p', width: 1280, height: 720, bitrate: 1500 },
        ALTA: { label: '1080p', width: 1920, height: 1080, bitrate: 2500 },
        ULTRA: { label: '4K', width: 3840, height: 2160, bitrate: 4000 }
    },
    
    // FPS disponibles
    FPS: [15, 24, 30, 60],
    
    // Configuración por defecto
    DEFAULT: {
        tipo: 'individual',
        calidad: 'MEDIA',
        fps: 30,
        audio: true,
        camara: true,
        mic: true,
        compartirPantalla: false
    },
    
    // Límites por tipo
    LIMITES: {
        individual: {
            maxParticipantes: 1,
            maxCamaras: 1,
            permiteJuego: true
        },
        grupal: {
            maxParticipantes: 10,
            maxCamaras: 10,
            permiteJuego: false
        },
        juego: {
            maxParticipantes: 1,
            maxCamaras: 1,
            permiteJuego: true,
            capturaPantalla: true
        }
    }
};

// ================================================================
// CLASE PRINCIPAL - Configuración de Transmisión
// ================================================================

export class ConfiguracionTransmision {
    constructor() {
        this.configuracion = { ...CONFIG_TRANSMISION.DEFAULT };
        this.participantes = [];
        this.camarasActivas = {};
        this.microfonosActivos = {};
        this.juegoActivo = null;
        this.roomName = null;
        this.userId = null;
        this.transmisionActiva = false;
        this.intervaloMetricas = null;
    }

    // ================================================================
    // INICIALIZAR CONFIGURACIÓN
    // ================================================================
    inicializar(userId, roomName, config = {}) {
        this.userId = userId;
        this.roomName = roomName;
        
        // Mezclar con configuración por defecto
        this.configuracion = {
            ...CONFIG_TRANSMISION.DEFAULT,
            ...config,
            tipo: config.tipo || CONFIG_TRANSMISION.DEFAULT.tipo
        };
        
        // Validar tipo
        if (!Object.values(CONFIG_TRANSMISION.TIPOS).includes(this.configuracion.tipo)) {
            throw new Error(`Tipo de transmisión no válido: ${this.configuracion.tipo}`);
        }
        
        this.transmisionActiva = true;
        
        console.log(`🎥 Transmisión inicializada:`, this.configuracion);
        this.guardarConfiguracion();
        
        return this.configuracion;
    }

    // ================================================================
    // CONFIGURAR TIPO DE TRANSMISIÓN
    // ================================================================
    setTipo(tipo) {
        if (!Object.values(CONFIG_TRANSMISION.TIPOS).includes(tipo)) {
            throw new Error(`Tipo no válido: ${tipo}`);
        }
        
        this.configuracion.tipo = tipo;
        this.guardarConfiguracion();
        
        console.log(`📺 Tipo de transmisión cambiado a: ${tipo}`);
        return this.configuracion;
    }

    // ================================================================
    // CONFIGURAR CALIDAD DE VIDEO
    // ================================================================
    setCalidad(calidadKey) {
        const calidad = CONFIG_TRANSMISION.CALIDADES[calidadKey];
        if (!calidad) {
            throw new Error(`Calidad no válida: ${calidadKey}`);
        }
        
        this.configuracion.calidad = calidadKey;
        this.configuracion.width = calidad.width;
        this.configuracion.height = calidad.height;
        this.configuracion.bitrate = calidad.bitrate;
        
        this.guardarConfiguracion();
        console.log(`📹 Calidad cambiada a: ${calidadKey} (${calidad.width}x${calidad.height})`);
        
        return this.configuracion;
    }

    // ================================================================
    // CONFIGURAR FPS
    // ================================================================
    setFps(fps) {
        if (!CONFIG_TRANSMISION.FPS.includes(fps)) {
            throw new Error(`FPS no válido: ${fps}. Opciones: ${CONFIG_TRANSMISION.FPS.join(', ')}`);
        }
        
        this.configuracion.fps = fps;
        this.guardarConfiguracion();
        console.log(`🎬 FPS cambiado a: ${fps}`);
        
        return this.configuracion;
    }

    // ================================================================
    // CONFIGURAR AUDIO
    // ================================================================
    setAudio(activo) {
        this.configuracion.audio = activo;
        this.guardarConfiguracion();
        console.log(`🎤 Audio ${activo ? 'activado' : 'desactivado'}`);
        
        return this.configuracion;
    }

    // ================================================================
    // CONFIGURAR CÁMARA
    // ================================================================
    setCamara(activo) {
        this.configuracion.camara = activo;
        this.guardarConfiguracion();
        console.log(`📷 Cámara ${activo ? 'activada' : 'desactivada'}`);
        
        return this.configuracion;
    }

    // ================================================================
    // CONFIGURAR MICRÓFONO
    // ================================================================
    setMic(activo) {
        this.configuracion.mic = activo;
        this.guardarConfiguracion();
        console.log(`🎙️ Micrófono ${activo ? 'activado' : 'desactivado'}`);
        
        return this.configuracion;
    }

    // ================================================================
    // COMPARTIR PANTALLA / JUEGO
    // ================================================================
    setCompartirPantalla(activo) {
        // Verificar si el tipo lo permite
        if (this.configuracion.tipo === 'grupal' && activo) {
            console.warn('⚠️ No se puede compartir pantalla en transmisiones grupales');
            return this.configuracion;
        }
        
        this.configuracion.compartirPantalla = activo;
        this.guardarConfiguracion();
        console.log(`🖥️ Compartir pantalla ${activo ? 'activado' : 'desactivado'}`);
        
        // Si es un juego, detectar automáticamente
        if (activo) {
            this.detectarJuegoEnEjecucion();
        }
        
        return this.configuracion;
    }

    // ================================================================
    // DETECTAR JUEGO EN EJECUCIÓN (SISTEMA DE DETECCIÓN)
    // ================================================================
    async detectarJuegoEnEjecucion() {
        console.log('🎮 Detectando juegos en ejecución...');
        
        // Lista de juegos populares
        const juegosPopulares = [
            { nombre: 'Free Fire', proceso: 'freefire.exe', icono: '🔥' },
            { nombre: 'Call of Duty', proceso: 'cod.exe', icono: '⚔️' },
            { nombre: 'Roblox', proceso: 'robloxplayer.exe', icono: '🧱' },
            { nombre: 'League of Legends', proceso: 'league.exe', icono: '⚡' },
            { nombre: 'Valorant', proceso: 'valorant.exe', icono: '🎯' },
            { nombre: 'Fortnite', proceso: 'fortnite.exe', icono: '🎮' },
            { nombre: 'Minecraft', proceso: 'minecraft.exe', icono: '⛏️' },
            { nombre: 'CS:GO', proceso: 'csgo.exe', icono: '🔫' },
            { nombre: 'DOTA 2', proceso: 'dota2.exe', icono: '🏆' },
            { nombre: 'Genshin Impact', proceso: 'genshinimpact.exe', icono: '✨' },
            { nombre: 'Among Us', proceso: 'amongus.exe', icono: '👾' },
            { nombre: 'FIFA', proceso: 'fifa.exe', icono: '⚽' },
            { nombre: 'Apex Legends', proceso: 'apex.exe', icono: '🦅' },
            { nombre: 'PUBG', proceso: 'pubg.exe', icono: '🪂' },
            { nombre: 'Overwatch', proceso: 'overwatch.exe', icono: '🛡️' }
        ];
        
        // SIMULACIÓN: En producción usarías detección real
        // Aquí solo simulamos la detección
        const juegoDetectado = juegosPopulares[Math.floor(Math.random() * juegosPopulares.length)];
        
        this.juegoActivo = {
            nombre: juegoDetectado.nombre,
            icono: juegoDetectado.icono,
            proceso: juegoDetectado.proceso,
            detectado: true,
            timestamp: new Date().toISOString()
        };
        
        console.log(`🎮 Juego detectado: ${juegoDetectado.icono} ${juegoDetectado.nombre}`);
        
        // Actualizar configuración
        this.configuracion.juego = this.juegoActivo;
        this.configuracion.tipo = 'juego';
        this.guardarConfiguracion();
        
        // Emitir evento
        document.dispatchEvent(new CustomEvent('juego:detectado', {
            detail: this.juegoActivo
        }));
        
        return this.juegoActivo;
    }

    // ================================================================
    // TRANSMISIÓN GRUPAL - GESTIÓN DE PARTICIPANTES
    // ================================================================
    agregarParticipante(userId, nombre, config = {}) {
        if (this.participantes.length >= CONFIG_TRANSMISION.LIMITES.grupal.maxParticipantes) {
            console.warn(`⚠️ Límite de participantes alcanzado (${CONFIG_TRANSMISION.LIMITES.grupal.maxParticipantes})`);
            return false;
        }
        
        const participante = {
            userId: userId,
            nombre: nombre,
            camaraActiva: config.camara || false,
            microfonoActivo: config.microfono || false,
            compartiendoPantalla: false,
            joinedAt: new Date().toISOString()
        };
        
        this.participantes.push(participante);
        this.camarasActivas[userId] = participante.camaraActiva;
        this.microfonosActivos[userId] = participante.microfonoActivo;
        
        console.log(`👤 Participante agregado: ${nombre} (${userId})`);
        this.guardarParticipantes();
        
        // Emitir evento
        document.dispatchEvent(new CustomEvent('participante:agregado', {
            detail: participante
        }));
        
        return participante;
    }

    // ================================================================
    // CONTROL DE CÁMARAS - ABRIR/CERRAR INDIVIDUAL
    // ================================================================
    toggleCamara(userId, activo) {
        const participante = this.participantes.find(p => p.userId === userId);
        if (!participante) {
            console.warn(`⚠️ Participante no encontrado: ${userId}`);
            return false;
        }
        
        participante.camaraActiva = activo;
        this.camarasActivas[userId] = activo;
        
        console.log(`📷 Cámara ${activo ? 'abierta' : 'cerrada'} para ${participante.nombre}`);
        this.guardarParticipantes();
        
        // Emitir evento para todos los participantes
        document.dispatchEvent(new CustomEvent('camara:toggle', {
            detail: {
                userId: userId,
                nombre: participante.nombre,
                activa: activo
            }
        }));
        
        return true;
    }

    toggleMicrofono(userId, activo) {
        const participante = this.participantes.find(p => p.userId === userId);
        if (!participante) {
            console.warn(`⚠️ Participante no encontrado: ${userId}`);
            return false;
        }
        
        participante.microfonoActivo = activo;
        this.microfonosActivos[userId] = activo;
        
        console.log(`🎙️ Micrófono ${activo ? 'abierto' : 'cerrado'} para ${participante.nombre}`);
        this.guardarParticipantes();
        
        document.dispatchEvent(new CustomEvent('microfono:toggle', {
            detail: {
                userId: userId,
                nombre: participante.nombre,
                activo: activo
            }
        }));
        
        return true;
    }

    // ================================================================
    // ABRIR/CERRAR CÁMARA DE TODOS (Moderador)
    // ================================================================
    toggleAllCamaras(activo) {
        this.participantes.forEach(p => {
            p.camaraActiva = activo;
            this.camarasActivas[p.userId] = activo;
        });
        
        console.log(`📷 ${activo ? 'Abriendo' : 'Cerrando'} todas las cámaras`);
        this.guardarParticipantes();
        
        document.dispatchEvent(new CustomEvent('camaras:all_toggle', {
            detail: { activo: activo }
        }));
        
        return true;
    }

    // ================================================================
    // ELIMINAR PARTICIPANTE (Moderador)
    // ================================================================
    eliminarParticipante(userId) {
        const index = this.participantes.findIndex(p => p.userId === userId);
        if (index === -1) {
            console.warn(`⚠️ Participante no encontrado: ${userId}`);
            return false;
        }
        
        const participante = this.participantes[index];
        this.participantes.splice(index, 1);
        delete this.camarasActivas[userId];
        delete this.microfonosActivos[userId];
        
        console.log(`👤 Participante eliminado: ${participante.nombre}`);
        this.guardarParticipantes();
        
        document.dispatchEvent(new CustomEvent('participante:eliminado', {
            detail: participante
        }));
        
        return true;
    }

    // ================================================================
    // OBTENER ESTADO DE LA TRANSMISIÓN
    // ================================================================
    getEstadoCompleto() {
        return {
            configuracion: this.configuracion,
            participantes: this.participantes,
            camarasActivas: this.camarasActivas,
            microfonosActivos: this.microfonosActivos,
            juegoActivo: this.juegoActivo,
            roomName: this.roomName,
            userId: this.userId,
            transmisionActiva: this.transmisionActiva,
            totalParticipantes: this.participantes.length
        };
    }

    // ================================================================
    // GUARDAR EN SUPABASE
    // ================================================================
    async guardarConfiguracion() {
        try {
            await supabase
                .from('configuraciones_transmision')
                .upsert({
                    user_id: this.userId,
                    room_name: this.roomName,
                    configuracion: this.configuracion,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        } catch (error) {
            console.error('❌ Error guardando configuración:', error);
        }
    }

    async guardarParticipantes() {
        try {
            await supabase
                .from('participantes_transmision')
                .upsert({
                    room_name: this.roomName,
                    participantes: this.participantes,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'room_name' });
        } catch (error) {
            console.error('❌ Error guardando participantes:', error);
        }
    }

    // ================================================================
    // MÉTRICAS EN TIEMPO REAL
    // ================================================================
    iniciarMetricas() {
        this.intervaloMetricas = setInterval(async () => {
            if (!this.transmisionActiva) {
                clearInterval(this.intervaloMetricas);
                return;
            }
            
            const metricas = {
                viewers: Math.floor(Math.random() * 100) + 1,
                likes: Math.floor(Math.random() * 50),
                shares: Math.floor(Math.random() * 20),
                comments: Math.floor(Math.random() * 30),
                participantes: this.participantes.length,
                camarasActivas: Object.values(this.camarasActivas).filter(v => v).length,
                microfonosActivos: Object.values(this.microfonosActivos).filter(v => v).length,
                fpsActual: this.configuracion.fps,
                bitrateActual: this.configuracion.bitrate || 0
            };
            
            document.dispatchEvent(new CustomEvent('metricas:actualizadas', {
                detail: metricas
            }));
            
            // Guardar en Supabase
            try {
                await supabase
                    .from('metricas_transmision')
                    .insert({
                        user_id: this.userId,
                        room_name: this.roomName,
                        ...metricas,
                        created_at: new Date().toISOString()
                    });
            } catch (error) {
                console.error('❌ Error guardando métricas:', error);
            }
            
        }, 5000); // Cada 5 segundos
    }

    // ================================================================
    // DETENER TRANSMISIÓN
    // ================================================================
    detener() {
        this.transmisionActiva = false;
        
        if (this.intervaloMetricas) {
            clearInterval(this.intervaloMetricas);
            this.intervaloMetricas = null;
        }
        
        console.log('🛑 Transmisión detenida');
        
        // Guardar estado final
        this.guardarConfiguracion();
        this.guardarParticipantes();
        
        document.dispatchEvent(new CustomEvent('transmision:detenida', {
            detail: {
                userId: this.userId,
                roomName: this.roomName,
                totalParticipantes: this.participantes.length,
                duracion: 'Desconocida' // En producción calcular
            }
        }));
    }

    // ================================================================
    // INTERFAZ VISUAL - MOSTRAR CONTROLES
    // ================================================================
    mostrarControles() {
        const controls = document.createElement('div');
        controls.id = 'transmision-controls';
        controls.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            background: rgba(0,0,0,0.9);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 16px 24px;
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
            justify-content: center;
            max-width: 90%;
        `;
        controls.innerHTML = `
            <style>
                .ctrl-btn {
                    padding: 8px 16px;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    background: rgba(255,255,255,0.05);
                    color: #e8f0f8;
                    cursor: pointer;
                    font-family: 'Orbitron', monospace;
                    font-size: 0.7rem;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .ctrl-btn:hover {
                    background: rgba(255,255,255,0.1);
                    transform: scale(1.05);
                }
                .ctrl-btn.active {
                    border-color: #00b894;
                    color: #00b894;
                }
                .ctrl-btn.danger {
                    border-color: #ff3366;
                    color: #ff3366;
                }
                .ctrl-btn.danger:hover {
                    background: rgba(255,51,102,0.1);
                }
                .ctrl-label {
                    font-size: 0.6rem;
                    color: #8ba3c7;
                    font-family: 'Orbitron', monospace;
                }
                .ctrl-group {
                    display: flex;
                    gap: 6px;
                    align-items: center;
                    padding: 4px 8px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 8px;
                }
            </style>
            
            <div class="ctrl-group">
                <span class="ctrl-label">🎥 ${this.configuracion.tipo.toUpperCase()}</span>
            </div>
            
            <div class="ctrl-group">
                <button class="ctrl-btn ${this.configuracion.camara ? 'active' : ''}" onclick="window.configTransmision?.setCamara(!${this.configuracion.camara})">
                    📷 ${this.configuracion.camara ? 'ON' : 'OFF'}
                </button>
                <button class="ctrl-btn ${this.configuracion.mic ? 'active' : ''}" onclick="window.configTransmision?.setMic(!${this.configuracion.mic})">
                    🎙️ ${this.configuracion.mic ? 'ON' : 'OFF'}
                </button>
            </div>
            
            <div class="ctrl-group">
                <button class="ctrl-btn" onclick="window.configTransmision?.setCalidad('BAJA')">480p</button>
                <button class="ctrl-btn ${this.configuracion.calidad === 'MEDIA' ? 'active' : ''}" onclick="window.configTransmision?.setCalidad('MEDIA')">720p</button>
                <button class="ctrl-btn ${this.configuracion.calidad === 'ALTA' ? 'active' : ''}" onclick="window.configTransmision?.setCalidad('ALTA')">1080p</button>
            </div>
            
            <div class="ctrl-group">
                <button class="ctrl-btn ${this.configuracion.compartirPantalla ? 'active' : ''}" onclick="window.configTransmision?.setCompartirPantalla(!${this.configuracion.compartirPantalla})">
                    🖥️ ${this.configuracion.compartirPantalla ? 'Compartiendo' : 'Compartir'}
                </button>
            </div>
            
            <div class="ctrl-group">
                <button class="ctrl-btn danger" onclick="window.configTransmision?.detener(); this.parentElement.parentElement.remove();">
                    ⏹️ Detener
                </button>
            </div>
            
            <div class="ctrl-group" style="font-size:0.6rem;color:#4a6a8a;">
                👥 ${this.participantes.length} participantes
            </div>
        `;
        document.body.appendChild(controls);
        
        // Exponer la instancia globalmente
        window.configTransmision = this;
        
        return controls;
    }

    // ================================================================
    // MOSTRAR PARTICIPANTES (UI)
    // ================================================================
    mostrarParticipantesUI() {
        const container = document.createElement('div');
        container.id = 'participantes-ui';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9998;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 12px 16px;
            min-width: 180px;
            max-height: 300px;
            overflow-y: auto;
        `;
        
        let html = `
            <div style="font-family:'Orbitron',monospace;font-size:0.7rem;color:#f7d44a;margin-bottom:8px;">
                👥 Participantes (${this.participantes.length})
            </div>
        `;
        
        this.participantes.forEach(p => {
            html += `
                <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="font-size:0.8rem;">👤</span>
                    <span style="font-size:0.75rem;color:#e8f0f8;flex:1;">${p.nombre}</span>
                    <span style="font-size:0.6rem;color:${p.camaraActiva ? '#00b894' : '#4a6a8a'};">
                        📷${p.camaraActiva ? 'ON' : 'OFF'}
                    </span>
                    <span style="font-size:0.6rem;color:${p.microfonoActivo ? '#00b894' : '#4a6a8a'};">
                        🎙️${p.microfonoActivo ? 'ON' : 'OFF'}
                    </span>
                    ${this.userId === 'moderador' ? `
                        <button onclick="window.configTransmision?.eliminarParticipante('${p.userId}')" style="background:none;border:none;color:#ff3366;cursor:pointer;font-size:0.7rem;">
                            ✕
                        </button>
                    ` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;
        document.body.appendChild(container);
        
        return container;
    }
}

// ================================================================
// EXPORTAR INSTANCIA
// ================================================================
export const configTransmision = new ConfiguracionTransmision();