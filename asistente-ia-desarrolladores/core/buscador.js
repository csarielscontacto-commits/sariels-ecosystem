/**
 * ================================================================
 * BUSCADOR INTELIGENTE - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Implementa búsqueda por lenguaje natural sobre el índice del proyecto.
 * 
 * @module Buscador
 */

/**
 * Clase principal del Buscador Inteligente
 */
export class Buscador {
    /**
     * Constructor
     * @param {Object} indice - Índice del proyecto
     */
    constructor(indice = null) {
        this.indice = indice;
        this.resultados = [];
        this.historial = [];
    }

    /**
     * Establece el índice del proyecto
     * @param {Object} indice - Índice del proyecto
     */
    setIndice(indice) {
        this.indice = indice;
    }

    /**
     * Busca en el proyecto usando lenguaje natural
     * @param {string} consulta - Consulta en lenguaje natural
     * @returns {Array} Resultados de la búsqueda
     */
    buscar(consulta) {
        if (!this.indice) {
            throw new Error('No hay índice disponible. Ejecuta indexarProyecto primero.');
        }
        
        this.resultados = [];
        const consultaNormalizada = consulta.toLowerCase().trim();
        
        // Registrar en historial
        this.historial.push({
            consulta: consulta,
            timestamp: Date.now(),
            resultados: 0
        });
        
        // Detectar intención de la consulta
        const intencion = this._detectarIntencion(consultaNormalizada);
        
        // Ejecutar búsqueda según intención
        switch (intencion) {
            case 'funcion':
                this._buscarFuncion(consultaNormalizada);
                break;
            case 'clase':
                this._buscarClase(consultaNormalizada);
                break;
            case 'archivo':
                this._buscarArchivo(consultaNormalizada);
                break;
            case 'referencias':
                this._buscarReferencias(consultaNormalizada);
                break;
            case 'dependencias':
                this._buscarDependencias(consultaNormalizada);
                break;
            case 'componente':
                this._buscarComponente(consultaNormalizada);
                break;
            default:
                this._busquedaGeneral(consultaNormalizada);
                break;
        }
        
        // Actualizar historial
        this.historial[this.historial.length - 1].resultados = this.resultados.length;
        
        return this.resultados;
    }

    /**
     * Detecta la intención de la consulta
     * @param {string} consulta - Consulta normalizada
     * @returns {string} Intención detectada
     * @private
     */
    _detectarIntencion(consulta) {
        const patrones = {
            'funcion': /(?:dónde|donde|qué|que|cuál|funcion|función|method|metodo|método)/,
            'clase': /(?:clase|class|objeto|object)/,
            'archivo': /(?:archivo|file|ruta|path)/,
            'referencias': /(?:referencias|references|llama|calls|usa|uses|dónde\s+se|donde\s+se)/,
            'dependencias': /(?:dependencia|dependency|import|require|usa|utiliza)/,
            'componente': /(?:componente|component|ui|widget|elemento|element)/
        };
        
        for (const [intencion, patron] of Object.entries(patrones)) {
            if (patron.test(consulta)) {
                return intencion;
            }
        }
        
        return 'general';
    }

