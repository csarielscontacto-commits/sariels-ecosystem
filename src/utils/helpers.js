// ================================================================
// 🛠️ HELPERS - CSARIEL'S ECOSYSTEM
// ================================================================
// Funciones auxiliares reutilizables para todo el ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// ⏱️ FORMATO DE TIEMPO
// ================================================================

/**
 * Calcula el tiempo transcurrido desde una fecha
 * @param {Date|string} fecha - Fecha a calcular
 * @param {string} idioma - Idioma para el texto (es, en, fr)
 * @returns {string} Tiempo formateado
 */
export function calcularTiempo(fecha, idioma = 'es') {
    if (!fecha) return 'Recién';
    
    const diff = Date.now() - new Date(fecha).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    const meses = Math.floor(diff / 2592000000);

    const textos = {
        es: { ahora: 'Ahora', min: 'min', h: 'h', d: 'd', mes: 'mes', hace: 'hace' },
        en: { ahora: 'Now', min: 'min', h: 'h', d: 'd', mes: 'month', hace: 'ago' },
        fr: { ahora: 'Maintenant', min: 'min', h: 'h', d: 'j', mes: 'mois', hace: 'il y a' }
    };

    const t = textos[idioma] || textos.es;

    if (minutos < 1) return t.ahora;
    if (minutos < 60) return `${minutos} ${t.min} ${t.hace}`;
    if (horas < 24) return `${horas} ${t.h} ${t.hace}`;
    if (dias < 30) return `${dias} ${t.d} ${t.hace}`;
    if (meses < 12) return `${meses} ${t.mes} ${t.hace}`;
    
    return new Date(fecha).toLocaleDateString();
}

// ================================================================
// 🔗 FORMATEO DE URLS
// ================================================================

/**
 * Limpia y formatea una URL
 * @param {string} url - URL a formatear
 * @returns {string} URL limpia
 */
export function formatearURL(url) {
    if (!url) return '';
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    return url;
}

/**
 * Extrae el dominio de una URL
 * @param {string} url - URL completa
 * @returns {string} Dominio extraído
 */
export function extraerDominio(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace('www.', '');
    } catch {
        return url;
    }
}

// ================================================================
# 🎨 FORMATEO DE NÚMEROS
// ================================================================

/**
 * Formatea un número con separadores de miles
 * @param {number} numero - Número a formatear
 * @param {string} idioma - Idioma (es, en, fr)
 * @returns {string} Número formateado
 */
export function formatearNumero(numero, idioma = 'es') {
    if (numero === undefined || numero === null) return '0';
    
    const locales = { es: 'es-MX', en: 'en-US', fr: 'fr-FR' };
    const locale = locales[idioma] || 'es-MX';
    
    return new Intl.NumberFormat(locale).format(numero);
}

/**
 * Formatea un número como moneda
 * @param {number} cantidad - Cantidad a formatear
 * @param {string} moneda - Código de moneda (MXN, USD, EUR)
 * @param {string} idioma - Idioma (es, en, fr)
 * @returns {string} Moneda formateada
 */
export function formatearMoneda(cantidad, moneda = 'MXN', idioma = 'es') {
    if (cantidad === undefined || cantidad === null) return '$0.00';
    
    const locales = { es: 'es-MX', en: 'en-US', fr: 'fr-FR' };
    const locale = locales[idioma] || 'es-MX';
    
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: moneda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(cantidad);
}

// ================================================================
# 🎨 FORMATEO DE TEXTO
// ================================================================

/**
 * Capitaliza la primera letra de un texto
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export function capitalizar(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Trunca un texto a una longitud máxima
 * @param {string} texto - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo para texto truncado
 * @returns {string} Texto truncado
 */
export function truncarTexto(texto, maxLength = 100, suffix = '...') {
    if (!texto) return '';
    if (texto.length <= maxLength) return texto;
    return texto.slice(0, maxLength) + suffix;
}

/**
 * Elimina etiquetas HTML de un texto
 * @param {string} texto - Texto con HTML
 * @returns {string} Texto sin HTML
 */
export function limpiarHTML(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.innerHTML = texto;
    return div.textContent || div.innerText || '';
}

// ================================================================
# 🎨 VALIDACIONES
// ================================================================

/**
 * Valida si un email es válido
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
export function validarEmail(email) {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida si un teléfono es válido (México)
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} true si es válido
 */
export function validarTelefono(telefono) {
    if (!telefono) return false;
    const regex = /^[0-9\s\-+()]{7,15}$/;
    return regex.test(telefono);
}

/**
 * Valida si una URL es válida
 * @param {string} url - URL a validar
 * @returns {boolean} true si es válida
 */
