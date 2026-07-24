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
        this.init();
    }

    init() {
        // ===== CARGAR POSICIÓN UNA SOLA VEZ =====
        const posGuardada = this.cargarPosicion();

        document.documentElement.style.setProperty('--m-primary', this.config.theme.primary);
        document.documentElement.style.setProperty('--m-blur', this.config.theme.blur);
        document.documentElement.style.setProperty('--m-width', this.config.ui.width);
        document.documentElement.style.setProperty('--m-height', this.config.ui.height);
        document.documentElement.style.setProperty('--m-glass', this.config.theme.glass);

        // Crear contenedor
        const container = document.createElement('div');
        container.id = 'marquinhos-container';
        container.innerHTML = `
            <div class="m-burbuja">
                <span class="m-icono">🧠</span>
                <span class="m-notificacion" style="display:none;">●</span>
            </div>
            <div class="m-ventana">
                <div class="m-header">
                    <span class="m-titulo">🧠 Marquinhos</span>
                    <button class="m-cerrar">✕</button>
                </div>
                <div class="m-mensajes"></div>
                <div class="m-input-area">
                    <input type="text" class="m-input" placeholder="Escribe un mensaje...">
                    <button class="m-btn-enviar">Enviar</button>
                </div>
                <button class="m-btn-horario">Ver horario</button>
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
            .m-input-area {
                display: flex;
                gap: 8px;
                padding-top: 10px;
                border-top: 1px solid rgba(255,255,255,0.08);
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
            }
            .m-btn-enviar:hover, .m-btn-horario:hover { transform: scale(1.05); }
            .m-btn-horario {
                margin-top: 8px;
                width: 100%;
            }
            @media (max-width: 480px) {
                .m-ventana { width: 290px; height: 420px; right: -5px; }
                .m-burbuja { width: 54px; height: 54px; font-size: 1.4rem; }
            }
        `;
        document.head.appendChild(style);

        // ===== REFERENCIAS =====
        const bubble = container.querySelector('.m-burbuja');
        const windowEl = container.querySelector('.m-ventana');
        const closeBtn = container.querySelector('.m-cerrar');
        const sendBtn = container.querySelector('.m-btn-enviar');
        const input = container.querySelector('.m-input');
        const messages = container.querySelector('.m-mensajes');

        // ===== DRAG (Mouse) =====
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

        // ===== DRAG (Touch) =====
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

        // ===== Toggle ventana (solo si no hubo arrastre) =====
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
                container.querySelector('.m-notificacion').style.display = 'none';
            }
        });

        // ===== Cerrar ventana =====
        closeBtn.addEventListener('click', () => {
            this.expandido = false;
            windowEl.classList.remove('abierta');
        });

        // ===== Enviar mensaje =====
        sendBtn.addEventListener('click', () => this.enviarMensaje(input, messages));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.enviarMensaje(input, messages);
        });

        // ===== Horario =====
        container.querySelector('.m-btn-horario').addEventListener('click', () => {
            alert(Engine.obtenerHorario());
        });

        // ===== Cargar mensajes iniciales =====
        this.cargarMensajes();
        this.detectarColisiones(container);
    }

    // ===== MÉTODOS DE ARRASTRE =====
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

    // ===== DETECTAR COLISIONES =====
    detectarColisiones(container) {
        const bubble = container.querySelector('.m-burbuja');
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

    // ===== MENSAJES =====
    async cargarMensajes() {
        const contenedor = document.querySelector('.m-mensajes');
        if (!contenedor) return;
        await Engine.recibirMensajes((mensajes) => {
            contenedor.innerHTML = mensajes.map(m => `
                <div class="m-mensaje ${m.usuario === 'Marquinhos' ? 'bot' : 'usuario'}">
                    <div class="m-usuario">${m.usuario}</div>
                    ${m.texto}
                </div>
            `).join('');
            contenedor.scrollTop = contenedor.scrollHeight;
        });
    }

    enviarMensaje(input, messages) {
        if (!input.value.trim()) return;
        Engine.enviarMensaje(input.value);
        input.value = '';
        this.cargarMensajes();
    }
}