// ================================================================
// 🪟 MODAL - CSARIEL'S ECOSYSTEM
// ================================================================
// Componente de modal reutilizable para todo el ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// 📦 TIPOS DE MODALES
// ================================================================

export const MODAL_VARIANTS = {
    DEFAULT: 'default',
    GOLD: 'gold',
    DARK: 'dark',
    GLASS: 'glass',
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

export const MODAL_SIZES = {
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
    XL: 'xl',
    FULL: 'full'
};

// ================================================================
// 🪟 CLASE PRINCIPAL DEL MODAL
// ================================================================

class Modal {
    constructor(options = {}) {
        this.title = options.title || 'Modal';
        this.content = options.content || '';
        this.variant = options.variant || MODAL_VARIANTS.DEFAULT;
        this.size = options.size || MODAL_SIZES.MD;
        this.className = options.className || '';
        this.id = options.id || `modal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        this.closable = options.closable !== undefined ? options.closable : true;
        this.closeOnOverlay = options.closeOnOverlay !== undefined ? options.closeOnOverlay : true;
        this.closeOnEscape = options.closeOnEscape !== undefined ? options.closeOnEscape : true;
        this.centered = options.centered !== undefined ? options.centered : true;
        this.animation = options.animation || 'fade'; // 'fade' | 'slide' | 'zoom' | 'none'
        this.buttons = options.buttons || [];
        this.footer = options.footer || null;
        this.header = options.header || null;
        this.onOpen = options.onOpen || null;
        this.onClose = options.onClose || null;
        this.onConfirm = options.onConfirm || null;
        this.onCancel = options.onCancel || null;
        this.confirmText = options.confirmText || 'Confirmar';
        this.cancelText = options.cancelText || 'Cancelar';
        this.dangerous = options.dangerous || false;
        this.dataAttributes = options.dataAttributes || {};
        this.scrollable = options.scrollable !== undefined ? options.scrollable : true;
        this.width = options.width || null;
        this.maxWidth = options.maxWidth || null;
        
        this.element = null;
        this.overlay = null;
        this.modalContent = null;
        this.isOpen = false;
        this.resolve = null;
        this.reject = null;
    }

    // ================================================================
    # 🎨 OBTENER CLASES CSS
    // ================================================================

    getClasses() {
        const classes = ['modal'];
        
        // Variante
        if (this.variant) {
            classes.push(`modal-${this.variant}`);
        }
        
        // Tamaño
        if (this.size) {
            classes.push(`modal-${this.size}`);
        }
        
        // Animación
        if (this.animation && this.animation !== 'none') {
            classes.push(`modal-animation-${this.animation}`);
        }
        
        // Centrado
        if (this.centered) {
            classes.push('modal-centered');
        }
        
        // Scrollable
        if (this.scrollable) {
            classes.push('modal-scrollable');
        }
        
        // Clase personalizada
        if (this.className) {
            classes.push(this.className);
        }
        
        return classes.join(' ');
    }

    // ================================================================
    # 🖥️ RENDERIZAR MODAL
    // ================================================================

    render() {
        // Crear overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.id = `${this.id}-overlay`;
        
        // Estilo del overlay
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Crear contenido del modal
        this.modalContent = document.createElement('div');
        this.modalContent.className = this.getClasses();
        this.modalContent.id = this.id;
        this.modalContent.style.cssText = `
            position: relative;
            background: #0a1428;
            border-radius: 20px;
            border: 1px solid rgba(212, 175, 55, 0.15);
            max-width: ${this.maxWidth || '600px'};
            width: ${this.width || '100%'};
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
            transform: scale(0.9) translateY(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: 90vh;
            display: flex;
            flex-direction: column;
        `;
        
        // Data attributes
        for (const [key, value] of Object.entries(this.dataAttributes)) {
            this.modalContent.dataset[key] = value;
        }
        
        // Construir contenido
        let html = '';
        
        // Header
        html += this.renderHeader();
        
        // Body
        html += this.renderBody();
        
        // Footer
        html += this.renderFooter();
        
        this.modalContent.innerHTML = html;
        
        // Añadir al overlay
        this.overlay.appendChild(this.modalContent);
        this.element = this.overlay;
        
        // Configurar eventos
        this.setupEvents();
        
        // Aplicar estilos dinámicos según variante
        this.applyVariantStyles();
        
        return this.element;
    }

    // ================================================================
    # 🖥️ RENDERIZAR HEADER
    // ================================================================

    renderHeader() {
        if (this.header) {
            return `<div class="modal-header">${this.header}</div>`;
        }
        
        return `
            <div class="modal-header">
                <h2 class="modal-title">${this.title}</h2>
                ${this.closable ? `<button class="modal-close-btn" aria-label="Cerrar">&times;</button>` : ''}
            </div>
        `;
    }

    // ================================================================
    # 🖥️ RENDERIZAR BODY
    // ================================================================

    renderBody() {
        let content = this.content;
        
        // Si content es un elemento DOM, lo convertimos a string
        if (typeof content !== 'string') {
            content = content.outerHTML || content.innerHTML || '';
        }
        
        return `<div class="modal-body">${content}</div>`;
    }

    // ================================================================
    # 🖥️ RENDERIZAR FOOTER
    // ================================================================

    renderFooter() {
        if (this.footer) {
            return `<div class="modal-footer">${this.footer}</div>`;
        }
        
        if (this.buttons.length > 0) {
            const buttonsHtml = this.buttons.map(btn => {
                const btnClass = btn.variant ? `btn-${btn.variant}` : 'btn-primary';
                const btnSize = btn.size ? `btn-${btn.size}` : 'btn-sm';
                return `<button class="btn ${btnClass} ${btnSize}" data-action="${btn.id || ''}">
                    ${btn.icon ? `<i class="${btn.icon}"></i> ` : ''}${btn.text}
                </button>`;
            }).join('');
            
            return `<div class="modal-footer">${buttonsHtml}</div>`;
        }
        
        // Botones por defecto (Confirmar/Cancelar)
        if (this.onConfirm || this.onCancel) {
            return `
                <div class="modal-footer">
                    ${this.onCancel ? `<button class="btn btn-outline btn-sm" id="${this.id}-cancel">${this.cancelText}</button>` : ''}
                    ${this.onConfirm ? `<button class="btn ${this.dangerous ? 'btn-danger' : 'btn-primary'} btn-sm" id="${this.id}-confirm">${this.confirmText}</button>` : ''}
                </div>
            `;
        }
        
        return '';
    }

    // ================================================================
    # 🎨 APLICAR ESTILOS SEGÚN VARIANTE
    // ================================================================

    applyVariantStyles() {
        if (!this.modalContent) return;
        
        const styles = {
            gold: {
                border: '2px solid #D4AF37',
                boxShadow: '0 0 60px rgba(212, 175, 55, 0.2)'
            },
            success: {
                border: '2px solid #00b894',
                boxShadow: '0 0 60px rgba(0, 184, 148, 0.2)'
            },
            error: {
                border: '2px solid #ff3366',
                boxShadow: '0 0 60px rgba(255, 51, 102, 0.2)'
            },
            warning: {
                border: '2px solid #ffd93d',
                boxShadow: '0 0 60px rgba(255, 217, 61, 0.2)'
            },
            info: {
                border: '2px solid #00d4ff',
                boxShadow: '0 0 60px rgba(0, 212, 255, 0.2)'
            },
            glass: {
                background: 'rgba(10, 20, 40, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }
        };
        
        const style = styles[this.variant];
        if (style) {
            Object.assign(this.modalContent.style, style);
        }
    }

    // ================================================================
    # 🎯 CONFIGURAR EVENTOS
    // ================================================================

    setupEvents() {
        if (!this.element) return;
        
        // Botón de cerrar
        const closeBtn = this.element.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Click en overlay
        if (this.closeOnOverlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }
        
        // Tecla Escape
        if (this.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }
        
        // Botones de acción
        const confirmBtn = this.element.querySelector(`#${this.id}-confirm`);
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.onConfirm) {
                    this.onConfirm(this);
                }
                if (this.resolve) {
                    this.resolve(true);
                }
                this.close();
            });
        }
        
        const cancelBtn = this.element.querySelector(`#${this.id}-cancel`);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (this.onCancel) {
                    this.onCancel(this);
                }
                if (this.resolve) {
                    this.resolve(false);
                }
                this.close();
            });
        }
        
        // Botones personalizados
        this.element.querySelectorAll('.modal-footer .btn[data-action]').forEach(btn => {
            const actionId = btn.dataset.action;
            const action = this.buttons.find(a => a.id === actionId);
            if (action && action.onClick) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    action.onClick(e, this);
                });
            }
        });
    }

    // ================================================================
    # 🔄 MÉTODOS PÚBLICOS
    // ================================================================

    open() {
        if (this.isOpen) return this;
        
        this.isOpen = true;
        
        // Añadir al DOM si no está
        if (!this.element.parentNode) {
            document.body.appendChild(this.element);
        }
        
        // Mostrar
        this.overlay.style.display = 'flex';
        
        // Animar entrada
        setTimeout(() => {
            this.overlay.style.opacity = '1';
            this.modalContent.style.transform = 'scale(1) translateY(0)';
        }, 10);
        
        // Disparar evento
        if (this.onOpen) {
            this.onOpen(this);
        }
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: this } }));
        
        return this;
    }

    close() {
        if (!this.isOpen) return this;
        
        this.isOpen = false;
        
        // Animar salida
        this.overlay.style.opacity = '0';
        this.modalContent.style.transform = 'scale(0.9) translateY(20px)';
        
        // Ocultar después de la animación
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300);
        
        // Disparar evento
        if (this.onClose) {
            this.onClose(this);
        }
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('modal:close', { detail: { modal: this } }));
        
        return this;
    }

    toggle() {
        return this.isOpen ? this.close() : this.open();
    }

    setContent(content) {
        this.content = content;
        const body = this.modalContent?.querySelector('.modal-body');
        if (body) {
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else {
                body.innerHTML = '';
                body.appendChild(content);
            }
        }
        return this;
    }

    setTitle(title) {
        this.title = title;
        const titleEl = this.modalContent?.querySelector('.modal-title');
        if (titleEl) {
            titleEl.textContent = title;
        }
        return this;
    }

    destroy() {
        this.close();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.overlay = null;
        this.modalContent = null;
        this.isOpen = false;
        return this;
    }

    // ================================================================
    # 📋 MÉTODO PROMISE (para usar con async/await)
    // ================================================================

    show() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.open();
        });
    }
}

