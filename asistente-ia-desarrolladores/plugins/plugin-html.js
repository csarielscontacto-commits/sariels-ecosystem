/**
 * ================================================================
 * PLUGIN HTML - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Analizador especializado en archivos HTML.
 * Detecta problemas de estructura, accesibilidad, SEO y rendimiento.
 * 
 * @module PluginHTML
 */

/**
 * Plugin para análisis de HTML
 */
export const PluginHTML = {
    nombre: 'Analizador HTML',
    version: '1.0.0',
    descripcion: 'Analiza archivos HTML en busca de problemas de estructura, accesibilidad, SEO y rendimiento',
    
    /**
     * Reglas que aplica este plugin
     */
    reglas: [
        'estructura',
        'accesibilidad',
        'seo',
        'rendimiento',
        'semantica'
    ],
    
    /**
     * Analiza un archivo HTML
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
                etiquetas: 0,
                enlaces: 0,
                imagenes: 0,
                scripts: 0,
                estilos: 0
            }
        };
        
        if (!contenido) return resultados;
        
        const lineas = contenido.split('\n');
        resultados.metricas.lineas = lineas.length;
        
        // ================================================================
        // 1. ESTRUCTURA BÁSICA
        // ================================================================
        
        // Verificar DOCTYPE
        if (!contenido.includes('<!DOCTYPE html>')) {
            resultados.advertencias.push({
                mensaje: 'Falta la declaración DOCTYPE. Agrega <!DOCTYPE html> al inicio del archivo.',
                archivo,
                linea: 1,
                tipo: 'estructura',
                severidad: 'alta'
            });
        }
        
        // Verificar etiqueta html
        if (!contenido.includes('<html')) {
            resultados.errores.push({
                mensaje: 'Falta la etiqueta <html>',
                archivo,
                linea: 1,
                tipo: 'estructura',
                severidad: 'alta'
            });
        }
        
        // Verificar etiqueta head
        if (!contenido.includes('<head')) {
            resultados.errores.push({
                mensaje: 'Falta la etiqueta <head>',
                archivo,
                linea: 1,
                tipo: 'estructura',
                severidad: 'media'
            });
        }
        
        // Verificar etiqueta body
        if (!contenido.includes('<body')) {
            resultados.errores.push({
                mensaje: 'Falta la etiqueta <body>',
                archivo,
                linea: 1,
                tipo: 'estructura',
                severidad: 'alta'
            });
        }
        
        // ================================================================
        // 2. META TAGS (SEO)
        // ================================================================
        
        // Verificar charset
        if (!contenido.includes('charset')) {
            resultados.advertencias.push({
                mensaje: 'Falta la declaración de charset. Recomendado: <meta charset="UTF-8">',
                archivo,
                linea: 1,
                tipo: 'seo',
                severidad: 'media'
            });
        }
        
        // Verificar viewport (responsive)
        if (!contenido.includes('viewport')) {
            resultados.advertencias.push({
                mensaje: 'Falta la meta etiqueta viewport para responsive design. Recomendado: <meta name="viewport" content="width=device-width, initial-scale=1.0">',
                archivo,
                linea: 1,
                tipo: 'seo',
                severidad: 'media'
            });
        }
        
        // Verificar title
        if (!contenido.includes('<title>') && !contenido.includes('</title>')) {
            resultados.errores.push({
                mensaje: 'Falta la etiqueta <title>. Es esencial para SEO y accesibilidad.',
                archivo,
                linea: 1,
                tipo: 'seo',
                severidad: 'alta'
            });
        }
        
        // Verificar meta description
        if (!contenido.includes('name="description"') && !contenido.includes("name='description'")) {
            resultados.advertencias.push({
                mensaje: 'Falta la meta descripción. Mejora el SEO agregando <meta name="description" content="...">',
                archivo,
                linea: 1,
                tipo: 'seo',
                severidad: 'media'
            });
        }
        
        // Verificar Open Graph (para compartir en redes)
        if (!contenido.includes('og:title') && !contenido.includes('og:description')) {
            resultados.advertencias.push({
                mensaje: 'Faltan etiquetas Open Graph (og:title, og:description, og:image). Mejora la compatibilidad con redes sociales.',
                archivo,
                linea: 1,
                tipo: 'seo',
                severidad: 'baja'
            });
        }
        
        // ================================================================
        // 3. ACCESIBILIDAD
        // ================================================================
        
        // Verificar lang en html
        if (contenido.includes('<html') && !contenido.includes('lang=')) {
            resultados.advertencias.push({
                mensaje: 'Falta el atributo lang en <html>. Recomendado: <html lang="es">',
                archivo,
                linea: 1,
                tipo: 'accesibilidad',
                severidad: 'media'
            });
        }
        
        // Verificar alt en imágenes
        const imagenes = contenido.match(/<img[^>]*>/g) || [];
        resultados.metricas.imagenes = imagenes.length;
        
        for (const img of imagenes) {
            if (!img.includes('alt=') || img.includes('alt=""') || img.includes("alt=''")) {
                resultados.advertencias.push({
                    mensaje: `Imagen sin texto alternativo (alt) o vacío. Mejora la accesibilidad agregando alt descriptivo.`,
                    archivo,
                    linea: obtenerLineaDeTag(contenido, img),
                    tipo: 'accesibilidad',
                    severidad: 'alta'
                });
            }
        }
        
        // Verificar aria labels en elementos interactivos
        const botones = contenido.match(/<button[^>]*>/g) || [];
        const enlaces = contenido.match(/<a[^>]*>/g) || [];
        resultados.metricas.enlaces = enlaces.length;
        
        const elementosInteractivos = [...botones, ...enlaces];
        for (const elem of elementosInteractivos) {
            if (!elem.includes('aria-label') && !elem.includes('title')) {
                // Solo advertencia si no tiene texto visible
                // Esta verificación es simplificada
                if (!elem.includes('>')) {
                    resultados.advertencias.push({
                        mensaje: 'Elemento interactivo sin etiqueta accesible. Considera agregar aria-label o title.',
                        archivo,
                        linea: obtenerLineaDeTag(contenido, elem),
                        tipo: 'accesibilidad',
                        severidad: 'media'
                    });
                }
            }
        }
        
        // Verificar headings en orden
        const headings = contenido.match(/<h[1-6][^>]*>/g) || [];
        let headingLevels = headings.map(h => parseInt(h.match(/<h([1-6])/)[1]));
        let lastLevel = 0;
        for (const level of headingLevels) {
            if (level > lastLevel + 1 && lastLevel > 0) {
                resultados.advertencias.push({
                    mensaje: `Salto en jerarquía de headings: de h${lastLevel} a h${level}. Mantén un orden lógico.`,
                    archivo,
                    linea: 1,
                    tipo: 'accesibilidad',
                    severidad: 'media'
                });
            }
            lastLevel = level;
        }
        
        // ================================================================
        // 4. RENDIMIENTO
        // ================================================================
        
        // Contar scripts
        const scripts = contenido.match(/<script[^>]*>/g) || [];
        resultados.metricas.scripts = scripts.length;
        
        // Verificar scripts bloqueantes
        for (const script of scripts) {
            if (script.includes('src=') && !script.includes('async') && !script.includes('defer')) {
                resultados.advertencias.push({
                    mensaje: 'Script sin async/defer. Puede bloquear el renderizado. Agrega async o defer para mejorar rendimiento.',
                    archivo,
                    linea: obtenerLineaDeTag(contenido, script),
                    tipo: 'rendimiento',
                    severidad: 'media'
                });
            }
        }
        
        // Contar estilos
        const estilos = contenido.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
        resultados.metricas.estilos = estilos.length;
        
        // Verificar estilos bloqueantes
        for (const estilo of estilos) {
            if (!estilo.includes('media=') && !estilo.includes('preload')) {
                resultados.advertencias.push({
                    mensaje: 'CSS sin media query o preload. Considera usar media="print" o preload para mejorar rendimiento.',
                    archivo,
                    linea: obtenerLineaDeTag(contenido, estilo),
                    tipo: 'rendimiento',
                    severidad: 'baja'
                });
            }
        }
        
        // Verificar imágenes sin width/height
        for (const img of imagenes) {
            if (!img.includes('width=') && !img.includes('height=')) {
                resultados.advertencias.push({
                    mensaje: 'Imagen sin atributos width/height. Puede causar layout shift. Agrega width y height.',
                    archivo,
                    linea: obtenerLineaDeTag(contenido, img),
                    tipo: 'rendimiento',
                    severidad: 'media'
                });
            }
        }
        
        // ================================================================
        // 5. SEMÁNTICA
        // ================================================================
        
        // Verificar uso de etiquetas semánticas
        const semanticas = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
        for (const tag of semanticas) {
            if (!contenido.includes(`<${tag}`)) {
                resultados.advertencias.push({
                    mensaje: `No se encontró la etiqueta semántica <${tag}>. Mejora la estructura usando etiquetas semánticas.`,
                    archivo,
                    linea: 1,
                    tipo: 'semantica',
                    severidad: 'baja'
                });
            }
        }
        
        // Verificar enlaces rotos (simplificado)
        const enlacesHtml = contenido.match(/href\s*=\s*['"]([^'"]+)['"]/g) || [];
        const enlacesInternos = enlacesHtml.filter(e => !e.includes('http://') && !e.includes('https://') && !e.startsWith('href="#'));
        resultados.metricas.enlaces = enlacesInternos.length;
        
        // ================================================================
        // 6. FORMAS Y VALIDACIÓN
        // ================================================================
        
        // Verificar inputs sin label
        const inputs = contenido.match(/<input[^>]*>/g) || [];
        for (const input of inputs) {
            if (!input.includes('type="hidden"') && !input.includes("type='hidden'")) {
                // Buscar label asociado
                const id = input.match(/id\s*=\s*['"]([^'"]+)['"]/);
                if (id) {
                    if (!contenido.includes(`for="${id[1]}"`) && !contenido.includes(`for='${id[1]}'`)) {
                        resultados.advertencias.push({
                            mensaje: `Input sin label asociado (id="${id[1]}"). Agrega <label for="${id[1]}">`,
                            archivo,
                            linea: obtenerLineaDeTag(contenido, input),
                            tipo: 'accesibilidad',
                            severidad: 'media'
                        });
                    }
                } else {
                    resultados.advertencias.push({
                        mensaje: 'Input sin id ni label asociado. Agrega id y label para accesibilidad.',
                        archivo,
                        linea: obtenerLineaDeTag(contenido, input),
                        tipo: 'accesibilidad',
                        severidad: 'media'
                    });
                }
            }
        }
        
        return resultados;
    },
    
    /**
     * Corrige problemas automáticamente (cuando es posible)
     * @param {Object} item - Item a corregir
     * @returns {Object} Resultado de la corrección
     */
    corregir(item) {
        // La mayoría de las correcciones de HTML requieren intervención manual
        return {
            aplicada: false,
            mensaje: 'Las correcciones de HTML requieren revisión manual para evitar pérdida de contenido'
        };
    }
};

/**
 * Obtiene el número de línea de un tag en el contenido
 * @param {string} contenido - Contenido completo
 * @param {string} tag - Tag a buscar
 * @returns {number} Número de línea
 */
function obtenerLineaDeTag(contenido, tag) {
    const index = contenido.indexOf(tag);
    if (index === -1) return 1;
    const antes = contenido.substring(0, index);
    return antes.split('\n').length;
}

export default PluginHTML;