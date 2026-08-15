// ================================================================
// 🃏 CARD - CSARIEL'S ECOSYSTEM
// ================================================================
// Componente de tarjeta reutilizable para todo el ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// 📦 TIPOS DE TARJETAS
// ================================================================

export const CARD_VARIANTS = {
    DEFAULT: 'default',
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    GOLD: 'gold',
    DARK: 'dark',
    GLASS: 'glass',
    BORDER: 'border',
    GRADIENT: 'gradient'
};

export const CARD_SIZES = {
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
    XL: 'xl',
    FULL: 'full'
};

// ================================================================
// 🃏 CLASE PRINCIPAL DE LA TARJETA
// ================================================================

class Card {
    constructor(options = {}) {
        this.title = options.title || null;
        this.subtitle = options.subtitle || null;
        this.content = options.content || '';
        this.variant = options.variant || CARD_VARIANTS.DEFAULT;
        this.size = options.size || CARD_SIZES.MD;
        this.className = options.className || '';
        this.id = options.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        this.padding = options.padding !== undefined ? options.padding : true;
        this.border = options.border !== undefined ? options.border : true;
        this.shadow = options.shadow !== undefined ? options.shadow : true;
        this.hoverable = options.hoverable || false;
        this.clickable = options.clickable || false;
        this.onClick = options.onClick || null;
        this.header = options.header || null;
        this.footer = options.footer || null;
        this.image = options.image || null;
        this.imagePosition = options.imagePosition || 'top'; // 'top' | 'bottom' | 'left' | 'right'
        this.badge = options.badge || null;
        this.badgeColor = options.badgeColor || 'gold';
        this.actions = options.actions || [];
        this.loading = options.loading || false;
        this.dataAttributes = options.dataAttributes || {};
        
        this.element = null;
        this.headerElement = null;
        this.bodyElement = null;
        this.footerElement = null;
    }

    // ================================================================
    # 🎨 OBTENER CLASES CSS
    // ================================================================

    getClasses() {
        const classes = ['card'];
        
        // Variante
        if (this.variant) {
            classes.push(`card-${this.variant}`);
        }
        
        // Tamaño
        if (this.size) {
            classes.push(`card-${this.size}`);
        }
        
        // Estado
        if (this.hoverable) {
            classes.push('card-hoverable');
        }
        if (this.clickable) {
            classes.push('card-clickable');
        }
        if (this.loading) {
            classes.push('card-loading');
        }
        if (!this.padding) {
            classes.push('card-no-padding');
        }
        if (!this.border) {
            classes.push('card-no-border');
        }
        if (!this.shadow) {
            classes.push('card-no-shadow');
        }
        
        // Clase personalizada
        if (this.className) {
            classes.push(this.className);
        }
        
        return classes.join(' ');
    }

    // ================================================================
    # 🖥️ RENDERIZAR BADGE
    // ================================================================

    renderBadge() {
        if (!this.badge) return '';
        return `<span class="card-badge card-badge-${this.badgeColor}">${this.badge}</span>`;
    }

    // ================================================================
    # 🖥️ RENDERIZAR IMAGEN
    // ================================================================

    renderImage() {
        if (!this.image) return '';
        
        const positionClass = `card-image-${this.imagePosition}`;
        return `<div class="card-image ${positionClass}">
            <img src="${this.image}" alt="${this.title || 'Card image'}" loading="lazy">
        </div>`;
    }

    // ================================================================
    # 🖥️ RENDERIZAR HEADER
    // ================================================================