    /**
     * Busca funciones por nombre
     * @param {string} consulta - Consulta normalizada
     * @private
     */
    _buscarFuncion(consulta) {
        // Extraer nombre de función de la consulta
        const patrones = [
            /funcion\s+(\w+)/i,
            /función\s+(\w+)/i,
            /method\s+(\w+)/i,
            /método\s+(\w+)/i,
            /(\w+)\s+function/i,
            /(\w+)\s+función/i,
            /llama\s+a\s+(\w+)/i,
            /llamada\s+a\s+(\w+)/i
        ];
        
        let nombreFuncion = null;
        for (const patron of patrones) {
            const match = consulta.match(patron);
            if (match) {
                nombreFuncion = match[1];
                break;
            }
        }
        
        if (!nombreFuncion) {
            // Buscar cualquier palabra que parezca un nombre de función
            const palabras = consulta.split(/\s+/);
            for (const palabra of palabras) {
                if (palabra.length > 2 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(palabra)) {
                    nombreFuncion = palabra;
                    break;
                }
            }
        }
        
        if (!nombreFuncion) {
            this.resultados.push({
                tipo: 'error',
                mensaje: 'No se pudo identificar el nombre de la función en tu consulta.'
            });
            return;
        }
        
        // Buscar en el índice
        const funciones = this.indice.funciones.filter(fn => 
            fn.nombre === nombreFuncion || 
            fn.nombre.toLowerCase().includes(nombreFuncion.toLowerCase())
        );
        
        if (funciones.length === 0) {
            this.resultados.push({
                tipo: 'sin_resultados',
                mensaje: `No se encontró la función '${nombreFuncion}' en el proyecto.`
            });
            return;
        }
        
        // Construir resultados
        funciones.forEach(fn => {
            const archivo = this.indice.archivos.find(a => a.ruta === fn.archivo);
            this.resultados.push({
                tipo: 'funcion',
                nombre: fn.nombre,
                archivo: fn.archivo,
                linea: fn.linea,
                parametros: fn.parametros || [],
                tipoFuncion: fn.tipo || 'normal',
                archivoNombre: archivo ? archivo.nombre : fn.archivo,
                contexto: this._obtenerContexto(fn, this.indice)
            });
        });
    }

    /**
     * Busca clases por nombre
     * @param {string} consulta - Consulta normalizada
     * @private
     */
    _buscarClase(consulta) {
        // Extraer nombre de clase
        const patrones = [
            /clase\s+(\w+)/i,
            /class\s+(\w+)/i,
            /objeto\s+(\w+)/i,
            /object\s+(\w+)/i
        ];
        
        let nombreClase = null;
        for (const patron of patrones) {
            const match = consulta.match(patron);
            if (match) {
                nombreClase = match[1];
                break;
            }
        }
        
        if (!nombreClase) {
            const palabras = consulta.split(/\s+/);
            for (const palabra of palabras) {
                if (palabra.length > 2 && /^[A-Z][a-zA-Z0-9_]*$/.test(palabra)) {
                    nombreClase = palabra;
                    break;
                }
            }
        }
        
        if (!nombreClase) {
            this.resultados.push({
                tipo: 'error',
                mensaje: 'No se pudo identificar el nombre de la clase en tu consulta.'
            });
            return;
        }
        
        // Buscar en el índice
        const clases = this.indice.clases.filter(cls => 
            cls.nombre === nombreClase || 
            cls.nombre.toLowerCase().includes(nombreClase.toLowerCase())
        );
        
        if (clases.length === 0) {
            this.resultados.push({
                tipo: 'sin_resultados',
                mensaje: `No se encontró la clase '${nombreClase}' en el proyecto.`
            });
            return;
        }
        
        clases.forEach(cls => {
            const archivo = this.indice.archivos.find(a => a.ruta === cls.archivo);
            this.resultados.push({
                tipo: 'clase',
                nombre: cls.nombre,
                archivo: cls.archivo,
                linea: cls.linea,
                extiende: cls.extiende || null,
                metodos: cls.metodos || [],
                archivoNombre: archivo ? archivo.nombre : cls.archivo
            });
        });
    }