// ================================================================
# 🪟 FUNCIONES DE AYUDA
// ================================================================

/**
 * Crea un modal rápidamente
 * @param {Object} options - Opciones del modal
 * @returns {Modal} Instancia del modal
 */
export function createModal(options) {
    return new Modal(options);
}

/**
 * Crea un modal y lo abre inmediatamente
 * @param {Object} options - Opciones del modal
 * @returns {Modal} Instancia del modal
 */
export function openModal(options) {
    const modal = new Modal(options);
    modal.render();
    modal.open();
    return modal;
}

/**
 * Crea un modal de confirmación
 * @param {string} message - Mensaje de confirmación
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<boolean>} Promise que resuelve con true/false
 */
export function confirmModal(message, options = {}) {
    return new Promise((resolve) => {
        const modal = new Modal({
            title: options.title || 'Confirmar',
            content: message,
            variant: options.variant || MODAL_VARIANTS.WARNING,
            confirmText: options.confirmText || 'Aceptar',
            cancelText: options.cancelText || 'Cancelar',
            dangerous: options.dangerous || false,
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
            onClose: () => resolve(false),
            ...options
        });
        
        modal.render();
        modal.open();
    });
}

/**
 * Crea un modal de alerta
 * @param {string} message - Mensaje de alerta
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<void>}
 */
export function alertModal(message, options = {}) {
    return new Promise((resolve) => {
        const modal = new Modal({
            title: options.title || 'Aviso',
            content: message,
            variant: options.variant || MODAL_VARIANTS.INFO,
            confirmText: 'Entendido',
            onConfirm: () => resolve(),
            onClose: () => resolve(),
            ...options
        });
        
        modal.render();
        modal.open();
    });
}

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    Modal,
    MODAL_VARIANTS,
    MODAL_SIZES,
    createModal,
    openModal,
    confirmModal,
    alertModal
};

console.log('🪟 Modal componente cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');