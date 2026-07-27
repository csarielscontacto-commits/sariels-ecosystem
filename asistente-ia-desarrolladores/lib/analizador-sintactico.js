/**
 * ================================================================
 * ANALIZADOR SINTÁCTICO - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Base para análisis sintáctico de código.
 * Proporciona funcionalidades comunes para todos los analizadores.
 * 
 * @module AnalizadorSintactico
 */

/**
 * Clase base para analizadores sintácticos
 */
export class AnalizadorSintactico {
    /**
     * Constructor
     * @param {string} contenido - Contenido del archivo
     * @param {string} nombreArchivo - Nombre del archivo
     */
    constructor(contenido, nombreArchivo) {
        this.contenido = contenido || '';
        this.nombreArchivo = nombreArchivo || 'desconocido';
        this.lineas = this.contenido.split('\n');
        this.errores = [];
        this.advertencias = [];
        this.metricas = {};
        this.estructura = {};
    }

    /**
     * Analiza el contenido del archivo
     * @returns {Object} Resultado del análisis
     */
    analizar() {
        throw new Error('Método analizar() debe ser implementado por subclases');
    }

    /**
     * Obtiene el número de líneas del archivo
     * @returns {number} Número de líneas
     */
    obtenerNumeroLineas() {
        return this.lineas.length;
    }

    /**
     * Obtiene la línea en una posición dada
     * @param {number} numero - Número de línea (base 1)
     * @returns {string} Contenido de la línea
     */
    obtenerLinea(numero) {
        if (numero < 1 || numero > this.lineas.length) {
            return '';
        }
        return this.lineas[numero - 1];
    }

    /**
     * Registra un error
     * @param {string} mensaje - Mensaje de error
     * @param {number} linea - Número de línea
     * @param {number} columna - Número de columna
     */
    registrarError(mensaje, linea = 1, columna = 1) {
        this.errores.push({
            mensaje,
            linea,
            columna,
            archivo: this.nombreArchivo,
            tipo: 'error'
        });
    }

    /**
     * Registra una advertencia
     * @param {string} mensaje - Mensaje de advertencia
     * @param {number} linea - Número de línea
     * @param {number} columna - Número de columna
     */
    registrarAdvertencia(mensaje, linea = 1, columna = 1) {
        this.advertencias.push({
            mensaje,
            linea,
            columna,
            archivo: this.nombreArchivo,
            tipo: 'advertencia'
        });
    }

    /**
     * Obtiene los resultados del análisis
     * @returns {Object} Resultados consolidados
     */
    obtenerResultados() {
        return {
            archivo: this.nombreArchivo,
            lineas: this.obtenerNumeroLineas(),
            errores: this.errores,
            advertencias: this.advertencias,
            metricas: this.metricas,
            estructura: this.estructura,
            tieneErrores: this.errores.length > 0,
            tieneAdvertencias: this.advertencias.length > 0
        };
    }

    /**
     * Limpia el contenido eliminando comentarios
     * @param {string} contenido - Contenido a limpiar
     * @param {string} tipo - Tipo de comentario (html, css, js)
     * @returns {string} Contenido sin comentarios
     */
    limpiarComentarios(contenido, tipo = 'js') {
        let limpio = contenido;
        
        switch (tipo) {
            case 'html':
                // Elimina comentarios HTML
                limpio = limpio.replace(/<!--[\s\S]*?-->/g, '');
                break;
            case 'css':
                // Elimina comentarios CSS
                limpio = limpio.replace(/\/\*[\s\S]*?\*\//g, '');
                break;
            case 'js':
                // Elimina comentarios de una y múltiples líneas
                limpio = limpio.replace(/\/\/.*$/gm, '');
                limpio = limpio.replace(/\/\*[\s\S]*?\*\//g, '');
                break;
            default:
                // Intenta detectar automáticamente
                limpio = limpio.replace(/\/\/.*$/gm, '');
                limpio = limpio.replace(/\/\*[\s\S]*?\*\//g, '');
                limpio = limpio.replace(/<!--[\s\S]*?-->/g, '');
                break;
        }
        
        return limpio;
    }

    /**
     * Cuenta ocurrencias de un patrón en el contenido
     * @param {string|RegExp} patron - Patrón a buscar
     * @param {string} contenido - Contenido donde buscar
     * @returns {number} Número de ocurrencias
     */
    contarOcurrencias(patron, contenido = this.contenido) {
        const regex = typeof patron === 'string' 
            ? new RegExp(patron, 'g') 
            : patron;
        const coincidencias = contenido.match(regex);
        return coincidencias ? coincidencias.length : 0;
    }

    /**
     * Extrae bloques delimitados por patrones
     * @param {string} inicio - Patrón de inicio
     * @param {string} fin - Patrón de fin
     * @param {string} contenido - Contenido donde buscar
     * @returns {Array} Bloques encontrados
     */
    extraerBloques(inicio, fin, contenido = this.contenido) {
        const bloques = [];
        let posicion = 0;
        let nivel = 0;
        let inicioBloque = -1;
        
        const regexInicio = new RegExp(inicio, 'g');
        const regexFin = new RegExp(fin, 'g');
        
        let match;
        while ((match = regexInicio.exec(contenido)) !== null) {
            if (nivel === 0) {
                inicioBloque = match.index;
            }
            nivel++;
            
            // Buscar el fin correspondiente
            let finMatch;
            let finPos = -1;
            let tempNivel = nivel;
            const tempRegex = new RegExp(fin, 'g');
            tempRegex.lastIndex = match.index + match[0].length;
            
            while ((finMatch = tempRegex.exec(contenido)) !== null) {
                tempNivel--;
                if (tempNivel === 0) {
                    finPos = finMatch.index + finMatch[0].length;
                    break;
                }
            }
            
            if (finPos !== -1) {
                bloques.push(contenido.substring(inicioBloque, finPos));
                regexInicio.lastIndex = finPos;
                nivel = 0;
            }
        }
        
        return bloques;
    }

    /**
     * Detecta líneas vacías en un bloque
     * @param {string} bloque - Bloque de código
     * @returns {number} Número de líneas vacías
     */
    lineasVacias(bloque) {
        if (!bloque) return 0;
        return bloque.split('\n').filter(linea => linea.trim() === '').length;
    }

    /**
     * Detecta posibles problemas de rendimiento
     * @param {string} contenido - Contenido a analizar
     * @returns {Array} Problemas encontrados
     */
    detectarProblemasRendimiento(contenido = this.contenido) {
        const problemas = [];
        
        // Bucles anidados profundos
        const bucles = contenido.match(/for\s*\(|while\s*\(/g);
        if (bucles && bucles.length > 10) {
            problemas.push({
                tipo: 'rendimiento',
                mensaje: `Múltiples bucles detectados (${bucles.length}). Posible impacto en rendimiento.`,
                severidad: 'media'
            });
        }
        
        // Event listeners sin limpieza
        if (contenido.includes('addEventListener') && !contenido.includes('removeEventListener')) {
            problemas.push({
                tipo: 'rendimiento',
                mensaje: 'Posible fuga de memoria: addEventListener sin removeEventListener correspondiente.',
                severidad: 'alta'
            });
        }
        
        // setTimeout/setInterval sin limpieza
        if (contenido.includes('setInterval') && !contenido.includes('clearInterval')) {
            problemas.push({
                tipo: 'rendimiento',
                mensaje: 'Posible fuga de memoria: setInterval sin clearInterval correspondiente.',
                severidad: 'alta'
            });
        }
        
        return problemas;
    }
}