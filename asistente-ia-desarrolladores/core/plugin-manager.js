/**
 * ================================================================
 * SISTEMA DE PLUGINS - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Sistema extensible para agregar nuevos analizadores sin modificar el núcleo.
 * 
 * @module PluginManager
 */

/**
 * Clase principal del Sistema de Plugins
 */
export class PluginManager {
    /**
     * Constructor
     */
    constructor() {
        this.plugins = new Map();
        this.pluginsCargados = new Set();
        this.analizadores = [];
        this.resultadosPlugins = new Map();
    }

    /**
     * Registra un plugin en el sistema
     * @param {Object} plugin - Plugin a registrar
     * @param {string} plugin.nombre - Nombre del plugin
     * @param {string} plugin.version - Versión del plugin
     * @param {Array} plugin.reglas - Reglas del plugin
     * @param {Function} plugin.analizar - Función de análisis
     * @param {Function} plugin.corregir - Función de corrección
     * @returns {boolean} True si se registró correctamente
     */
    registrarPlugin(plugin) {
        // Validar que el plugin tenga la estructura mínima
        if (!plugin.nombre || !plugin.analizar || typeof plugin.analizar !== 'function') {
            console.error(`❌ Plugin inválido: ${plugin.nombre || 'sin nombre'}`);
            return false;
        }
        
        // Verificar que no esté duplicado
        if (this.plugins.has(plugin.nombre)) {
            console.warn(`⚠️ Plugin '${plugin.nombre}' ya está registrado. Sobrescribiendo...`);
        }
        
        // Registrar el plugin
        this.plugins.set(plugin.nombre, {
            ...plugin,
            registrado: Date.now(),
            activo: true
        });
        
        // Si tiene reglas, agregarlas al sistema de análisis
        if (plugin.reglas && Array.isArray(plugin.reglas)) {
            this.analizadores.push({
                nombre: plugin.nombre,
                reglas: plugin.reglas,
                analizar: plugin.analizar,
                corregir: plugin.corregir || null
            });
        }
        
        console.log(`✅ Plugin '${plugin.nombre}' registrado correctamente (v${plugin.version || '1.0'})`);
        return true;
    }

    /**
     * Carga un plugin desde un archivo
     * @param {string} rutaPlugin - Ruta del archivo del plugin
     * @returns {Promise<boolean>} True si se cargó correctamente
     */
    async cargarPlugin(rutaPlugin) {
        try {
            // En un entorno real, se cargaría desde el sistema de archivos
            // Aquí simulamos la carga
            const plugin = await import(rutaPlugin);
            if (plugin.default) {
                return this.registrarPlugin(plugin.default);
            }
            return this.registrarPlugin(plugin);
        } catch (error) {
            console.error(`❌ Error cargando plugin '${rutaPlugin}':`, error);
            return false;
        }
    }

    /**
     * Carga plugins desde un directorio
     * @param {string} directorio - Directorio de plugins
     * @returns {Promise<Array>} Plugins cargados
     */
    async cargarPluginsDesdeDirectorio(directorio) {
        const cargados = [];
        // En un entorno real, se leería el directorio
        // Aquí simulamos la carga de plugins predefinidos
        const pluginsPredefinidos = [
            { nombre: 'plugin-html', version: '1.0', reglas: ['html', 'estructura', 'accesibilidad'] },
            { nombre: 'plugin-css', version: '1.0', reglas: ['css', 'estilos', 'responsive'] },
            { nombre: 'plugin-js', version: '1.0', reglas: ['javascript', 'sintaxis', 'rendimiento'] },
            { nombre: 'plugin-seguridad', version: '1.0', reglas: ['seguridad', 'xss', 'inyeccion'] },
            { nombre: 'plugin-accesibilidad', version: '1.0', reglas: ['accesibilidad', 'a11y', 'wcag'] }
        ];
        
        for (const pluginInfo of pluginsPredefinidos) {
            // Crear un plugin simple
            const plugin = this._crearPluginSimple(pluginInfo);
            if (this.registrarPlugin(plugin)) {
                cargados.push(plugin.nombre);
            }
        }
        
        return cargados;
    }

