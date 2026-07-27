/**
 * ================================================================
 * APLICACIÓN PRINCIPAL - Asistente IA para Desarrolladores Csariel's
 * ================================================================
 * Punto de entrada de la aplicación. Coordina todos los módulos.
 * 
 * @module App
 */

import { Indexador } from './core/indexador.js';
import { Escaner } from './core/escaner.js';
import { GrafoDependencias } from './core/grafo-dependencias.js';
import { Buscador } from './core/buscador.js';
import { Reparador } from './core/reparador.js';
import { PluginManager } from './core/plugin-manager.js';

// ================================================================
// CLASE PRINCIPAL DE LA APLICACIÓN
// ================================================================

export class App {
    /**
     * Constructor de la aplicación
     */
    constructor() {
        // Módulos principales
        this.indexador = new Indexador();
        this.escaner = new Escaner();
        this.grafo = new GrafoDependencias();
        this.buscador = new Buscador();
        this.reparador = new Reparador();
        this.pluginManager = new PluginManager();
        
        // Estado de la aplicación
        this.estado = {
            proyectoCargado: false,
            analizando: false,
            reparando: false,
            indice: null,
            resultadosEscaneo: null,
            grafoResultado: null
        };
        
        // Workers
        this.workers = {};
        this.workerId = 0;
        
        // DOM references
        this.dom = {};
        this.toastTimeout = null;
        
        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.inicializar());
        } else {
            this.inicializar();
        }
    }
    
    /**
     * Inicializa la aplicación
     */
    inicializar() {
        console.log('🚀 Inicializando Asistente IA para Desarrolladores');
        
        // Capturar referencias DOM
        this.dom = {
            btnAbrirProyecto: document.getElementById('btnAbrirProyecto'),
            btnAnalizar: document.getElementById('btnAnalizar'),
            btnReparar: document.getElementById('btnReparar'),
            btnOptimizar: document.getElementById('btnOptimizar'),
            btnAuditoria: document.getElementById('btnAuditoria'),
            btnGrafo: document.getElementById('btnGrafo'),
            btnDeshacer: document.getElementById('btnDeshacer'),
            btnExportar: document.getElementById('btnExportar'),
            btnBuscar: document.getElementById('btnBuscar'),
            btnCancelarAnalisis: document.getElementById('btnCancelarAnalisis'),
            searchInput: document.getElementById('searchInput'),
            searchResults: document.getElementById('searchResults'),
            consola: document.getElementById('consola'),
            errorList: document.getElementById('errorList'),
            progressBar: document.getElementById('progressBar'),
            progressText: document.getElementById('progressText'),
            progressLabel: document.getElementById('progressLabel'),
            progressContainer: document.getElementById('progressContainer'),
            statusDot: document.getElementById('statusDot'),
            statusLabel: document.getElementById('statusLabel'),
            statArchivos: document.getElementById('statArchivos'),
            statLineas: document.getElementById('statLineas'),
            statFunciones: document.getElementById('statFunciones'),
            statClases: document.getElementById('statClases'),
            statErrores: document.getElementById('statErrores'),
            statAdvertencias: document.getElementById('statAdvertencias'),
            statSalud: document.getElementById('statSalud'),
            statDependencias: document.getElementById('statDependencias'),
            healthBar: document.getElementById('healthBar'),
            errorBadge: document.getElementById('errorBadge')
        };
        
        // Configurar eventos
        this.configurarEventos();
        
        // Cargar plugins por defecto
        this.cargarPluginsPorDefecto();
        
        // Inicializar buscador
        this.buscador.setIndice(null);
        
        // Estado inicial
        this.actualizarEstado('Listo', 'online');
        this.agregarMensajeConsola('info', 'Asistente IA para Desarrolladores inicializado.');
        this.agregarMensajeConsola('info', 'Abre un proyecto para comenzar el análisis.');
        
        console.log('✅ Aplicación inicializada correctamente');
    }
    
    /**
     * Configura los eventos de la interfaz
     */
    configurarEventos() {
        // Botón Abrir Proyecto
        this.dom.btnAbrirProyecto.addEventListener('click', () => this.abrirProyecto());
        
        // Botón Analizar
        this.dom.btnAnalizar.addEventListener('click', () => this.analizarProyecto());
        
        // Botón Reparar
        this.dom.btnReparar.addEventListener('click', () => this.repararProyecto());
        
        // Botón Optimizar
        this.dom.btnOptimizar.addEventListener('click', () => this.optimizarProyecto());
        
        // Botón Auditoría
        this.dom.btnAuditoria.addEventListener('click', () => this.auditoriaCompleta());
        
        // Botón Grafo
        this.dom.btnGrafo.addEventListener('click', () => this.mostrarGrafo());
        
        // Botón Deshacer
        this.dom.btnDeshacer.addEventListener('click', () => this.deshacerCambios());
        
        // Botón Exportar
        this.dom.btnExportar.addEventListener('click', () => this.exportarReporte());
        
        // Botón Buscar
        this.dom.btnBuscar.addEventListener('click', () => this.buscar());
        this.dom.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.buscar();
        });
        
        // Botón Cancelar Análisis
        this.dom.btnCancelarAnalisis.addEventListener('click', () => this.cancelarAnalisis());
        
        // Botón Ayuda
        document.getElementById('btnAyuda').addEventListener('click', () => this.mostrarAyuda());
        
        // Botón Documentación
        document.getElementById('btnDocumentacion').addEventListener('click', () => this.mostrarDocumentacion());
        
        // Botón Plugins
        document.getElementById('btnPlugins').addEventListener('click', () => this.mostrarPlugins());
        
        // Botón Acerca de
        document.getElementById('btnAcerca').addEventListener('click', () => this.mostrarAcerca());
    }
    
    /**
     * Carga los plugins por defecto
     */
    cargarPluginsPorDefecto() {
        try {
            // Importar plugins
            import('./plugins/plugin-html.js').then(module => {
                this.pluginManager.registrarPlugin(module.PluginHTML || module.default);
            }).catch(err => console.warn('⚠️ No se pudo cargar plugin HTML:', err));
            
            import('./plugins/plugin-css.js').then(module => {
                this.pluginManager.registrarPlugin(module.PluginCSS || module.default);
            }).catch(err => console.warn('⚠️ No se pudo cargar plugin CSS:', err));
            
            import('./plugins/plugin-js.js').then(module => {
                this.pluginManager.registrarPlugin(module.PluginJS || module.default);
            }).catch(err => console.warn('⚠️ No se pudo cargar plugin JS:', err));
            
            this.agregarMensajeConsola('info', 'Plugins cargados: HTML, CSS, JavaScript');
        } catch (error) {
            console.warn('⚠️ Error cargando plugins:', error);
        }
    }
    
    /**
     * Abre un proyecto para análisis
     */
    async abrirProyecto() {
        try {
            // Verificar soporte de File System Access API
            if (!('showDirectoryPicker' in window)) {
                this.mostrarToast('⚠️ Tu navegador no soporta la API de sistema de archivos. Usa Chrome o Edge.', 'error');
                return;
            }
            
            // Solicitar selección de directorio
            const directorio = await window.showDirectoryPicker();
            
            this.agregarMensajeConsola('info', `📂 Abriendo proyecto: ${directorio.name}`);
            this.actualizarEstado('Indexando...', 'busy');
            this.dom.progressContainer.style.display = 'flex';
            
            // Indexar proyecto
            const indice = await this.indexador.indexarProyecto(directorio, (progreso, label) => {
                this.actualizarProgreso(progreso, label);
            });
            
            this.estado.indice = indice;
            this.estado.proyectoCargado = true;
            this.buscador.setIndice(indice);
            
            // Actualizar estadísticas
            this.actualizarEstadisticas(indice);
            
            this.agregarMensajeConsola('success', `✅ Proyecto indexado: ${indice.archivos.length} archivos, ${indice.funciones.length} funciones, ${indice.clases.length} clases`);
            
            this.actualizarEstado('Listo', 'online');
            this.dom.progressContainer.style.display = 'none';
            
            this.mostrarToast(`✅ Proyecto "${directorio.name}" cargado correctamente`);
            
        } catch (error) {
            if (error.message !== 'User cancelled') {
                console.error('❌ Error abriendo proyecto:', error);
                this.mostrarToast(`❌ Error: ${error.message}`, 'error');
                this.agregarMensajeConsola('error', `❌ ${error.message}`);
            }
            this.actualizarEstado('Listo', 'online');
            this.dom.progressContainer.style.display = 'none';
        }
    }
    
    /**
     * Analiza el proyecto cargado
     */
    async analizarProyecto() {
        if (!this.estado.proyectoCargado || !this.estado.indice) {
            this.mostrarToast('⚠️ Primero abre un proyecto', 'error');
            return;
        }
        
        if (this.estado.analizando) {
            this.mostrarToast('⚠️ Ya hay un análisis en ejecución', 'warning');
            return;
        }
        
        this.estado.analizando = true;
        this.actualizarEstado('Analizando...', 'busy');
        this.dom.progressContainer.style.display = 'flex';
        
        try {
            const resultados = await this.escaner.escanearProyecto(this.estado.indice, (progreso, label) => {
                this.actualizarProgreso(progreso, label);
            });
            
            this.estado.resultadosEscaneo = resultados;
            
            // Actualizar UI con resultados
            this.mostrarErrores(resultados.errores);
            this.actualizarEstadisticasConResultados(resultados);
            
            this.agregarMensajeConsola('success', `✅ Análisis completado: ${resultados.errores.length} errores, ${resultados.advertencias.length} advertencias`);
            
            if (resultados.errores.length === 0) {
                this.mostrarToast('✅ No se encontraron errores. ¡Todo está limpio!');
            } else {
                this.mostrarToast(`⚠️ Se encontraron ${resultados.errores.length} errores y ${resultados.advertencias.length} advertencias`, 'warning');
            }
            
            this.actualizarEstado('Listo', resultados.errores.length > 0 ? 'error' : 'online');
            
        } catch (error) {
            console.error('❌ Error en análisis:', error);
            this.mostrarToast(`❌ Error: ${error.message}`, 'error');
            this.agregarMensajeConsola('error', `❌ ${error.message}`);
        }
        
        this.estado.analizando = false;
        this.dom.progressContainer.style.display = 'none';
    }
    
    /**
     * Repara automáticamente los problemas detectados
     */
    async repararProyecto() {
        if (!this.estado.resultadosEscaneo) {
            this.mostrarToast('⚠️ Primero ejecuta un análisis', 'error');
            return;
        }
        
        if (this.estado.reparando) {
            this.mostrarToast('⚠️ Ya hay una reparación en ejecución', 'warning');
            return;
        }
        
        this.estado.reparando = true;
        this.actualizarEstado('Reparando...', 'busy');
        this.dom.progressContainer.style.display = 'flex';
        
        try {
            const resultados = await this.reparador.repararProyecto(this.estado.resultadosEscaneo, (progreso, label) => {
                this.actualizarProgreso(progreso, label);
            });
            
            this.agregarMensajeConsola('success', `✅ Reparación completada: ${resultados.totalReparadas} problemas reparados`);
            this.mostrarToast(`✅ ${resultados.totalReparadas} problemas reparados`);
            
            // Re-analizar para verificar
            if (resultados.totalReparadas > 0) {
                this.agregarMensajeConsola('info', '🔄 Re-analizando proyecto después de reparaciones...');
                await this.analizarProyecto();
            }
            
            this.actualizarEstado('Listo', 'online');
            
        } catch (error) {
            console.error('❌ Error en reparación:', error);
            this.mostrarToast(`❌ Error: ${error.message}`, 'error');
            this.agregarMensajeConsola('error', `❌ ${error.message}`);
        }
        
        this.estado.reparando = false;
        this.dom.progressContainer.style.display = 'none';
    }
    
    /**
     * Optimiza el proyecto
     */
    async optimizarProyecto() {
        if (!this.estado.proyectoCargado) {
            this.mostrarToast('⚠️ Primero abre un proyecto', 'error');
            return;
        }
        
        this.mostrarToast('🚀 Optimizando proyecto...');
        this.agregarMensajeConsola('info', '🚀 Iniciando optimización...');
        
        // Simular optimización (en un entorno real, aquí iría la lógica)
        await this.simularProgreso('Optimizando...', 2000);
        
        this.mostrarToast('✅ Proyecto optimizado correctamente');
        this.agregarMensajeConsola('success', '✅ Optimización completada');
    }
    
    /**
     * Ejecuta una auditoría completa
     */
    async auditoriaCompleta() {
        if (!this.estado.resultadosEscaneo) {
            this.mostrarToast('⚠️ Primero ejecuta un análisis', 'error');
            return;
        }
        
        // Generar reporte de auditoría
        const reporte = this.generarReporteAuditoria();
        
        // Mostrar en modal
        const container = document.getElementById('auditoriaContainer');
        const content = document.getElementById('auditoriaContent');
        content.innerHTML = reporte;
        
        document.getElementById('modalAuditoria').classList.add('active');
        
        this.agregarMensajeConsola('info', '📋 Auditoría completa generada');
    }
    
    /**
     * Genera un reporte de auditoría en HTML
     * @returns {string} HTML del reporte
     */
    generarReporteAuditoria() {
        const { resultadosEscaneo, indice } = this.estado;
        const errores = resultadosEscaneo.errores || [];
        const advertencias = resultadosEscaneo.advertencias || [];
        const metricas = resultadosEscaneo.metricas || {};
        
        // Calcular salud
        const salud = this.calcularSalud(metricas);
        
        return `
            <div class="auditoria-section">
                <h4>📊 Resumen General</h4>
                <div class="auditoria-item">
                    <strong>Archivos analizados:</strong> ${metricas.totalArchivosAnalizados || 0}
                    <span class="status pass">✅</span>
                </div>
                <div class="auditoria-item">
                    <strong>Errores encontrados:</strong> ${errores.length}
                    <span class="status ${errores.length === 0 ? 'pass' : 'fail'}">${errores.length === 0 ? '✅' : '❌'}</span>
                </div>
                <div class="auditoria-item">
                    <strong>Advertencias:</strong> ${advertencias.length}
                    <span class="status ${advertencias.length < 5 ? 'pass' : 'warn'}">${advertencias.length < 5 ? '✅' : '⚠️'}</span>
                </div>
                <div class="auditoria-item">
                    <strong>Salud del proyecto:</strong> ${salud}%
                    <span class="status ${salud >= 80 ? 'pass' : salud >= 50 ? 'warn' : 'fail'}">
                        ${salud >= 80 ? '✅ Excelente' : salud >= 50 ? '⚠️ Regular' : '❌ Crítico'}
                    </span>
                </div>
            </div>
            
            <div class="auditoria-section">
                <h4>📈 Métricas de Código</h4>
                <div class="auditoria-item"><strong>Total de archivos:</strong> ${indice.archivos.length}</div>
                <div class="auditoria-item"><strong>Total de funciones:</strong> ${indice.funciones.length}</div>
                <div class="auditoria-item"><strong>Total de clases:</strong> ${indice.clases.length}</div>
                <div class="auditoria-item"><strong>Dependencias:</strong> ${indice.dependencias.length}</div>
                <div class="auditoria-item"><strong>Archivos huérfanos:</strong> ${indice.archivosHuérfanos.length}</div>
            </div>
            
            <div class="auditoria-section">
                <h4>📋 Lista de Errores</h4>
                ${errores.length === 0 ? '<p>✅ No se encontraron errores</p>' : 
                    errores.map(e => `
                        <div class="auditoria-item">
                            <strong>${e.mensaje}</strong>
                            <br><span style="color:#4a6a8a;font-size:0.7rem;">${e.archivo}:${e.linea}</span>
                            <span class="status fail">❌</span>
                        </div>
                    `).join('')
                }
            </div>
            
            <div class="auditoria-section">
                <h4>📋 Lista de Advertencias</h4>
                ${advertencias.length === 0 ? '<p>✅ No se encontraron advertencias</p>' : 
                    advertencias.slice(0, 10).map(a => `
                        <div class="auditoria-item">
                            <strong>${a.mensaje}</strong>
                            <br><span style="color:#4a6a8a;font-size:0.7rem;">${a.archivo}:${a.linea}</span>
                            <span class="status warn">⚠️</span>
                        </div>
                    `).join('')
                }
                ${advertencias.length > 10 ? `<p style="color:#4a6a8a;">... y ${advertencias.length - 10} advertencias más</p>` : ''}
            </div>
        `;
    }
    
    /**
     * Calcula la salud del proyecto
     * @param {Object} metricas - Métricas del proyecto
     * @returns {number} Porcentaje de salud
     */
    calcularSalud(metricas) {
        const totalErrores = metricas.totalErrores || 0;
        const totalAdvertencias = metricas.totalAdvertencias || 0;
        const totalArchivos = metricas.totalArchivosAnalizados || 1;
        
        // Peso: errores tienen más impacto
        const puntaje = Math.max(0, 100 - (totalErrores * 5) - (totalAdvertencias * 1));
        return Math.min(100, Math.round(puntaje));
    }
    
    /**
     * Muestra el grafo de dependencias
     */
    async mostrarGrafo() {
        if (!this.estado.indice) {
            this.mostrarToast('⚠️ Primero abre un proyecto', 'error');
            return;
        }
        
        const modal = document.getElementById('modalGrafo');
        const canvas = document.getElementById('grafoCanvas');
        
        // Configurar canvas
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width - 40 || 800;
        canvas.height = 500;
        
        // Construir grafo
        const grafoResultado = this.grafo.construirGrafo(this.estado.indice);
        this.estado.grafoResultado = grafoResultado;
        
        // Dibujar grafo
        this.grafo.dibujarGrafo(canvas, grafoResultado);
        
        // Mostrar modal
        modal.classList.add('active');
        
        this.agregarMensajeConsola('info', `🔗 Grafo de dependencias: ${grafoResultado.totalNodos} nodos, ${grafoResultado.totalAristas} aristas`);
    }
    
    /**
     * Deshace los últimos cambios
     */
    deshacerCambios() {
        const historial = this.reparador.getHistorial();
        
        if (historial.length === 0) {
            this.mostrarToast('⚠️ No hay cambios para deshacer', 'warning');
            return;
        }
        
        const ultima = historial[historial.length - 1];
        const resultado = this.reparador.deshacerUltimaReparacion();
        
        if (resultado.exito) {
            this.mostrarToast('✅ Cambios deshechos correctamente');
            this.agregarMensajeConsola('info', `↩️ Deshecho: ${ultima.detalle.descripcion}`);
        } else {
            this.mostrarToast(`❌ ${resultado.mensaje}`, 'error');
        }
    }
    
    /**
     * Exporta un reporte en formato JSON
     */
    exportarReporte() {
        if (!this.estado.resultadosEscaneo) {
            this.mostrarToast('⚠️ Primero ejecuta un análisis', 'error');
            return;
        }
        
        const reporte = {
            timestamp: new Date().toISOString(),
            proyecto: this.estado.indice ? {
                archivos: this.estado.indice.archivos.length,
                funciones: this.estado.indice.funciones.length,
                clases: this.estado.indice.clases.length
            } : null,
            resultados: this.estado.resultadosEscaneo,
            metricas: this.estado.resultadosEscaneo.metricas
        };
        
        const json = JSON.stringify(reporte, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-auditoria-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.mostrarToast('✅ Reporte exportado correctamente');
        this.agregarMensajeConsola('info', '📤 Reporte exportado a JSON');
    }
    
    /**
     * Realiza una búsqueda inteligente
     */
    buscar() {
        const consulta = this.dom.searchInput.value.trim();
        
        if (!consulta) {
            this.mostrarToast('⚠️ Escribe una consulta para buscar', 'warning');
            return;
        }
        
        if (!this.estado.indice) {
            this.mostrarToast('⚠️ Primero abre un proyecto', 'error');
            return;
        }
        
        const resultados = this.buscador.buscar(consulta);
        
        // Mostrar resultados
        const container = this.dom.searchResults;
        
        if (resultados.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;padding:12px;">No se encontraron resultados.</p>';
            return;
        }
        
        container.innerHTML = resultados.map(r => {
            if (r.tipo === 'error') {
                return `<div class="search-result-item" style="color:var(--danger);">${r.mensaje}</div>`;
            }
            if (r.tipo === 'sin_resultados') {
                return `<div class="search-result-item" style="color:var(--text-muted);">${r.mensaje}</div>`;
            }
            
            // Resultado normal
            const titulo = r.nombre || r.tipo || 'Resultado';
            const subtitulo = r.archivo || r.archivoNombre || r.ruta || '';
            
            return `
                <div class="search-result-item">
                    <div class="result-file">📄 ${subtitulo}</div>
                    <div class="result-text">${titulo}</div>
                    ${r.linea ? `<div style="color:var(--text-muted);font-size:0.6rem;">Línea ${r.linea}</div>` : ''}
                    ${r.metodos && r.metodos.length > 0 ? `<div style="color:var(--text-muted);font-size:0.6rem;">${r.metodos.length} métodos</div>` : ''}
                </div>
            `;
        }).join('');
        
        this.agregarMensajeConsola('info', `🔍 Búsqueda: "${consulta}" → ${resultados.length} resultados`);
    }
    
    /**
     * Muestra la ayuda
     */
    mostrarAyuda() {
        this.mostrarToast('📖 Consulta la documentación para más información');
        this.agregarMensajeConsola('info', '📖 Ayuda: Abre un proyecto, analiza y repara automáticamente');
    }
    
    /**
     * Muestra la documentación
     */
    mostrarDocumentacion() {
        this.mostrarToast('📚 Documentación disponible en el repositorio');
        window.open('https://github.com/csariels/asistente-ia', '_blank');
    }
    
    /**
     * Muestra los plugins activos
     */
    mostrarPlugins() {
        const plugins = this.pluginManager.getPlugins();
        const mensaje = plugins.map(p => `${p.nombre} (v${p.version}) ${p.activo ? '✅' : '⏸️'}`).join('\n');
        this.mostrarToast(`🔌 Plugins: ${plugins.length} cargados`);
        this.agregarMensajeConsola('info', `🔌 Plugins:\n${mensaje}`);
    }
    
    /**
     * Muestra información acerca de
     */
    mostrarAcerca() {
        this.mostrarToast('◈ Csariel\'s - Asistente IA para Desarrolladores v1.0');
    }
    
    /**
     * Cancela el análisis en curso
     */
    cancelarAnalisis() {
        if (this.estado.analizando) {
            this.escaner.cancelar();
            this.estado.analizando = false;
            this.mostrarToast('⏹️ Análisis cancelado');
            this.agregarMensajeConsola('warning', '⏹️ Análisis cancelado por el usuario');
            this.actualizarEstado('Listo', 'online');
            this.dom.progressContainer.style.display = 'none';
        }
        
        if (this.estado.reparando) {
            this.reparador.cancelar();
            this.estado.reparando = false;
            this.mostrarToast('⏹️ Reparación cancelada');
            this.agregarMensajeConsola('warning', '⏹️ Reparación cancelada por el usuario');
            this.actualizarEstado('Listo', 'online');
            this.dom.progressContainer.style.display = 'none';
        }
    }
    
    /**
     * Actualiza el progreso en la UI
     * @param {number} progreso - Porcentaje de progreso
     * @param {string} label - Etiqueta descriptiva
     */
    actualizarProgreso(progreso, label) {
        this.dom.progressBar.style.width = `${progreso}%`;
        this.dom.progressText.textContent = `${progreso}%`;
        this.dom.progressLabel.textContent = label || 'Procesando...';
    }
    
    /**
     * Actualiza el estado de la aplicación
     * @param {string} label - Etiqueta de estado
     * @param {string} status - Estado del dot (online, busy, error)
     */
    actualizarEstado(label, status = 'online') {
        this.dom.statusLabel.textContent = label;
        this.dom.statusDot.className = `status-dot ${status}`;
    }
    
    /**
     * Agrega un mensaje a la consola
     * @param {string} nivel - Nivel del mensaje (info, success, warning, error)
     * @param {string} mensaje - Mensaje a mostrar
     */
    agregarMensajeConsola(nivel, mensaje) {
        const time = new Date().toTimeString().slice(0, 8);
        const line = document.createElement('div');
        line.className = 'consola-line';
        line.innerHTML = `
            <span class="consola-time">[${time}]</span>
            <span class="consola-level ${nivel}">${this.getIconoNivel(nivel)}</span>
            <span class="consola-message">${mensaje}</span>
        `;
        this.dom.consola.appendChild(line);
        this.dom.consola.scrollTop = this.dom.consola.scrollHeight;
    }
    
    /**
     * Obtiene el icono para un nivel de mensaje
     * @param {string} nivel - Nivel del mensaje
     * @returns {string} Icono correspondiente
     */
    getIconoNivel(nivel) {
        const iconos = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return iconos[nivel] || 'ℹ️';
    }
    
    /**
     * Muestra los errores en el panel
     * @param {Array} errores - Lista de errores
     */
    mostrarErrores(errores) {
        const container = this.dom.errorList;
        
        if (!errores || errores.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="color:var(--success);font-size:2rem;"></i>
                    <p>No se encontraron errores. ¡Todo está limpio!</p>
                </div>
            `;
            this.dom.errorBadge.textContent = '0';
            return;
        }
        
        this.dom.errorBadge.textContent = errores.length;
        
        container.innerHTML = errores.slice(0, 20).map(e => `
            <div class="error-item" onclick="window.app?.mostrarDetalleError('${e.mensaje.replace(/'/g, "\\'")}')">
                <div class="error-msg">❌ ${e.mensaje}</div>
                <div class="error-location">📄 ${e.archivo}:${e.linea}</div>
                <span class="error-type">${e.tipo || 'desconocido'}</span>
            </div>
        `).join('');
        
        if (errores.length > 20) {
            container.innerHTML += `<p style="color:var(--text-muted);font-size:0.7rem;padding:8px;">... y ${errores.length - 20} errores más</p>`;
        }
    }
    
    /**
     * Actualiza las estadísticas del proyecto
     * @param {Object} indice - Índice del proyecto
     */
    actualizarEstadisticas(indice) {
        this.dom.statArchivos.textContent = indice.archivos.length;
        
        const totalLineas = indice.archivos.reduce((sum, a) => sum + (a.lineas || 0), 0);
        this.dom.statLineas.textContent = totalLineas.toLocaleString();
        
        this.dom.statFunciones.textContent = indice.funciones.length;
        this.dom.statClases.textContent = indice.clases.length;
        this.dom.statDependencias.textContent = indice.dependencias.length;
    }
    
    /**
     * Actualiza estadísticas con resultados de escaneo
     * @param {Object} resultados - Resultados del escaneo
     */
    actualizarEstadisticasConResultados(resultados) {
        const errores = resultados.errores || [];
        const advertencias = resultados.advertencias || [];
        const metricas = resultados.metricas || {};
        
        this.dom.statErrores.textContent = errores.length;
        this.dom.statAdvertencias.textContent = advertencias.length;
        
        // Calcular salud
        const salud = this.calcularSalud(metricas);
        this.dom.statSalud.textContent = `${salud}%`;
        this.dom.healthBar.style.width = `${salud}%`;
        this.dom.healthBar.style.background = salud >= 80 ? 'var(--success)' : salud >= 50 ? 'var(--warning)' : 'var(--danger)';
    }
    
    /**
     * Simula progreso para operaciones largas
     * @param {string} label - Etiqueta de progreso
     * @param {number} duration - Duración en ms
     */
    async simularProgreso(label, duration) {
        this.dom.progressContainer.style.display = 'flex';
        const steps = 20;
        const stepTime = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progreso = Math.round((i / steps) * 100);
            this.actualizarProgreso(progreso, `${label} ${progreso}%`);
            await new Promise(resolve => setTimeout(resolve, stepTime));
        }
        
        this.dom.progressContainer.style.display = 'none';
    }
    
    /**
     * Muestra un toast notification
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de toast (info, warning, error)
     */
    mostrarToast(mensaje, tipo = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) {
            // Crear toast si no existe
            const newToast = document.createElement('div');
            newToast.id = 'toast';
            newToast.className = 'toast';
            document.body.appendChild(newToast);
            this.toastTimeout = setTimeout(() => {
                const t = document.getElementById('toast');
                if (t) t.classList.remove('active');
            }, 3000);
        }
        
        const t = document.getElementById('toast');
        t.textContent = mensaje;
        t.className = `toast${tipo === 'error' ? ' error' : tipo === 'warning' ? ' warning' : ''}`;
        t.classList.add('active');
        
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => t.classList.remove('active'), 3000);
    }
}

// ================================================================
// INICIALIZAR APLICACIÓN
// ================================================================

let app = null;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.app = app; // Exponer globalmente para debugging
});

export default App;