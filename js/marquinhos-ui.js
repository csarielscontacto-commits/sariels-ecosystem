// js/marquinhos-ui.js
import { Engine } from './marquinhos-engine.js';

export class MarquinhosUI {
    constructor() {
        this.config = Engine.obtenerConfigVisual();
        this.expandido = false;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.hasMoved = false;
        this.mensajes = [];
        this.saldoCommit = 0;
        this.stickersDisponibles = [];
        this.respondiendoA = null;
        this.typingTimeout = null;
        this.anuncioActual = null;
        this.publicidadInterval = null;
        this.campanaActiva = null;
        this.init();
    }

    init() {
        // ===== CARGAR POSICIÓN GUARDADA =====
        const posGuardada = this.cargarPosicion();

        document.documentElement.style.setProperty('--m-primary', this.config.theme.primary);
        document.documentElement.style.setProperty('--m-blur', this.config.theme.blur);
        document.documentElement.style.setProperty('--m-width', this.config.ui.width);
        document.documentElement.style.setProperty('--m-height', this.config.ui.height);
        document.documentElement.style.setProperty('--m-glass', this.config.theme.glass);

        // ===== CREAR CONTENEDOR =====
        const container = document.createElement('div');
        container.id = 'marquinhos-container';
        container.innerHTML = `
            <div class="m-burbuja" id="m-burbuja">
                <span class="m-icono">🧠</span>
                <span class="m-notificacion" style="display:none;">●</span>
                <span class="m-ad-label" id="m-ad-label" style="display:none;">AD</span>
            </div>
            <div class="m-ventana" id="m-ventana">
                <div class="m-header">
                    <span class="m-titulo">🧠 Marquinhos</span>
                    <div class="m-header-actions">
                        <span class="m-saldo" id="m-saldo" title="Saldo COMMIT">💰 0 CMT</span>
                        <button class="m-btn-stickers" id="m-btn-stickers" title="Stickers">🎁</button>
                        <button class="m-btn-llamada" id="m-btn-llamada" title="Llamada de voz">📞</button>
                        <button class="m-btn-video" id="m-btn-video" title="Videollamada">📹</button>
                        <button class="m-btn-adjuntar" id="m-btn-adjuntar" title="Adjuntar archivo">📎</button>
                        <button class="m-btn-buscar" id="m-btn-buscar" title="Buscar mensajes">🔍</button>
                        <button class="m-btn-ads" id="m-btn-ads" title="Publicidad">📢</button>
                        <button class="m-cerrar" id="m-cerrar">✕</button>
                    </div>
                </div>
                <div class="m-mensajes" id="m-mensajes">
                    <div class="m-typing-indicator" id="m-typing-indicator" style="display:none;padding:4px 12px;color:var(--text-muted);font-size:0.7rem;font-style:italic;">
                        <span id="m-typing-text">Alguien está escribiendo...</span>
                    </div>
                </div>
                <div class="m-input-area">
                    <button class="m-btn-emoji" id="m-btn-emoji">😊</button>
                    <input type="text" class="m-input" id="m-input" placeholder="Escribe un mensaje...">
                    <button class="m-btn-enviar" id="m-btn-enviar">Enviar</button>
                </div>
                <div class="m-reply-bar" id="m-reply-bar" style="display:none;padding:4px 12px;border-top:1px solid var(--gold-dim);background:rgba(0,0,0,0.2);font-size:0.75rem;color:var(--text-secondary);">
                    <span>↩️ Respondiendo a: <strong id="m-reply-text"></strong></span>
                    <button onclick="cancelarRespuesta()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;margin-left:auto;">✕</button>
                </div>
                <button class="m-btn-horario" id="m-btn-horario">Ver horario</button>
            </div>

            <!-- MODAL DE PUBLICIDAD -->
            <div class="m-ad-modal-overlay" id="m-ad-modal-overlay">
                <div class="m-ad-modal" id="m-ad-modal">
                    <div class="m-ad-modal-header">
                        <span>📢 Comprar Publicidad en Marquinhos</span>
                        <button class="m-ad-modal-cerrar" id="m-ad-modal-cerrar">✕</button>
                    </div>
                    <div class="m-ad-modal-body">
                        <label class="m-ad-label-form">Empresa / Negocio</label>
                        <input type="text" class="m-ad-input" id="m-ad-empresa" placeholder="Nombre de tu empresa" maxlength="60">
                        <label class="m-ad-label-form">Mensaje del anuncio</label>
                        <textarea class="m-ad-textarea" id="m-ad-mensaje" placeholder="Ej: 20% de descuento esta semana" maxlength="120"></textarea>
                        <label class="m-ad-label-form">URL (opcional)</label>
                        <input type="url" class="m-ad-input" id="m-ad-url" placeholder="https://...">
                        <label class="m-ad-label-form">Nivel de publicidad</label>
                        <div class="m-ad-niveles" id="m-ad-niveles">
                            <div class="m-ad-nivel-item" data-nivel="basico">
                                <span class="m-ad-nivel-dot" style="background:#3ecf6e;"></span>
                                <span class="m-ad-nivel-nombre">Básico</span>
                                <span class="m-ad-nivel-precio">$49 MXN</span>
                            </div>
                            <div class="m-ad-nivel-item" data-nivel="estandar">
                                <span class="m-ad-nivel-dot" style="background:#f7d44a;"></span>
                                <span class="m-ad-nivel-nombre">Estándar</span>
                                <span class="m-ad-nivel-precio">$99 MXN</span>
                            </div>
                            <div class="m-ad-nivel-item" data-nivel="premium">
                                <span class="m-ad-nivel-dot" style="background:#ff9a3c;"></span>
                                <span class="m-ad-nivel-nombre">Premium</span>
                                <span class="m-ad-nivel-precio">$199 MXN</span>
                            </div>
                            <div class="m-ad-nivel-item" data-nivel="patrocinado">
                                <span class="m-ad-nivel-dot" style="background:#ff3366;"></span>
                                <span class="m-ad-nivel-nombre">Patrocinado</span>
                                <span class="m-ad-nivel-precio">$399 MXN</span>
                            </div>
                        </div>
                        <label class="m-ad-label-form">Duración (días)</label>
                        <input type="number" class="m-ad-input" id="m-ad-duracion" value="7" min="1" max="60">
                        <div class="m-ad-pago-info" id="m-ad-pago-info"></div>
                        <button class="m-ad-btn-comprar" id="m-ad-btn-comprar">Comprar Publicidad</button>
                        <div class="m-ad-nota">Tu anuncio quedará pendiente hasta que el admin confirme tu pago.</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        // ===== ESTILOS =====
        this.inyectarEstilos();

        // ===== REFERENCIAS =====
        this.bubble = document.getElementById('m-burbuja');
        this.windowEl = document.getElementById('m-ventana');
        this.closeBtn = document.getElementById('m-cerrar');
        this.sendBtn = document.getElementById('m-btn-enviar');
        this.input = document.getElementById('m-input');
        this.messages = document.getElementById('m-mensajes');
        this.emojiBtn = document.getElementById('m-btn-emoji');
        this.attachBtn = document.getElementById('m-btn-adjuntar');
        this.callBtn = document.getElementById('m-btn-llamada');
        this.videoBtn = document.getElementById('m-btn-video');
        this.stickerBtn = document.getElementById('m-btn-stickers');
        this.buscarBtn = document.getElementById('m-btn-buscar');
        this.saldoEl = document.getElementById('m-saldo');
        this.typingIndicator = document.getElementById('m-typing-indicator');
        this.typingText = document.getElementById('m-typing-text');
        this.replyBar = document.getElementById('m-reply-bar');
        this.replyText = document.getElementById('m-reply-text');
        this.adsBtn = document.getElementById('m-btn-ads');
        this.adLabel = document.getElementById('m-ad-label');
        this.adModalOverlay = document.getElementById('m-ad-modal-overlay');
        this.adModalCerrar = document.getElementById('m-ad-modal-cerrar');
        this.adBtnComprar = document.getElementById('m-ad-btn-comprar');

        // ===== EVENTOS =====
        this.setupDrag();
        this.setupWindowToggle();
        this.setupSendMessage();
        this.setupEmojiPicker();
        this.setupFileAttachment();
        this.setupCalls();
        this.setupStickers();
        this.setupSearch();
        this.setupAds();

        // ===== ESCUCHAR MENSAJES =====
        Engine.recibirMensajes((mensajes) => {
            this.mensajes = mensajes;
            this.renderizarMensajes();
            this.actualizarSaldo();
            this.actualizarNotificaciones();
        });

        // ===== 📢 ESCUCHAR CAMPAÑAS DESDE ENGINE =====
        this.escucharCampanas();

        // ===== 💾 CARGAR CAMPAÑA DESDE CACHÉ =====
        this.cargarCampanaDesdeCache();

        // ===== INICIALIZAR =====
        this.cargarMensajes();
        this.cargarSaldo();
        this.initPublicidad();
        this.detectarColisiones();

        console.log('🧠 Marquinhos UI v3.1 — Chat Avanzado + Publicidad + Campañas RPC');
        console.log('📨 Estados de mensaje: enviando → enviado → recibido → leído');
        console.log('🔍 Búsqueda en tiempo real');
        console.log('✏️ Editar y eliminar mensajes');
        console.log('💬 Responder mensajes específicos');
        console.log('🔄 Indicador "escribiendo..."');
        console.log('📢 Publicidad algorítmica activa');
        console.log('📢 Campañas RPC integradas');
    }

    // ================================================================
    // MÉTODOS DE ESTILOS
    // ================================================================
    inyectarEstilos() {
        const style = document.createElement('style');
        style.textContent = `
            /* ===== CONTENEDOR PRINCIPAL ===== */
            #marquinhos-container {
                position: fixed;
                z-index: 99999;
                font-family: 'Space Grotesk', sans-serif;
                left: 20px;
                bottom: 20px;
                user-select: none;
                cursor: default;
                transition: none;
            }

