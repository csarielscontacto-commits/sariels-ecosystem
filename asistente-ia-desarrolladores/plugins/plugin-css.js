/**
 * ================================================================
 * PLUGIN CSS - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Analizador especializado en archivos CSS.
 * Detecta problemas de compatibilidad, rendimiento y buenas prácticas.
 * 
 * @module PluginCSS
 */

/**
 * Plugin para análisis de CSS
 */
export const PluginCSS = {
    nombre: 'Analizador CSS',
    version: '1.0.0',
    descripcion: 'Analiza archivos CSS en busca de problemas de compatibilidad, rendimiento y buenas prácticas',
    
    /**
     * Reglas que aplica este plugin
     */
    reglas: [
        'compatibilidad',
        'rendimiento',
        'buenas_practicas',
        'responsive',
        'mantenibilidad'
    ],
    
    /**
     * Analiza un archivo CSS
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @returns {Object} Resultados del análisis
     */
    analizar(contenido, archivo) {
        const resultados = {
            errores: [],
            advertencias: [],
            metricas: {
                lineas: 0,
                reglas: 0,
                propiedades: 0,
                selectores: 0,
                mediaQueries: 0
            }
        };
        
        if (!contenido) return resultados;
        
        const lineas = contenido.split('\n');
        resultados.metricas.lineas = lineas.length;
        
        // ================================================================
        // 1. COMPATIBILIDAD
        // ================================================================
        
        // Verificar prefijos de navegador faltantes
        const propiedadesConPrefijo = {
            'display: flex': ['-webkit-display: flex', '-ms-display: flex'],
            'display: grid': ['-ms-display: grid'],
            'transition': ['-webkit-transition', '-moz-transition', '-o-transition'],
            'transform': ['-webkit-transform', '-moz-transform', '-ms-transform'],
            'animation': ['-webkit-animation', '-moz-animation'],
            'border-radius': ['-webkit-border-radius', '-moz-border-radius'],
            'box-shadow': ['-webkit-box-shadow', '-moz-box-shadow'],
            'flex': ['-webkit-flex', '-ms-flex'],
            'grid': ['-ms-grid'],
            'filter': ['-webkit-filter'],
            'backdrop-filter': ['-webkit-backdrop-filter']
        };
        
        for (const [propiedad, prefijos] of Object.entries(propiedadesConPrefijo)) {
            if (contenido.includes(propiedad)) {
                const todosPrefijos = prefijos.every(p => contenido.includes(p));
                if (!todosPrefijos) {
                    const prefijosFaltantes = prefijos.filter(p => !contenido.includes(p));
                    resultados.advertencias.push({
                        mensaje: `Propiedad '${propiedad}' sin prefijos para compatibilidad. Faltan: ${prefijosFaltantes.join(', ')}`,
                        archivo,
                        linea: 1,
                        tipo: 'compatibilidad',
                        severidad: 'media'
                    });
                }
            }
        }
        
        // ================================================================
        // 2. RENDIMIENTO
        // ================================================================
        
        // Verificar uso de !important
        if (contenido.includes('!important')) {
            const matches = contenido.match(/!important/g);
            if (matches && matches.length > 3) {
                resultados.advertencias.push({
                    mensaje: `Uso excesivo de !important (${matches.length} veces). Considera usar especificidad en su lugar.`,
                    archivo,
                    linea: 1,
                    tipo: 'rendimiento',
                    severidad: 'media'
                });
            }
        }
        
        // Verificar selectores muy complejos
        const selectores = contenido.match(/[^{]+(?=\{)/g) || [];
        resultados.metricas.selectores = selectores.length;
        
        for (const selector of selectores) {
            const profundidad = (selector.match(/\s/g) || []).length;
            if (profundidad > 4) {
                resultados.advertencias.push({
                    mensaje: `Selector muy profundo (${profundidad} niveles). Considera simplificar para mejorar rendimiento.`,
                    archivo,
                    linea: obtenerLineaDeSelector(contenido, selector),
                    tipo: 'rendimiento',
                    severidad: 'baja'
                });
            }
        }
        
        // Verificar uso de @import (bloquea renderizado)
        if (contenido.includes('@import')) {
            resultados.advertencias.push({
                mensaje: 'Uso de @import detectado. Puede bloquear el renderizado. Considera usar <link> en HTML.',
                archivo,
                linea: 1,
                tipo: 'rendimiento',
                severidad: 'media'
            });
        }
        
        // ================================================================
        // 3. BUENAS PRÁCTICAS
        // ================================================================
        
        // Verificar uso de !important
        if (contenido.includes('!important')) {
            resultados.advertencias.push({
                mensaje: 'Uso de !important detectado. Considera usar especificidad en su lugar.',
                archivo,
                linea: 1,
                tipo: 'buenas_practicas',
                severidad: 'baja'
            });
        }
        
        // Verificar propiedades con !important y !important
        const propiedades = contenido.match(/[a-zA-Z-]+:\s*[^;]+;/g) || [];
        resultados.metricas.propiedades = propiedades.length;
        
        // Verificar colores en hex sin alpha
        const hexColores = contenido.match(/#[0-9a-fA-F]{6}/g) || [];
        if (hexColores.length > 10) {
            resultados.advertencias.push({
                mensaje: 'Uso excesivo de colores hex. Considera usar variables CSS para mantener consistencia.',
                archivo,
                linea: 1,
                tipo: 'buenas_practicas',
                severidad: 'baja'
            });
        }
        
        // ================================================================
        // 4. RESPONSIVE
        // ================================================================
        
        // Verificar media queries
        const mediaQueries = contenido.match(/@media\s+[^{]+\{/g) || [];
        resultados.metricas.mediaQueries = mediaQueries.length;
        
        if (mediaQueries.length === 0 && contenido.length > 500) {
            resultados.advertencias.push({
                mensaje: 'No se encontraron media queries. Considera hacer el diseño responsive.',
                archivo,
                linea: 1,
                tipo: 'responsive',
                severidad: 'media'
            });
        }
        
        // Verificar unidades fijas (px) para tamaños importantes
        const pxUnidades = contenido.match(/\d+px/g) || [];
        const remUnidades = contenido.match(/\d+rem/g) || [];
        if (pxUnidades.length > remUnidades.length * 2) {
            resultados.advertencias.push({
                mensaje: 'Uso excesivo de px. Considera usar rem o em para mejor escalabilidad.',
                archivo,
                linea: 1,
                tipo: 'responsive',
                severidad: 'baja'
            });
        }
        
        // ================================================================
        // 5. MANTENIBILIDAD
        // ================================================================
        
        // Verificar archivos muy grandes
        if (lineas.length > 500) {
            resultados.advertencias.push({
                mensaje: `Archivo CSS muy grande (${lineas.length} líneas). Considera dividirlo en módulos.`,
                archivo,
                linea: 1,
                tipo: 'mantenibilidad',
                severidad: 'media'
            });
        }
        
        // Verificar selectores universales
        if (contenido.includes('* {')) {
            resultados.advertencias.push({
                mensaje: 'Uso de selector universal (*) detectado. Puede afectar el rendimiento. Considera usarlo con moderación.',
                archivo,
                linea: 1,
                tipo: 'mantenibilidad',
                severidad: 'baja'
            });
        }
        
        // Verificar comentarios (documentación)
        if (!contenido.includes('/*') && lineas.length > 100) {
            resultados.advertencias.push({
                mensaje: 'Archivo CSS sin comentarios. Considera documentar secciones importantes.',
                archivo,
                linea: 1,
                tipo: 'mantenibilidad',
                severidad: 'baja'
            });
        }
        
        return resultados;
    },
    
    /**
     * Corrige problemas automáticamente
     * @param {Object} item - Item a corregir
     * @returns {Object} Resultado de la corrección
     */
    corregir(item) {
        // La mayoría de las correcciones de CSS requieren intervención manual
        return {
            aplicada: false,
            mensaje: 'Las correcciones de CSS requieren revisión manual para evitar pérdida de estilo'
        };
    }
};

/**
 * Obtiene el número de línea de un selector en el contenido
 * @param {string} contenido - Contenido completo
 * @param {string} selector - Selector a buscar
 * @returns {number} Número de línea
 */
function obtenerLineaDeSelector(contenido, selector) {
    const index = contenido.indexOf(selector);
    if (index === -1) return 1;
    const antes = contenido.substring(0, index);
    return antes.split('\n').length;
}

export default PluginCSS;