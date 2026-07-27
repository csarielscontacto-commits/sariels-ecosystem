/**
 * ================================================================
 * PLUGIN JAVASCRIPT - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Analizador especializado en archivos JavaScript.
 * Detecta problemas de sintaxis, rendimiento, seguridad y buenas prácticas.
 * 
 * @module PluginJS
 */

/**
 * Plugin para análisis de JavaScript
 */
export const PluginJS = {
    nombre: 'Analizador JavaScript',
    version: '1.0.0',
    descripcion: 'Analiza archivos JavaScript en busca de problemas de sintaxis, rendimiento, seguridad y buenas prácticas',
    
    /**
     * Reglas que aplica este plugin
     */
    reglas: [
        'sintaxis',
        'rendimiento',
        'seguridad',
        'buenas_practicas',
        'mantenibilidad'
    ],
    
    /**
     * Analiza un archivo JavaScript
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
                funciones: 0,
                clases: 0,
                variables: 0,
                bucles: 0,
                condicionales: 0
            }
        };
        
        if (!contenido) return resultados;
        
        const lineas = contenido.split('\n');
        resultados.metricas.lineas = lineas.length;
        
        // ================================================================
        // 1. SINTaxis (validación básica)
        // ================================================================
        
        try {
            new Function(contenido);
        } catch (error) {
            const match = error.message.match(/line (\d+)/i);
            resultados.errores.push({
                mensaje: `Error de sintaxis: ${error.message}`,
                archivo,
                linea: match ? parseInt(match[1]) : 1,
                tipo: 'sintaxis',
                severidad: 'alta'
            });
        }
        
        // ================================================================
        // 2. RENDIMIENTO
        // ================================================================
        
        // Detectar bucles
        const bucles = contenido.match(/for\s*\(|while\s*\(/g) || [];
        resultados.metricas.bucles = bucles.length;
        
        if (bucles.length > 10) {
            resultados.advertencias.push({
                mensaje: `Múltiples bucles detectados (${bucles.length}). Considera optimizar para mejorar rendimiento.`,
                archivo,
                linea: 1,
                tipo: 'rendimiento',
                severidad: 'media'
            });
        }
        
        // Detectar bucles anidados
        const lineasBucle = lineas.filter(l => l.includes('for(') || l.includes('for (') || l.includes('while(') || l.includes('while ('));
        let buclesAnidados = 0;
        for (let i = 0; i < lineasBucle.length; i++) {
            for (let j = i + 1; j < lineasBucle.length; j++) {
                if (lineasBucle[j].includes('{') && !lineasBucle[j].includes('}')) {
                    buclesAnidados++;
                }
            }
        }
        
        if (buclesAnidados > 3) {
            resultados.advertencias.push({
                mensaje: `Posibles bucles anidados detectados (${buclesAnidados}). Pueden causar problemas de rendimiento.`,
                archivo,
                linea: 1,
                tipo: 'rendimiento',
                severidad: 'alta'
            });
        }
        
        // Detectar event listeners sin cleanup
        if (contenido.includes('addEventListener') && !contenido.includes('removeEventListener')) {
            resultados.advertencias.push({
                mensaje: 'Posible fuga de memoria: addEventListener sin removeEventListener correspondiente.',
                archivo,
                linea: 1,
                tipo: 'rendimiento',
                severidad: 'alta'
            });
        }
        
        // Detectar setInterval sin clearInterval
        if (contenido.includes('setInterval') && !contenido.includes('clearInterval')) {
            resultados.advertencias.push({
                mensaje: 'Posible fuga de memoria: setInterval sin clearInterval correspondiente.',
                archivo,
                linea: 1,
                tipo: 'rendimiento',
                severidad: 'alta'
            });
        }
        
        // ================================================================
        // 3. SEGURIDAD
        // ================================================================
        
        // Detectar uso de eval()
        if (contenido.includes('eval(')) {
            resultados.errores.push({
                mensaje: 'Uso de eval() detectado. Es una práctica insegura y puede ser explotada.',
                archivo,
                linea: 1,
                tipo: 'seguridad',
                severidad: 'alta'
            });
        }
        
        // Detectar innerHTML sin sanitización
        if (contenido.includes('innerHTML')) {
            // Verificar si hay sanitización (simplificado)
            if (!contenido.includes('textContent') && !contenido.includes('DOMPurify')) {
                resultados.advertencias.push({
                    mensaje: 'Uso de innerHTML sin sanitización. Puede ser vulnerable a XSS. Considera usar textContent o DOMPurify.',
                    archivo,
                    linea: 1,
                    tipo: 'seguridad',
                    severidad: 'alta'
                });
            }
        }
        
        // Detectar console.log en modo producción (simulado)
        if (contenido.includes('console.log') || contenido.includes('console.info')) {
            resultados.advertencias.push({
                mensaje: 'Uso de console.log/info detectado. Considera eliminarlos en producción.',
                archivo,
                linea: 1,
                tipo: 'seguridad',
                severidad: 'baja'
            });
        }
        
        // ================================================================
        // 4. BUENAS PRÁCTICAS
        // ================================================================
        
        // Detectar var
        if (contenido.includes('var ')) {
            const varCount = (contenido.match(/var /g) || []).length;
            resultados.advertencias.push({
                mensaje: `Uso de 'var' detectado (${varCount} veces). Considera usar 'let' o 'const' para mejor scope.`,
                archivo,
                linea: 1,
                tipo: 'buenas_practicas',
                severidad: 'media'
            });
        }
        
        // Detectar funciones largas (más de 50 líneas)
        const funciones = contenido.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\}/g) || [];
        resultados.metricas.funciones = funciones.length;
        
        for (const fn of funciones) {
            const lineasFn = fn.split('\n').length;
            if (lineasFn > 50) {
                resultados.advertencias.push({
                    mensaje: `Función larga (${lineasFn} líneas). Considera refactorizar en funciones más pequeñas.`,
                    archivo,
                    linea: 1,
                    tipo: 'buenas_practicas',
                    severidad: 'media'
                });
            }
        }
        
        // Detectar clases (solo para métricas)
        const clases = contenido.match(/class\s+\w+/g) || [];
        resultados.metricas.clases = clases.length;
        
        // Detectar variables globales (sin let/const)
        const variables = contenido.match(/^\s*(?:var|let|const)\s+\w+/gm) || [];
        resultados.metricas.variables = variables.length;
        
        // ================================================================
        // 5. MANTENIBILIDAD
        // ================================================================
        
        // Detectar archivos muy grandes
        if (lineas.length > 1000) {
            resultados.advertencias.push({
                mensaje: `Archivo muy grande (${lineas.length} líneas). Considera dividirlo en módulos más pequeños.`,
                archivo,
                linea: 1,
                tipo: 'mantenibilidad',
                severidad: 'media'
            });
        }
        
        // Detectar comentarios (documentación)
        if (!contenido.includes('//') && !contenido.includes('/*') && lineas.length > 200) {
            resultados.advertencias.push({
                mensaje: 'Archivo sin comentarios. Considera documentar el código.',
                archivo,
                linea: 1,
                tipo: 'mantenibilidad',
                severidad: 'baja'
            });
        }
        
        // Detectar código duplicado (simplificado)
        const lineasUnicas = new Set(lineas.filter(l => l.trim().length > 20));
        if (lineas.length > 100 && lineasUnicas.size < lineas.length * 0.7) {
            resultados.advertencias.push({
                mensaje: 'Posible código duplicado detectado (baja diversidad de líneas). Considera refactorizar.',
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
        switch (item.tipo) {
            case 'sintaxis':
                return {
                    aplicada: false,
                    mensaje: 'Los errores de sintaxis requieren corrección manual'
                };
            case 'seguridad':
                if (item.mensaje.includes('eval')) {
                    return {
                        aplicada: false,
                        mensaje: 'Reemplaza eval() por alternativas seguras como Function() o JSON.parse()'
                    };
                }
                if (item.mensaje.includes('innerHTML')) {
                    return {
                        aplicada: false,
                        mensaje: 'Reemplaza innerHTML por textContent o usa DOMPurify para sanitizar'
                    };
                }
                return {
                    aplicada: false,
                    mensaje: 'Las correcciones de seguridad requieren revisión manual'
                };
            default:
                return {
                    aplicada: false,
                    mensaje: `Corrección automática no disponible para: ${item.tipo}`
                };
        }
    }
};

export default PluginJS;