    renderHeader() {
        if (this.header) {
            return `<div class="card-header">${this.header}</div>`;
        }
        
        if (!this.title && !this.subtitle) return '';
        
        return `
            <div class="card-header">
                ${this.title ? `<h3 class="card-title">${this.title}</h3>` : ''}
                ${this.subtitle ? `<p class="card-subtitle">${this.subtitle}</p>` : ''}
                ${this.renderBadge()}
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
        
        return `<div class="card-body">${content}</div>`;
    }

    // ================================================================
    # 🖥️ RENDERIZAR FOOTER
    // ================================================================

    renderFooter() {
        if (this.footer) {
            return `<div class="card-footer">${this.footer}</div>`;
        }
        
        if (this.actions.length === 0) return '';
        
        const actionsHtml = this.actions.map(action => {
            const btnClass = action.variant ? `btn-${action.variant}` : 'btn-primary';
            const btnSize = action.size ? `btn-${action.size}` : 'btn-sm';
            return `<button class="btn ${btnClass} ${btnSize}" ${action.onClick ? `data-action="${action.id || ''}"` : ''}>
                ${action.icon ? `<i class="${action.icon}"></i> ` : ''}${action.text}
            </button>`;
        }).join('');
        
        return `<div class="card-footer">${actionsHtml}</div>`;
    }

    // ================================================================
    # 🖥️ RENDERIZAR TARJETA COMPLETA
    // ================================================================

    render() {
        // Crear elemento contenedor
        this.element = document.createElement('div');
        this.element.className = this.getClasses();
        this.element.id = this.id;
        
        // Data attributes
        for (const [key, value] of Object.entries(this.dataAttributes)) {
            this.element.dataset[key] = value;
        }
        
        // Evento click
        if (this.clickable && this.onClick) {
            this.element.addEventListener('click', (e) => {
                // Evitar clics en elementos interactivos dentro de la tarjeta
                if (e.target.closest('button, a, input, select, textarea')) {
                    return;
                }
                this.onClick(e);
            });
        }
        
        // Construir contenido
        const imageTop = this.image && this.imagePosition === 'top';
        const imageBottom = this.image && this.imagePosition === 'bottom';
        const imageLeft = this.image && this.imagePosition === 'left';
        const imageRight = this.image && this.imagePosition === 'right';
        
        let html = '';
        
        // Imagen arriba
        if (imageTop) {
            html += this.renderImage();
        }
        
        // Header
        html += this.renderHeader();
        
        // Body
        html += this.renderBody();
        
        // Footer
        html += this.renderFooter();
        
        // Imagen abajo
        if (imageBottom) {
            html += this.renderImage();
        }
        
        // Imagen izquierda o derecha (layout especial)
        if (imageLeft || imageRight) {
            // Si hay imagen lateral, reestructurar
            const bodyContent = this.renderBody();
            const headerContent = this.renderHeader();
            const footerContent = this.renderFooter();
            const imageContent = this.renderImage();
            
            const side = imageLeft ? 'left' : 'right';
            html = `
                <div class="card-layout-${side}">
                    ${imageLeft ? imageContent : ''}
                    <div class="card-content">
                        ${headerContent}
                        ${bodyContent}
                        ${footerContent}
                    </div>
                    ${imageRight ? imageContent : ''}
                </div>
            `;
        }
        
        this.element.innerHTML = html;
        
        // Guardar referencias a elementos internos
        this.headerElement = this.element.querySelector('.card-header');
        this.bodyElement = this.element.querySelector('.card-body');
        this.footerElement = this.element.querySelector('.card-footer');
        
        // Configurar eventos de acciones
        if (this.actions.length > 0) {
            this.element.querySelectorAll('.card-footer .btn[data-action]').forEach(btn => {
                const actionId = btn.dataset.action;
                const action = this.actions.find(a => a.id === actionId);
                if (action && action.onClick) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        action.onClick(e, this);
                    });
                }
            });
        }
        
        return this.element;
    }

    // ================================================================
    # 🔄 MÉTODOS PÚBLICOS
    // ================================================================

    setContent(content) {
        this.content = content;
        this.updateBody();
        return this;
    }

    setTitle(title) {
        this.title = title;
        this.updateHeader();
        return this;
    }

    setSubtitle(subtitle) {
        this.subtitle = subtitle;
        this.updateHeader();
        return this;
    }

    setBadge(badge, color = 'gold') {
        this.badge = badge;
        this.badgeColor = color;
        this.updateHeader();
        return this;
    }

    setLoading(loading) {
        this.loading = loading;
        this.element?.classList.toggle('card-loading', loading);
        return this;
    }

    updateHeader() {
        if (!this.headerElement) return;
        const newHeader = this.renderHeader();
        this.headerElement.outerHTML = newHeader;
        this.headerElement = this.element.querySelector('.card-header');
    }

    updateBody() {
        if (!this.bodyElement) return;
        const newBody = this.renderBody();
        this.bodyElement.outerHTML = newBody;
        this.bodyElement = this.element.querySelector('.card-body');
    }

    updateFooter() {
        if (!this.footerElement) return;
        const newFooter = this.renderFooter();
        this.footerElement.outerHTML = newFooter;
        this.footerElement = this.element.querySelector('.card-footer');
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.headerElement = null;
        this.bodyElement = null;
        this.footerElement = null;
    }
}

// ================================================================
# 🃏 FUNCIONES DE AYUDA
// ================================================================

/**
 * Crea una tarjeta rápidamente
 * @param {Object} options - Opciones de la tarjeta
 * @returns {Card} Instancia de la tarjeta
 */
export function createCard(options) {
    return new Card(options);
}

/**
 * Crea una tarjeta y la añade al DOM
 * @param {string|HTMLElement} container - Contenedor donde añadir la tarjeta
 * @param {Object} options - Opciones de la tarjeta
 * @returns {Card} Instancia de la tarjeta
 */
export function createAndAppendCard(container, options) {
    const card = new Card(options);
    const element = card.render();
    
    const containerEl = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    
    if (containerEl) {
        containerEl.appendChild(element);
    }
    
    return card;
}

/**
 * Crea una tarjeta Gold (para cosas premium)
 */
export function createGoldCard(title, content, badge = '⭐ Premium') {
    return new Card({
        title,
        content,
        variant: CARD_VARIANTS.GOLD,
        badge,
        badgeColor: 'gold',
        shadow: true,
        hoverable: true
    });
}

/**
 * Crea una tarjeta de perfil
 */
export function createProfileCard(user, options = {}) {
    return new Card({
        title: user.nombre || user.username || 'Usuario',
        subtitle: user.email || user.bio || '',
        image: user.avatar || null,
        variant: CARD_VARIANTS.GLASS,
        hoverable: true,
        ...options
    });
}

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    Card,
    CARD_VARIANTS,
    CARD_SIZES,
    createCard,
    createAndAppendCard,
    createGoldCard,
    createProfileCard
};

console.log('🃏 Card componente cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');