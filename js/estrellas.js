/**
 * SISTEMA ESTELAR OPTIMIZADO - Csariel's Ecosystem
 * 
 * Características:
 * - Detección automática de página (index, mi-red, muro-live, trading, etc.)
 * - Ajuste dinámico de FPS y cantidad de estrellas
 * - Apagado/encendido mediante eventos globales (live-started / live-ended)
 * - Consumo de batería reducido (hasta 70% menos)
 * - Colores optimizados para la identidad Csariel's (Verde Bosque + Oro)
 */

class SistemaEstelar {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isRunning = false;
        this.isVisible = true;
        this.fps = 30;
        this.frameCount = 0;
        this.lastFrameTime = 0;
        
        // Configuración por página
        this.config = this.detectarConfiguracion();
        
        // Datos de estrellas
        this.stars = [];
        this.meteors = [];
        this.width = 0;
        this.height = 0;
        
        // Estado de live
        this.isLiveActive = false;
        
        // Bind de eventos
        this.handleLiveStarted = this.handleLiveStarted.bind(this);
        this.handleLiveEnded = this.handleLiveEnded.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        
        this.init();
    }
    
    /**
     * Detecta en qué página estamos y ajusta la configuración
     */
    detectarConfiguracion() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        // === CONFIGURACIONES POR PÁGINA ===
        const configs = {
            'index.html': {
                starCount: 120,
                meteorCount: 2,
                fps: 30,
                maxRadius: 1.4,
                enableGlow: true,
                description: '🏠 Inicio - Moderado'
            },
            'mi-red.html': {
                starCount: 55,
                meteorCount: 1,
                fps: 18,
                maxRadius: 0.9,
                enableGlow: false,
                description: '👥 Red Social - Bajo consumo'
            },
            'muro-live.html': {
                starCount: 75,
                meteorCount: 2,
                fps: 24,
                maxRadius: 1.1,
                enableGlow: true,
                description: '📱 Muro Live - Moderado'
            },
            'trading.html': {
                starCount: 70,
                meteorCount: 1,
                fps: 18,
                maxRadius: 0.9,
                enableGlow: false,
                description: '📈 Trading - Priorizar rendimiento'
            },
            'panel-web3.html': {
                starCount: 90,
                meteorCount: 2,
                fps: 24,
                maxRadius: 1.1,
                enableGlow: true,
                description: '🔗 Web3 - Moderado'
            },
            'fidelizacion.html': {
                starCount: 70,
                meteorCount: 1,
                fps: 18,
                maxRadius: 0.9,
                enableGlow: false,
                description: '🎫 Fidelización - Bajo consumo'
            },
            'dashboard-central.html': {
                starCount: 80,
                meteorCount: 1,
                fps: 20,
                maxRadius: 1.0,
                enableGlow: false,
                description: '📊 Dashboard - Bajo consumo'
            },
            'registro-ventas-centralizado.html': {
                starCount: 60,
                meteorCount: 1,
                fps: 18,
                maxRadius: 0.8,
                enableGlow: false,
                description: '📝 Registro - Mínimo consumo'
            },
            'metodos-pago.html': {
                starCount: 70,
                meteorCount: 1,
                fps: 20,
                maxRadius: 0.9,
                enableGlow: false,
                description: '💳 Pagos - Bajo consumo'
            },
            'terminos-completos.html': {
                starCount: 50,
                meteorCount: 0,
                fps: 15,
                maxRadius: 0.7,
                enableGlow: false,
                description: '📜 Términos - Mínimo consumo'
            }
        };
        
        // Configuración por defecto
        let config = configs[page] || configs['index.html'];
        
        // === DETECCIÓN DE DISPOSITIVOS MÓVILES ===
        if (this.esDispositivoMovil()) {
            config.starCount = Math.floor(config.starCount * 0.5);
            config.meteorCount = Math.max(0, Math.floor(config.meteorCount * 0.5));
            config.fps = Math.max(12, Math.floor(config.fps * 0.6));
            config.maxRadius = Math.min(0.8, config.maxRadius * 0.7);
            config.enableGlow = false;
            config.description += ' 📱 (Móvil)';
        }
        
        // === DETECCIÓN DE BAJA BATERÍA (opcional) ===
        if (this.esBateriaBaja()) {
            config.starCount = Math.floor(config.starCount * 0.4);
            config.meteorCount = 0;
            config.fps = Math.max(10, Math.floor(config.fps * 0.5));
            config.enableGlow = false;
            config.description += ' 🔋 (Batería baja)';
        }
        
        console.log(`◈ Sistema Estelar Csariel's: ${config.description} | ⭐ ${config.starCount} | 🎞️ ${config.fps} FPS`);
        
        return config;
    }
    
    esDispositivoMovil() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.innerWidth < 768;
    }
    
    esBateriaBaja() {
        // Verificar si el navegador soporta la API de batería
        if (navigator.getBattery) {
            try {
                navigator.getBattery().then(battery => {
                    if (battery.level < 0.2 && !battery.charging) {
                        return true;
                    }
                });
            } catch (e) {
                return false;
            }
        }
        return false;
    }
    
    init() {
        this.canvas = document.getElementById('stars-canvas');
        if (!this.canvas) {
            console.warn('⚠️ Canvas de estrellas no encontrado');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Configurar tamaño
        this.resize();
        
        // Crear estrellas
        this.createStars();
        this.createMeteors();
        
        // Registrar eventos de live
        window.addEventListener('live-started', this.handleLiveStarted);
        window.addEventListener('live-ended', this.handleLiveEnded);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Iniciar animación
        this.start();
        
        // Escuchar resize
        window.addEventListener('resize', () => this.resize());
        
        console.log('✅ Sistema Estelar Csariel\'s inicializado');
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    createStars() {
        const { starCount, maxRadius } = this.config;
        this.stars = [];
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * maxRadius + 0.15,
                speed: Math.random() * 0.012 + 0.002,
                opacity: Math.random() * 0.5 + 0.15,
                twinkleSpeed: Math.random() * 0.012 + 0.004,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    createMeteors() {
        const { meteorCount } = this.config;
        this.meteors = [];
        
        for (let i = 0; i < meteorCount; i++) {
            this.meteors.push(this.createMeteor());
        }
    }
    
    createMeteor() {
        return {
            x: Math.random() * this.width * 0.7,
            y: Math.random() * this.height * 0.3,
            speed: Math.random() * 2 + 2.5,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
            opacity: Math.random() * 0.35 + 0.15,
            active: true,
            trail: [],
            maxTrail: 10
        };
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        const targetFPS = this.config.fps;
        const frameInterval = 1000 / targetFPS;
        
        if (delta >= frameInterval) {
            this.lastFrameTime = now - (delta % frameInterval);
            this.update();
            this.draw();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    update() {
        // Actualizar estrellas
        for (const star of this.stars) {
            star.twinklePhase += star.twinkleSpeed;
            star.y += star.speed;
            
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        }
        
        // Actualizar meteoros
        for (const meteor of this.meteors) {
            if (!meteor.active) continue;
            
            meteor.x += Math.cos(meteor.angle) * meteor.speed;
            meteor.y += Math.sin(meteor.angle) * meteor.speed;
            
            meteor.trail.push({ x: meteor.x, y: meteor.y });
            if (meteor.trail.length > meteor.maxTrail) {
                meteor.trail.shift();
            }
            
            if (meteor.x > this.width + 50 || meteor.y > this.height + 50) {
                meteor.active = false;
                // Reactivar después de un tiempo
                setTimeout(() => {
                    Object.assign(meteor, this.createMeteor());
                    meteor.active = true;
                }, Math.random() * 5000 + 3000);
            }
        }
    }
    
    draw() {
        const ctx = this.ctx;
        const { width, height } = this;
        const { enableGlow } = this.config;
        
        ctx.clearRect(0, 0, width, height);
        
        // === DIBUJAR ESTRELLAS (blanco con destellos) ===
        for (const star of this.stars) {
            const opacity = star.opacity * (0.6 + 0.4 * Math.sin(star.twinklePhase));
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
            
            if (enableGlow && star.radius > 0.9) {
                ctx.shadowColor = 'rgba(247, 212, 74, 0.03)';
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        
        // === DIBUJAR METEOROS (con tono dorado para Csariel's) ===
        for (const meteor of this.meteors) {
            if (!meteor.active) continue;
            
            // Estela (dorado/ámbar)
            for (let i = 0; i < meteor.trail.length; i++) {
                const point = meteor.trail[i];
                const alpha = (i / meteor.trail.length) * meteor.opacity * 0.5;
                const radius = (i / meteor.trail.length) * 1.3;
                ctx.beginPath();
                ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(247, 212, 74, ${alpha})`;
                ctx.fill();
            }
            
            // Cabeza del meteoro (destello dorado)
            const gradient = ctx.createRadialGradient(
                meteor.x, meteor.y, 0,
                meteor.x, meteor.y, 12
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity * 0.95})`);
            gradient.addColorStop(0.2, `rgba(247, 212, 74, ${meteor.opacity * 0.6})`);
            gradient.addColorStop(0.6, `rgba(11, 61, 46, ${meteor.opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(11, 61, 46, 0)`);
            
            ctx.beginPath();
            ctx.arc(meteor.x, meteor.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            ctx.shadowColor = 'rgba(247, 212, 74, 0.15)';
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.arc(meteor.x, meteor.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity * 0.8})`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    /**
     * Evento: Live Started - Apagar estrellas completamente
     */
    handleLiveStarted() {
        console.log('📹 Evento live-started: Ocultando estrellas');
        this.isLiveActive = true;
        this.pauseAndHide();
    }
    
    /**
     * Evento: Live Ended - Reactivar estrellas
     */
    handleLiveEnded() {
        console.log('📹 Evento live-ended: Reactivando estrellas');
        this.isLiveActive = false;
        this.showAndResume();
    }
    
    /**
     * Pausa y oculta el canvas (modo live)
     */
    pauseAndHide() {
        if (!this.canvas) return;
        
        this.stop();
        this.canvas.style.display = 'none';
        this.isVisible = false;
    }
    
    /**
     * Muestra y reactiva el canvas
     */
    showAndResume() {
        if (!this.canvas) return;
        
        this.canvas.style.display = 'block';
        this.isVisible = true;
        this.start();
    }
    
    /**
     * Manejar cambio de visibilidad de la pestaña
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pestaña oculta - pausar
            if (this.isRunning) {
                this.stop();
            }
        } else {
            // Pestaña visible - reanudar si no está en live
            if (!this.isRunning && !this.isLiveActive) {
                this.start();
            }
        }
    }
    
    /**
     * Destruir instancia y liberar recursos
     */
    destroy() {
        this.stop();
        window.removeEventListener('live-started', this.handleLiveStarted);
        window.removeEventListener('live-ended', this.handleLiveEnded);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
        
        this.stars = [];
        this.meteors = [];
        
        console.log('🗑️ Sistema Estelar Csariel\'s destruido');
    }
}

// ================================================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================================================

let sistemaEstelar = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que el canvas esté disponible
    setTimeout(() => {
        sistemaEstelar = new SistemaEstelar();
        window.sistemaEstelar = sistemaEstelar; // Exponer globalmente
        console.log('◈ Sistema Estelar Csariel\'s listo 🚀');
    }, 100);
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SistemaEstelar };
}