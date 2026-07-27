/**
 * ================================================================
 * ESCÁNER INTELIGENTE - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Escanea proyectos completos detectando errores de sintaxis,
 * variables sin usar, código muerto, imports rotos, etc.
 * 
 * @module Escaner
 */

/**
 * Clase principal del Escáner Inteligente
 */
export class Escaner {
    /**
     * Constructor
     * @param {Object} opciones - Opciones de configuración
     */
    constructor(opciones = {}) {
        this.opciones = {
            detectarErroresSintaxis: true,
            detectarVariablesSinUsar: true,
            detectarFuncionesDuplicadas: true,
            detectarCodigoMuerto: true,
            detectarImportsRotos: true,
            detectarRutasInexistentes: true,
            detectarArchivosHuerfanos: true,
            detectarCSSsinUsar: true,
            detectarFuncionesNuncaLlamadas: true,
            detectarDependenciasFaltantes: true,
            detectarFugasMemoria: true,
            detectarProblemasRendimiento: true,
            ...opciones
        };
        
        this.resultados = {
            errores: [],
            advertencias: [],
            metricas: {},
            archivosAnalizados: []
        };
        
        this.archivosEscaneados = 0;
        this.progreso = 0;
        this.cancelado = false;
    }

    /**
     * Escanea un proyecto completo
     * @param {Object} indice - Índice del proyecto
     * @param {Function} callbackProgreso - Callback de progreso
     * @returns {Object} Resultados del escaneo
     */
    escanearProyecto(indice, callbackProgreso = null) {
        this.resultados = {
            errores: [],
            advertencias: [],
            metricas: {},
            archivosAnalizados: []
        };
        
        this.archivosEscaneados = 0;
        this.progreso = 0;
        this.cancelado = false;
        
        const totalArchivos = indice.archivos.length;
        
        // Escanear cada archivo
        for (let i = 0; i < indice.archivos.length; i++) {
            if (this.cancelado) break;
            
            const archivo = indice.archivos[i];
            const resultadoArchivo = this._escanearArchivo(archivo, indice);
            
            if (resultadoArchivo) {
                this.resultados.archivosAnalizados.push(resultadoArchivo);
                
                if (resultadoArchivo.errores) {
                    this.resultados.errores.push(...resultadoArchivo.errores);
                }
                if (resultadoArchivo.advertencias) {
                    this.resultados.advertencias.push(...resultadoArchivo.advertencias);
                }
            }
            
            this.archivosEscaneados++;
            this.progreso = Math.round((i + 1) / totalArchivos * 100);
            
            if (callbackProgreso) {
                callbackProgreso(this.progreso, `Escaneando ${archivo.nombre}`);
            }
        }
        
        // Escaneo global
        this._escanearGlobal(indice);
        
        // Calcular métricas
        this._calcularMetricas();
        
        return this.resultados;
    }

    /**
     * Escanea un archivo individual
     * @param {Object} archivo - Información del archivo
     * @param {Object} indice - Índice del proyecto
     * @returns {Object} Resultados del escaneo del archivo
     * @private
     */
    _escanearArchivo(archivo, indice) {
        const resultado = {
            archivo: archivo.ruta,
            nombre: archivo.nombre,
            tipo: archivo.tipo,
            errores: [],
            advertencias: [],
            metricas: {}
        };
        
        // Escanear según el tipo de archivo
        switch (archivo.tipo) {
            case 'javascript':
                this._escanearJavaScript(archivo, indice, resultado);
                break;
            case 'html':
                this._escanearHTML(archivo, indice, resultado);
                break;
            case 'css':
                this._escanearCSS(archivo, indice, resultado);
                break;
            case 'json':
                this._escanearJSON(archivo, indice, resultado);
                break;
            default:
                break;
        }
        
        return resultado;
    }