    /**
     * Busca archivos por nombre
     * @param {string} consulta - Consulta normalizada
     * @private
     */
    _buscarArchivo(consulta) {
        const patrones = [
            /archivo\s+([^\s]+)/i,
            /file\s+([^\s]+)/i,
            /ruta\s+([^\s]+)/i,
            /path\s+([^\s]+)/i
        ];
        
        let nombreArchivo = null;
        for (const patron of patrones) {
            const match = consulta.match(patron);
            if (match) {
                nombreArchivo = match[1];
                break;
            }
        }
        
        if (!nombreArchivo) {
            const palabras = consulta.split(/\s+/);
            for (const palabra of palabras) {
                if (palabra.includes('.') || palabra.includes('/') || palabra.includes('\\')) {
                    nombreArchivo = palabra;
                    break;
                }
            }
        }
        
        if (!nombreArchivo) {
            this.resultados.push({
                tipo: 'error',
                mensaje: 'No se pudo identificar el nombre del archivo en tu consulta.'
            });
            return;
        }
        
        // Buscar en el índice
        const archivos = this.indice.archivos.filter(a => 
            a.nombre === nombreArchivo || 
            a.nombre.includes(nombreArchivo) ||
            a.ruta.includes(nombreArchivo)
        );
        
        if (archivos.length === 0) {
            this.resultados.push({
                tipo: 'sin_resultados',
                mensaje: `No se encontró el archivo '${nombreArchivo}' en el proyecto.`
            });
            return;
        }
        
        archivos.forEach(a => {
            // Encontrar funciones en este archivo
            const funciones = this.indice.funciones.filter(fn => fn.archivo === a.ruta);
            const clases = this.indice.clases.filter(cls => cls.archivo === a.ruta);
            
            this.resultados.push({
                tipo: 'archivo',
                nombre: a.nombre,
                ruta: a.ruta,
                lineas: a.lineas || 0,
                extension: a.extension || '',
                funciones: funciones.map(f => f.nombre),
                clases: clases.map(c => c.nombre),
                dependencias: this.indice.importaciones
                    .filter(imp => imp.archivo === a.ruta && imp.resuelto)
                    .map(imp => imp.fuente)
            });
        });
    }

    /**
     * Busca referencias de un símbolo
     * @param {string} consulta - Consulta normalizada
     * @private
     */
    _buscarReferencias(consulta) {
        // Extraer nombre del símbolo
        const patrones = [
            /referencias\s+de\s+(\w+)/i,
            /referencias\s+a\s+(\w+)/i,
            /dónde\s+se\s+usa\s+(\w+)/i,
            /donde\s+se\s+usa\s+(\w+)/i,
            /quién\s+llama\s+a\s+(\w+)/i,
            /quien\s+llama\s+a\s+(\w+)/i,
            /usos\s+de\s+(\w+)/i
        ];
        
        let nombreSimbolo = null;
        for (const patron of patrones) {
            const match = consulta.match(patron);
            if (match) {
                nombreSimbolo = match[1];
                break;
            }
        }
        
        if (!nombreSimbolo) {
            const palabras = consulta.split(/\s+/);
            for (const palabra of palabras) {
                if (palabra.length > 2 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(palabra)) {
                    nombreSimbolo = palabra;
                    break;
                }
            }
        }
        
        if (!nombreSimbolo) {
            this.resultados.push({
                tipo: 'error',
                mensaje: 'No se pudo identificar el símbolo en tu consulta.'
            });
            return;
        }
        
        // Buscar el símbolo en funciones y clases
        const esFuncion = this.indice.funciones.some(fn => fn.nombre === nombreSimbolo);
        const esClase = this.indice.clases.some(cls => cls.nombre === nombreSimbolo);
        
        if (!esFuncion && !esClase) {
            this.resultados.push({
                tipo: 'sin_resultados',
                mensaje: `No se encontró el símbolo '${nombreSimbolo}' en el proyecto.`
            });
            return;
        }
        
        // Buscar referencias en importaciones y usos
        const referencias = [];
        
        // Buscar en importaciones
        this.indice.importaciones.forEach(imp => {
            if (imp.nombre === nombreSimbolo || imp.fuente.includes(nombreSimbolo)) {
                referencias.push({
                    tipo: 'importacion',
                    archivo: imp.archivo,
                    linea: imp.linea,
                    detalle: `Importado como '${imp.nombre}' desde '${imp.fuente}'`
                });
            }
        });
        
        // Buscar en exportaciones
        this.indice.exportaciones.forEach(exp => {
            if (exp.nombre === nombreSimbolo) {
                referencias.push({
                    tipo: 'exportacion',
                    archivo: exp.archivo,
                    linea: exp.linea,
                    detalle: `Exportado como '${exp.nombre}'`
                });
            }
        });
        
        // Buscar llamadas a la función en el contenido de los archivos
        if (esFuncion) {
            this.indice.archivos.forEach(archivo => {
                if (archivo.contenido) {
                    const regex = new RegExp(`\\b${nombreSimbolo}\\s*\\(`, 'g');
                    const coincidencias = archivo.contenido.match(regex);
                    if (coincidencias) {
                        referencias.push({
                            tipo: 'llamada',
                            archivo: archivo.ruta,
                            cantidad: coincidencias.length,
                            detalle: `${coincidencias.length} llamada(s) encontrada(s)`
                        });
                    }
                }
            });
        }
        
        // Construir resultado
        this.resultados.push({
            tipo: 'referencias',
            simbolo: nombreSimbolo,
            totalReferencias: referencias.length,
            referencias: referencias,
            esFuncion,
            esClase
        });
    }

