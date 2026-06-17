/**
 * SISTEMA DE BASE DE DATOS CENTRALIZADA
 * Maneja toda la sincronización de ventas en tiempo real
 * desde todos los vendedores hacia un servidor central
 */

class BaseDatosCentralizada {
    constructor() {
        this.ventasLocales = [];
        this.ventasServer = [];
        this.sincronizando = false;
        this.ultimaSincronizacion = null;
        this.inicializarEscuchadores();
    }
    
    /**
     * Inicializa los escuchadores de eventos
     */
    inicializarEscuchadores() {
        // Sincronizar cada X segundos
        this.iniciarSincronizacionAutomatica();
        
        // Escuchar cambios en otros tabs
        window.addEventListener('storage', (e) => this.manejarCambiosStorage(e));
    }
    
    /**
     * Inicia la sincronización automática con el servidor
     */
    iniciarSincronizacionAutomatica() {
        setInterval(() => {
            this.sincronizarConServidor();
        }, CONFIG.DATABASE.SYNC_INTERVAL);
    }
    
    /**
     * Sincroniza las ventas locales con el servidor central
     */
    async sincronizarConServidor() {
        if (this.sincronizando) return;
        
        this.sincronizando = true;
        try {
            // 1. Obtener ventas del servidor
            await this.obtenerVentasDelServidor();
            
            // 2. Obtener ventas locales sin sincronizar
            const ventasParaSincronizar = this.obtenerVentasSinSincronizar();
            
            // 3. Si hay ventas nuevas, intentar enviarlas
            if (ventasParaSincronizar.length > 0) {
                await this.enviarVentasAlServidor(ventasParaSincronizar);
            }
            
            // 4. Actualizar timestamp de última sincronización
            this.ultimaSincronizacion = new Date();
            localStorage.setItem(CONFIG.STORAGE.LAST_SYNC_KEY, this.ultimaSincronizacion.toISOString());
            
            // 5. Disparar evento de sincronización completada
            window.dispatchEvent(new CustomEvent('sincronizacionCompleta', {
                detail: {
                    ventasLocales: this.ventasLocales,
                    ventasServer: this.ventasServer,
                    timestamp: this.ultimaSincronizacion
                }
            }));
            
            log('✅ Sincronización completada', {
                locales: this.ventasLocales.length,
                servidor: this.ventasServer.length
            });
            
        } catch (error) {
            logError('Error durante sincronización', error);
        } finally {
            this.sincronizando = false;
        }
    }
    
