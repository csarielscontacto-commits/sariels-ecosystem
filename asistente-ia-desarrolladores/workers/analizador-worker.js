/**
 * ================================================================
 * DEPENDENCIAS WORKER - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Web Worker para análisis de dependencias sin bloquear la interfaz.
 * 
 * @module DependenciasWorker
 */

// ================================================================
// CONFIGURACIÓN DEL WORKER
// ================================================================

const CONFIG = {
    BATCH_SIZE: 100,
    MAX_NODES: 500,
    TIMEOUT_MS: 15000
};

// ================================================================
// ESTADO DEL WORKER
// ================================================================

let estado = {
    ejecutando: false,
    cancelado: false,
    progreso: 0,
    total: 0,
    procesados: 0,
    resultados: null
};

// ================================================================
// MANEJO DE MENSAJES
// ================================================================

self.addEventListener('message', async (event) => {
    const { tipo, datos, id } = event.data;
    
    try {
        switch (tipo) {
            case 'analizar':
                await manejarAnalisis(datos, id);
                break;
            case 'cancelar':
                manejarCancelacion();
                break;
            case 'estado':
                enviarEstado(id);
                break;
            default:
                self.postMessage({
                    tipo: 'error',
                    id,
                    error: `Tipo de mensaje desconocido: ${tipo}`
                });
        }
    } catch (error) {
        self.postMessage({
            tipo: 'error',
            id,
            error: error.message,
            stack: error.stack
        });
    }
});

// ================================================================
// MANEJADORES
// ================================================================

/**
 * Maneja la solicitud de análisis de dependencias
 * @param {Object} datos - Datos del análisis
 * @param {string} id - ID del mensaje
 */
async function manejarAnalisis(datos, id) {
    if (estado.ejecutando) {
        self.postMessage({
            tipo: 'error',
            id,
            error: 'Ya hay un análisis en ejecución'
        });
        return;
    }
    
    estado.ejecutando = true;
    estado.cancelado = false;
    estado.progreso = 0;
    estado.resultados = null;
    estado.procesados = 0;
    
    const { indice, opciones = {} } = datos;
    
    if (!indice || !indice.archivos || indice.archivos.length === 0) {
        self.postMessage({
            tipo: 'error',
            id,
            error: 'No se proporcionó un índice válido'
        });
        estado.ejecutando = false;
        return;
    }
    
    try {
        const resultados = await analizarDependencias(indice, opciones, id);
        
        estado.resultados = resultados;
        estado.progreso = 100;
        
        self.postMessage({
            tipo: 'completado',
            id,
            resultados,
            metricas: {
                totalNodos: resultados.nodos ? resultados.nodos.length : 0,
                totalAristas: resultados.aristas ? resultados.aristas.length : 0,
                ciclos: resultados.ciclos ? resultados.ciclos.length : 0
            }
        });
    } catch (error) {
        if (error.message === 'Cancelado') {
            self.postMessage({
                tipo: 'cancelado',
                id,
                mensaje: 'Análisis cancelado por el usuario'
            });
        } else {
            self.postMessage({
                tipo: 'error',
                id,
                error: error.message,
                stack: error.stack
            });
        }
    }
    
    estado.ejecutando = false;
}

/**
 * Analiza las dependencias del proyecto
 * @param {Object} indice - Índice del proyecto
 * @param {Object} opciones - Opciones de análisis
 * @param {string} id - ID del mensaje
 * @returns {Object} Resultados del análisis
 */
