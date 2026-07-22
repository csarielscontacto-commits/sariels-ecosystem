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

        // Estilos