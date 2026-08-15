// ================================================================
// 📝 INPUT - CSARIEL'S ECOSYSTEM
// ================================================================
// Componente de input reutilizable para todo el ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// 📦 TIPOS DE INPUTS
// ================================================================

export const INPUT_TYPES = {
    TEXT: 'text',
    EMAIL: 'email',
    PASSWORD: 'password',
    NUMBER: 'number',
    TEL: 'tel',
    URL: 'url',
    SEARCH: 'search',
    DATE: 'date',
    DATETIME: 'datetime-local',
    TIME: 'time',
    MONTH: 'month',
    WEEK: 'week',
    COLOR: 'color',
    RANGE: 'range',
    FILE: 'file',
    TEXTAREA: 'textarea',
    SELECT: 'select'
};

export const INPUT_SIZES = {
    SM: 'sm',
    MD: 'md',
    LG: 'lg'
};

export const INPUT_VARIANTS = {
    DEFAULT: 'default',
    GOLD: 'gold',
    DARK: 'dark',
    GLASS: 'glass',
    SUCCESS: 'success',
    ERROR: 'error'
};

// ================================================================
// 📝 CLASE PRINCIPAL DEL INPUT
// ================================================================

class Input {
    constructor(options = {}) {
        this.type = options.type || INPUT_TYPES.TEXT;
        this.name = options.name || `input-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        this.id = options.id || this.name;
        this.label = options.label || null;
        this.placeholder = options.placeholder || '';
        this.value = options.value || '';
        this.defaultValue = options.defaultValue || '';
        this.required = options.required || false;
        this.disabled = options.disabled || false;
        this.readonly = options.readonly || false;
        this.size = options.size || INPUT_SIZES.MD;
        this.variant = options.variant || INPUT_VARIANTS.DEFAULT;
        this.className = options.className || '';
        this.helpText = options.helpText || null;
        this.error = options.error || null;
        this.success = options.success || null;
        this.icon = options.icon || null;
        this.iconPosition = options.iconPosition || 'left';
        this.min = options.min || null;
        this.max = options.max || null;
        this.step = options.step || null;
        this.minLength = options.minLength || null;
        this.maxLength = options.maxLength || null;
        this.pattern = options.pattern || null;
        this.autocomplete = options.autocomplete || 'off';
        this.autofocus = options.autofocus || false;
        this.rows = options.rows || 4;
        this.cols = options.cols || 50;
        this.options = options.options || []; // Para select
        this.multiple = options.multiple || false;
        this.accept = options.accept || null; // Para file
        this.onChange = options.onChange || null;
        this.onInput = options.onInput || null;
        this.onFocus = options.onFocus || null;
        this.onBlur = options.onBlur || null;
        this.onEnter = options.onEnter || null;
        this.dataAttributes = options.dataAttributes || {};
        
        this.element = null;
        this.inputElement = null;
        this.labelElement = null;
        this.helpElement = null;
        this.errorElement = null;
        this.successElement = null;
        this.wrapperElement = null;
        
        this.validateOnChange = options.validateOnChange || false;
        this.validators = options.validators || [];
    }

    // ================================================================
    # 🎨 OBTENER CLASES CSS
    // ================================================================

    getClasses() {
        const classes = ['input-wrapper'];
        
        // Tamaño
        if (this.size) {
            classes.push(`input-${this.size}`);
        }
        
        // Variante
        if (this.variant) {
            classes.push(`input-${this.variant}`);
        }
        
        // Estado
        if (this.error) {
            classes.push('input-error');
        }
        if (this.success) {
            classes.push('input-success');
        }
        if (this.disabled) {
            classes.push('input-disabled');
        }
        if (this.readonly) {
            classes.push('input-readonly');
        }
        
        // Clase personalizada
        if (this.className) {
            classes.push(this.className);
        }
        
        return classes.join(' ');
    }

    // ================================================================
    # 📝 RENDERIZAR INPUT
    // ================================================================

    render() {
        // Crear wrapper
        this.wrapperElement = document.createElement('div');
        this.wrapperElement.className = this.getClasses();
        this.wrapperElement.id = `${this.id}-wrapper`;
        
        // Data attributes
        for (const [key, value] of Object.entries(this.dataAttributes)) {
            this.wrapperElement.dataset[key] = value;
        }
        
        // Label
        if (this.label) {
            this.labelElement = document.createElement('label');
            this.labelElement.className = 'input-label';
            this.labelElement.htmlFor = this.id;
            this.labelElement.textContent = this.label;
            
            if (this.required) {
                const required = document.createElement('span');
                required.className = 'input-required';
                required.textContent = ' *';
                this.labelElement.appendChild(required);
            }
            
            this.wrapperElement.appendChild(this.labelElement);
        }
        
        // Crear input
        this.inputElement = this.createInputElement();
        this.wrapperElement.appendChild(this.inputElement);
        
        // Help text
        if (this.helpText) {
            this.helpElement = document.createElement('div');
            this.helpElement.className = 'input-help';
            this.helpElement.textContent = this.helpText;
            this.wrapperElement.appendChild(this.helpElement);
        }
        
        // Error
        if (this.error) {
            this.errorElement = document.createElement('div');
            this.errorElement.className = 'input-error-message';
            this.errorElement.textContent = this.error;
            this.wrapperElement.appendChild(this.errorElement);
        }
        
        // Success
        if (this.success) {
            this.successElement = document.createElement('div');
            this.successElement.className = 'input-success-message';
            this.successElement.textContent = this.success;
            this.wrapperElement.appendChild(this.successElement);
        }
        
        this.element = this.wrapperElement;
        
        // Configurar eventos
        this.setupEvents();
        
        return this.element;
    }

    // ================================================================
    # 📝 CREAR ELEMENTO INPUT ESPECÍFICO
    // ================================================================

    createInputElement() {
        let element;
        
        if (this.type === INPUT_TYPES.TEXTAREA) {
            element = document.createElement('textarea');
            element.rows = this.rows;
            element.cols = this.cols;
            element.value = this.value || this.defaultValue;
        } else if (this.type === INPUT_TYPES.SELECT) {
            element = document.createElement('select');
            if (this.multiple) {
                element.multiple = true;
            }
            
            // Opción por defecto
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Selecciona una opción...';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            element.appendChild(defaultOption);
            
            // Opciones
            this.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label || opt.text || opt.value;
                if (opt.selected) {
                    option.selected = true;
                }
                if (opt.disabled) {
                    option.disabled = true;
                }
                element.appendChild(option);
            });
        } else {
            element = document.createElement('input');
            element.type = this.type;
            
            // Atributos específicos
            if (this.min !== null) element.min = this.min;
            if (this.max !== null) element.max = this.max;
            if (this.step !== null) element.step = this.step;
            if (this.minLength !== null) element.minLength = this.minLength;
            if (this.maxLength !== null) element.maxLength = this.maxLength;
            if (this.pattern) element.pattern = this.pattern;
            if (this.accept) element.accept = this.accept;
            
            element.value = this.value || this.defaultValue;
        }
        
        // Atributos comunes
        element.id = this.id;
        element.name = this.name;
        element.placeholder = this.placeholder;
        element.required = this.required;
        element.disabled = this.disabled;
        element.readOnly = this.readonly;
        element.autocomplete = this.autocomplete;
        element.autofocus = this.autofocus;
        
        // Clase del input
        element.className = 'input-field';
        
        return element;
    }

    // ================================================================
    # 🎯 CONFIGURAR EVENTOS
    // ================================================================

    setupEvents() {
        if (!this.inputElement) return;
        
        // Change
        if (this.onChange) {
            this.inputElement.addEventListener('change', (e) => {
                this.value = this.inputElement.value;
                this.onChange(e, this);
                if (this.validateOnChange) {
                    this.validate();
                }
            });
        }
        
        // Input
        if (this.onInput) {
            this.inputElement.addEventListener('input', (e) => {
                this.value = this.inputElement.value;
                this.onInput(e, this);
                if (this.validateOnChange) {
                    this.validate();
                }
            });
        }
        
        // Focus
        if (this.onFocus) {
            this.inputElement.addEventListener('focus', (e) => {
                this.onFocus(e, this);
            });
        }
        
        // Blur
        if (this.onBlur) {
            this.inputElement.addEventListener('blur', (e) => {
                this.onBlur(e, this);
                if (this.validateOnChange) {
                    this.validate();
                }
            });
        }
        
        // Enter key
        if (this.onEnter) {
            this.inputElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.onEnter(e, this);
                }
            });
        }
    }

    // ================================================================
    # ✅ VALIDACIÓN
    // ================================================================

    validate() {
        const value = this.getValue();
        const errors = [];
        
        // Validadores personalizados
        for (const validator of this.validators) {
            const result = validator(value, this);
            if (result !== true && typeof result === 'string') {
                errors.push(result);
            } else if (result === false) {
                errors.push('Campo inválido');
            }
        }
        
        // Validación requerida
        if (this.required && !value) {
            errors.push('Este campo es requerido');
        }
        
        // Validación de longitud
        if (this.minLength && value && value.length < this.minLength) {
            errors.push(`Mínimo ${this.minLength} caracteres`);
        }
        if (this.maxLength && value && value.length > this.maxLength) {
            errors.push(`Máximo ${this.maxLength} caracteres`);
        }
        
        // Validación de email
        if (this.type === INPUT_TYPES.EMAIL && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errors.push('Email inválido');
            }
        }
        
        // Actualizar estado de error
        if (errors.length > 0) {
            this.setError(errors[0]);
            return false;
        } else {
            this.clearError();
            return true;
        }
    }

    // ================================================================
    # 🔄 MÉTODOS PÚBLICOS
    // ================================================================

    getValue() {
        if (!this.inputElement) return '';
        
        if (this.type === INPUT_TYPES.SELECT && this.multiple) {
            return Array.from(this.inputElement.selectedOptions).map(opt => opt.value);
        }
        
        return this.inputElement.value;
    }

    setValue(value) {
        this.value = value;
        if (this.inputElement) {
            this.inputElement.value = value;
        }
        return this;
    }

    setError(error) {
        this.error = error;
        this.wrapperElement?.classList.add('input-error');
        
        if (!this.errorElement) {
            this.errorElement = document.createElement('div');
            this.errorElement.className = 'input-error-message';
            this.wrapperElement?.appendChild(this.errorElement);
        }
        this.errorElement.textContent = error;
        
        if (this.successElement) {
            this.successElement.remove();
            this.successElement = null;
        }
        
        return this;
    }

    clearError() {
        this.error = null;
        this.wrapperElement?.classList.remove('input-error');
        if (this.errorElement) {
            this.errorElement.remove();
            this.errorElement = null;
        }
        return this;
    }

    setSuccess(message) {
        this.success = message;
        this.wrapperElement?.classList.add('input-success');
        
        if (!this.successElement) {
            this.successElement = document.createElement('div');
            this.successElement.className = 'input-success-message';
            this.wrapperElement?.appendChild(this.successElement);
        }
        this.successElement.textContent = message;
        
        if (this.errorElement) {
            this.errorElement.remove();
            this.errorElement = null;
        }
        
        return this;
    }

    clearSuccess() {
        this.success = null;
        this.wrapperElement?.classList.remove('input-success');
        if (this.successElement) {
            this.successElement.remove();
            this.successElement = null;
        }
        return this;
    }

    clear() {
        this.setValue('');
        this.clearError();
        this.clearSuccess();
        return this;
    }

    focus() {
        this.inputElement?.focus();
        return this;
    }

    blur() {
        this.inputElement?.blur();
        return this;
    }

    disable() {
        this.disabled = true;
        if (this.inputElement) {
            this.inputElement.disabled = true;
        }
        this.wrapperElement?.classList.add('input-disabled');
        return this;
    }

    enable() {
        this.disabled = false;
        if (this.inputElement) {
            this.inputElement.disabled = false;
        }
        this.wrapperElement?.classList.remove('input-disabled');
        return this;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.inputElement = null;
        this.labelElement = null;
        this.helpElement = null;
        this.errorElement = null;
        this.successElement = null;
        this.wrapperElement = null;
        return this;
    }
}

// ================================================================
# 📝 FUNCIONES DE AYUDA
// ================================================================

/**
 * Crea un input rápidamente
 * @param {Object} options - Opciones del input
 * @returns {Input} Instancia del input
 */
export function createInput(options) {
    return new Input(options);
}

/**
 * Crea un input y lo añade al DOM
 * @param {string|HTMLElement} container - Contenedor donde añadir el input
 * @param {Object} options - Opciones del input
 * @returns {Input} Instancia del input
 */
export function createAndAppendInput(container, options) {
    const input = new Input(options);
    const element = input.render();
    
    const containerEl = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    
    if (containerEl) {
        containerEl.appendChild(element);
    }
    
    return input;
}

/**
 * Crea un input de búsqueda
 */
export function createSearchInput(options = {}) {
    return new Input({
        type: INPUT_TYPES.SEARCH,
        placeholder: options.placeholder || 'Buscar...',
        icon: 'fa-search',
        ...options
    });
}

/**
 * Crea un input de email
 */
export function createEmailInput(options = {}) {
    return new Input({
        type: INPUT_TYPES.EMAIL,
        placeholder: options.placeholder || 'correo@ejemplo.com',
        ...options
    });
}

/**
 * Crea un input de contraseña
 */
export function createPasswordInput(options = {}) {
    return new Input({
        type: INPUT_TYPES.PASSWORD,
        placeholder: options.placeholder || '••••••••',
        ...options
    });
}

/**
 * Crea un textarea
 */
export function createTextarea(options = {}) {
    return new Input({
        type: INPUT_TYPES.TEXTAREA,
        rows: options.rows || 4,
        placeholder: options.placeholder || 'Escribe aquí...',
        ...options
    });
}

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    Input,
    INPUT_TYPES,
    INPUT_SIZES,
    INPUT_VARIANTS,
    createInput,
    createAndAppendInput,
    createSearchInput,
    createEmailInput,
    createPasswordInput,
    createTextarea
};

console.log('📝 Input componente cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');