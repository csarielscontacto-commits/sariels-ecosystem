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
                        <button class="m-btn-llamada" id="m-btn-llamada" title="Llamada de voz">📞</button>
                        <button class="m-btn-video" id="m-btn-video" title="Videollamada">📹</button>
                        <button class="m-btn-adjuntar" id="m-btn-adjuntar" title="Adjuntar archivo">📎</button>
                        <button class="m-cerrar" id="m-cerrar">✕</button>
                    </div>
                </div>
                <div class="m-mensajes" id="m-mensajes"></div>
                <div class="m-input-area">
                    <button class="m-btn-emoji" id="m-btn-emoji">😊</button>
                    <input type="text" class="m-input" id="m-input" placeholder="Escribe un mensaje...">
                    <button class="m-btn-enviar" id="m-btn-enviar">Enviar</button>
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
            }
            .m-header-actions {
                display: flex;
                gap: 6px;
                align-items: center;
            }
            .m-header-actions button {
                background: none;
                border: none;
                color: #a99c8c;
                cursor: pointer;
                font-size: 1rem;
                padding: 4px 8px;
                border-radius: 6px;
                transition: all 0.3s;
            }
            .m-header-actions button:hover {
                background: rgba(255,255,255,0.05);
                color: #e8e1d8;
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
            }
            .m-mensajes::-webkit-scrollbar { width: 4px; }
            .m-mensajes::-webkit-scrollbar-thumb { background: #f7d44a; border-radius: 2px; }
            .m-mensaje {
                padding: 8px 14px;
                margin-bottom: 6px;
                border-radius: 12px;
                max-width: 85%;
                font-size: 0.85rem;
                line-height: 1.4;
                word-break: break-word;
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
            #m-file-input {
                display: none;
            }
            @media (max-width: 480px) {
                .m-ventana { width: 290px; height: 420px; right: -5px; }
                .m-burbuja { width: 54px; height: 54px; font-size: 1.4rem; }
                .m-header-actions button { font-size: 0.8rem; padding: 2px 6px; }
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

        // ================================================================
        // ===== DRAG & DROP (Mouse) =====
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

        // ================================================================
        // ===== DRAG & DROP (Touch - Móviles) =====
        // ================================================================
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
                document.querySelector('.m-notificacion').style.display = 'none';
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
                // Buscar usuario objetivo (simulado)
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
        // ===== ESCUCHAR MENSAJES EN TIEMPO REAL =====
        // ================================================================
        Engine.recibirMensajes((mensajes) => {
            this.mensajes = mensajes;
            this.renderizarMensajes();
        });

        // ================================================================
        // ===== INICIALIZAR =====
        // ================================================================
        this.cargarMensajes();
        this.detectarColisiones(container);

        console.log('🧠 Marquinhos UI inicializado con plugins completos');
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
    // ===== MENSAJES =====
    // ================================================================
    async cargarMensajes() {
        const contenedor = document.getElementById('m-mensajes');
        if (!contenedor) return;
        
        // Usar Engine.recibirMensajes que ya tiene el callback
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

        contenedor.innerHTML = this.mensajes.map(m => {
            const esBot = m.usuario === 'Marquinhos' || m.user_id === 'Marquinhos';
            const nombre = m.usuario || m.user_id || 'Anónimo';
            const contenido = m.content || m.texto || '';
            const tipo = m.type || 'text';
            const reacciones = m.reacciones || [];

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
            } else if (tipo === 'emoji') {
                contenidoHTML = `<span style="font-size:2rem;">${contenido}</span>`;
            } else {
                contenidoHTML = contenido;
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

            return `
                <div class="m-mensaje ${esBot ? 'bot' : 'usuario'}" data-id="${m.id || m._id}">
                    <div class="m-usuario">${esBot ? '🧠 Marquinhos' : nombre}</div>
                    ${contenidoHTML}
                    ${reaccionesHTML}
                </div>
            `;
        }).join('');

        contenedor.scrollTop = contenedor.scrollHeight;
    }

    enviarMensaje(input) {
        if (!input.value.trim()) return;
        Engine.enviarMensaje(input.value);
        input.value = '';
        // El mensaje se actualizará automáticamente via Realtime
    }
}