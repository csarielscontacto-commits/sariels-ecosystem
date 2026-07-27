// ================================================================
// LEGAL-CORE.JS - MÓDULO CENTRAL PARA DOCUMENTOS LEGALES
// Csariel's Platform · Versión 1.0
// Funcionalidades: Validación de formularios, contador de caracteres,
// feedback visual, envío a Supabase (Edge Function)
// ================================================================

/**
 * ================================================================
 * CONFIGURACIÓN
 * ================================================================
 */
const LEGAL_CONFIG = {
    // Límites de caracteres
    MAX_DESCRIPTION_CHARS: 2000,
    MAX_COMMENT_CHARS: 500,

    // Estados
    STATUS: {
        PENDING: 'pending_review',
        REVIEWING: 'reviewing',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        RESOLVED: 'resolved'
    },

    // Selectores CSS
    SELECTORS: {
        FORM: '#takedownForm, #contactForm, .legal-form',
        FORM_CONTROL: '.form-control',
        CHECKBOX_GROUP: '.checkbox-group',
        CHAR_COUNTER: '.char-counter',
        FEEDBACK: '.form-feedback',
        SUBMIT_BTN: '.btn-submit'
    },

    // Mensajes de error
    MESSAGES: {
        REQUIRED: 'Este campo es obligatorio.',
        EMAIL: 'Ingresa un correo electrónico válido.',
        URL: 'Ingresa una URL válida (ej: https://ejemplo.com).',
        CHECKBOX: 'Debes aceptar esta declaración para continuar.',
        SIGNATURE: 'La firma digital es obligatoria para validar este documento.',
        CHARACTER_LIMIT: 'Has excedido el límite de caracteres.',
        SUBMIT_ERROR: 'Hubo un error al enviar la solicitud. Por favor, intenta más tarde.',
        SUBMIT_SUCCESS: 'Tu solicitud ha sido enviada correctamente.'
    }
};

/**
 * ================================================================
 * CLASE PRINCIPAL - LegalCore
 * ================================================================
 */
class LegalCore {
    constructor() {
        this.forms = [];
        this.isSubmitting = false;

        // Inicializar al cargar
        this.init();
    }

    /**
     * Inicializa todos los módulos
     */
    init() {
        console.log('⚖️ LegalCore: Inicializando módulo legal...');

        // Buscar todos los formularios legales
        document.querySelectorAll(LEGAL_CONFIG.SELECTORS.FORM).forEach(form => {
            this.setupForm(form);
        });

        // Configurar contadores de caracteres
        this.setupCharCounters();

        console.log(`✅ LegalCore: ${document.querySelectorAll(LEGAL_CONFIG.SELECTORS.FORM).length} formularios configurados.`);
    }

    // ================================================================
    // CONFIGURACIÓN DE FORMULARIOS
    // ================================================================

