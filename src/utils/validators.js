// ================================================================
// ✅ VALIDATORS - CSARIEL'S ECOSYSTEM
// ================================================================
// Funciones de validación para todo el ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
# 📧 VALIDACIÓN DE EMAIL
// ================================================================

/**
 * Valida si un email es válido
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
}

// ================================================================
# 📱 VALIDACIÓN DE TELÉFONO
// ================================================================

/**
 * Valida si un teléfono es válido (formato internacional)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} true si es válido
 */
export function isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    // Permite: +52 222 123 4567, 2221234567, 222-123-4567
    const regex = /^[\+\d\s\-\(\)]{7,15}$/;
    return regex.test(phone.trim());
}

/**
 * Formatea un teléfono a formato internacional
 * @param {string} phone - Teléfono a formatear
 * @returns {string} Teléfono formateado
 */
export function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+52 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+52 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
}

// ================================================================
# 🔗 VALIDACIÓN DE URL
// ================================================================

/**
 * Valida si una URL es válida
 * @param {string} url - URL a validar
 * @returns {boolean} true si es válida
 */
export function isValidURL(url) {
    if (!url || typeof url !== 'string') return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Limpia y formatea una URL
 * @param {string} url - URL a limpiar
 * @returns {string} URL limpia
 */
export function cleanURL(url) {
    if (!url) return '';
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    return url;
}

// ================================================================
# 👤 VALIDACIÓN DE USUARIO
// ================================================================

/**
 * Valida si un nombre de usuario es válido
 * @param {string} username - Nombre de usuario
 * @returns {boolean} true si es válido
 */
export function isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    // Letras, números, guión bajo, espacio (2-30 caracteres)
    const regex = /^[a-zA-Z0-9_\u00C0-\u00FF\s]{2,30}$/;
    return regex.test(username.trim());
}

/**
 * Valida si una contraseña es segura
 * @param {string} password - Contraseña a validar
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
    const errors = [];
    
    if (!password || password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Debe contener al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Debe contener al menos una minúscula');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Debe contener al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Debe contener al menos un carácter especial');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// ================================================================
# 🏷️ VALIDACIÓN DE TEXTO
// ================================================================

/**
 * Valida si un texto no está vacío
 * @param {string} text - Texto a validar
 * @param {number} minLength - Longitud mínima
 * @param {number} maxLength - Longitud máxima
 * @returns {boolean} true si es válido
 */