    /**
     * Busca dependencias de un módulo
     * @param {string} consulta - Consulta normalizada
     * @private
     */
    _buscarDependencias(consulta) {
        // Extraer nombre del módulo
        const patrones = [
            /dependencias\s+de\s+([^\s]+)/i,
            /dependencia\s+de\s+([^\s]+)/i,
            /importa\s+([^\s]+)/i
        ];
        
        let nombreModulo = null;
        for (const patron of patrones) {
            const match = consulta.match(patron);
            if (match) {
                nombreModulo = match[1];
                break;
            }
        }
        
        if (!nombreModulo) {
            const palabras = consulta.split(/\s+/);
            for (const palabra of palabras) {
                if (palabra.includes('.') || palabra.includes('/') || palabra.includes('\\')) {
                    nombreModulo = palabra;
                    break;
                }
            }
        }
        
        if (!nombreModulo) {
            this.resultados.push({
                tipo: 'error',
                mensaje: 'No se pudo identificar el módulo en tu consulta.'
            });
            return;
        }
        
        // Buscar el módulo
        const archivo = this.indice.archivos.find(a => 
            a.nombre === nombreModulo || a.ruta.includes(nombreModulo)
        );
        
        if (!archivo) {
            this.resultados.push({
                tipo: 'sin_resultados',
                mensaje: `No se encontró el módulo '${nombreModulo}' en el proyecto.`
            });
            return;
        }
        
        // Encontrar dependencias entrantes y salientes
        const dependenciasEntrantes = this.indice.importaciones
            .filter(imp => imp.fuente.includes(nombreModulo) || imp.rutaResuelta === archivo.ruta)
            .map(imp => ({
                desde: imp.archivo,
                nombre: imp.nombre,
                linea: imp.linea
            }));
        
        const dependenciasSalientes = this.indice.importaciones
            .filter(imp => imp.archivo === archivo.ruta && imp.resuelto)
            .map(imp => ({
                hacia: imp.rutaResuelta,
                nombre: imp.nombre,
                linea: imp.linea
            }));
        
        this.resultados.push({
            tipo: 'dependencias',
            modulo: archivo.nombre,
            ruta: archivo.ruta,
            dependenciasEntrantes,
            dependenciasSalientes,
            totalEntrantes: dependenciasEntrantes.length,
            totalSalientes: dependenciasSalientes.length
        });
    }