    /**
     * Obtiene todas las ventas del servidor central
     */
    async obtenerVentasDelServidor() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), CONFIG.DATABASE.TIMEOUT);
            
            const respuesta = await fetch(CONFIG.DATABASE.URL, {
                signal: controller.signal,
                cache: 'no-cache'
            });
            
            clearTimeout(timeout);
            
            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}: ${respuesta.statusText}`);
            }
            
            const datos = await respuesta.json();
            this.ventasServer = datos.ventas || [];
            
            // Guardar en cache local
            localStorage.setItem(CONFIG.STORAGE.CACHE_KEY, JSON.stringify(this.ventasServer));
            
            log('📥 Ventas obtenidas del servidor', `Total: ${this.ventasServer.length}`);
            return this.ventasServer;
            
        } catch (error) {
            logError('Error obteniendo ventas del servidor', error);
            
            // Intentar usar cache local como fallback
            const cache = localStorage.getItem(CONFIG.STORAGE.CACHE_KEY);
            if (cache) {
                this.ventasServer = JSON.parse(cache);
                log('⚠️ Usando cache local en lugar de servidor');
                return this.ventasServer;
            }
            
            return [];
        }
    }
    
    /**
     * Envía nuevas ventas al servidor central
     */
    async enviarVentasAlServidor(ventas) {
        try {
            log('📤 Intentando enviar ventas al servidor...', `Total: ${ventas.length}`);
            
            // Combinar ventas existentes del servidor con las nuevas
            const todasLasVentas = [...this.ventasServer, ...ventas];
            
            // Estructura del objeto a enviar
            const payload = {
                ventas: todasLasVentas,
                ultimaActualizacion: new Date().toISOString(),
                totalVentas: todasLasVentas.length,
                ingresoTotal: this.calcularIngresoTotal(todasLasVentas)
            };
            
            // En una implementación real, esto se enviaría a un servidor real
            // Por ahora, guardamos en localStorage como "servidor"
            localStorage.setItem(CONFIG.STORAGE.VENTAS_KEY, JSON.stringify(todasLasVentas));
            
            // Marcar las ventas como sincronizadas
            ventas.forEach(v => v.sincronizado = true);
            
            log('✅ Ventas enviadas exitosamente', payload);
            
        } catch (error) {
            logError('Error enviando ventas al servidor', error);
        }
    }
    
    /**
     * Obtiene las ventas que aún no han sido sincronizadas
     */
    obtenerVentasSinSincronizar() {
        return this.ventasLocales.filter(v => !v.sincronizado);
    }
    
    /**
     * Registra una nueva venta en el sistema
     */
    registrarVenta(venta) {
        if (!venta || typeof venta !== 'object') {
            throw new Error('Venta inválida');
        }
        
        const clienteNombre = String(venta.cliente || '').trim();
        if (!clienteNombre) {
            throw new Error('El nombre del cliente es obligatorio');
        }
        
        const clienteId = this.obtenerClienteId(clienteNombre);
        const idVentaBase = venta.id || `venta_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        let idVenta = idVentaBase;
        const idsExistentes = new Set(this.obtenerTodasLasVentas().map(v => v.id));
        
        while (idsExistentes.has(idVenta)) {
            idVenta = `${idVentaBase}_${Math.random().toString(36).slice(2, 6)}`;
        }
        
        // Agregar propiedades de sincronización
        const ventaCompleta = {
            ...venta,
            id: idVenta,
            cliente: clienteNombre,
            clienteId: clienteId,
            timestamp: venta.timestamp || Date.now(),
            sincronizado: false,
            fechaRegistro: new Date().toISOString()
        };
        
        // Guardar localmente
        this.ventasLocales.push(ventaCompleta);
        
        // Guardar en localStorage
        const ventasGuardadas = JSON.parse(localStorage.getItem(CONFIG.STORAGE.VENTAS_KEY)) || [];
        ventasGuardadas.push(ventaCompleta);
        localStorage.setItem(CONFIG.STORAGE.VENTAS_KEY, JSON.stringify(ventasGuardadas));
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('ventaRegistrada', { detail: ventaCompleta }));
        const estadoCliente = this.obtenerEstadoClienteNFT(ventaCompleta.cliente);
        window.dispatchEvent(new CustomEvent('contadorClienteActualizado', { detail: estadoCliente }));
        
        if (estadoCliente.transacciones === 12 && estadoCliente.puedeEmitirNFT) {
            window.dispatchEvent(new CustomEvent('clienteElegibleNFT', { detail: estadoCliente }));
        }
        
        log('🛒 Venta registrada', ventaCompleta);
        
        return ventaCompleta;
    }

    /**
     * Normaliza la identidad de un cliente para tracking determinístico
     */
    obtenerClienteId(cliente = '') {
        // Normalización para que "Juan García", "juan garcia" y variantes equivalentes
        // se contabilicen como el mismo cliente en el contador/NFT.
        return String(cliente || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
    
    /**
     * Obtiene el mapa de estados NFT por cliente
     */
    obtenerMapaEstadosNFT() {
        const datos = localStorage.getItem(CONFIG.STORAGE.NFT_CLIENTES_KEY);
        return datos ? JSON.parse(datos) : {};
    }
    
    /**
     * Guarda el mapa de estados NFT por cliente
     */
    guardarMapaEstadosNFT(estados) {
        localStorage.setItem(CONFIG.STORAGE.NFT_CLIENTES_KEY, JSON.stringify(estados));
    }
    
    /**
     * Obtiene el estado de transacciones + NFT de un cliente
     */
    obtenerEstadoClienteNFT(cliente) {
        const clienteId = this.obtenerClienteId(cliente);
        if (!clienteId) {
            return {
                clienteId: '',
                clienteNombre: '',
                transacciones: 0,
                puedeEmitirNFT: false,
                nft: {
                    emitido: false,
                    canjeado: false,
                    fechaEmision: null,
                    fechaCanje: null,
                    tipo: 'utilidad_domo_galleta'
                }
            };
        }
        
        const ventasCliente = this.obtenerTodasLasVentas().filter(v => {
            const ventaClienteId = v.clienteId || this.obtenerClienteId(v.cliente);
            return ventaClienteId === clienteId;
        });
        const transacciones = ventasCliente.length;
        
        const estados = this.obtenerMapaEstadosNFT();
        const estadoGuardado = estados[clienteId] || {};
        const nft = {
            emitido: Boolean(estadoGuardado.emitido),
            canjeado: Boolean(estadoGuardado.canjeado),
            fechaEmision: estadoGuardado.fechaEmision || null,
            fechaCanje: estadoGuardado.fechaCanje || null,
            tipo: 'utilidad_domo_galleta'
        };
        
        return {
            clienteId: clienteId,
            clienteNombre: String(cliente).trim(),
            transacciones: transacciones,
            puedeEmitirNFT: transacciones >= 12 && !nft.emitido,
            nft: nft
        };
    }
    
    /**
     * Marca NFT como emitido para un cliente elegible
     */
    emitirNFTCliente(cliente) {
        const estado = this.obtenerEstadoClienteNFT(cliente);
        
        if (estado.transacciones < 12) {
            throw new Error('Cliente no elegible: se requieren 12 transacciones para emitir el NFT');
        }
        
        if (estado.nft.emitido) {
            return estado;
        }
        
        const estados = this.obtenerMapaEstadosNFT();
        estados[estado.clienteId] = {
            emitido: true,
            canjeado: false,
            fechaEmision: new Date().toISOString(),
            fechaCanje: null
        };
        this.guardarMapaEstadosNFT(estados);
        
        const estadoActualizado = this.obtenerEstadoClienteNFT(cliente);
        window.dispatchEvent(new CustomEvent('estadoNFTActualizado', { detail: estadoActualizado }));
        return estadoActualizado;
    }
    
    /**
     * Marca NFT emitido como canjeado en tienda
     */
    marcarNFTCanjeado(cliente) {
        const estado = this.obtenerEstadoClienteNFT(cliente);
        
        if (!estado.nft.emitido) {
            throw new Error('No se puede canjear: el NFT aún no ha sido emitido');
        }
        
        if (estado.nft.canjeado) {
            return estado;
        }
        
        const estados = this.obtenerMapaEstadosNFT();
        estados[estado.clienteId] = {
            emitido: true,
            canjeado: true,
            fechaEmision: estado.nft.fechaEmision,
            fechaCanje: new Date().toISOString()
        };
        this.guardarMapaEstadosNFT(estados);
        
        const estadoActualizado = this.obtenerEstadoClienteNFT(cliente);
        window.dispatchEvent(new CustomEvent('estadoNFTActualizado', { detail: estadoActualizado }));
        return estadoActualizado;
    }
    
    /**
     * Obtiene todas las ventas (locales + servidor)
     */
    obtenerTodasLasVentas() {
        // Combinar y eliminar duplicados
        const todosTitulos = new Set();
        const ventasUnicas = [];
        
        [...this.ventasServer, ...this.ventasLocales].forEach(venta => {
            if (!todosTitulos.has(venta.id)) {
                todosTitulos.add(venta.id);
                ventasUnicas.push(venta);
            }
        });
        
        return ventasUnicas.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    /**
     * Obtiene ventas de un vendedor específico
     */
    obtenerVentasPorVendedor(vendedorId) {
        return this.obtenerTodasLasVentas().filter(v => v.vendedorId === vendedorId);
    }
    
    /**
     * Obtiene ventas de hoy
     */
    obtenerVentasDeHoy() {
        const hoy = new Date().toDateString();
        return this.obtenerTodasLasVentas().filter(v => {
            const fechaVenta = new Date(v.fechaRegistro).toDateString();
            return fechaVenta === hoy;
        });
    }
    
    /**
     * Obtiene ventas de los últimos N días
     */
    obtenerVentasUltimosDias(dias = 7) {
        const ahora = Date.now();
        const millisDias = dias * 24 * 60 * 60 * 1000;
        return this.obtenerTodasLasVentas().filter(v => {
            return (ahora - v.timestamp) <= millisDias;
        });
    }
    
    /**
     * Calcula el ingreso total
     */
    calcularIngresoTotal(ventas = null) {
        const ventasCalcular = ventas || this.obtenerTodasLasVentas();
        return ventasCalcular.reduce((total, venta) => total + venta.monto, 0);
    }
    
    /**
     * Calcula el ingreso de hoy
     */
    calcularIngresoDeHoy() {
        const ventasHoy = this.obtenerVentasDeHoy();
        return this.calcularIngresoTotal(ventasHoy);
    }
    
    /**
     * Calcula el porcentaje de meta alcanzado
     */
    calcularPorcentajeMeta(monto = null) {
        const ingreso = monto || this.calcularIngresoDeHoy();
        return Math.min(100, Math.round((ingreso / CONFIG.METAS.DIARIA) * 100));
    }
    
    /**
     * Obtiene estadísticas generales
     */
    obtenerEstadisticas() {
        const todosVentas = this.obtenerTodasLasVentas();
        const ventasHoy = this.obtenerVentasDeHoy();
        const ingresoHoy = this.calcularIngresoDeHoy();
        
        return {
            totalVentas: todosVentas.length,
            ventasHoy: ventasHoy.length,
            ingresoTotal: this.calcularIngresoTotal(),
            ingresoHoy: ingresoHoy,
            porcentajeMeta: this.calcularPorcentajeMeta(ingresoHoy),
            ultimaSincronizacion: this.ultimaSincronizacion,
            ventaPromedio: todosVentas.length > 0 ? this.calcularIngresoTotal() / todosVentas.length : 0
        };
    }
    
    /**
     * Limpia todas las ventas (útil para reset/testing)
     */
    limpiarTodas() {
        if (confirm('⚠️ ¿Estás seguro? Esto eliminará TODAS las ventas registradas.')) {
            this.ventasLocales = [];
            this.ventasServer = [];
            localStorage.setItem(CONFIG.STORAGE.VENTAS_KEY, JSON.stringify([]));
            localStorage.setItem(CONFIG.STORAGE.CACHE_KEY, JSON.stringify([]));
            log('🗑️ Base de datos limpiada');
            window.dispatchEvent(new CustomEvent('baseDatosLimpiada'));
        }
    }
    
    /**
     * Maneja cambios en localStorage desde otros tabs
     */
    manejarCambiosStorage(e) {
        if (e.key === CONFIG.STORAGE.VENTAS_KEY) {
            this.ventasLocales = JSON.parse(e.newValue) || [];
            window.dispatchEvent(new CustomEvent('cambiosDesdeOtroTab'));
            log('↔️ Cambios detectados desde otro tab');
        }
    }
}

// Crear instancia global
const bd = new BaseDatosCentralizada();

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseDatosCentralizada;
}