    /**
     * Crea un plugin simple para pruebas
     * @param {Object} info - Información del plugin
     * @returns {Object} Plugin creado
     * @private
     */
    _crearPluginSimple(info) {
        return {
            nombre: info.nombre,
            version: info.version || '1.0',
            reglas: info.reglas || [],
            analizar: (contenido, archivo) => {
                // Análisis simple
                const resultados = {
                    errores: [],
                    advertencias: [],
                    metricas: {}
                };
                
                // Reglas simples
                if (info.reglas.includes('html')) {
                    // Verificar etiquetas básicas
                    if (contenido && !contenido.includes('<!DOCTYPE html>')) {
                        resultados.advertencias.push({
                            mensaje: 'Falta la declaración DOCTYPE',
                            archivo: archivo,
                            linea: 1,
                            tipo: 'html'
                        });
                    }
                }
                
                if (info.reglas.includes('css')) {
                    // Verificar propiedades comunes
                    if (contenido && !contenido.includes('margin')) {
                        resultados.advertencias.push({
                            mensaje: 'No se encontraron propiedades de margin en CSS',
                            archivo: archivo,
                            linea: 1,
                            tipo: 'css'
                        });
                    }
                }
                
                if (info.reglas.includes('javascript')) {
                    // Verificar uso de 'var'
                    if (contenido && contenido.includes('var ')) {
                        resultados.advertencias.push({
                            mensaje: 'Uso de "var" detectado. Considera usar "let" o "const".',
                            archivo: archivo,
                            linea: 1,
                            tipo: 'javascript'
                        });
                    }
                }
                
                return resultados;
            },
            corregir: (item) => {
                // Corrección simple
                return {
                    aplicada: false,
                    mensaje: 'Corrección automática no implementada para este plugin'
                };
            }
        };
    }

    /**
     * Deshabilita un plugin
     * @param {string} nombrePlugin - Nombre del plugin
     * @returns {boolean} True si se deshabilitó
     */
    deshabilitarPlugin(nombrePlugin) {
        if (!this.plugins.has(nombrePlugin)) {
            console.warn(`⚠️ Plugin '${nombrePlugin}' no encontrado`);
            return false;
        }
        
        const plugin = this.plugins.get(nombrePlugin);
        plugin.activo = false;
        this.plugins.set(nombrePlugin, plugin);
        
        // Remover de analizadores
        this.analizadores = this.analizadores.filter(a => a.nombre !== nombrePlugin);
        
        console.log(`⏸️ Plugin '${nombrePlugin}' deshabilitado`);
        return true;
    }

    /**
     * Habilita un plugin
     * @param {string} nombrePlugin - Nombre del plugin
     * @returns {boolean} True si se habilitó
     */
    habilitarPlugin(nombrePlugin) {
        if (!this.plugins.has(nombrePlugin)) {
            console.warn(`⚠️ Plugin '${nombrePlugin}' no encontrado`);
            return false;
        }
        
        const plugin = this.plugins.get(nombrePlugin);
        plugin.activo = true;
        this.plugins.set(nombrePlugin, plugin);
        
        // Agregar a analizadores
        if (plugin.reglas && Array.isArray(plugin.reglas)) {
            this.analizadores.push({
                nombre: plugin.nombre,
                reglas: plugin.reglas,
                analizar: plugin.analizar,
                corregir: plugin.corregir || null
            });
        }
        
        console.log(`▶️ Plugin '${nombrePlugin}' habilitado`);
        return true;
    }

    /**
     * Elimina un plugin
     * @param {string} nombrePlugin - Nombre del plugin
     * @returns {boolean} True si se eliminó
     */
    eliminarPlugin(nombrePlugin) {
        if (!this.plugins.has(nombrePlugin)) {
            console.warn(`⚠️ Plugin '${nombrePlugin}' no encontrado`);
            return false;
        }
        
        this.plugins.delete(nombrePlugin);
        this.analizadores = this.analizadores.filter(a => a.nombre !== nombrePlugin);
        
        console.log(`🗑️ Plugin '${nombrePlugin}' eliminado`);
        return true;
    }