    /**
     * Busca componentes UI
     * @param {string} consulta - Consulta normalizada
     * @private
     */
    _buscarComponente(consulta) {
        // Extraer nombre del componente
        const patrones = [
            /componente\s+([^\s]+)/i,
            /component\s+([^\s]+)/i,
            /ui\s+([^\s]+)/i,
            /widget\s+([^\s]+)/i
        ];
        
        let nombreComponente = null;
        for (const patron of patrones) {
            const match = consulta.match(patron);
            if (match) {
                nombreComponente = match[1];
                break;
            }
        }
        
        if (!nombreComponente) {
            const palabras = consulta.split(/\s+/);
            for (const palabra of palabras) {
                if (palabra.length > 2 && /^[A-Z][a-zA-Z0-9_]*$/.test(palabra)) {
                    nombreComponente = palabra;
                    break;
                }
            }
        }
        
        if (!nombreComponente) {
            // Buscar componentes en general
            this._buscarComponentesGenerales();
            return;
        }
        
        // Buscar el componente en clases y funciones
        const clases = this.indice.clases.filter(cls => 
            cls.nombre.toLowerCase().includes(nombreComponente.toLowerCase())
        );
        
        const funciones = this.indice.funciones.filter(fn => 
            fn.nombre.toLowerCase().includes(nombreComponente.toLowerCase())
        );
        
        if (clases.length === 0 && funciones.length === 0) {
            this.resultados.push({
                tipo: 'sin_resultados',
                mensaje: `No se encontró el componente '${nombreComponente}' en el proyecto.`
            });
            return;
        }
        
        // Construir resultados
        const resultados = [];
        clases.forEach(cls => {
            const archivo = this.indice.archivos.find(a => a.ruta === cls.archivo);
            resultados.push({
                tipo: 'componente',
                nombre: cls.nombre,
                archivo: cls.archivo,
                archivoNombre: archivo ? archivo.nombre : cls.archivo,
                tipoElemento: 'clase',
                metodos: cls.metodos || []
            });
        });
        
        funciones.forEach(fn => {
            const archivo = this.indice.archivos.find(a => a.ruta === fn.archivo);
            resultados.push({
                tipo: 'componente',
                nombre: fn.nombre,
                archivo: fn.archivo,
                archivoNombre: archivo ? archivo.nombre : fn.archivo,
                tipoElemento: 'funcion',
                parametros: fn.parametros || []
            });
        });
        
        this.resultados = resultados;
    }

    /**
     * Busca componentes en general
     * @private
     */
    _buscarComponentesGenerales() {
        // Buscar clases y funciones que parecen componentes
        const patronComponente = /^(?:[A-Z][a-zA-Z]*Component|[A-Z][a-zA-Z]*View|[A-Z][a-zA-Z]*Page|[A-Z][a-zA-Z]*Widget)$/;
        
        const clases = this.indice.clases.filter(cls => 
            patronComponente.test(cls.nombre)
        );
        
        const funciones = this.indice.funciones.filter(fn => 
            patronComponente.test(fn.nombre)
        );
        
        if (clases.length === 0 && funciones.length === 0) {
            this.resultados.push({
                tipo: 'sin_resultados',
                mensaje: 'No se encontraron componentes UI en el proyecto.'
            });
            return;
        }
        
        clases.forEach(cls => {
            const archivo = this.indice.archivos.find(a => a.ruta === cls.archivo);
            this.resultados.push({
                tipo: 'componente',
                nombre: cls.nombre,
                archivo: cls.archivo,
                archivoNombre: archivo ? archivo.nombre : cls.archivo,
                tipoElemento: 'clase'
            });
        });
        
        funciones.forEach(fn => {
            const archivo = this.indice.archivos.find(a => a.ruta === fn.archivo);
            this.resultados.push({
                tipo: 'componente',
                nombre: fn.nombre,
                archivo: fn.archivo,
                archivoNombre: archivo ? archivo.nombre : fn.archivo,
                tipoElemento: 'funcion'
            });
        });
    }