export function validarURL(url) {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ================================================================
# 🎨 GENERADORES
// ================================================================

/**
 * Genera un ID único
 * @param {string} prefix - Prefijo opcional
 * @returns {string} ID único
 */
export function generarID(prefix = '') {
    const id = Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${id}` : id;
}

/**
 * Genera un código aleatorio
 * @param {number} length - Longitud del código
 * @param {string} chars - Caracteres permitidos
 * @returns {string} Código aleatorio
 */
export function generarCodigo(length = 6, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    let codigo = '';
    for (let i = 0; i < length; i++) {
        codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
}

/**
 * Genera un color aleatorio en formato hexadecimal
 * @returns {string} Color hexadecimal
 */
export function generarColorAleatorio() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// ================================================================
# 🎨 MANIPULACIÓN DE OBJETOS
// ================================================================

/**
 * Clona un objeto profundamente
 * @param {Object} obj - Objeto a clonar
 * @returns {Object} Objeto clonado
 */
export function clonarObjeto(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Fusiona objetos profundamente
 * @param {Object} target - Objeto destino
 * @param {Object} source - Objeto fuente
 * @returns {Object} Objeto fusionado
 */
export function fusionarObjetos(target, source) {
    const result = { ...target };
    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = fusionarObjetos(result[key] || {}, value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

// ================================================================
# 🎨 MANIPULACIÓN DE ARRAYS
// ================================================================

/**
 * Agrupa un array por una propiedad
 * @param {Array} array - Array a agrupar
 * @param {string} key - Propiedad para agrupar
 * @returns {Object} Objeto agrupado
 */
export function agruparPor(array, key) {
    return array.reduce((acc, item) => {
        const group = item[key];
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});
}

/**
 * Ordena un array por una propiedad
 * @param {Array} array - Array a ordenar
 * @param {string} key - Propiedad para ordenar
 * @param {string} order - 'asc' o 'desc'
 * @returns {Array} Array ordenado
 */
export function ordenarPor(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        const valA = a[key] ?? '';
        const valB = b[key] ?? '';
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

// ================================================================
# 🎨 MANIPULACIÓN DEL DOM
// ================================================================

/**
 * Crea un elemento HTML con atributos y contenido
 * @param {string} tag - Etiqueta HTML
 * @param {Object} attributes - Atributos del elemento
 * @param {string|Node} content - Contenido del elemento
 * @returns {HTMLElement} Elemento creado
 */
export function crearElemento(tag, attributes = {}, content = '') {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
        } else {
            el.setAttribute(key, value);
        }
    }
    if (content) {
        if (typeof content === 'string') {
            el.innerHTML = content;
        } else if (content instanceof Node) {
            el.appendChild(content);
        }
    }
    return el;
}

/**
 * Muestra u oculta un elemento
 * @param {string|HTMLElement} element - Elemento o selector
 * @param {boolean} show - true para mostrar, false para ocultar
 */
export function toggleElemento(element, show) {
    const el = typeof element === 'string' 
        ? document.querySelector(element) 
        : element;
    if (el) {
        el.style.display = show ? '' : 'none';
    }
}

// ================================================================
# 🎨 COPIAR AL PORTAPAPELES
// ================================================================

/**
 * Copia texto al portapapeles
 * @param {string} texto - Texto a copiar
 * @returns {Promise<boolean>} true si se copió correctamente
 */
export async function copiarAlPortapapeles(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        return true;
    } catch {
        // Fallback
        const input = document.createElement('input');
        input.value = texto;
        document.body.appendChild(input);
        input.select();
        const result = document.execCommand('copy');
        document.body.removeChild(input);
        return result;
    }
}

// ================================================================
# 🎨 DEBOUNCE Y THROTTLE
// ================================================================

/**
 * Debounce: ejecuta una función después de un delay
 * @param {Function} fn - Función a ejecutar
 * @param {number} delay - Delay en milisegundos
 * @returns {Function} Función con debounce
 */
export function debounce(fn, delay = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Throttle: ejecuta una función cada cierto tiempo
 * @param {Function} fn - Función a ejecutar
 * @param {number} limit - Límite en milisegundos
 * @returns {Function} Función con throttle
 */
export function throttle(fn, limit = 300) {
    let inThrottle = false;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ================================================================
# 🎨 DETECCIÓN DE DISPOSITIVO
// ================================================================

/**
 * Detecta si es un dispositivo móvil
 * @returns {boolean} true si es móvil
 */
export function esMovil() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detecta si es un navegador en modo oscuro
 * @returns {boolean} true si es modo oscuro
 */
export function esModoOscuro() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ================================================================
# 🎨 EXPORTAR TODO
// ================================================================

export default {
    // Tiempo
    calcularTiempo,
    
    // URLs
    formatearURL,
    extraerDominio,
    
    // Números
    formatearNumero,
    formatearMoneda,
    
    // Texto
    capitalizar,
    truncarTexto,
    limpiarHTML,
    
    // Validaciones
    validarEmail,
    validarTelefono,
    validarURL,
    
    // Generadores
    generarID,
    generarCodigo,
    generarColorAleatorio,
    
    // Objetos
    clonarObjeto,
    fusionarObjetos,
    
    // Arrays
    agruparPor,
    ordenarPor,
    
    // DOM
    crearElemento,
    toggleElemento,
    
    // Utilidades
    copiarAlPortapapeles,
    debounce,
    throttle,
    esMovil,
    esModoOscuro
};

console.log('🛠️ Helpers.js cargado (versión unificada)');
console.log('📍 Hecho en Puebla, México 🇲🇽');