    /**
     * Escanea un archivo JavaScript
     * @param {Object} archivo - Información del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _escanearJavaScript(archivo, indice, resultado) {
        const contenido = archivo.contenido || '';
        
        // 1. Detectar errores de sintaxis
        if (this.opciones.detectarErroresSintaxis) {
            this._detectarErroresSintaxisJS(contenido, archivo.ruta, resultado);
        }
        
        // 2. Detectar variables sin usar
        if (this.opciones.detectarVariablesSinUsar) {
            this._detectarVariablesSinUsarJS(contenido, archivo.ruta, resultado);
        }
        
        // 3. Detectar funciones duplicadas
        if (this.opciones.detectarFuncionesDuplicadas) {
            this._detectarFuncionesDuplicadas(archivo.ruta, indice, resultado);
        }
        
        // 4. Detectar código muerto
        if (this.opciones.detectarCodigoMuerto) {
            this._detectarCodigoMuertoJS(contenido, archivo.ruta, resultado);
        }
        
        // 5. Detectar imports rotos
        if (this.opciones.detectarImportsRotos) {
            this._detectarImportsRotos(archivo.ruta, indice, resultado);
        }
        
        // 6. Detectar funciones nunca llamadas
        if (this.opciones.detectarFuncionesNuncaLlamadas) {
            this._detectarFuncionesNuncaLlamadas(archivo.ruta, indice, resultado);
        }
        
        // 7. Detectar fugas de memoria
        if (this.opciones.detectarFugasMemoria) {
            this._detectarFugasMemoria(contenido, archivo.ruta, resultado);
        }
        
        // 8. Detectar problemas de rendimiento
        if (this.opciones.detectarProblemasRendimiento) {
            this._detectarProblemasRendimientoJS(contenido, archivo.ruta, resultado);
        }
    }

    /**
     * Escanea un archivo HTML
     * @param {Object} archivo - Información del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _escanearHTML(archivo, indice, resultado) {
        const contenido = archivo.contenido || '';
        
        // 1. Detectar rutas inexistentes
        if (this.opciones.detectarRutasInexistentes) {
            this._detectarRutasInexistentes(contenido, archivo.ruta, indice, resultado);
        }
        
        // 2. Detectar CSS sin usar
        if (this.opciones.detectarCSSsinUsar) {
            this._detectarCSSsinUsarHTML(contenido, archivo.ruta, indice, resultado);
        }
        
        // 3. Errores básicos de HTML
        this._detectarErroresHTML(contenido, archivo.ruta, resultado);
    }

    /**
     * Escanea un archivo CSS
     * @param {Object} archivo - Información del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _escanearCSS(archivo, indice, resultado) {
        const contenido = archivo.contenido || '';
        
        // 1. Detectar CSS sin usar (global)
        if (this.opciones.detectarCSSsinUsar) {
            this._detectarCSSsinUsarGlobal(archivo.ruta, indice, resultado);
        }
        
        // 2. Errores básicos de CSS
        this._detectarErroresCSS(contenido, archivo.ruta, resultado);
    }

    /**
     * Escanea un archivo JSON
     * @param {Object} archivo - Información del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _escanearJSON(archivo, indice, resultado) {
        const contenido = archivo.contenido || '';
        
        // Detectar dependencias faltantes
        if (this.opciones.detectarDependenciasFaltantes) {
            this._detectarDependenciasFaltantes(contenido, archivo.ruta, indice, resultado);
        }
    }

    /**
     * Detecta errores de sintaxis en JavaScript
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarErroresSintaxisJS(contenido, archivo, resultado) {
        try {
            // Intenta parsear el código JavaScript
            new Function(contenido);
        } catch (error) {
            // Extraer número de línea del error
            const match = error.message.match(/line (\d+)/i);
            const linea = match ? parseInt(match[1]) : 1;
            
            resultado.errores.push({
                mensaje: `Error de sintaxis: ${error.message}`,
                archivo,
                linea,
                columna: 1,
                tipo: 'sintaxis'
            });
        }
    }

    /**
     * Detecta variables sin usar en JavaScript
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarVariablesSinUsarJS(contenido, archivo, resultado) {
        // Buscar declaraciones de variables
        const declaraciones = [];
        const patrones = [
            /(?:var|let|const)\s+(\w+)\s*=/g,
            /(?:var|let|const)\s+(\w+)\s*;/g,
            /(?:var|let|const)\s+(\w+)\s*,\s*/g
        ];
        
        patrones.forEach(patron => {
            let match;
            while ((match = patron.exec(contenido)) !== null) {
                const nombre = match[1];
                // Verificar si la variable se usa después de declarada
                const posicionDeclaracion = match.index;
                const despues = contenido.substring(posicionDeclaracion + match[0].length);
                
                // Buscar usos de la variable (simple comprobación)
                const regexUso = new RegExp(`\\b${nombre}\\b`, 'g');
                const usos = despues.match(regexUso);
                const tieneUso = usos && usos.length > 0;
                
                if (!tieneUso) {
                    resultado.advertencias.push({
                        mensaje: `Variable '${nombre}' declarada pero no utilizada`,
                        archivo,
                        linea: this._obtenerNumeroLinea(contenido, match.index),
                        columna: 1,
                        tipo: 'variable_sin_usar'
                    });
                }
            }
        });
    }

    /**
     * Detecta funciones duplicadas
     * @param {string} archivo - Ruta del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarFuncionesDuplicadas(archivo, indice, resultado) {
        const funciones = indice.funciones.filter(f => f.archivo === archivo);
        const nombres = {};
        
        funciones.forEach(fn => {
            if (nombres[fn.nombre]) {
                resultado.errores.push({
                    mensaje: `Función duplicada '${fn.nombre}' encontrada en la línea ${fn.linea}`,
                    archivo,
                    linea: fn.linea,
                    columna: 1,
                    tipo: 'funcion_duplicada'
                });
            } else {
                nombres[fn.nombre] = true;
            }
        });
    }

    /**
     * Detecta código muerto en JavaScript
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarCodigoMuertoJS(contenido, archivo, resultado) {
        // Código después de return
        const returns = contenido.match(/return\s*[^;]*;/g);
        if (returns) {
            let posicion = 0;
            returns.forEach(returnStmt => {
                const index = contenido.indexOf(returnStmt, posicion);
                const despues = contenido.substring(index + returnStmt.length);
                // Si hay código después de return (no es el final de la función)
                if (despues.trim() && !despais.trim().startsWith('}')) {
                    resultado.advertencias.push({
                        mensaje: 'Código muerto detectado después de return',
                        archivo,
                        linea: this._obtenerNumeroLinea(contenido, index),
                        columna: 1,
                        tipo: 'codigo_muerto'
                    });
                }
                posicion = index + 1;
            });
        }
    }

    /**
     * Detecta imports rotos
     * @param {string} archivo - Ruta del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarImportsRotos(archivo, indice, resultado) {
        const imports = indice.importaciones.filter(imp => imp.archivo === archivo);
        
        imports.forEach(imp => {
            if (!imp.resuelto) {
                resultado.errores.push({
                    mensagem: `Importación rota: '${imp.nombre}' desde '${imp.fuente}'`,
                    archivo,
                    linea: imp.linea || 1,
                    columna: 1,
                    tipo: 'import_roto'
                });
            }
        });
    }

    /**
     * Detecta funciones nunca llamadas
     * @param {string} archivo - Ruta del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarFuncionesNuncaLlamadas(archivo, indice, resultado) {
        const funciones = indice.funciones.filter(f => f.archivo === archivo);
        
        funciones.forEach(fn => {
            // Si no es exportada y no es llamada en ningún lado
            const esExportada = indice.exportaciones.some(e => 
                e.archivo === archivo && e.nombre === fn.nombre
            );
            
            if (!esExportada && !fn.nombre.startsWith('_')) {
                // Verificar si es llamada en el mismo archivo
                const llamada = new RegExp(`${fn.nombre}\\s*\\(`, 'g');
                const contenido = archivo.contenido || '';
                const coincidencias = contenido.match(llamada);
                const tieneLlamada = coincidencias && coincidencias.length > 1; // Más de 1 porque la definición cuenta
                
                if (!tieneLlamada) {
                    resultado.advertencias.push({
                        mensaje: `Función '${fn.nombre}' nunca es llamada`,
                        archivo,
                        linea: fn.linea || 1,
                        columna: 1,
                        tipo: 'funcion_nunca_llamada'
                    });
                }
            }
        });
    }

    /**
     * Detecta fugas de memoria en JavaScript
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarFugasMemoria(contenido, archivo, resultado) {
        // Detectar addEventListener sin removeEventListener
        const addEvents = contenido.match(/addEventListener/g);
        const removeEvents = contenido.match(/removeEventListener/g);
        
        if (addEvents && (!removeEvents || addEvents.length > removeEvents.length)) {
            resultado.advertencias.push({
                mensaje: `Posible fuga de memoria: ${addEvents.length} addEventListener detectados, pero solo ${removeEvents ? removeEvents.length : 0} removeEventListener`,
                archivo,
                linea: 1,
                columna: 1,
                tipo: 'fuga_memoria'
            });
        }
        
        // Detectar setInterval sin clearInterval
        const setIntervals = contenido.match(/setInterval/g);
        const clearIntervals = contenido.match(/clearInterval/g);
        
        if (setIntervals && (!clearIntervals || setIntervals.length > clearIntervals.length)) {
            resultado.advertencias.push({
                mensaje: `Posible fuga de memoria: ${setIntervals.length} setInterval detectados, pero solo ${clearIntervals ? clearIntervals.length : 0} clearInterval`,
                archivo,
                linea: 1,
                columna: 1,
                tipo: 'fuga_memoria'
            });
        }
    }

    /**
     * Detecta problemas de rendimiento en JavaScript
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarProblemasRendimientoJS(contenido, archivo, resultado) {
        // Bucles anidados
        const bucles = contenido.match(/for\s*\(|while\s*\(/g);
        if (bucles && bucles.length > 10) {
            resultado.advertencias.push({
                mensaje: `Múltiples bucles detectados (${bucles.length}). Posible impacto en rendimiento.`,
                archivo,
                linea: 1,
                columna: 1,
                tipo: 'rendimiento'
            });
        }
        
        // DOM manipulation excesiva (innerHTML en bucles)
        const innerHTML = contenido.match(/innerHTML\s*=/g);
        const buclesDOM = contenido.match(/for\s*\(|while\s*\(/g);
        if (innerHTML && buclesDOM && innerHTML.length > 0) {
            resultado.advertencias.push({
                mensaje: 'Uso de innerHTML dentro de bucles. Considera usar document.createElement o fragmentos.',
                archivo,
                linea: 1,
                columna: 1,
                tipo: 'rendimiento'
            });
        }
    }

    /**
     * Detecta rutas inexistentes en HTML
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarRutasInexistentes(contenido, archivo, indice, resultado) {
        // Buscar href, src, etc.
        const patrones = [
            /(?:href|src|action)\s*=\s*['"]([^'"]+)['"]/g,
            /url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/g
        ];
        
        const archivosExistentes = new Set(indice.archivos.map(a => a.ruta));
        
        patrones.forEach(patron => {
            let match;
            while ((match = patron.exec(contenido)) !== null) {
                const ruta = match[1];
                // Ignorar rutas externas
                if (ruta.startsWith('http://') || ruta.startsWith('https://') || ruta.startsWith('//')) {
                    continue;
                }
                // Ignorar rutas con # (anclas)
                if (ruta.startsWith('#')) {
                    continue;
                }
                // Ignorar rutas con ? (parámetros)
                if (ruta.includes('?')) {
                    continue;
                }
                
                // Verificar si la ruta existe
                const rutaCompleta = this._resolverRutaRelativa(ruta, archivo, indice);
                if (rutaCompleta && !archivosExistentes.has(rutaCompleta)) {
                    resultado.advertencias.push({
                        mensaje: `Ruta inexistente: ${ruta}`,
                        archivo,
                        linea: this._obtenerNumeroLinea(contenido, match.index),
                        columna: 1,
                        tipo: 'ruta_inexistente'
                    });
                }
            }
        });
    }

    /**
     * Resuelve una ruta relativa
     * @param {string} ruta - Ruta relativa
     * @param {string} archivoBase - Archivo base
     * @param {Object} indice - Índice del proyecto
     * @returns {string|null} Ruta resuelta o null
     * @private
     */
    _resolverRutaRelativa(ruta, archivoBase, indice) {
        // Si la ruta empieza con ./, resolver relativo al archivo base
        if (ruta.startsWith('./') || ruta.startsWith('../')) {
            const directorioBase = archivoBase.substring(0, archivoBase.lastIndexOf('/') + 1);
            const rutaCompleta = directorioBase + ruta;
            // Buscar en el índice
            for (const a of indice.archivos) {
                if (a.ruta === rutaCompleta) {
                    return a.ruta;
                }
            }
            // Buscar con extensiones
            const extensiones = ['', '.html', '.js', '.css', '.json', '.mjs', '.cjs'];
            for (const ext of extensiones) {
                for (const a of indice.archivos) {
                    if (a.ruta === rutaCompleta + ext) {
                        return a.ruta;
                    }
                }
            }
            return null;
        }
        return null;
    }

    /**
     * Detecta CSS sin usar en HTML
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarCSSsinUsarHTML(contenido, archivo, indice, resultado) {
        // Extraer todas las clases usadas en HTML
        const clasesUsadas = new Set();
        const clasesMatch = contenido.match(/class\s*=\s*['"]([^'"]+)['"]/g);
        if (clasesMatch) {
            clasesMatch.forEach(match => {
                const clases = match.match(/\b[a-zA-Z_-][a-zA-Z0-9_-]*\b/g);
                if (clases) {
                    clases.forEach(cls => {
                        if (cls !== 'class') {
                            clasesUsadas.add(cls);
                        }
                    });
                }
            });
        }
        
        // Verificar contra las clases en CSS
        const clasesCSS = indice.clases.filter(c => c.lenguaje === 'css');
        clasesCSS.forEach(cls => {
            if (!clasesUsadas.has(cls.nombre)) {
                resultado.advertencias.push({
                    mensaje: `Clase CSS '${cls.nombre}' definida pero no utilizada en HTML`,
                    archivo: cls.archivo,
                    linea: cls.linea || 1,
                    columna: 1,
                    tipo: 'css_sin_usar'
                });
            }
        });
    }

    /**
     * Detecta CSS sin usar globalmente
     * @param {string} archivo - Ruta del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarCSSsinUsarGlobal(archivo, indice, resultado) {
        // Similar a _detectarCSSsinUsarHTML pero sin el contexto HTML
        // Esta función se llama para cada archivo CSS
    }

    /**
     * Detecta dependencias faltantes en JSON
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @param {Object} indice - Índice del proyecto
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarDependenciasFaltantes(contenido, archivo, indice, resultado) {
        if (!archivo.endsWith('package.json')) return;
        
        try {
            const data = JSON.parse(contenido);
            const dependencias = { ...data.dependencies, ...data.devDependencies };
            
            // Verificar dependencias que se importan pero no están en package.json
            const imports = indice.importaciones.filter(imp => 
                imp.fuente && !imp.fuente.startsWith('.') && !imp.fuente.startsWith('/')
            );
            
            imports.forEach(imp => {
                const nombre = imp.fuente.split('/')[0]; // Nombre del paquete
                if (!dependencias[nombre]) {
                    resultado.errores.push({
                        mensaje: `Dependencia faltante: '${nombre}' no está en package.json`,
                        archivo: imp.archivo,
                        linea: imp.linea || 1,
                        columna: 1,
                        tipo: 'dependencia_faltante'
                    });
                }
            });
        } catch (error) {
            // No es JSON válido
        }
    }

    /**
     * Detecta errores básicos de HTML
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarErroresHTML(contenido, archivo, resultado) {
        // Detectar etiquetas no cerradas
        const etiquetas = contenido.match(/<(\w+)[^>]*>/g) || [];
        const etiquetasCerradas = contenido.match(/<\/(\w+)>/g) || [];
        
        const abiertas = etiquetas.map(tag => tag.match(/<(\w+)/)[1]);
        const cerradas = etiquetasCerradas.map(tag => tag.match(/<\/(\w+)/)[1]);
        
        const noCerradas = [];
        const stack = [];
        for (const tag of abiertas) {
            if (tag === 'br' || tag === 'hr' || tag === 'img' || tag === 'input' || tag === 'meta' || tag === 'link') {
                continue; // Etiquetas auto-cerradas
            }
            if (cerradas.includes(tag)) {
                // Buscar si hay una coincidencia
                const index = cerradas.indexOf(tag);
                if (index !== -1) {
                    cerradas.splice(index, 1);
                    continue;
                }
            }
            noCerradas.push(tag);
        }
        
        if (noCerradas.length > 0) {
            resultado.advertencias.push({
                mensaje: `Etiquetas HTML no cerradas: ${noCerradas.join(', ')}`,
                archivo,
                linea: 1,
                columna: 1,
                tipo: 'html_etiqueta_no_cerrada'
            });
        }
    }

    /**
     * Detecta errores básicos de CSS
     * @param {string} contenido - Contenido del archivo
     * @param {string} archivo - Ruta del archivo
     * @param {Object} resultado - Resultado acumulado
     * @private
     */
    _detectarErroresCSS(contenido, archivo, resultado) {
        // Detectar propiedades con sintaxis incorrecta
        const propiedades = contenido.match(/[a-zA-Z-]+:\s*[^;]+;/g) || [];
        propiedades.forEach(prop => {
            if (prop.includes(';;') || prop.includes('::')) {
                resultado.advertencias.push({
                    mensaje: `Sintaxis CSS incorrecta: ${prop.trim()}`,
                    archivo,
                    linea: this._obtenerNumeroLinea(contenido, contenido.indexOf(prop)),
                    columna: 1,
                    tipo: 'css_sintaxis'
                });
            }
        });
    }

    /**
     * Escaneo global del proyecto
     * @param {Object} indice - Índice del proyecto
     * @private
     */
    _escanearGlobal(indice) {
        // Detectar archivos huérfanos
        if (this.opciones.detectarArchivosHuerfanos) {
            indice.archivosHuérfanos.forEach(h => {
                this.resultados.advertencias.push({
                    mensaje: `Archivo huérfano: ${h.nombre} - ${h.razon}`,
                    archivo: h.ruta,
                    linea: 1,
                    columna: 1,
                    tipo: 'archivo_huerfano'
                });
            });
        }
    }

    /**
     * Calcula métricas del escaneo
     * @private
     */
    _calcularMetricas() {
        this.resultados.metricas = {
            totalErrores: this.resultados.errores.length,
            totalAdvertencias: this.resultados.advertencias.length,
            totalArchivosAnalizados: this.resultados.archivosAnalizados.length,
            tasaError: this.resultados.archivosAnalizados.length > 0
                ? (this.resultados.errores.length / this.resultados.archivosAnalizados.length)
                : 0
        };
    }

    /**
     * Obtiene el número de línea de una posición en el código
     * @param {string} codigo - Código completo
     * @param {number} posicion - Posición en el código
     * @returns {number} Número de línea
     * @private
     */
    _obtenerNumeroLinea(codigo, posicion) {
        if (posicion === undefined || posicion === null) return 1;
        const antes = codigo.substring(0, posicion);
        return antes.split('\n').length;
    }

    /**
     * Cancela el escaneo
     */
    cancelar() {
        this.cancelado = true;
    }

    /**
     * Obtiene el progreso actual
     * @returns {Object} Progreso actual
     */
    obtenerProgreso() {
        return {
            progreso: this.progreso,
            archivosEscaneados: this.archivosEscaneados,
            cancelado: this.cancelado
        };
    }
}