    /**
     * Búsqueda general en todo el proyecto
     * @param {string} consulta - Consulta normalizada
     * @private
     */
    _busquedaGeneral(consulta) {
        const palabrasClave = consulta.split(/\s+/).filter(p => p.length > 2);
        
        if (palabrasClave.length === 0) {
            this.resultados.push({
                tipo: 'error',
                mensaje: 'Por favor, proporciona palabras clave más específicas.'
            });
            return;
        }
        
        // Buscar en archivos
        const archivosEncontrados = this.indice.archivos.filter(a => {
            return palabrasClave.some(p => 
                a.nombre.toLowerCase().includes(p) || 
                a.ruta.toLowerCase().includes(p)
            );
        });
        
        // Buscar en funciones
        const funcionesEncontradas = this.indice.funciones.filter(fn => {
            return palabrasClave.some(p => 
                fn.nombre.toLowerCase().includes(p)
            );
        });
        
        // Buscar en clases
        const clasesEncontradas = this.indice.clases.filter(cls => {
            return palabrasClave.some(p => 
                cls.nombre.toLowerCase().includes(p)
            );
        });
        
        // Buscar en contenido de archivos (solo si hay pocos archivos)
        let contenidoEncontrado = [];
        if (this.indice.archivos.length < 100) {
            this.indice.archivos.forEach(a => {
                if (a.contenido) {
                    const lineas = a.contenido.split('\n');
                    lineas.forEach((linea, index) => {
                        if (palabrasClave.some(p => linea.toLowerCase().includes(p))) {
                            contenidoEncontrado.push({
                                archivo: a.nombre,
                                ruta: a.ruta,
                                linea: index + 1,
                                contenido: linea.trim()
                            });
                        }
                    });
                }
            });
        }
        
        // Construir resultados
        const resultados = [];
        
        if (archivosEncontrados.length > 0) {
            resultados.push({
                tipo: 'archivos',
                items: archivosEncontrados.map(a => ({
                    nombre: a.nombre,
                    ruta: a.ruta,
                    lineas: a.lineas || 0
                })),
                total: archivosEncontrados.length
            });
        }
        
        if (funcionesEncontradas.length > 0) {
            resultados.push({
                tipo: 'funciones',
                items: funcionesEncontradas.map(fn => ({
                    nombre: fn.nombre,
                    archivo: fn.archivo,
                    linea: fn.linea
                })),
                total: funcionesEncontradas.length
            });
        }
        
        if (clasesEncontradas.length > 0) {
            resultados.push({
                tipo: 'clases',
                items: clasesEncontradas.map(cls => ({
                    nombre: cls.nombre,
                    archivo: cls.archivo,
                    linea: cls.linea
                })),
                total: clasesEncontradas.length
            });
        }
        
        if (contenidoEncontrado.length > 0) {
            resultados.push({
                tipo: 'contenido',
                items: contenidoEncontrado.slice(0, 50),
                total: contenidoEncontrado.length
            });
        }
        
        if (resultados.length === 0) {
            this.resultados.push({
                tipo: 'sin_resultados',
                mensaje: 'No se encontraron resultados para tu búsqueda.'
            });
        } else {
            this.resultados = resultados;
        }
    }

    /**
     * Obtiene el contexto de una función (quién la llama, dónde se usa)
     * @param {Object} fn - Función
     * @param {Object} indice - Índice del proyecto
     * @returns {Object} Contexto de la función
     * @private
     */
    _obtenerContexto(fn, indice) {
        const contexto = {
            llamadaPor: [],
            usadaEn: []
        };
        
        // Buscar llamadas a esta función
        indice.archivos.forEach(archivo => {
            if (archivo.contenido) {
                const regex = new RegExp(`\\b${fn.nombre}\\s*\\(`, 'g');
                const coincidencias = archivo.contenido.match(regex);
                if (coincidencias) {
                    contexto.usadaEn.push({
                        archivo: archivo.nombre,
                        cantidad: coincidencias.length
                    });
                }
            }
        });
        
        // Buscar importaciones de esta función
        indice.importaciones.forEach(imp => {
            if (imp.nombre === fn.nombre || imp.fuente.includes(fn.nombre)) {
                contexto.llamadaPor.push({
                    archivo: imp.archivo,
                    fuente: imp.fuente
                });
            }
        });
        
        return contexto;
    }

    /**
     * Obtiene el historial de búsquedas
     * @returns {Array} Historial de búsquedas
     */
    getHistorial() {
        return this.historial;
    }

    /**
     * Limpia el historial de búsquedas
     */
    limpiarHistorial() {
        this.historial = [];
    }

    /**
     * Exporta los resultados a formato JSON
     * @returns {string} JSON de los resultados
     */
    exportarResultados() {
        return JSON.stringify({
            resultados: this.resultados,
            total: this.resultados.length,
            timestamp: Date.now()
        }, null, 2);
    }
}