// ================================================================
// 🔘 BUTTON - CSARIEL'S ECOSYSTEM
// ================================================================
// Componente de botón reutilizable para todo el ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// 📦 TIPOS DE BOTONES
// ================================================================

export const BUTTON_VARIANTS = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    OUTLINE: 'outline',
    GHOST: 'ghost',
    GOLD: 'gold',
    DANGER: 'danger',
    SUCCESS: 'success',
    WARNING: 'warning',
    LIVE: 'live',
    TRADING: 'trading',
    INTERNET: 'internet',
    TIENDA: 'tienda',
    WALLET: 'wallet'
};

export const BUTTON_SIZES = {
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
    XL: 'xl'
};

// ================================================================
// 🔘 CLASE PRINCIPAL DEL BOTÓN
// ================================================================

class Button {
    constructor(options = {}) {
        this.text = options.text || 'Botón';
        this.variant = options.variant || BUTTON_VARIANTS.PRIMARY;
        this.size = options.size || BUTTON_SIZES.MD;
        this.icon = options.icon || null;
        this.iconPosition = options.iconPosition || 'left'; // 'left' | 'right'
        this.disabled = options.disabled || false;
        this.loading = options.loading || false;
        this.fullWidth = options.fullWidth || false;
        this.className = options.className || '';
        this.id = options.id || `btn-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        this.onClick = options.onClick || null;
        this.href = options.href || null;
        this.target = options.target || '_self';
        this.type = options.type || 'button'; // 'button' | 'submit' | 'reset'
        this.dataAttributes = options.dataAttributes || {};
        this.tooltip = options.tooltip || null;
        
        this.element = null;
    }

    // ================================================================
    # 🎨 OBTENER CLASES CSS
    // ================================================================

    getClasses() {
        const classes = ['btn'];
        
        // Variante
        if (this.variant) {
            classes.push(`btn-${this.variant}`);
        }
        
        // Tamaño
        if (this.size) {
            classes.push(`btn-${this.size}`);
        }
        
        // Estado
        if (this.disabled) {
            classes.push('btn-disabled');
        }
        if (this.loading) {
            classes.push('btn-loading');
        }
        if (this.fullWidth) {
            classes.push('btn-full-width');
        }
        
        // Clase personalizada
        if (this.className) {
            classes.push(this.className);
        }
        
        return classes.join(' ');
    }

    // ================================================================
    # 📦 RENDERIZAR ICONO
    // ================================================================

    renderIcon() {
        if (!this.icon) return '';
        
        const iconClass = this.icon.startsWith('fa-') ? `fas ${this.icon}` : this.icon;
        return `<i class="${iconClass}"></i>`;
    }

    // ================================================================
    # 🖥️ RENDERIZAR BOTÓN
    // ================================================================

    render() {
        const iconHtml = this.renderIcon();
        const textHtml = this.loading ? '<span class="btn-spinner"></span>' : this.text;
        
        // Ordenar icono y texto según posición
        let content = '';
        if (this.iconPosition === 'left') {
            content = `${iconHtml} ${textHtml}`;
        } else {
            content = `${textHtml} ${iconHtml}`;
        }
        
        // Crear elemento
        const tag = this.href ? 'a' : 'button';
        this.element = document.createElement(tag);
        
        // Clases
        this.element.className = this.getClasses();
        
        // ID
        if (this.id) {
            this.element.id = this.id;
        }
        
        // Atributos
        if (this.href) {
            this.element.href = this.href;
            this.element.target = this.target;
        } else {
            this.element.type = this.type;
        }
        
        if (this.disabled) {
            this.element.disabled = true;
        }
        
        if (this.tooltip) {
            this.element.title = this.tooltip;
        }
        
        // Data attributes
        for (const [key, value] of Object.entries(this.dataAttributes)) {
            this.element.dataset[key] = value;
        }
        
        // Contenido
        this.element.innerHTML = content;
        
        // Evento click
        if (this.onClick && typeof this.onClick === 'function') {
            this.element.addEventListener('click', (e) => {
                if (!this.disabled && !this.loading) {
                    this.onClick(e);
                }
            });
        }
        
        return this.element;
    }

    // ================================================================
    # 🔄 MÉTODOS PÚBLICOS
    // ================================================================

    setText(text) {
        this.text = text;
        this.update();
        return this;
    }

    setLoading(loading) {
        this.loading = loading;
        this.update();
        return this;
    }

    setDisabled(disabled) {
        this.disabled = disabled;
        this.update();
        return this;
    }

    setVariant(variant) {
        this.variant = variant;
        this.update();
        return this;
    }

    update() {
        if (!this.element) return;
        
        // Actualizar clases
        this.element.className = this.getClasses();
        
        // Actualizar contenido
        const iconHtml = this.renderIcon();
        const textHtml = this.loading ? '<span class="btn-spinner"></span>' : this.text;
        
        let content = '';
        if (this.iconPosition === 'left') {
            content = `${iconHtml} ${textHtml}`;
        } else {
            content = `${textHtml} ${iconHtml}`;
        }
        
        this.element.innerHTML = content;
        
        // Actualizar disabled
        if (this.href) {
            // Los enlaces no tienen disabled
        } else {
            this.element.disabled = this.disabled;
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

// ================================================================
# 🔘 FUNCIONES DE AYUDA
// ================================================================

/**
 * Crea un botón rápidamente
 * @param {Object} options - Opciones del botón
 * @returns {Button} Instancia del botón
 */
export function createButton(options) {
    return new Button(options);
}

/**
 * Crea un botón y lo añade al DOM
 * @param {string|HTMLElement} container - Contenedor donde añadir el botón
 * @param {Object} options - Opciones del botón
 * @returns {Button} Instancia del botón
 */
export function createAndAppendButton(container, options) {
    const button = new Button(options);
    const element = button.render();
    
    const containerEl = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    
    if (containerEl) {
        containerEl.appendChild(element);
    }
    
    return button;
}

/**
 * Crea un botón con estilo Gold (para cosas premium)
 */
export function createGoldButton(text, onClick) {
    return new Button({
        text,
        variant: BUTTON_VARIANTS.GOLD,
        size: BUTTON_SIZES.MD,
        icon: 'fa-crown',
        onClick
    });
}

/**
 * Crea un botón Live (para transmisiones)
 */
export function createLiveButton(text, onClick) {
    return new Button({
        text,
        variant: BUTTON_VARIANTS.LIVE,
        size: BUTTON_SIZES.MD,
        icon: 'fa-circle',
        onClick
    });
}

/**
 * Crea un botón de Trading
 */
export function createTradingButton(text, onClick) {
    return new Button({
        text,
        variant: BUTTON_VARIANTS.TRADING,
        size: BUTTON_SIZES.MD,
        icon: 'fa-chart-line',
        onClick
    });
}

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    Button,
    BUTTON_VARIANTS,
    BUTTON_SIZES,
    createButton,
    createAndAppendButton,
    createGoldButton,
    createLiveButton,
    createTradingButton
};

console.log('🔘 Button componente cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');