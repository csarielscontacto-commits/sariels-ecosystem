/**
 * ================================================================
 * UTILIDADES - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Funciones utilitarias reutilizables para todo el sistema.
 * 
 * @module Utils
 */

/**
 * Genera un identificador único
 * @returns {string} ID único
 */
export function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/**
 * Formatea un timestamp a hora legible
 * @param {number} timestamp - Timestamp en milisegundos
 * @returns {string} Hora formateada
 */
export function formatearHora(timestamp) {
    const fecha = new Date(timestamp);
    return fecha.toTimeString().slice(0, 8);
}

/**
 * Calcula el porcentaje de salud del proyecto
 * @param {Object} stats - Estadísticas del proyecto
 * @returns {number} Porcentaje de salud (0-100)
 */
export function calcularSalud(stats) {
    const { totalErrores = 0, totalAdvertencias = 0, totalArchivos = 1, totalLineas = 1 } = stats;
    
    // Peso de errores y advertencias
    const puntajeErrores = Math.max(0, 100 - (totalErrores * 5));
    const puntajeAdvertencias = Math.max(0, 100 - (totalAdvertencias * 2));
    
    // Factor de complejidad (archivos grandes reducen la salud)
    const lineasPorArchivo = totalLineas / totalArchivos;
    const factorComplejidad = Math.min(1, 1000 / (lineasPorArchivo + 100));
    
    const salud = Math.round((puntajeErrores * 0.6 + puntajeAdvertencias * 0.3 + factorComplejidad * 10));
    
    return Math.max(0, Math.min(100, salud));
}

/**
 * Determina el color según el nivel de salud
 * @param {number} salud - Porcentaje de salud
 * @returns {string} Color CSS
 */
export function colorSalud(salud) {
    if (salud >= 80) return 'var(--success)';
    if (salud >= 50) return 'var(--warning)';
    return 'var(--danger)';
}

/**
 * Escapa caracteres HTML para evitar inyecciones
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto escapado
 */
export function escapeHtml(texto) {
    if (!texto) return '';
    const mapa = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return texto.replace(/[&<>"']/g, function(m) { return mapa[m]; });
}

/**
 * Calcula el tamaño de un archivo en formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export function formatoTamanio(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * Cuenta líneas de código en un texto
 * @param {string} texto - Contenido del archivo
 * @returns {number} Número de líneas
 */
export function contarLineas(texto) {
    if (!texto) return 0;
    return texto.split('\n').length;
}

/**
 * Extrae la extensión de un archivo
 * @param {string} nombreArchivo - Nombre del archivo
 * @returns {string} Extensión (sin punto)
 */
export function extraerExtension(nombreArchivo) {
    if (!nombreArchivo) return '';
    const partes = nombreArchivo.split('.');
    return partes.length > 1 ? partes.pop().toLowerCase() : '';
}

/**
 * Detecta el tipo de archivo por extensión
 * @param {string} nombreArchivo - Nombre del archivo
 * @returns {string} Tipo de archivo
 */
export function detectarTipoArchivo(nombreArchivo) {
    const ext = extraerExtension(nombreArchivo);
    const tipos = {
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'js': 'javascript',
        'mjs': 'javascript',
        'cjs': 'javascript',
        'json': 'json',
        'md': 'markdown',
        'txt': 'texto',
        'xml': 'xml',
        'svg': 'svg',
        'png': 'imagen',
        'jpg': 'imagen',
        'jpeg': 'imagen',
        'gif': 'imagen',
        'webp': 'imagen',
        'ico': 'imagen',
        'woff': 'fuente',
        'woff2': 'fuente',
        'ttf': 'fuente',
        'eot': 'fuente'
    };
    return tipos[ext] || 'desconocido';
}

/**
 * Agrupa elementos por propiedad
 * @param {Array} array - Array a agrupar
 * @param {string} propiedad - Propiedad por la que agrupar
 * @returns {Object} Objeto agrupado
 */
export function agruparPor(array, propiedad) {
    return array.reduce((resultado, item) => {
        const clave = item[propiedad] || 'sin_clasificar';
        if (!resultado[clave]) {
            resultado[clave] = [];
        }
        resultado[clave].push(item);
        return resultado;
    }, {});
}

/**
 * Debounce para limitar ejecución de funciones
 * @param {Function} fn - Función a ejecutar
 * @param {number} delay - Retraso en milisegundos
 * @returns {Function} Función debounceada
 */
export function debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Throttle para limitar ejecución de funciones
 * @param {Function} fn - Función a ejecutar
 * @param {number} limit - Límite en milisegundos
 * @returns {Function} Función throttleada
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

/**
 * Clona un objeto profundamente
 * @param {Object} obj - Objeto a clonar
 * @returns {Object} Clon del objeto
 */
export function cloneDeep(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => cloneDeep(item));
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = cloneDeep(obj[key]);
        }
    }
    return cloned;
}

/**
 * Verifica si una cadena es una URL
 * @param {string} texto - Texto a verificar
 * @returns {boolean} Verdadero si es URL
 */
export function esUrl(texto) {
    try {
        new URL(texto);
        return true;
    } catch {
        return false;
    }
}

/**
 * Obtiene el nombre base de un archivo sin extensión
 * @param {string} nombreArchivo - Nombre del archivo
 * @returns {string} Nombre sin extensión
 */
export function nombreBase(nombreArchivo) {
    if (!nombreArchivo) return '';
    const partes = nombreArchivo.split('.');
    if (partes.length <= 1) return nombreArchivo;
    return partes.slice(0, -1).join('.');
}

/**
 * Extrae la ruta relativa de un archivo
 * @param {string} rutaCompleta - Ruta completa
 * @param {string} base - Ruta base
 * @returns {string} Ruta relativa
 */
export function rutaRelativa(rutaCompleta, base) {
    if (!rutaCompleta || !base) return rutaCompleta;
    const normalizada = rutaCompleta.replace(/\\/g, '/');
    const baseNormalizada = base.replace(/\\/g, '/');
    if (normalizada.startsWith(baseNormalizada)) {
        return normalizada.substring(baseNormalizada.length + 1);
    }
    return normalizada;
}