    /**
     * Ejecuta el análisis con todos los plugins activos
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @returns {Object} Resultados consolidados
     */
    ejecutarAnalisis(contenido, archivo) {
        const resultados = {
            errores: [],
            advertencias: [],
            metricas: {},
            plugins: []
        };
        
        for (const analizador of this.analizadores) {
            try {
                const resultado = analizador.analizar(contenido, archivo);
                if (resultado) {
                    // Consolidar errores y advertencias
                    if (resultado.errores) {
                        resultados.errores.push(...resultado.errores);
                    }
                    if (resultado.advertencias) {
                        resultados.advertencias.push(...resultado.advertencias);
                    }
                    if (resultado.metricas) {
                        Object.assign(resultados.metricas, resultado.metricas);
                    }
                    resultados.plugins.push(analizador.nombre);
                }
            } catch (error) {
                console.error(`❌ Error en plugin '${analizador.nombre}':`, error);
            }
        }
        
        return resultados;
    }

    /**
     * Ejecuta la corrección con el plugin adecuado
     * @param {Object} item - Item a corregir
     * @returns {Object} Resultado de la corrección
     */
    ejecutarCorreccion(item) {
        for (const analizador of this.analizadores) {
            if (analizador.corregir && typeof analizador.corregir === 'function') {
                try {
                    const resultado = analizador.corregir(item);
                    if (resultado && resultado.aplicada) {
                        return resultado;
                    }
                } catch (error) {
                    console.error(`❌ Error en corrección de plugin '${analizador.nombre}':`, error);
                }
            }
        }
        
        return {
            aplicada: false,
            mensaje: 'No se encontró un plugin que pueda corregir este problema'
        };
    }

    /**
     * Obtiene la lista de plugins registrados
     * @param {boolean} soloActivos - Solo plugins activos
     * @returns {Array} Lista de plugins
     */
    getPlugins(soloActivos = false) {
        const plugins = [];
        for (const [nombre, plugin] of this.plugins) {
            if (soloActivos && !plugin.activo) continue;
            plugins.push({
                nombre,
                version: plugin.version || '1.0',
                activo: plugin.activo,
                reglas: plugin.reglas || [],
                registrado: plugin.registrado
            });
        }
        return plugins;
    }

    /**
     * Obtiene un plugin por nombre
     * @param {string} nombrePlugin - Nombre del plugin
     * @returns {Object|null} Plugin encontrado o null
     */
    getPlugin(nombrePlugin) {
        return this.plugins.get(nombrePlugin) || null;
    }

    /**
     * Exporta la configuración de plugins
     * @returns {Object} Configuración de plugins
     */
    exportarConfiguracion() {
        const config = {
            plugins: [],
            timestamp: Date.now()
        };
        
        for (const [nombre, plugin] of this.plugins) {
            config.plugins.push({
                nombre,
                version: plugin.version || '1.0',
                activo: plugin.activo,
                reglas: plugin.reglas || [],
                registrado: plugin.registrado
            });
        }
        
        return config;
    }

    /**
     * Importa configuración de plugins
     * @param {Object} config - Configuración a importar
     * @returns {number} Número de plugins importados
     */
    importarConfiguracion(config) {
        let importados = 0;
        if (!config || !config.plugins) return 0;
        
        for (const pluginInfo of config.plugins) {
            if (this.plugins.has(pluginInfo.nombre)) {
                const plugin = this.plugins.get(pluginInfo.nombre);
                plugin.activo = pluginInfo.activo !== undefined ? pluginInfo.activo : plugin.activo;
                this.plugins.set(pluginInfo.nombre, plugin);
                importados++;
            }
        }
        
        return importados;
    }
}