    /**
     * Configura un formulario individual
     */
    setupForm(form) {
        // 1. Validación en tiempo real
        this.setupRealtimeValidation(form);

        // 2. Configurar checkboxes
        this.setupCheckboxes(form);

        // 3. Configurar envío
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleSubmit(form, event);
        });

        // 4. Guardar referencia
        this.forms.push(form);

        return form;
    }

    // ================================================================
    // VALIDACIÓN EN TIEMPO REAL
    // ================================================================

    /**
     * Configura validación en tiempo real para campos
     */
    setupRealtimeValidation(form) {
        // Campos obligatorios
        form.querySelectorAll(`${LEGAL_CONFIG.SELECTORS.FORM_CONTROL}[required]`).forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    this.clearError(input);
                }
            });
        });

        // Textareas con límite de caracteres
        form.querySelectorAll('textarea[data-max-chars]').forEach(textarea => {
            const maxChars = parseInt(textarea.dataset.maxChars) || LEGAL_CONFIG.MAX_DESCRIPTION_CHARS;

            textarea.addEventListener('input', () => {
                const length = textarea.value.length;
                const counter = this.getCharCounter(textarea);

                if (counter) {
                    counter.textContent = `${length} / ${maxChars} caracteres`;

                    if (length > maxChars) {
                        textarea.value = textarea.value.substring(0, maxChars);
                        counter.classList.add('limit');
                    } else {
                        counter.classList.remove('limit');
                    }
                }
            });
        });
    }

    /**
     * Valida un campo individual
     */
    validateField(input) {
        const value = input.value.trim();

        // Validar tipo
        if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.setError(input, LEGAL_CONFIG.MESSAGES.EMAIL);
                return false;
            }
        }

        if (input.type === 'url' && value) {
            try {
                new URL(value);
            } catch {
                this.setError(input, LEGAL_CONFIG.MESSAGES.URL);
                return false;
            }
        }

        // Validar requerido
        if (input.hasAttribute('required') && !value) {
            this.setError(input, LEGAL_CONFIG.MESSAGES.REQUIRED);
            return false;
        }

        this.clearError(input);
        return true;
    }

    // ================================================================
    // CHECKBOXES LEGALES
    // ================================================================

    /**
     * Configura checkboxes legales
     */
    setupCheckboxes(form) {
        form.querySelectorAll(LEGAL_CONFIG.SELECTORS.CHECKBOX_GROUP + ' input[type="checkbox"]').forEach(cb => {
            const group = cb.closest(LEGAL_CONFIG.SELECTORS.CHECKBOX_GROUP);

            cb.addEventListener('change', () => {
                if (cb.checked) {
                    group.classList.remove('error');
                } else {
                    group.classList.add('error');
                }
            });
        });
    }

    // ================================================================
    // CONTADORES DE CARACTERES
    // ================================================================

    /**
     * Configura todos los contadores de caracteres
     */
    setupCharCounters() {
        document.querySelectorAll('textarea[data-max-chars]').forEach(textarea => {
            const maxChars = parseInt(textarea.dataset.maxChars) || LEGAL_CONFIG.MAX_DESCRIPTION_CHARS;
            const counter = this.getCharCounter(textarea);

            if (counter) {
                const length = textarea.value.length;
                counter.textContent = `${length} / ${maxChars} caracteres`;
            }
        });
    }

    /**
     * Obtiene el contador de caracteres asociado a un textarea
     */
    getCharCounter(textarea) {
        // Buscar contador hermano
        let counter = textarea.parentElement.querySelector(LEGAL_CONFIG.SELECTORS.CHAR_COUNTER);

        // Si no existe, buscar en el grupo
        if (!counter) {
            const group = textarea.closest('.form-group');
            if (group) {
                counter = group.querySelector(LEGAL_CONFIG.SELECTORS.CHAR_COUNTER);
            }
        }

        return counter;
    }

    // ================================================================
    // MANEJO DE ERRORES VISUALES
    // ================================================================

    /**
     * Marca un campo como error
     */
    setError(input, message) {
        input.classList.add('error');

        // Buscar o crear mensaje de error
        let errorEl = input.parentElement.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            errorEl.style.cssText = `
                display: block;
                font-size: 0.8rem;
                color: var(--danger, #ff7675);
                margin-top: 0.3rem;
            `;
            input.parentElement.appendChild(errorEl);
        }

        errorEl.textContent = message || LEGAL_CONFIG.MESSAGES.REQUIRED;
    }

    /**
     * Limpia el estado de error de un campo
     */
    clearError(input) {
        input.classList.remove('error');

        const errorEl = input.parentElement.querySelector('.field-error');
        if (errorEl) {
            errorEl.remove();
        }
    }

    // ================================================================
    // VALIDACIÓN COMPLETA DEL FORMULARIO
    // ================================================================

    /**
     * Valida todo el formulario
     */
    validateForm(form) {
        let isValid = true;

        // 1. Validar campos obligatorios
        form.querySelectorAll(`${LEGAL_CONFIG.SELECTORS.FORM_CONTROL}[required]`).forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        // 2. Validar checkboxes legales
        form.querySelectorAll(LEGAL_CONFIG.SELECTORS.CHECKBOX_GROUP + ' input[type="checkbox"]').forEach(cb => {
            const group = cb.closest(LEGAL_CONFIG.SELECTORS.CHECKBOX_GROUP);
            if (!cb.checked) {
                group.classList.add('error');
                isValid = false;
            } else {
                group.classList.remove('error');
            }
        });

        // 3. Validar firma digital (si existe)
        const signature = form.querySelector('#firmaDigital, #digital_signature');
        if (signature) {
            if (!signature.value.trim()) {
                this.setError(signature, LEGAL_CONFIG.MESSAGES.SIGNATURE);
                isValid = false;
            } else {
                this.clearError(signature);
            }
        }

        return isValid;
    }

    // ================================================================
    // ENVÍO DEL FORMULARIO
    // ================================================================

    /**
     * Maneja el envío del formulario
     */
    async handleSubmit(form, event) {
        // 1. Evitar envíos duplicados
        if (this.isSubmitting) {
            return;
        }

        // 2. Validar formulario
        if (!this.validateForm(form)) {
            this.showFeedback(form, 'error', '❌', 'Campos incompletos',
                'Por favor, completa todos los campos obligatorios y acepta las declaraciones.');
            return;
        }

        // 3. Preparar datos
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Añadir metadatos
        data.submitted_at = new Date().toISOString();
        data.status = LEGAL_CONFIG.STATUS.PENDING;
        data.ip_address = 'client_ip_retrieved_server_side';

        // 4. Deshabilitar botón
        this.setSubmitting(form, true);

        // 5. Enviar a Supabase
        try {
            const result = await this.submitToSupabase(data);

            if (result.success) {
                this.showFeedback(form, 'success', '✅', '¡Solicitud Recibida!',
                    `Hemos recibido tu notificación. Se ha enviado una copia a tu correo: <strong>${data.emailContacto || data.email || 'registrado'}</strong>.`);

                // Ocultar formulario
                form.style.display = 'none';

                // Emitir evento
                document.dispatchEvent(new CustomEvent('legal:submitted', {
                    detail: { data, result }
                }));
            } else {
                throw new Error(result.message || LEGAL_CONFIG.MESSAGES.SUBMIT_ERROR);
            }
        } catch (error) {
            console.error('❌ Error en envío:', error);
            this.showFeedback(form, 'error', '❌', 'Error al enviar',
                `Hubo un problema al procesar tu solicitud. Contacta a <strong>csarielscontacto@gmail.com</strong>`);
        }

        // 6. Restaurar botón
        this.setSubmitting(form, false);
    }

    /**
     * Envía los datos a Supabase (Edge Function)
     */
    async submitToSupabase(data) {
        const SUPABASE_URL = 'https://nvyyxgkladjauolvpzfp.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MTU2ODEsImV4cCI6MjA1NjE5MTY4MX0.c1Zk6QpI7m7tQnY4k8w9Tg5dDw2pXgFh1y3JkLmNpQo';

        const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-takedown`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error en el servidor');
        }

        return result;
    }

    // ================================================================
    // FEEDBACK VISUAL
    // ================================================================

    /**
     * Muestra feedback al usuario
     */
    showFeedback(form, type, icon, title, message) {
        const feedback = form.querySelector(LEGAL_CONFIG.SELECTORS.FEEDBACK) || this.createFeedback(form);

        feedback.className = `form-feedback ${type}`;
        feedback.innerHTML = `
            <span class="icon">${icon}</span>
            <div class="message-content">
                <strong>${title}</strong>
                <p style="margin:0.3rem 0 0 0;">${message}</p>
            </div>
        `;

        feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Crea un elemento de feedback si no existe
     */
    createFeedback(form) {
        const feedback = document.createElement('div');
        feedback.className = 'form-feedback';
        feedback.id = 'formFeedback';
        form.appendChild(feedback);
        return feedback;
    }

    // ================================================================
    // ESTADO DE ENVÍO
    // ================================================================

    /**
     * Cambia el estado del botón de envío
     */
    setSubmitting(form, isSubmitting) {
        this.isSubmitting = isSubmitting;

        const btn = form.querySelector(LEGAL_CONFIG.SELECTORS.SUBMIT_BTN);
        if (!btn) return;

        if (isSubmitting) {
            btn.disabled = true;
            btn.classList.add('loading');
            btn.textContent = 'Enviando...';
        } else {
            btn.disabled = false;
            btn.classList.remove('loading');
            btn.textContent = btn.dataset.originalText || 'Enviar';
        }
    }
}

// ================================================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.legalCore = new LegalCore();
        console.log('⚖️ LegalCore: Inicializado correctamente.');
    });
} else {
    window.legalCore = new LegalCore();
    console.log('⚖️ LegalCore: Inicializado correctamente.');
}

// ================================================================
// EXPORTACIÓN PARA MÓDULOS
// ================================================================

// Para usar con import/export
export { LegalCore, LEGAL_CONFIG };