export function isValidText(text, minLength = 1, maxLength = 1000) {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Sanitiza un texto (elimina HTML y caracteres peligrosos)
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export function sanitizeText(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ================================================================
# 📅 VALIDACIÓN DE FECHA
// ================================================================

/**
 * Valida si una fecha es válida
 * @param {string|Date} date - Fecha a validar
 * @returns {boolean} true si es válida
 */
export function isValidDate(date) {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
}

/**
 * Valida si una fecha está en el pasado
 * @param {string|Date} date - Fecha a validar
 * @returns {boolean} true si está en el pasado
 */
export function isPastDate(date) {
    if (!isValidDate(date)) return false;
    return new Date(date).getTime() < Date.now();
}

/**
 * Valida si una fecha está en el futuro
 * @param {string|Date} date - Fecha a validar
 * @returns {boolean} true si está en el futuro
 */
export function isFutureDate(date) {
    if (!isValidDate(date)) return false;
    return new Date(date).getTime() > Date.now();
}

// ================================================================
# 💰 VALIDACIÓN DE NÚMEROS
// ================================================================

/**
 * Valida si un número es positivo
 * @param {number} num - Número a validar
 * @returns {boolean} true si es positivo
 */
export function isPositiveNumber(num) {
    return typeof num === 'number' && num > 0;
}

/**
 * Valida si un número es entero
 * @param {number} num - Número a validar
 * @returns {boolean} true si es entero
 */
export function isInteger(num) {
    return Number.isInteger(num);
}

/**
 * Valida si un número está en un rango
 * @param {number} num - Número a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} true si está en el rango
 */
export function isInRange(num, min, max) {
    return typeof num === 'number' && num >= min && num <= max;
}

// ================================================================
# 🪙 VALIDACIÓN DE CMT/STOKS
// ================================================================

/**
 * Valida si una cantidad de CMT es válida
 * @param {number} amount - Cantidad a validar
 * @param {number} min - Cantidad mínima
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateCMT(amount, min = 0.01) {
    if (!amount || typeof amount !== 'number') {
        return { valid: false, message: 'Cantidad inválida' };
    }
    if (amount <= 0) {
        return { valid: false, message: 'La cantidad debe ser mayor a 0' };
    }
    if (amount < min) {
        return { valid: false, message: `La cantidad mínima es ${min} CMT` };
    }
    return { valid: true, message: 'Cantidad válida' };
}

/**
 * Valida si una cantidad de STOKS es válida
 * @param {number} amount - Cantidad a validar
 * @param {number} min - Cantidad mínima
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateSTOKS(amount, min = 1) {
    if (!amount || typeof amount !== 'number') {
        return { valid: false, message: 'Cantidad inválida' };
    }
    if (amount <= 0) {
        return { valid: false, message: 'La cantidad debe ser mayor a 0' };
    }
    if (!Number.isInteger(amount)) {
        return { valid: false, message: 'Los STOKS deben ser números enteros' };
    }
    if (amount < min) {
        return { valid: false, message: `La cantidad mínima es ${min} STOKS` };
    }
    return { valid: true, message: 'Cantidad válida' };
}

// ================================================================
# 📋 VALIDACIÓN DE FORMULARIOS
// ================================================================

/**
 * Valida un objeto de formulario completo
 * @param {Object} data - Datos del formulario
 * @param {Object} rules - Reglas de validación
 * @returns {Object} { valid: boolean, errors: Object }
 */
export function validateForm(data, rules) {
    const errors = {};
    let valid = true;

    for (const [field, rule] of Object.entries(rules)) {
        const value = data[field];
        
        if (rule.required && !value) {
            errors[field] = `${rule.label || field} es requerido`;
            valid = false;
            continue;
        }

        if (value) {
            if (rule.type === 'email' && !isValidEmail(value)) {
                errors[field] = 'Email inválido';
                valid = false;
            }
            if (rule.type === 'phone' && !isValidPhone(value)) {
                errors[field] = 'Teléfono inválido';
                valid = false;
            }
            if (rule.type === 'url' && !isValidURL(value)) {
                errors[field] = 'URL inválida';
                valid = false;
            }
            if (rule.type === 'username' && !isValidUsername(value)) {
                errors[field] = 'Usuario inválido (2-30 caracteres)';
                valid = false;
            }
            if (rule.minLength && value.length < rule.minLength) {
                errors[field] = `Mínimo ${rule.minLength} caracteres`;
                valid = false;
            }
            if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `Máximo ${rule.maxLength} caracteres`;
                valid = false;
            }
            if (rule.min !== undefined && value < rule.min) {
                errors[field] = `Mínimo ${rule.min}`;
                valid = false;
            }
            if (rule.max !== undefined && value > rule.max) {
                errors[field] = `Máximo ${rule.max}`;
                valid = false;
            }
        }
    }

    return { valid, errors };
}

// ================================================================
# 📦 EXPORTAR TODO
// ================================================================

export default {
    isValidEmail,
    isValidPhone,
    formatPhone,
    isValidURL,
    cleanURL,
    isValidUsername,
    validatePassword,
    isValidText,
    sanitizeText,
    isValidDate,
    isPastDate,
    isFutureDate,
    isPositiveNumber,
    isInteger,
    isInRange,
    validateCMT,
    validateSTOKS,
    validateForm
};

console.log('✅ Validators cargados');
console.log('📍 Hecho en Puebla, México 🇲🇽');