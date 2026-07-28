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
        this.respondiendoA = null; // Para respuesta a mensajes
        this.typingTimeout = null;
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
        `;
        document.body.appendChild(container);

        // ===== ESTILOS =====
        const style = document.createElement('style');
        style.textContent = `
            #marquinhos-container {
                position: fixed;
                z-index: 9999;
                touch-action: none;
                user-select: none;
                ${posGuardada 
                    ? `left: ${posGuardada.x}px; top: ${posGuardada.y}px;` 
                    : 'bottom: 20px; right: 20px;'}
            }
            .m-burbuja {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: linear-gradient(135deg, #d4a373, #c2683e);
                cursor: grab;
                backdrop-filter: blur(var(--m-blur));
                border: 1px solid rgba(255,255,255,0.2);
                box-shadow: 0 8px 32px rgba(212,168,87,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                transition: box-shadow 0.3s ease, transform 0.2s ease;
                position: relative;
            }
            .m-burbuja:hover {
                transform: scale(1.05);
                box-shadow: 0 8px 40px rgba(212,168,87,0.4);
            }
            .m-burbuja .m-icono { font-size: 1.8rem; }
            .m-burbuja .m-notificacion {
                position: absolute;
                top: -4px;
                right: -4px;
                width: 16px;
                height: 16px;
                background: #ff3366;
                border-radius: 50%;
                border: 2px solid #05080f;
                font-size: 0.6rem;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                animation: pulse-dot 2s ease-in-out infinite;
            }
            @keyframes pulse-dot {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.3); }
            }
            .m-burbuja.dragging {
                cursor: grabbing;
                transform: scale(1.1);
                box-shadow: 0 12px 48px rgba(212,168,87,0.5);
            }
            .m-ventana {
                display: none;
                width: var(--m-width);
                height: var(--m-height);
                background: var(--m-glass);
                backdrop-filter: blur(var(--m-blur));
                border-radius: 20px;
                border: 1px solid rgba(255,255,255,0.2);
                flex-direction: column;
                overflow: hidden;
                padding: 16px;
                position: absolute;
                bottom: 80px;
                right: 0;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            }
            .m-ventana.abierta {
                display: flex;
                animation: slideUp 0.3s ease-out;
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .m-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(255,255,255,0.08);
                margin-bottom: 12px;
                flex-wrap: wrap;
                gap: 4px;
            }
            .m-header-actions {
                display: flex;
                gap: 4px;
                align-items: center;
                flex-wrap: wrap;
            }
            .m-header-actions button {
                background: none;
                border: none;
                color: #a99c8c;
                cursor: pointer;
                font-size: 0.9rem;
                padding: 4px 6px;
                border-radius: 6px;
                transition: all 0.3s;
            }
            .m-header-actions button:hover {
                background: rgba(255,255,255,0.05);
                color: #e8e1d8;
            }
            .m-header-actions .m-saldo {
                font-size: 0.65rem;
                color: var(--gold-cosmic, #f7d44a);
                font-family: 'Orbitron', monospace;
                padding: 2px 8px;
                background: rgba(247,212,74,0.08);
                border-radius: 12px;
                border: 1px solid rgba(247,212,74,0.15);
            }
            .m-titulo {
                font-family: 'Orbitron', monospace;
                font-size: 0.9rem;
                color: #f7d44a;
            }
            .m-cerrar {
                background: none;
                border: none;
                color: #a99c8c;
                cursor: pointer;
                font-size: 1.2rem;
                transition: color 0.3s;
            }
            .m-cerrar:hover { color: #e8e1d8; }
            .m-mensajes {
                flex: 1;
                overflow-y: auto;
                margin-bottom: 12px;
                padding-right: 4px;
                min-height: 200px;
                max-height: 350px;
                display: flex;
                flex-direction: column;
            }
            .m-mensajes::-webkit-scrollbar { width: 4px; }
            .m-mensajes::-webkit-scrollbar-thumb { background: #f7d44a; border-radius: 2px; }
            .m-mensaje-wrapper {
                display: flex;
                flex-direction: column;
                margin-bottom: 4px;
            }
            .m-mensaje-wrapper.respuesta {
                border-left: 2px solid var(--gold-cosmic);
                padding-left: 6px;
                margin-top: 2px;
            }
            .m-mensaje {
                padding: 8px 14px;
                border-radius: 12px;
                max-width: 85%;
                font-size: 0.85rem;
                line-height: 1.4;
                word-break: break-word;
                position: relative;
            }
            .m-mensaje.usuario {
                background: rgba(0,212,255,0.1);
                border: 1px solid rgba(0,212,255,0.15);
                margin-left: auto;
                color: #e8f0f8;
            }
            .m-mensaje.bot {
                background: rgba(212,168,87,0.1);
                border: 1px solid rgba(212,168,87,0.15);
                margin-right: auto;
                color: #8ba3c7;
            }
            .m-mensaje .m-usuario {
                font-weight: 600;
                font-size: 0.7rem;
                color: #f7d44a;
                margin-bottom: 2px;
            }
            .m-mensaje .m-estado {
                font-size: 0.5rem;
                color: var(--text-muted);
                text-align: right;
                margin-top: 2px;
                font-family: 'Orbitron', monospace;
            }
            .m-mensaje .m-estado.enviado { color: var(--text-muted); }
            .m-mensaje .m-estado.recibido { color: var(--success); }
            .m-mensaje .m-estado.leido { color: var(--success); }
            .m-mensaje .m-estado.fallido { color: var(--danger); }
            .m-mensaje .m-estado.enviando { color: var(--warning); animation: pulse 1s infinite; }
            .m-mensaje .m-hora {
                font-size: 0.5rem;
                color: var(--text-muted);
                text-align: right;
                margin-top: 2px;
            }
            .m-mensaje .m-editado {
                font-size: 0.45rem;
                color: var(--text-muted);
                font-style: italic;
            }
            .m-mensaje .m-responder-a {
                font-size: 0.6rem;
                color: var(--gold-cosmic);
                background: rgba(247,212,74,0.05);
                padding: 2px 8px;
                border-radius: 4px;
                margin-bottom: 4px;
                cursor: pointer;
            }
            .m-mensaje .m-responder-a:hover {
                background: rgba(247,212,74,0.1);
            }
            .m-mensaje .m-reacciones {
                display: flex;
                gap: 4px;
                margin-top: 4px;
                flex-wrap: wrap;
            }
            .m-mensaje .m-reaccion {
                font-size: 0.8rem;
                cursor: pointer;
                padding: 0 4px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            .m-mensaje .m-reaccion:hover {
                background: rgba(255,255,255,0.1);
            }
            .m-mensaje .m-acciones {
                display: none;
                position: absolute;
                right: 8px;
                top: 4px;
                gap: 4px;
                background: rgba(0,0,0,0.6);
                border-radius: 6px;
                padding: 2px;
            }
            .m-mensaje:hover .m-acciones {
                display: flex;
            }
            .m-mensaje .m-acciones button {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                font-size: 0.6rem;
                padding: 2px 4px;
                border-radius: 4px;
                transition: all 0.3s;
            }
            .m-mensaje .m-acciones button:hover {
                background: rgba(255,255,255,0.05);
                color: var(--text-primary);
            }
            .m-mensaje .m-acciones button.danger:hover {
                color: var(--danger);
            }
            .m-mensaje .m-archivo {
                margin-top: 4px;
                padding: 6px 10px;
                background: rgba(0,0,0,0.2);
                border-radius: 6px;
                font-size: 0.7rem;
                color: #a99c8c;
                display: flex;
                align-items: center;
                gap: 6px;
                flex-wrap: wrap;
            }
            .m-mensaje .m-archivo img {
                max-width: 100%;
                max-height: 200px;
                border-radius: 8px;
                margin-top: 4px;
            }
            .m-mensaje .m-archivo video {
                max-width: 100%;
                max-height: 200px;
                border-radius: 8px;
                margin-top: 4px;
            }
            .m-mensaje .m-sticker-cmt {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px 12px;
                background: rgba(0,0,0,0.2);
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.05);
            }
            .m-mensaje .m-sticker-cmt .m-sticker-emoji {
                font-size: 2.5rem;
            }
            .m-mensaje .m-sticker-cmt .m-sticker-nombre {
                font-size: 0.7rem;
                color: #a99c8c;
                margin-top: 2px;
            }
            .m-mensaje .m-sticker-cmt .m-sticker-valor {
                font-size: 0.6rem;
                color: var(--gold-cosmic, #f7d44a);
                font-family: 'Orbitron', monospace;
            }
            .m-typing-indicator {
                padding: 4px 12px;
                color: var(--text-muted);
                font-size: 0.7rem;
                font-style: italic;
                animation: pulse 1s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .m-input-area {
                display: flex;
                gap: 6px;
                padding-top: 10px;
                border-top: 1px solid rgba(255,255,255,0.08);
                align-items: center;
            }
            .m-btn-emoji {
                background: none;
                border: none;
                color: #a99c8c;
                cursor: pointer;
                font-size: 1.2rem;
                padding: 4px 8px;
                border-radius: 6px;
                transition: all 0.3s;
            }
            .m-btn-emoji:hover {
                background: rgba(255,255,255,0.05);
                color: #e8e1d8;
            }
            .m-input {
                flex: 1;
                padding: 10px 14px;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 10px;
                color: #e8f0f8;
                font-family: 'Space Grotesk', sans-serif;
                font-size: 0.85rem;
                outline: none;
                transition: border-color 0.3s;
            }
            .m-input:focus {
                border-color: #00e5ff;
                box-shadow: 0 0 20px rgba(0,212,255,0.05);
            }
            .m-btn-enviar, .m-btn-horario {
                padding: 10px 16px;
                background: linear-gradient(135deg, #f7d44a, #b8923a);
                border: none;
                border-radius: 10px;
                color: #0a0c10;
                font-weight: 700;
                cursor: pointer;
                transition: transform 0.3s;
                font-family: 'Orbitron', monospace;
                font-size: 0.7rem;
                white-space: nowrap;
            }
            .m-btn-enviar:hover, .m-btn-horario:hover { transform: scale(1.05); }
            .m-btn-horario {
                margin-top: 8px;
                width: 100%;
            }
            .m-emojis-popup {
                display: none;
                position: absolute;
                bottom: 70px;
                left: 10px;
                background: rgba(11,61,46,0.95);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 10px;
                backdrop-filter: blur(10px);
                max-width: 250px;
                flex-wrap: wrap;
                gap: 4px;
                z-index: 100;
            }
            .m-emojis-popup.abierto {
                display: flex;
            }
            .m-emojis-popup span {
                font-size: 1.2rem;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            .m-emojis-popup span:hover {
                background: rgba(255,255,255,0.1);
            }
            /* ===== STICKERS POPUP ===== */
            .m-stickers-popup {
                display: none;
                position: absolute;
                bottom: 70px;
                right: 10px;
                background: rgba(11,61,46,0.95);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 12px;
                backdrop-filter: blur(10px);
                max-width: 280px;
                z-index: 100;
                flex-direction: column;
                gap: 6px;
            }
            .m-stickers-popup.abierto {
                display: flex;
            }
            .m-stickers-popup .m-sticker-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 6px 10px;
                background: rgba(255,255,255,0.03);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            .m-stickers-popup .m-sticker-item:hover {
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,255,255,0.1);
                transform: scale(1.02);
            }
            .m-stickers-popup .m-sticker-item .m-sticker-emoji {
                font-size: 1.8rem;
                width: 40px;
                text-align: center;
            }
            .m-stickers-popup .m-sticker-item .m-sticker-info {
                flex: 1;
            }
            .m-stickers-popup .m-sticker-item .m-sticker-info .m-sticker-name {
                font-size: 0.75rem;
                color: #e8f0f8;
            }
            .m-stickers-popup .m-sticker-item .m-sticker-info .m-sticker-price {
                font-size: 0.6rem;
                color: var(--gold-cosmic, #f7d44a);
                font-family: 'Orbitron', monospace;
            }
            .m-stickers-popup .m-sticker-item .m-sticker-badge {
                font-size: 0.5rem;
                padding: 2px 8px;
                border-radius: 10px;
                background: rgba(247,212,74,0.1);
                color: #a99c8c;
                font-family: 'Orbitron', monospace;
            }
            .m-buscar-popup {
                display: none;
                position: absolute;
                top: 50px;
                right: 10px;
                background: rgba(11,61,46,0.95);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 12px;
                backdrop-filter: blur(10px);
                min-width: 250px;
                z-index: 100;
                flex-direction: column;
                gap: 6px;
            }
            .m-buscar-popup.abierto {
                display: flex;
            }
            .m-buscar-popup input {
                padding: 8px 12px;
                background: rgba(0,0,0,0.3);
                border: 1px solid var(--gold-dim);
                border-radius: 8px;
                color: var(--text-primary);
                font-size: 0.85rem;
                outline: none;
                font-family: 'Space Grotesk', sans-serif;
            }
            .m-buscar-popup input:focus {
                border-color: var(--gold-cosmic);
            }
            .m-buscar-popup .m-resultado {
                padding: 4px 8px;
                font-size: 0.7rem;
                color: var(--text-secondary);
                cursor: pointer;
                border-radius: 4px;
                transition: background 0.2s;
            }
            .m-buscar-popup .m-resultado:hover {
                background: rgba(255,255,255,0.05);
            }
            .m-reply-bar {
                display: none;
                padding: 4px 12px;
                border-top: 1px solid rgba(255,255,255,0.08);
                background: rgba(0,0,0,0.2);
                font-size: 0.75rem;
                color: var(--text-secondary);
                align-items: center;
            }
            .m-reply-bar.visible {
                display: flex;
            }
            #m-file-input {
                display: none;
            }
            @media (max-width: 480px) {
                .m-ventana { width: 290px; height: 420px; right: -5px; }
                .m-burbuja { width: 54px; height: 54px; font-size: 1.4rem; }
                .m-header-actions button { font-size: 0.8rem; padding: 2px 6px; }
                .m-header-actions .m-saldo { font-size: 0.55rem; }
                .m-stickers-popup { max-width: 240px; right: 0; }
                .m-buscar-popup { min-width: 200px; right: 0; }
            }
        `;
        document.head.appendChild(style);

        // ===== REFERENCIAS =====
        const bubble = document.getElementById('m-burbuja');
        const windowEl = document.getElementById('m-ventana');
        const closeBtn = document.getElementById('m-cerrar');
        const sendBtn = document.getElementById('m-btn-enviar');
        const input = document.getElementById('m-input');
        const messages = document.getElementById('m-mensajes');
        const emojiBtn = document.getElementById('m-btn-emoji');
        const attachBtn = document.getElementById('m-btn-adjuntar');
        const callBtn = document.getElementById('m-btn-llamada');
        const videoBtn = document.getElementById('m-btn-video');
        const stickerBtn = document.getElementById('m-btn-stickers');
        const buscarBtn = document.getElementById('m-btn-buscar');
        const saldoEl = document.getElementById('m-saldo');
        const typingIndicator = document.getElementById('m-typing-indicator');
        const typingText = document.getElementById('m-typing-text');
        const replyBar = document.getElementById('m-reply-bar');
        const replyText = document.getElementById('m-reply-text');

        // ================================================================
        // ===== DRAG & DROP =====
        // ================================================================
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

        // ================================================================
        // ===== ABRIR/CERRAR VENTANA =====
        // ================================================================
        bubble.addEventListener('click', () => {
            if (this.hasMoved) {
                this.hasMoved = false;
                return;
            }
            this.expandido = !this.expandido;
            windowEl.classList.toggle('abierta', this.expandido);
            if (this.expandido) {
                Engine.marcarComoLeido();
                this.cargarMensajes();
                this.cargarSaldo();
                document.querySelector('.m-notificacion').style.display = 'none';
                input.focus();
            }
        });

        closeBtn.addEventListener('click', () => {
            this.expandido = false;
            windowEl.classList.remove('abierta');
        });

        // ================================================================
        // ===== ENVIAR MENSAJE =====
        // ================================================================
        sendBtn.addEventListener('click', () => this.enviarMensaje(input));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.enviarMensaje(input);
            
            // Indicador "escribiendo..."
            if (e.target.value.length > 0) {
                this.enviarTypingIndicator();
            }
        });

        // ================================================================
        // ===== EMOJIS =====
        // ================================================================
        const emojis = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '✨', '🌟', '💪', '🤗', '😍', '🥳', '🤔', '👀', '💯'];
        let emojiPopup = null;

        emojiBtn.addEventListener('click', () => {
            if (!emojiPopup) {
                emojiPopup = document.createElement('div');
                emojiPopup.className = 'm-emojis-popup';
                emojis.forEach(e => {
                    const span = document.createElement('span');
                    span.textContent = e;
                    span.addEventListener('click', () => {
                        input.value += e;
                        input.focus();
                        emojiPopup.classList.remove('abierto');
                    });
                    emojiPopup.appendChild(span);
                });
                document.querySelector('.m-ventana').appendChild(emojiPopup);
            }
            emojiPopup.classList.toggle('abierto');
        });

        // ================================================================
        // ===== ADJUNTAR ARCHIVO =====
        // ================================================================
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'm-file-input';
        fileInput.accept = 'image/*,video/*';
        fileInput.multiple = false;
        document.querySelector('.m-ventana').appendChild(fileInput);

        attachBtn.addEventListener('click', () => {
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

        // ================================================================
        // ===== LLAMADAS =====
        // ================================================================
        callBtn.addEventListener('click', () => {
            if (Engine.estaEnLlamada()) {
                Engine.terminarLlamada();
                callBtn.textContent = '📞';
                callBtn.title = 'Llamada de voz';
            } else {
                const targetUser = prompt('ID del usuario para llamar:');
                if (targetUser) {
                    Engine.iniciarLlamada(targetUser, { video: false });
                    callBtn.textContent = '🔴';
                    callBtn.title = 'Terminar llamada';
                }
            }
        });

        videoBtn.addEventListener('click', () => {
            if (Engine.estaEnLlamada()) {
                Engine.terminarLlamada();
                videoBtn.textContent = '📹';
                videoBtn.title = 'Videollamada';
            } else {
                const targetUser = prompt('ID del usuario para videollamar:');
                if (targetUser) {
                    Engine.iniciarLlamada(targetUser, { video: true });
                    videoBtn.textContent = '🔴';
                    videoBtn.title = 'Terminar videollamada';
                }
            }
        });

        // ================================================================
        // ===== HORARIO =====
        // ================================================================
        document.getElementById('m-btn-horario').addEventListener('click', () => {
            alert(Engine.obtenerHorario());
        });

        // ================================================================
        // ===== 🆕 STICKERS CON COMMIT =====
        // ================================================================
        let stickersPopup = null;

        this.cargarStickers();

        stickerBtn.addEventListener('click', () => {
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

        // ================================================================
        // ===== 🆕 BUSCAR MENSAJES =====
        // ================================================================
        let buscarPopup = null;

        buscarBtn.addEventListener('click', () => {
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

        // ================================================================
        // ===== ESCUCHAR MENSAJES EN TIEMPO REAL =====
        // ================================================================
        Engine.recibirMensajes((mensajes) => {
            this.mensajes = mensajes;
            this.renderizarMensajes();
            this.actualizarSaldo();
            this.actualizarNotificaciones();
        });

        // ================================================================
        // ===== INICIALIZAR =====
        // ================================================================
        this.cargarMensajes();
        this.detectarColisiones(container);
        this.cargarSaldo();

        console.log('🧠 Marquinhos UI v3.0 — Chat Avanzado');
        console.log('📨 Estados de mensaje: enviando → enviado → recibido → leído');
        console.log('🔍 Búsqueda en tiempo real');
        console.log('✏️ Editar y eliminar mensajes');
        console.log('💬 Responder mensajes específicos');
        console.log('🔄 Indicador "escribiendo..."');
    }

    // ================================================================
    // ===== MÉTODOS DE ARRASTRE =====
    // ================================================================
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

    detectarColisiones(container) {
        const bubble = document.getElementById('m-burbuja');
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
    // ===== SALDO COMMIT =====
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
    // ===== STICKERS =====
    // ================================================================
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
    // ===== 🆕 BUSCAR MENSAJES =====
    // ================================================================
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
        // Cerrar popup de búsqueda
        const popup = document.getElementById('m-buscar-popup');
        if (popup) popup.classList.remove('abierto');
        
        // Buscar y scroll al mensaje
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
    // ===== 🆕 INDICADOR "ESCRIBIENDO..." =====
    // ================================================================
    enviarTypingIndicator() {
        const userId = Engine.obtenerUserId ? Engine.obtenerUserId() : 'usuario_default';
        
        // Mostrar localmente
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
        
        // Enviar a otros usuarios
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
    // ===== 🆕 RESPONDER MENSAJE =====
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
    // ===== 🆕 EDITAR MENSAJE =====
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

    // ================================================================
    // ===== 🆕 ELIMINAR MENSAJE =====
    // ================================================================
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
    // ===== MENSAJES =====
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

        // Mantener el indicador de typing
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

            // Si está eliminado
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
            
            // Renderizar según tipo
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

            // Estado del mensaje
            const estadoMap = {
                'enviando': '<span class="m-estado enviando">⏳ Enviando...</span>',
                'enviado': '<span class="m-estado enviado">✅ Enviado</span>',
                'recibido': '<span class="m-estado recibido">📩 Recibido</span>',
                'leido': '<span class="m-estado leido">👁️ Leído</span>',
                'fallido': '<span class="m-estado fallido">❌ Fallido</span>'
            };
            const estadoHTML = estadoMap[estado] || '';

            // Mensaje de respuesta
            let respuestaHTML = '';
            if (esRespuesta) {
                const textoRespondido = typeof esRespuesta === 'string' ? esRespuesta : 'Mensaje';
                respuestaHTML = `
                    <div class="m-responder-a" onclick="window.marquinhosUI?.scrollToMensaje('${m.responder_a || m.extra?.responder_a}')">
                        ↩️ ${textoRespondido}
                    </div>
                `;
            }

            // Reacciones
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

            // Acciones (hover)
            const accionesHTML = `
                <div class="m-acciones">
                    <button onclick="window.marquinhosUI?.iniciarRespuesta('${m.id}', '${escapeHtml(contenido.substring(0, 30))}')" title="Responder">↩️</button>
                    <button onclick="window.marquinhosUI?.editarMensaje('${m.id}', '${escapeHtml(contenido)}')" title="Editar">✏️</button>
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

        // Restaurar el indicador de typing
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
        // Ocultar indicador de typing
        const typingIndicator = document.getElementById('m-typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }
}

// ================================================================
// FUNCIONES GLOBALES PARA ACCIONES DE MENSAJE
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