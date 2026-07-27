/**
 * ================================================================
 * PLANTILLA DE PLUGIN - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Plantilla para crear nuevos plugins de análisis.
 * Copia este archivo y modifica según tus necesidades.
 * 
 * @module PluginTemplate
 */

/**
 * Plantilla para crear un nuevo plugin
 */
export const PluginTemplate = {
    /**
     * Información del plugin
     */
    nombre: 'Nombre del Plugin',
    version: '1.0.0',
    descripcion: 'Descripción breve del plugin',
    
    /**
     * Reglas que aplica este plugin
     * Lista de identificadores de reglas
     */
    reglas: [
        'regla1',
        'regla2',
        'regla3'
    ],
    
    /**
     * Analiza un archivo
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @returns {Object} Resultados del análisis
     */
    analizar(contenido, archivo) {
        // ================================================================
        // INICIALIZAR RESULTADOS
        // ================================================================
        const resultados = {
            errores: [],
            advertencias: [],
            metricas: {}
        };
        
        // Si no hay contenido, retornar vacío
        if (!contenido) return resultados;
        
        // ================================================================
        // MÉTRICAS BÁSICAS
        // ================================================================
        const lineas = contenido.split('\n');
        resultados.metricas.lineas = lineas.length;
        
        // ================================================================
        // REGLA DE EJEMPLO 1
        // ================================================================
        // Buscar un patrón específico en el contenido
        const patronEjemplo = /patron-ejemplo/g;
        const coincidencias = contenido.match(patronEjemplo);
        
        if (coincidencias && coincidencias.length > 0) {
            resultados.advertencias.push({
                mensaje: `Se encontraron ${coincidencias.length} coincidencias del patrón.`,
                archivo,
                linea: 1,
                tipo: 'regla1',
                severidad: 'media'
            });
        }
        
        // ================================================================
        // REGLA DE EJEMPLO 2
        // ================================================================
        // Buscar otro patrón
        const patronEjemplo2 = /otro-patron/g;
        if (patronEjemplo2.test(contenido)) {
            resultados.errores.push({
                mensaje: 'Patrón problemático detectado.',
                archivo,
                linea: 1,
                tipo: 'regla2',
                severidad: 'alta'
            });
        }
        
        // ================================================================
        // REGLA DE EJEMPLO 3 (por línea)
        // ================================================================
        lineas.forEach((linea, index) => {
            if (linea.includes('problema-linea')) {
                resultados.advertencias.push({
                    mensaje: 'Problema detectado en esta línea.',
                    archivo,
                    linea: index + 1,
                    tipo: 'regla3',
                    severidad: 'baja'
                });
            }
        });
        
        return resultados;
    },
    
    /**
     * Corrige problemas automáticamente
     * @param {Object} item - Item a corregir
     * @returns {Object} Resultado de la corrección
     */
    corregir(item) {
        // Determinar qué tipo de corrección aplicar
        switch (item.tipo) {
            case 'regla1':
                return {
                    aplicada: false,
                    mensaje: 'Corrección para regla1 no implementada'
                };
            case 'regla2':
                return {
                    aplicada: true,
                    mensaje: 'Corrección para regla2 aplicada correctamente',
                    // Puedes incluir más información como el contenido antes/después
                    antes: 'código antes',
                    despues: 'código después'
                };
            case 'regla3':
                return {
                    aplicada: false,
                    mensaje: 'Corrección para regla3 requiere intervención manual'
                };
            default:
                return {
                    aplicada: false,
                    mensaje: `Corrección no disponible para: ${item.tipo}`
                };
        }
    }
};

/**
 * ================================================================
 * GUÍA PARA CREAR UN NUEVO PLUGIN
 * ================================================================
 * 
 * 1. Copia este archivo y renómbralo como plugin-nuevo.js
 * 
 * 2. Modifica la información del plugin:
 *    - nombre: Nombre descriptivo
 *    - version: Versión del plugin
 *    - descripcion: Breve descripción
 * 
 * 3. Define tus reglas en el array 'reglas'
 * 
 * 4. Implementa la función 'analizar':
 *    - Recibe contenido y archivo
 *    - Retorna { errores, advertencias, metricas }
 * 
 * 5. (Opcional) Implementa la función 'corregir':
 *    - Recibe un item de error/advertencia
 *    - Retorna { aplicada, mensaje, antes, despues }
 * 
 * 6. Registra el plugin en el PluginManager:
 *    pluginManager.registrarPlugin(PluginNuevo);
 * 
 * ================================================================
 * EJEMPLO DE REGISTRO
 * ================================================================
 * 
 * import { PluginNuevo } from './plugins/plugin-nuevo.js';
 * 
 * const pluginManager = new PluginManager();
 * pluginManager.registrarPlugin(PluginNuevo);
 * 
 * ================================================================
 * TIPOS DE SEVERIDAD
 * ================================================================
 * 
 * - 'alta': Problema crítico que debe corregirse
 * - 'media': Problema importante que debería corregirse
 * - 'baja': Sugerencia de mejora
 * 
 * ================================================================
 * TIPOS DE ERRORES COMUNES
 * ================================================================
 * 
 * - 'sintaxis': Error de sintaxis
 * - 'seguridad': Problema de seguridad
 * - 'rendimiento': Problema de rendimiento
 * - 'accesibilidad': Problema de accesibilidad
 * - 'seo': Problema de SEO
 * - 'compatibilidad': Problema de compatibilidad
 * - 'mantenibilidad': Problema de mantenibilidad
 * - 'buenas_practicas': Violación de buenas prácticas
 * 
 * ================================================================
 */

export default PluginTemplate;