async function analizarDependencias(indice, opciones, id) {
    const resultados = {
        nodos: [],
        aristas: [],
        ciclos: [],
        huerfanos: [],
        modulosSinUsar: [],
        metricas: {}
    };
    
    const archivos = indice.archivos;
    const importaciones = indice.importaciones || [];
    const funciones = indice.funciones || [];
    const clases = indice.clases || [];
    
    // 1. Crear nodos para archivos
    estado.total = archivos.length;
    
    for (const archivo of archivos) {
        if (estado.cancelado) {
            throw new Error('Cancelado');
        }
        
        resultados.nodos.push({
            id: archivo.ruta,
            nombre: archivo.nombre,
            tipo: 'archivo',
            tamaño: archivo.lineas || 0
        });
        
        estado.procesados++;
        estado.progreso = Math.round((estado.procesados / estado.total) * 100);
        
        if (estado.procesados % 10 === 0) {
            self.postMessage({
                tipo: 'progreso',
                id,
                progreso: estado.progreso,
                procesados: estado.procesados,
                total: estado.total
            });
        }
    }
    
    // 2. Crear aristas a partir de importaciones
    const nodosMap = new Map(resultados.nodos.map(n => [n.id, n]));
    
    for (const imp of importaciones) {
        if (estado.cancelado) {
            throw new Error('Cancelado');
        }
        
        if (imp.resuelto && imp.rutaResuelta) {
            const origen = nodosMap.get(imp.archivo);
            const destino = nodosMap.get(imp.rutaResuelta);
            
            if (origen && destino) {
                resultados.aristas.push({
                    origen: imp.archivo,
                    destino: imp.rutaResuelta,
                    tipo: 'importacion',
                    nombre: imp.nombre || ''
                });
            }
        }
    }
    
    // 3. Detectar ciclos
    resultados.ciclos = detectarCiclos(resultados.nodos, resultados.aristas);
    
    // 4. Detectar nodos huérfanos
    const nodosConectados = new Set();
    for (const arista of resultados.aristas) {
        nodosConectados.add(arista.origen);
        nodosConectados.add(arista.destino);
    }
    
    resultados.huerfanos = resultados.nodos
        .filter(n => !nodosConectados.has(n.id))
        .map(n => n.id);
    
    // 5. Identificar módulos sin usar
    const archivosImportados = new Set();
    for (const imp of importaciones) {
        if (imp.resuelto && imp.rutaResuelta) {
            archivosImportados.add(imp.rutaResuelta);
        }
    }
    
    const excluidos = ['index.html', 'app.js', 'main.js', 'config.js'];
    resultados.modulosSinUsar = archivos
        .filter(a => !excluidos.includes(a.nombre) && !archivosImportados.has(a.ruta))
        .map(a => a.ruta);
    
    // 6. Métricas
    resultados.metricas = {
        totalNodos: resultados.nodos.length,
        totalAristas: resultados.aristas.length,
        ciclosDetectados: resultados.ciclos.length,
        nodosHuerfanos: resultados.huerfanos.length,
        modulosSinUsar: resultados.modulosSinUsar.length
    };
    
    return resultados;
}

/**
 * Detecta ciclos en el grafo
 * @param {Array} nodos - Lista de nodos
 * @param {Array} aristas - Lista de aristas
 * @returns {Array} Ciclos encontrados
 */
function detectarCiclos(nodos, aristas) {
    const grafo = {};
    for (const nodo of nodos) {
        grafo[nodo.id] = [];
    }
    for (const arista of aristas) {
        if (grafo[arista.origen]) {
            grafo[arista.origen].push(arista.destino);
        }
    }
    
    const visitado = new Set();
    const pila = new Set();
    const ciclos = [];
    
    function dfs(nodo, path) {
        if (pila.has(nodo)) {
            const inicio = path.indexOf(nodo);
            const ciclo = path.slice(inicio);
            if (ciclo.length > 1) {
                ciclos.push({
                    nodos: ciclo,
                    descripcion: `${ciclo.join(' → ')} → ${ciclo[0]}`
                });
            }
            return;
        }
        
        if (visitado.has(nodo)) return;
        
        visitado.add(nodo);
        pila.add(nodo);
        
        const vecinos = grafo[nodo] || [];
        for (const vecino of vecinos) {
            dfs(vecino, [...path, nodo]);
        }
        
        pila.delete(nodo);
    }
    
    for (const nodo of Object.keys(grafo)) {
        if (!visitado.has(nodo)) {
            dfs(nodo, []);
        }
    }
    
    return ciclos;
}

/**
 * Maneja la cancelación del análisis
 */
function manejarCancelacion() {
    estado.cancelado = true;
    self.postMessage({
        tipo: 'cancelado',
        mensaje: 'Cancelando análisis de dependencias...'
    });
}

/**
 * Envía el estado actual del worker
 * @param {string} id - ID del mensaje
 */
function enviarEstado(id) {
    self.postMessage({
        tipo: 'estado',
        id,
        estado: {
            ejecutando: estado.ejecutando,
            cancelado: estado.cancelado,
            progreso: estado.progreso,
            procesados: estado.procesados,
            total: estado.total
        }
    });
}

// ================================================================
// LOG DE INICIO
// ================================================================

console.log('🔗 Worker de Dependencias iniciado (DependenciasWorker)');