            /* ===== BURBUJA ===== */
            .m-burbuja {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ff6b9d, #ff3366);
                box-shadow: 0 4px 20px rgba(255,51,102,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                cursor: grab;
                transition: transform 0.2s, box-shadow 0.3s, background 0.5s;
                position: relative;
                color: white;
                user-select: none;
            }
            .m-burbuja:hover {
                transform: scale(1.05);
                box-shadow: 0 8px 30px rgba(255,51,102,0.4);
            }
            .m-burbuja.dragging {
                cursor: grabbing;
                transform: scale(1.1);
                box-shadow: 0 12px 40px rgba(255,51,102,0.5);
            }

            .m-burbuja .m-icono {
                pointer-events: none;
                transition: none;
            }

            .m-burbuja .m-notificacion {
                position: absolute;
                top: -4px;
                right: -4px;
                background: #ff3366;
                color: white;
                font-size: 0.5rem;
                font-weight: 700;
                min-width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #05080f;
                font-family: 'Orbitron', monospace;
                padding: 0 4px;
            }

            .m-burbuja .m-ad-label {
                position: absolute;
                bottom: -4px;
                right: -4px;
                background: #D4AF37;
                color: #000;
                font-size: 0.4rem;
                font-weight: 700;
                padding: 1px 6px;
                border-radius: 8px;
                font-family: 'Orbitron', monospace;
                letter-spacing: 0.5px;
                border: 1px solid #000;
                display: none;
            }

            /* ===== VENTANA ===== */
            .m-ventana {
                position: absolute;
                bottom: 80px;
                left: 0;
                width: 380px;
                max-width: 90vw;
                height: 480px;
                max-height: 70vh;
                background: rgba(11, 61, 46, 0.95);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(212,175,55,0.15);
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                display: none;
                flex-direction: column;
                overflow: hidden;
                color: #e8f0f8;
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            .m-ventana.abierta {
                display: flex;
                animation: m-fadeIn 0.3s ease;
            }

            @keyframes m-fadeIn {
                from { opacity: 0; transform: translateY(10px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            .m-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 14px;
                border-bottom: 1px solid rgba(212,175,55,0.08);
                background: rgba(0,0,0,0.2);
                flex-shrink: 0;
            }
            .m-titulo {
                font-family: 'Orbitron', monospace;
                font-size: 0.75rem;
                font-weight: 700;
                color: #D4AF37;
                transition: color 0.3s;
            }
            .m-header-actions {
                display: flex;
                align-items: center;
                gap: 4px;
                flex-wrap: wrap;
            }
            .m-header-actions .m-saldo {
                font-size: 0.55rem;
                color: #D4AF37;
                font-family: 'Orbitron', monospace;
                background: rgba(212,175,55,0.05);
                padding: 2px 8px;
                border-radius: 12px;
                border: 1px solid rgba(212,175,55,0.08);
                cursor: default;
            }
            .m-header-actions button {
                background: none;
                border: none;
                color: #4a6a8a;
                cursor: pointer;
                font-size: 0.8rem;
                padding: 2px 6px;
                border-radius: 6px;
                transition: color 0.2s, background 0.2s;
                font-family: 'Space Grotesk', sans-serif;
            }
            .m-header-actions button:hover {
                color: #e8f0f8;
                background: rgba(255,255,255,0.05);
            }
            .m-cerrar {
                font-size: 1rem !important;
                color: #4a6a8a !important;
                padding: 0 4px !important;
            }
            .m-cerrar:hover {
                color: #ff3366 !important;
                background: rgba(255,51,102,0.1) !important;
            }

            /* ===== MENSAJES ===== */
            .m-mensajes {
                flex: 1;
                overflow-y: auto;
                padding: 8px 12px;
                display: flex;
                flex-direction: column;
                gap: 4px;
                scroll-behavior: smooth;
                min-height: 0;
            }
            .m-mensajes::-webkit-scrollbar {
                width: 3px;
            }
            .m-mensajes::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.02);
            }
            .m-mensajes::-webkit-scrollbar-thumb {
                background: #D4AF37;
                border-radius: 3px;
            }

            .m-mensaje-wrapper {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            .m-mensaje-wrapper.respuesta {
                border-left: 2px solid #D4AF37;
                padding-left: 8px;
                margin-left: 8px;
            }

            .m-mensaje {
                max-width: 85%;
                padding: 6px 12px;
                border-radius: 12px;
                font-size: 0.8rem;
                line-height: 1.5;
                word-wrap: break-word;
                position: relative;
                transition: border 0.3s;
            }
            .m-mensaje.bot {
                background: rgba(255,255,255,0.04);
                border-bottom-left-radius: 4px;
                align-self: flex-start;
                color: #e8f0f8;
            }
            .m-mensaje.usuario {
                background: rgba(212,175,55,0.08);
                border-bottom-right-radius: 4px;
                align-self: flex-end;
                color: #e8f0f8;
            }
            .m-mensaje .m-usuario {
                font-size: 0.55rem;
                font-weight: 600;
                color: #D4AF37;
                margin-bottom: 2px;
            }
            .m-mensaje .m-hora {
                font-size: 0.45rem;
                color: #4a6a8a;
            }
            .m-mensaje .m-editado {
                font-size: 0.45rem;
                color: #4a6a8a;
                margin-left: 4px;
                font-style: italic;
            }

            .m-mensaje .m-estado {
                font-size: 0.45rem;
                margin-left: 4px;
            }
            .m-mensaje .m-estado.enviando { color: #f7d44a; }
            .m-mensaje .m-estado.enviado { color: #4a6a8a; }
            .m-mensaje .m-estado.recibido { color: #00b894; }
            .m-mensaje .m-estado.leido { color: #00b894; }
            .m-mensaje .m-estado.fallido { color: #ff3366; }

            .m-mensaje .m-archivo {
                margin: 4px 0;
                background: rgba(0,0,0,0.2);
                border-radius: 8px;
                padding: 4px 8px;
                max-width: 100%;
            }
            .m-mensaje .m-archivo img,
            .m-mensaje .m-archivo video {
                max-width: 200px;
                max-height: 200px;
                border-radius: 8px;
                display: block;
                margin-top: 4px;
            }
            .m-mensaje .m-archivo i {
                margin-right: 4px;
                color: #4a6a8a;
            }

            .m-mensaje .m-sticker-cmt {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                background: rgba(0,0,0,0.2);
                border-radius: 8px;
                padding: 8px 12px;
                min-width: 100px;
            }
            .m-mensaje .m-sticker-cmt .m-sticker-emoji {
                font-size: 2rem;
            }
            .m-mensaje .m-sticker-cmt .m-sticker-nombre {
                font-size: 0.7rem;
                font-weight: 600;
                color: #D4AF37;
            }
            .m-mensaje .m-sticker-cmt .m-sticker-valor {
                font-size: 0.6rem;
                color: #4a6a8a;
            }

            .m-mensaje .m-reacciones {
                display: flex;
                gap: 4px;
                margin-top: 4px;
                flex-wrap: wrap;
            }
            .m-mensaje .m-reaccion {
                font-size: 0.7rem;
                background: rgba(255,255,255,0.04);
                padding: 0 4px;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
            }
            .m-mensaje .m-reaccion:hover {
                background: rgba(255,255,255,0.08);
            }

            .m-mensaje .m-responder-a {
                font-size: 0.6rem;
                color: #4a6a8a;
                padding: 2px 6px;
                border-radius: 4px;
                background: rgba(0,0,0,0.15);
                margin-bottom: 2px;
                cursor: pointer;
                transition: color 0.2s;
                border-left: 2px solid #D4AF37;
                font-style: italic;
            }
            .m-mensaje .m-responder-a:hover {
                color: #D4AF37;
            }

            .m-mensaje .m-acciones {
                display: flex;
                gap: 4px;
                margin-top: 2px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            .m-mensaje:hover .m-acciones {
                opacity: 1;
            }
            .m-mensaje .m-acciones button {
                background: none;
                border: none;
                color: #4a6a8a;
                cursor: pointer;
                font-size: 0.55rem;
                padding: 0 4px;
                border-radius: 4px;
                transition: color 0.2s, background 0.2s;
            }
            .m-mensaje .m-acciones button:hover {
                color: #D4AF37;
                background: rgba(212,175,55,0.05);
            }
            .m-mensaje .m-acciones button.danger:hover {
                color: #ff3366;
                background: rgba(255,51,102,0.05);
            }

            /* ===== CAMPAÑA ===== */
            .m-campana-mensaje {
                padding: 10px 12px;
                margin: 8px 0;
                background: rgba(212,175,55,0.05);
                border-radius: 10px;
                border-left: 3px solid #D4AF37;
                font-size: 0.75rem;
                color: var(--text-secondary);
                width: 100%;
                animation: m-fadeIn 0.3s ease;
            }

            /* ===== INPUT ===== */
            .m-input-area {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-top: 1px solid rgba(212,175,55,0.06);
                background: rgba(0,0,0,0.15);
                flex-shrink: 0;
            }
            .m-input-area button {
                background: none;
                border: none;
                color: #4a6a8a;
                cursor: pointer;
                font-size: 1rem;
                padding: 4px;
                border-radius: 6px;
                transition: color 0.2s, background 0.2s;
                flex-shrink: 0;
            }
            .m-input-area button:hover {
                color: #D4AF37;
                background: rgba(212,175,55,0.05);
            }
            .m-input {
                flex: 1;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(212,175,55,0.08);
                border-radius: 20px;
                padding: 8px 14px;
                color: #e8f0f8;
                font-size: 0.75rem;
                outline: none;
                font-family: 'Space Grotesk', sans-serif;
                transition: border-color 0.2s;
                min-width: 0;
            }
            .m-input:focus {
                border-color: #D4AF37;
            }
            .m-input::placeholder {
                color: #4a6a8a;
            }
            .m-btn-enviar {
                background: linear-gradient(135deg, #D4AF37, #b8923a) !important;
                color: #000 !important;
                font-weight: 700;
                font-size: 0.65rem !important;
                padding: 6px 14px !important;
                border-radius: 20px !important;
                flex-shrink: 0;
                transition: transform 0.2s, box-shadow 0.2s;
                border: none;
            }
            .m-btn-enviar:hover {
                transform: scale(1.02);
                box-shadow: 0 0 20px rgba(212,175,55,0.2);
            }

            .m-reply-bar {
                display: none;
                padding: 4px 12px;
                border-top: 1px solid var(--gold-dim);
                background: rgba(0,0,0,0.2);
                font-size: 0.75rem;
                color: var(--text-secondary);
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }
            .m-reply-bar.visible {
                display: flex;
            }
            .m-reply-bar button {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                transition: color 0.2s;
            }
            .m-reply-bar button:hover {
                color: var(--text-primary);
            }

            .m-btn-horario {
                border: none;
                border-top: 1px solid rgba(212,175,55,0.06);
                background: rgba(0,0,0,0.15);
                color: #4a6a8a;
                padding: 6px;
                font-size: 0.55rem;
                cursor: pointer;
                transition: color 0.2s, background 0.2s;
                font-family: 'Orbitron', monospace;
                flex-shrink: 0;
            }
            .m-btn-horario:hover {
                color: #D4AF37;
                background: rgba(0,0,0,0.2);
            }

            /* ===== EMOJIS ===== */
            .m-emojis-popup {
                display: none;
                flex-wrap: wrap;
                gap: 4px;
                padding: 8px 12px;
                background: rgba(0,0,0,0.9);
                border-radius: 12px;
                border: 1px solid rgba(212,175,55,0.1);
                max-width: 250px;
                position: absolute;
                bottom: 60px;
                left: 12px;
                z-index: 10;
            }
            .m-emojis-popup.abierto {
                display: flex;
            }
            .m-emojis-popup span {
                font-size: 1.2rem;
                cursor: pointer;
                padding: 2px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            .m-emojis-popup span:hover {
                background: rgba(255,255,255,0.05);
            }

            /* ===== STICKERS ===== */
            .m-stickers-popup {
                display: none;
                flex-direction: column;
                gap: 4px;
                padding: 8px 12px;
                background: rgba(0,0,0,0.9);
                border-radius: 12px;
                border: 1px solid rgba(212,175,55,0.1);
                max-width: 280px;
                max-height: 300px;
                overflow-y: auto;
                position: absolute;
                bottom: 60px;
                left: 12px;
                z-index: 10;
            }
            .m-stickers-popup.abierto {
                display: flex;
            }
            .m-stickers-popup::-webkit-scrollbar {
                width: 3px;
            }
            .m-stickers-popup::-webkit-scrollbar-thumb {
                background: #D4AF37;
                border-radius: 3px;
            }

            .m-sticker-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 8px;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
                border-bottom: 1px solid rgba(255,255,255,0.03);
            }
            .m-sticker-item:hover {
                background: rgba(255,255,255,0.04);
            }
            .m-sticker-item .m-sticker-emoji {
                font-size: 1.5rem;
            }
            .m-sticker-item .m-sticker-info {
                flex: 1;
            }
            .m-sticker-item .m-sticker-name {
                font-size: 0.7rem;
                color: #e8f0f8;
            }
            .m-sticker-item .m-sticker-price {
                font-size: 0.55rem;
                color: #4a6a8a;
            }
            .m-sticker-item .m-sticker-badge {
                font-size: 0.5rem;
                font-family: 'Orbitron', monospace;
                padding: 1px 8px;
                border-radius: 10px;
                background: rgba(255,255,255,0.03);
            }

            /* ===== BÚSQUEDA ===== */
            .m-buscar-popup {
                display: none;
                flex-direction: column;
                padding: 8px 12px;
                background: rgba(0,0,0,0.9);
                border-radius: 12px;
                border: 1px solid rgba(212,175,55,0.1);
                max-width: 300px;
                max-height: 300px;
                position: absolute;
                top: 50px;
                right: 12px;
                z-index: 10;
            }
            .m-buscar-popup.abierto {
                display: flex;
            }
            .m-buscar-popup input {
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(212,175,55,0.08);
                border-radius: 20px;
                padding: 6px 12px;
                color: #e8f0f8;
                font-size: 0.7rem;
                outline: none;
                font-family: 'Space Grotesk', sans-serif;
                width: 100%;
            }
            .m-buscar-popup input:focus {
                border-color: #D4AF37;
            }
            #m-buscar-resultados {
                margin-top: 6px;
                overflow-y: auto;
                max-height: 200px;
            }
            .m-resultado {
                padding: 4px 8px;
                border-radius: 6px;
                cursor: pointer;
                transition: background 0.2s;
                border-bottom: 1px solid rgba(255,255,255,0.02);
                font-size: 0.7rem;
            }
            .m-resultado:hover {
                background: rgba(255,255,255,0.04);
            }

            /* ===== PUBLICIDAD MODAL ===== */
            .m-ad-modal-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(8px);
                z-index: 999999;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .m-ad-modal-overlay.abierto {
                display: flex;
            }
            .m-ad-modal {
                background: rgba(11, 61, 46, 0.98);
                border: 1px solid rgba(212,175,55,0.15);
                border-radius: 16px;
                padding: 20px 24px;
                max-width: 480px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }
            .m-ad-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(212,175,55,0.08);
                padding-bottom: 10px;
                margin-bottom: 14px;
                color: #D4AF37;
                font-family: 'Orbitron', monospace;
                font-size: 0.9rem;
                font-weight: 700;
            }
            .m-ad-modal-cerrar {
                background: none;
                border: none;
                color: #4a6a8a;
                cursor: pointer;
                font-size: 1.2rem;
                transition: color 0.2s;
                padding: 0 4px;
            }
            .m-ad-modal-cerrar:hover {
                color: #ff3366;
            }
            .m-ad-modal-body {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .m-ad-label-form {
                font-size: 0.6rem;
                color: #4a6a8a;
                font-family: 'Orbitron', monospace;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .m-ad-input,
            .m-ad-textarea {
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(212,175,55,0.08);
                border-radius: 8px;
                padding: 8px 12px;
                color: #e8f0f8;
                font-size: 0.8rem;
                outline: none;
                font-family: 'Space Grotesk', sans-serif;
                width: 100%;
                transition: border-color 0.2s;
            }
            .m-ad-input:focus,
            .m-ad-textarea:focus {
                border-color: #D4AF37;
            }
            .m-ad-textarea {
                min-height: 60px;
                resize: vertical;
            }
            .m-ad-niveles {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 6px;
            }
            .m-ad-nivel-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 10px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.03);
                background: rgba(0,0,0,0.15);
                cursor: pointer;
                transition: border-color 0.2s, background 0.2s;
            }
            .m-ad-nivel-item:hover {
                border-color: rgba(212,175,55,0.1);
                background: rgba(0,0,0,0.2);
            }
            .m-ad-nivel-item.seleccionado {
                border-color: #D4AF37;
                background: rgba(212,175,55,0.05);
            }
            .m-ad-nivel-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                flex-shrink: 0;
            }
            .m-ad-nivel-nombre {
                font-size: 0.7rem;
                color: #e8f0f8;
                flex: 1;
            }
            .m-ad-nivel-precio {
                font-size: 0.65rem;
                color: #D4AF37;
                font-family: 'Orbitron', monospace;
            }
            .m-ad-pago-info {
                padding: 8px 12px;
                background: rgba(0,0,0,0.2);
                border-radius: 8px;
                font-size: 0.65rem;
                color: #4a6a8a;
                line-height: 1.6;
                border: 1px solid rgba(212,175,55,0.05);
            }
            .m-ad-pago-info strong {
                color: #e8f0f8;
            }
            .m-ad-btn-comprar {
                background: linear-gradient(135deg, #D4AF37, #b8923a);
                border: none;
                border-radius: 12px;
                padding: 10px;
                font-weight: 700;
                font-family: 'Orbitron', monospace;
                font-size: 0.75rem;
                color: #000;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                width: 100%;
            }
            .m-ad-btn-comprar:hover {
                transform: scale(1.01);
                box-shadow: 0 0 30px rgba(212,175,55,0.2);
            }
            .m-ad-btn-comprar:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            .m-ad-nota {
                font-size: 0.5rem;
                color: #4a6a8a;
                text-align: center;
                margin-top: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    // ================================================================
    // 📢 ESCUCHAR CAMPAÑAS DESDE ENGINE (NUEVO)
    // ================================================================

    /**
     * Escucha los eventos de campaña que dispara el Engine
     * y actualiza la burbuja de Marquinhos con la campaña activa.
     */
    escucharCampanas() {
        // Escuchar campaña actualizada desde el Engine
        document.addEventListener('marquinhos:campana-actualizada', (e) => {
            const { campaña, tieneCampana } = e.detail;
            if (tieneCampana && campaña) {
                this.aplicarCampana(campaña);
            } else {
                this.aplicarEstiloPorDefecto();
            }
        });

        // Escuchar evento de estilo por defecto
        document.addEventListener('marquinhos:campana-default', () => {
            this.aplicarEstiloPorDefecto();
        });

        console.log('📢 Marquinhos UI: Escuchando campañas del Engine');
    },

    /**
     * Aplica una campaña a la burbuja de Marquinhos
     */
    aplicarCampana(campaña) {
        const bubble = document.getElementById('m-burbuja');
        const adLabel = document.getElementById('m-ad-label');
        
        if (!bubble) return;

        // Guardar campaña actual
        this.campanaActiva = campaña;

        // Cambiar color de la burbuja según la campaña
        const color = campaña.color || '#D4AF37';
        bubble.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
        bubble.style.boxShadow = `0 4px 20px ${color}66`;

        // Cambiar icono si tiene emoji personalizado
        const icono = bubble.querySelector('.m-icono');
        if (icono) {
            icono.textContent = campaña.emoji || '🧠';
        }

        // Mostrar etiqueta de publicidad
        if (adLabel) {
            adLabel.style.display = 'block';
            adLabel.textContent = `📢 ${campaña.empresa || 'Promoción'}`;
            adLabel.style.background = color;
            adLabel.style.color = '#fff';
        }

        // Cambiar título en la ventana
        const titulo = document.querySelector('.m-titulo');
        if (titulo) {
            titulo.textContent = `🧠 ${campaña.empresa || 'Marquinhos'}`;
        }

        // Mostrar mensaje de campaña en el chat
        const mensajes = document.getElementById('m-mensajes');
        if (mensajes) {
            // Buscar si ya hay un mensaje de campaña
            let campanaMsg = mensajes.querySelector('.m-campana-mensaje');
            if (!campanaMsg) {
                campanaMsg = document.createElement('div');
                campanaMsg.className = 'm-campana-mensaje';
                campanaMsg.style.cssText = `
                    padding: 10px 12px;
                    margin: 8px 0;
                    background: rgba(212,175,55,0.05);
                    border-radius: 10px;
                    border-left: 3px solid ${color};
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                `;
                // Insertar al inicio del chat
                mensajes.prepend(campanaMsg);
            }
            
            campanaMsg.innerHTML = `
                <div style="font-weight:bold; color:${color}; font-size:0.8rem;">
                    📢 ${campaña.empresa || 'Promoción'}
                </div>
                <div style="margin-top:2px;">${campaña.mensaje || ''}</div>
                ${campaña.url ? `<a href="${campaña.url}" target="_blank" style="color:${color};text-decoration:underline;font-size:0.7rem;margin-top:4px;display:inline-block;">🔗 Ver más</a>` : ''}
            `;
            
            campanaMsg.style.borderLeftColor = color;
        }

        // Guardar en localStorage para persistencia
        try {
            localStorage.setItem('marquinhos_campana_activa', JSON.stringify(campaña));
            localStorage.setItem('marquinhos_campana_fecha', Date.now().toString());
        } catch (e) {}

        console.log('🎨 Marquinhos: Campaña aplicada -', campaña.empresa);
    },

    /**
     * Restaura el estilo por defecto (rosa) cuando no hay campaña activa
     */
    aplicarEstiloPorDefecto() {
        const bubble = document.getElementById('m-burbuja');
        const adLabel = document.getElementById('m-ad-label');
        const icono = bubble?.querySelector('.m-icono');
        const titulo = document.querySelector('.m-titulo');

        if (bubble) {
            bubble.style.background = 'linear-gradient(135deg, #ff6b9d, #ff3366)';
            bubble.style.boxShadow = '0 4px 20px rgba(255,51,102,0.3)';
        }

        if (icono) {
            icono.textContent = '🧠';
        }

        if (adLabel) {
            adLabel.style.display = 'none';
        }

        if (titulo) {
            titulo.textContent = '🧠 Marquinhos';
        }

        // Eliminar mensaje de campaña del chat
        const mensajes = document.getElementById('m-mensajes');
        if (mensajes) {
            const campanaMsg = mensajes.querySelector('.m-campana-mensaje');
            if (campanaMsg) {
                campanaMsg.remove();
            }
        }

        // Limpiar localStorage
        try {
            localStorage.removeItem('marquinhos_campana_activa');
            localStorage.removeItem('marquinhos_campana_fecha');
        } catch (e) {}

        this.campanaActiva = null;
        console.log('🌸 Marquinhos: Estilo rosa por defecto');
    },

    /**
     * Cargar campaña desde caché al iniciar
     */
    cargarCampanaDesdeCache() {
        try {
            const saved = localStorage.getItem('marquinhos_campana_activa');
            if (saved) {
                const campaña = JSON.parse(saved);
                const fecha = parseInt(localStorage.getItem('marquinhos_campana_fecha') || '0');
                const expiracion = 24 * 60 * 60 * 1000; // 24 horas
                if (Date.now() - fecha < expiracion) {
                    this.aplicarCampana(campaña);
                    console.log('📢 Marquinhos: Campaña cargada desde caché');
                    return;
                }
            }
            // Si no hay caché válida, usar estilo por defecto
            this.aplicarEstiloPorDefecto();
        } catch (e) {
            console.warn('⚠️ Error al cargar campaña de caché:', e);
            this.aplicarEstiloPorDefecto();
        }
    }

    // ================================================================
    // DRAG
    // ================================================================
    setupDrag() {
        const bubble = this.bubble;
        const container = document.getElementById('marquinhos-container');
        bubble.addEventListener('mousedown', (e) => {
            this.iniciarArrastre(e.clientX, e.clientY, bubble);
            const onMove = (ev) => this.moverArrastre(ev.clientX, ev.clientY, bubble, container);
            const onUp = () => {
                this.finalizarArrastre(bubble);
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        bubble.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.iniciarArrastre(touch.clientX, touch.clientY, bubble);
            const onMove = (ev) => {
                const t = ev.touches[0];
                this.moverArrastre(t.clientX, t.clientY, bubble, container);
            };
            const onEnd = () => {
                this.finalizarArrastre(bubble);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onEnd);
            };
            document.addEventListener('touchmove', onMove, { passive: true });
            document.addEventListener('touchend', onEnd);
        }, { passive: true });
    }

    iniciarArrastre(clientX, clientY, bubble) {
        const rect = bubble.getBoundingClientRect();
        this.dragOffsetX = clientX - rect.left;
        this.dragOffsetY = clientY - rect.top;
        this.dragStartX = clientX;
        this.dragStartY = clientY;
        this.isDragging = true;
        this.hasMoved = false;
        bubble.classList.add('dragging');
    }

    moverArrastre(clientX, clientY, bubble, container) {
        if (!this.isDragging) return;
        const dx = clientX - this.dragStartX;
        const dy = clientY - this.dragStartY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
            this.hasMoved = true;
        }
        let newX = clientX - this.dragOffsetX;
        let newY = clientY - this.dragOffsetY;
        const bubbleRect = bubble.getBoundingClientRect();
        const bubbleSize = bubbleRect.width;
        const maxX = window.innerWidth - bubbleSize;
        const maxY = window.innerHeight - bubbleSize;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        container.style.left = newX + 'px';
        container.style.top = newY + 'px';
        container.style.right = 'auto';
        container.style.bottom = 'auto';
        this.guardarPosicion(newX, newY);
    }

    finalizarArrastre(bubble) {
        this.isDragging = false;
        bubble.classList.remove('dragging');
    }

    guardarPosicion(x, y) {
        try {
            localStorage.setItem('marquinhos_posicion', JSON.stringify({ x, y }));
        } catch (e) {}
    }

    cargarPosicion() {
        try {
            const data = localStorage.getItem('marquinhos_posicion');
            return data ? JSON.parse(data) : null;
        } catch (e) { return null; }
    }

    detectarColisiones() {
        const container = document.getElementById('marquinhos-container');
        const bubble = this.bubble;
        setInterval(() => {
            if (!bubble) return;
            const rectBurbuja = bubble.getBoundingClientRect();
            const criticos = document.querySelectorAll('.elemento-critico');
            let colision = false;
            criticos.forEach(el => {
                const rectEl = el.getBoundingClientRect();
                if (!(rectBurbuja.right < rectEl.left || rectBurbuja.left > rectEl.right ||
                      rectBurbuja.bottom < rectEl.top || rectBurbuja.top > rectEl.bottom)) {
                    colision = true;
                }
            });
            if (colision) {
                const currentLeft = rectBurbuja.left;
                const currentTop = rectBurbuja.top;
                const newTop = Math.max(0, currentTop - 80);
                const newLeft = Math.max(0, currentLeft);
                container.style.left = newLeft + 'px';
                container.style.top = newTop + 'px';
                container.style.right = 'auto';
                container.style.bottom = 'auto';
                this.guardarPosicion(newLeft, newTop);
            }
        }, 300);
    }

    // ================================================================
    // VENTANA
    // ================================================================
    setupWindowToggle() {
        this.bubble.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'm-ad-label') {
                e.stopPropagation();
                this.clickAnuncio();
                return;
            }
            if (this.hasMoved) {
                this.hasMoved = false;
                return;
            }
            this.expandido = !this.expandido;
            this.windowEl.classList.toggle('abierta', this.expandido);
            if (this.expandido) {
                Engine.marcarComoLeido();
                this.cargarMensajes();
                this.cargarSaldo();
                document.querySelector('.m-notificacion').style.display = 'none';
                this.input.focus();
            }
        });

        this.closeBtn.addEventListener('click', () => {
            this.expandido = false;
            this.windowEl.classList.remove('abierta');
        });
    }

    // ================================================================
    // ENVIAR MENSAJE
    // ================================================================
    setupSendMessage() {
        this.sendBtn.addEventListener('click', () => this.enviarMensaje(this.input));
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.enviarMensaje(this.input);
            if (e.target.value.length > 0) {
                this.enviarTypingIndicator();
            }
        });
    }

    enviarMensaje(input) {
        if (!input.value.trim()) return;
        const texto = input.value;
        const responderA = this.respondiendoA;
        if (responderA) {
            Engine.enviarMensajeConRespuesta?.(texto, responderA.id, responderA.texto);
            this.cancelarRespuesta();
        } else {
            Engine.enviarMensaje(texto);
        }
        input.value = '';
        const typingIndicator = document.getElementById('m-typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    // ================================================================
    // EMOJIS
    // ================================================================
    setupEmojiPicker() {
        const emojis = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '✨', '🌟', '💪', '🤗', '😍', '🥳', '🤔', '👀', '💯'];
        let emojiPopup = null;
        this.emojiBtn.addEventListener('click', () => {
            if (!emojiPopup) {
                emojiPopup = document.createElement('div');
                emojiPopup.className = 'm-emojis-popup';
                emojis.forEach(e => {
                    const span = document.createElement('span');
                    span.textContent = e;
                    span.addEventListener('click', () => {
                        this.input.value += e;
                        this.input.focus();
                        emojiPopup.classList.remove('abierto');
                    });
                    emojiPopup.appendChild(span);
                });
                document.querySelector('.m-ventana').appendChild(emojiPopup);
            }
            emojiPopup.classList.toggle('abierto');
        });
    }

    // ================================================================
    // ARCHIVOS
    // ================================================================
    setupFileAttachment() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'm-file-input';
        fileInput.accept = 'image/*,video/*';
        fileInput.multiple = false;
        document.querySelector('.m-ventana').appendChild(fileInput);

        this.attachBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const mensaje = await Engine.enviarArchivo(file);
            if (mensaje) {
                this.cargarMensajes();
            }
            fileInput.value = '';
        });
    }

    // ================================================================
    // LLAMADAS
    // ================================================================
    setupCalls() {
        this.callBtn.addEventListener('click', () => {
            if (Engine.estaEnLlamada()) {
                Engine.terminarLlamada();
                this.callBtn.textContent = '📞';
                this.callBtn.title = 'Llamada de voz';
            } else {
                const targetUser = prompt('ID del usuario para llamar:');
                if (targetUser) {
                    Engine.iniciarLlamada(targetUser, { video: false });
                    this.callBtn.textContent = '🔴';
                    this.callBtn.title = 'Terminar llamada';
                }
            }
        });

        this.videoBtn.addEventListener('click', () => {
            if (Engine.estaEnLlamada()) {
                Engine.terminarLlamada();
                this.videoBtn.textContent = '📹';
                this.videoBtn.title = 'Videollamada';
            } else {
                const targetUser = prompt('ID del usuario para videollamar:');
                if (targetUser) {
                    Engine.iniciarLlamada(targetUser, { video: true });
                    this.videoBtn.textContent = '🔴';
                    this.videoBtn.title = 'Terminar videollamada';
                }
            }
        });

        document.getElementById('m-btn-horario').addEventListener('click', () => {
            alert(Engine.obtenerHorario());
        });
    }

    // ================================================================
    // STICKERS
    // ================================================================
    setupStickers() {
        let stickersPopup = null;
        this.cargarStickers();

        this.stickerBtn.addEventListener('click', () => {
            if (!stickersPopup) {
                stickersPopup = document.createElement('div');
                stickersPopup.className = 'm-stickers-popup';
                stickersPopup.id = 'm-stickers-popup';
                document.querySelector('.m-ventana').appendChild(stickersPopup);
            }
            stickersPopup.classList.toggle('abierto');
            if (stickersPopup.classList.contains('abierto')) {
                this.renderizarStickersPopup(stickersPopup);
            }
        });
    }

    async cargarStickers() {
        try {
            if (typeof window.Commit !== 'undefined' && window.Commit) {
                this.stickersDisponibles = await window.Commit.listarStickers();
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar los stickers:', error);
        }
    }

    renderizarStickersPopup(popup) {
        if (!this.stickersDisponibles || this.stickersDisponibles.length === 0) {
            popup.innerHTML = `
                <div style="text-align:center;color:#a99c8c;padding:12px;font-size:0.8rem;">
                    ⏳ Cargando stickers...
                </div>
            `;
            this.cargarStickers().then(() => {
                this.renderizarStickersPopup(popup);
            });
            return;
        }

        const userId = Engine.obtenerUserId ? Engine.obtenerUserId() : 'usuario_default';

        popup.innerHTML = `
            <div style="font-family:'Orbitron',monospace;font-size:0.7rem;color:var(--gold-cosmic);padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.05);">
                🎁 Enviar Sticker
            </div>
            ${this.stickersDisponibles.map(s => `
                <div class="m-sticker-item" data-asset="${s.asset_type}" data-price="${s.price_commit}">
                    <span class="m-sticker-emoji">${s.emoji || '🎁'}</span>
                    <div class="m-sticker-info">
                        <div class="m-sticker-name">${s.asset_name}</div>
                        <div class="m-sticker-price">${s.price_commit} CMT</div>
                    </div>
                    <span class="m-sticker-badge" style="color:${s.color_hex || '#a99c8c'};">${s.rarity || 'Común'}</span>
                </div>
            `).join('')}
            <div style="font-size:0.55rem;color:#4a6a8a;text-align:center;padding-top:6px;border-top:1px solid rgba(255,255,255,0.05);">
                💰 Comisión 50% para la plataforma
            </div>
        `;

        popup.querySelectorAll('.m-sticker-item').forEach(el => {
            el.addEventListener('click', async () => {
                const assetType = el.dataset.asset;
                const price = parseInt(el.dataset.price);
                if (this.saldoCommit < price) {
                    alert(`❌ Saldo insuficiente. Tienes ${this.saldoCommit} CMT y necesitas ${price} CMT.`);
                    return;
                }
                const targetUser = prompt('ID del usuario para enviar este sticker:');
                if (!targetUser) return;
                try {
                    const result = await Engine.enviarStickerCommit?.(targetUser, assetType);
                    if (result) {
                        this.cargarSaldo();
                        this.cargarMensajes();
                        popup.classList.remove('abierto');
                    }
                } catch (error) {
                    alert(`❌ Error: ${error.message}`);
                }
            });
        });
    }

    // ================================================================
    // BÚSQUEDA
    // ================================================================
    setupSearch() {
        let buscarPopup = null;
        this.buscarBtn.addEventListener('click', () => {
            if (!buscarPopup) {
                buscarPopup = document.createElement('div');
                buscarPopup.className = 'm-buscar-popup';
                buscarPopup.id = 'm-buscar-popup';
                buscarPopup.innerHTML = `
                    <input type="text" id="m-buscar-input" placeholder="🔍 Buscar mensajes..." />
                    <div id="m-buscar-resultados"></div>
                `;
                document.querySelector('.m-ventana').appendChild(buscarPopup);
                const buscarInput = document.getElementById('m-buscar-input');
                buscarInput.addEventListener('input', (e) => {
                    this.buscarMensajes(e.target.value);
                });
                buscarInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.buscarMensajes(e.target.value);
                    }
                });
            }
            buscarPopup.classList.toggle('abierto');
            if (buscarPopup.classList.contains('abierto')) {
                document.getElementById('m-buscar-input').focus();
            }
        });
    }

    async buscarMensajes(query) {
        const resultadosContainer = document.getElementById('m-buscar-resultados');
        if (!resultadosContainer) return;
        if (!query || query.length < 2) {
            resultadosContainer.innerHTML = '';
            return;
        }
        try {
            const resultados = await Engine.buscarMensajes(query);
            if (!resultados || resultados.length === 0) {
                resultadosContainer.innerHTML = `
                    <div style="padding:8px;font-size:0.7rem;color:var(--text-muted);text-align:center;">
                        No se encontraron mensajes
                    </div>
                `;
                return;
            }
            resultadosContainer.innerHTML = resultados.slice(0, 10).map(m => `
                <div class="m-resultado" onclick="window.marquinhosUI?.scrollToMensaje('${m.id}')">
                    <div style="font-weight:600;font-size:0.65rem;color:var(--gold-cosmic);">
                        ${m.user_id || 'Usuario'}
                    </div>
                    <div>${m.content}</div>
                    <div style="font-size:0.5rem;color:var(--text-muted);">${new Date(m.created_at).toLocaleString()}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error buscando mensajes:', error);
            resultadosContainer.innerHTML = `
                <div style="padding:8px;font-size:0.7rem;color:var(--danger);text-align:center;">
                    Error al buscar
                </div>
            `;
        }
    }

    scrollToMensaje(messageId) {
        const popup = document.getElementById('m-buscar-popup');
        if (popup) popup.classList.remove('abierto');
        const elemento = document.querySelector(`.m-mensaje[data-id="${messageId}"]`);
        if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
            elemento.style.border = '2px solid var(--gold-cosmic)';
            setTimeout(() => {
                elemento.style.border = 'none';
            }, 2000);
        }
    }

    // ================================================================
    // TYPING INDICATOR
    // ================================================================
    enviarTypingIndicator() {
        const userId = Engine.obtenerUserId ? Engine.obtenerUserId() : 'usuario_default';
        const typingIndicator = document.getElementById('m-typing-indicator');
        const typingText = document.getElementById('m-typing-text');
        if (typingIndicator) {
            typingIndicator.style.display = 'block';
            typingText.textContent = 'Tú estás escribiendo...';
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                typingIndicator.style.display = 'none';
            }, 2000);
        }
        Engine.enviarTypingIndicator?.();
    }

    mostrarTypingIndicator(usuario) {
        const typingIndicator = document.getElementById('m-typing-indicator');
        const typingText = document.getElementById('m-typing-text');
        if (typingIndicator) {
            typingIndicator.style.display = 'block';
            typingText.textContent = `${usuario} está escribiendo...`;
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                typingIndicator.style.display = 'none';
            }, 3000);
        }
    }

    // ================================================================
    // RESPONDER
    // ================================================================
    iniciarRespuesta(messageId, texto) {
        this.respondiendoA = { id: messageId, texto: texto };
        const replyBar = document.getElementById('m-reply-bar');
        const replyText = document.getElementById('m-reply-text');
        if (replyBar && replyText) {
            replyBar.classList.add('visible');
            replyBar.style.display = 'flex';
            replyText.textContent = texto || 'Mensaje';
        }
        document.getElementById('m-input').focus();
    }

    cancelarRespuesta() {
        this.respondiendoA = null;
        const replyBar = document.getElementById('m-reply-bar');
        if (replyBar) {
            replyBar.classList.remove('visible');
            replyBar.style.display = 'none';
        }
    }

    // ================================================================
    // EDITAR / ELIMINAR
    // ================================================================
    async editarMensaje(messageId, textoActual) {
        const nuevoTexto = prompt('Editar mensaje:', textoActual);
        if (nuevoTexto && nuevoTexto.trim() && nuevoTexto !== textoActual) {
            try {
                await Engine.editarMensaje?.(messageId, nuevoTexto.trim());
                this.cargarMensajes();
            } catch (error) {
                alert('Error al editar el mensaje');
            }
        }
    }

    async eliminarMensaje(messageId) {
        if (confirm('¿Eliminar este mensaje para todos?')) {
            try {
                await Engine.eliminarMensaje?.(messageId);
                this.cargarMensajes();
            } catch (error) {
                alert('Error al eliminar el mensaje');
            }
        }
    }

    // ================================================================
    // SALDO COMMIT
    // ================================================================
    async cargarSaldo() {
        try {
            const userId = Engine.obtenerUserId ? Engine.obtenerUserId() : 'usuario_default';
            if (typeof window.Commit !== 'undefined' && window.Commit) {
                const saldo = await window.Commit.consultarSaldo(userId);
                this.saldoCommit = saldo.balance || 0;
                this.actualizarSaldo();
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar el saldo CMT:', error);
        }
    }

    actualizarSaldo() {
        const saldoEl = document.getElementById('m-saldo');
        if (saldoEl) {
            saldoEl.textContent = `💰 ${this.saldoCommit.toFixed(0)} CMT`;
        }
    }

    // ================================================================
    // PUBLICIDAD
    // ================================================================
    setupAds() {
        this.adsBtn.addEventListener('click', () => {
            this.abrirModalPublicidad();
        });

        this.adModalCerrar.addEventListener('click', () => {
            this.cerrarModalPublicidad();
        });

        this.adModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.adModalOverlay) {
                this.cerrarModalPublicidad();
            }
        });

        document.querySelectorAll('.m-ad-nivel-item').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelectorAll('.m-ad-nivel-item').forEach(x => x.classList.remove('seleccionado'));
                el.classList.add('seleccionado');
                this.nivelSeleccionado = el.dataset.nivel;
            });
        });

        this.adBtnComprar.addEventListener('click', () => {
            this.comprarPublicidadDesdeModal();
        });
    }

    initPublicidad(intervaloMs = 45000) {
        this.rotarAnuncio();
        if (this.publicidadInterval) clearInterval(this.publicidadInterval);
        this.publicidadInterval = setInterval(() => {
            this.rotarAnuncio();
        }, intervaloMs);
    }

    async rotarAnuncio() {
        try {
            const anuncio = await Engine.getAnuncioParaBurbuja();
            this.anuncioActual = anuncio;
            this.mostrarAnuncioEnBurbuja(anuncio);
        } catch (error) {
            console.warn('⚠️ No se pudo rotar el anuncio de Marquinhos:', error);
        }
    }

    mostrarAnuncioEnBurbuja(anuncio) {
        const bubble = document.getElementById('m-burbuja');
        const adLabel = document.getElementById('m-ad-label');
        if (!bubble || !adLabel) return;
        bubble.classList.remove('ad-basico', 'ad-estandar', 'ad-premium', 'ad-patrocinado');
        if (!anuncio) {
            adLabel.style.display = 'none';
            bubble.title = '';
            return;
        }
        bubble.classList.add(`ad-${anuncio.nivel}`);
        adLabel.style.display = 'block';
        bubble.title = `📢 ${anuncio.empresa}: ${anuncio.mensaje}`;
    }

    clickAnuncio() {
        if (!this.anuncioActual) return;
        Engine.registrarClick(this.anuncioActual.id);
        if (this.anuncioActual.url) {
            window.open(this.anuncioActual.url, '_blank', 'noopener');
        } else {
            alert(`📢 ${this.anuncioActual.empresa}\n\n${this.anuncioActual.mensaje}`);
        }
    }

    abrirModalPublicidad() {
        const overlay = document.getElementById('m-ad-modal-overlay');
        if (!overlay) return;
        document.getElementById('m-ad-empresa').value = '';
        document.getElementById('m-ad-mensaje').value = '';
        document.getElementById('m-ad-url').value = '';
        document.getElementById('m-ad-duracion').value = 7;
        document.querySelectorAll('.m-ad-nivel-item').forEach(x => x.classList.remove('seleccionado'));
        this.nivelSeleccionado = null;
        this.renderizarDatosPago();
        overlay.classList.add('abierto');
    }

    cerrarModalPublicidad() {
        const overlay = document.getElementById('m-ad-modal-overlay');
        if (overlay) overlay.classList.remove('abierto');
    }

    obtenerDatosPago() {
        try {
            const data = localStorage.getItem('csariels_datos_pago_publicidad');
            if (data) return JSON.parse(data);
        } catch (e) {}
        return {
            banco: 'Pendiente de configurar',
            titular: 'Pendiente de configurar',
            clabe: '0000 0000 0000 0000',
            nota: 'Contacta al administrador para confirmar tu pago.'
        };
    }

    renderizarDatosPago() {
        const cont = document.getElementById('m-ad-pago-info');
        if (!cont) return;
        const pago = this.obtenerDatosPago();
        cont.innerHTML = `
            <div>🏦 Banco: <strong>${pago.banco}</strong></div>
            <div>👤 Titular: <strong>${pago.titular}</strong></div>
            <div>💳 CLABE: <strong>${pago.clabe}</strong></div>
            <div style="margin-top:6px;">${pago.nota || ''}</div>
        `;
    }

    async comprarPublicidadDesdeModal() {
        const empresa = document.getElementById('m-ad-empresa').value.trim();
        const mensaje = document.getElementById('m-ad-mensaje').value.trim();
        const url = document.getElementById('m-ad-url').value.trim();
        const duracionDias = parseInt(document.getElementById('m-ad-duracion').value) || 7;
        const nivel = this.nivelSeleccionado;
        const btnComprar = document.getElementById('m-ad-btn-comprar');
        if (!empresa || !mensaje) {
            alert('⚠️ Completa el nombre de la empresa y el mensaje del anuncio.');
            return;
        }
        if (!nivel) {
            alert('⚠️ Selecciona un nivel de publicidad.');
            return;
        }
        btnComprar.disabled = true;
        btnComprar.textContent = 'Procesando...';
        try {
            await Engine.comprarPublicidad({ empresa, mensaje, url, nivel, duracionDias });
            alert('✅ Solicitud creada. Tu anuncio se activará cuando el admin confirme tu pago.');
            this.cerrarModalPublicidad();
        } catch (error) {
            alert(`❌ Error al crear la solicitud: ${error.message}`);
        } finally {
            btnComprar.disabled = false;
            btnComprar.textContent = 'Comprar Publicidad';
        }
    }

    // ================================================================
    // MENSAJES
    // ================================================================
    async cargarMensajes() {
        const contenedor = document.getElementById('m-mensajes');
        if (!contenedor) return;
        Engine.recibirMensajes((mensajes) => {
            this.mensajes = mensajes;
            this.renderizarMensajes();
        });
    }

    renderizarMensajes() {
        const contenedor = document.getElementById('m-mensajes');
        if (!contenedor) return;
        if (!this.mensajes || this.mensajes.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align:center;color:var(--text-muted);padding:20px;font-size:0.8rem;">
                    💬 No hay mensajes aún. ¡Envía uno!
                </div>
            `;
            return;
        }
        const typingIndicator = document.getElementById('m-typing-indicator');
        const typingHTML = typingIndicator ? typingIndicator.outerHTML : '';

        contenedor.innerHTML = this.mensajes.map(m => {
            const esBot = m.usuario === 'Marquinhos' || m.user_id === 'Marquinhos';
            const nombre = m.usuario || m.user_id || 'Anónimo';
            const contenido = m.content || m.texto || '';
            const tipo = m.type || 'text';
            const reacciones = m.reacciones || [];
            const estado = m.estado || 'enviado';
            const esEditado = m.editado || false;
            const estaEliminado = m.eliminado_para_todos || false;
            const esRespuesta = m.responder_a || m.extra?.responder_a;
            const hora = m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            if (estaEliminado) {
                return `
                    <div class="m-mensaje-wrapper">
                        <div class="m-mensaje bot" style="opacity:0.5;font-style:italic;">
                            <span style="color:var(--text-muted);">🗑️ Mensaje eliminado</span>
                        </div>
                    </div>
                `;
            }

            let contenidoHTML = '';
            if (tipo === 'image' || (contenido && (contenido.match(/\.(jpg|jpeg|png|gif|webp)/i)))) {
                contenidoHTML = `
                    <div class="m-archivo">
                        <i class="fas fa-image"></i> Imagen
                        <img src="${contenido}" alt="Imagen" loading="lazy" />
                    </div>
                `;
            } else if (tipo === 'video' || (contenido && (contenido.match(/\.(mp4|webm|mov)/i)))) {
                contenidoHTML = `
                    <div class="m-archivo">
                        <i class="fas fa-video"></i> Video
                        <video controls src="${contenido}"></video>
                    </div>
                `;
            } else if (tipo === 'sticker') {
                contenidoHTML = `
                    <div class="m-archivo" style="background:none;padding:0;">
                        <img src="${contenido}" alt="Sticker" style="max-width:120px;max-height:120px;" />
                    </div>
                `;
            } else if (tipo === 'sticker_cmt' || tipo === 'gift_cmt') {
                const extra = m.extra || {};
                const emoji = extra.emoji || '🎁';
                const name = extra.asset_name || 'Sticker';
                const price = extra.amount || 0;
                const receiver = extra.receiver_id || 'alguien';
                contenidoHTML = `
                    <div class="m-sticker-cmt">
                        <span class="m-sticker-emoji">${emoji}</span>
                        <span class="m-sticker-nombre">${name} → ${receiver}</span>
                        <span class="m-sticker-valor">💰 ${price} CMT</span>
                        ${extra.commission ? `<span style="font-size:0.5rem;color:#4a6a8a;">Comisión 50%: ${extra.commission} CMT</span>` : ''}
                    </div>
                `;
            } else if (tipo === 'emoji') {
                contenidoHTML = `<span style="font-size:2rem;">${contenido}</span>`;
            } else {
                contenidoHTML = contenido;
            }

            const estadoMap = {
                'enviando': '<span class="m-estado enviando">⏳ Enviando...</span>',
                'enviado': '<span class="m-estado enviado">✅ Enviado</span>',
                'recibido': '<span class="m-estado recibido">📩 Recibido</span>',
                'leido': '<span class="m-estado leido">👁️ Leído</span>',
                'fallido': '<span class="m-estado fallido">❌ Fallido</span>'
            };
            const estadoHTML = estadoMap[estado] || '';

            let respuestaHTML = '';
            if (esRespuesta) {
                const textoRespondido = typeof esRespuesta === 'string' ? esRespuesta : 'Mensaje';
                respuestaHTML = `
                    <div class="m-responder-a" onclick="window.marquinhosUI?.scrollToMensaje('${m.responder_a || m.extra?.responder_a}')">
                        ↩️ ${textoRespondido}
                    </div>
                `;
            }

            let reaccionesHTML = '';
            if (reacciones && reacciones.length > 0) {
                const agrupadas = {};
                reacciones.forEach(r => {
                    agrupadas[r.emoji] = (agrupadas[r.emoji] || 0) + 1;
                });
                reaccionesHTML = `
                    <div class="m-reacciones">
                        ${Object.entries(agrupadas).map(([emoji, count]) => `
                            <span class="m-reaccion">${emoji} ${count > 1 ? count : ''}</span>
                        `).join('')}
                    </div>
                `;
            }

            const accionesHTML = `
                <div class="m-acciones">
                    <button onclick="window.marquinhosUI?.iniciarRespuesta('${m.id}', '${window.escapeHtml(contenido.substring(0, 30))}')" title="Responder">↩️</button>
                    <button onclick="window.marquinhosUI?.editarMensaje('${m.id}', '${window.escapeHtml(contenido)}')" title="Editar">✏️</button>
                    <button class="danger" onclick="window.marquinhosUI?.eliminarMensaje('${m.id}')" title="Eliminar">🗑️</button>
                </div>
            `;

            return `
                <div class="m-mensaje-wrapper ${esRespuesta ? 'respuesta' : ''}">
                    <div class="m-mensaje ${esBot ? 'bot' : 'usuario'}" data-id="${m.id || m._id}">
                        ${respuestaHTML}
                        <div class="m-usuario">${esBot ? '🧠 Marquinhos' : nombre}</div>
                        ${contenidoHTML}
                        ${reaccionesHTML}
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
                            <span class="m-hora">${hora}</span>
                            ${estadoHTML}
                        </div>
                        ${esEditado ? '<span class="m-editado">✎ Editado</span>' : ''}
                        ${accionesHTML}
                    </div>
                </div>
            `;
        }).join('');

        if (typingIndicator) {
            contenedor.appendChild(typingIndicator);
        }
        contenedor.scrollTop = contenedor.scrollHeight;
    }

    actualizarNotificaciones() {
        const noLeidos = this.mensajes.filter(m => !m.leido && m.user_id !== 'Marquinhos').length;
        const notificacion = document.querySelector('.m-notificacion');
        if (notificacion) {
            if (noLeidos > 0) {
                notificacion.style.display = 'flex';
                notificacion.textContent = noLeidos > 9 ? '9+' : noLeidos;
            } else {
                notificacion.style.display = 'none';
            }
        }
    }
}

// ================================================================
// FUNCIONES GLOBALES
// ================================================================
window.cancelarRespuesta = function() {
    if (window.marquinhosUI) {
        window.marquinhosUI.cancelarRespuesta();
    }
};

window.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Auto-inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si el usuario está logueado
    const isLoggedIn = localStorage.getItem('csariels_login') === 'true' || localStorage.getItem('csariels_user_id');
    if (isLoggedIn) {
        if (!window.marquinhosUI) {
            window.marquinhosUI = new MarquinhosUI();
            console.log('🧠 Marquinhos UI inicializado');
        }
    } else {
        console.log('ℹ️ Usuario no logueado, Marquinhos no se iniciará.');
    }
});