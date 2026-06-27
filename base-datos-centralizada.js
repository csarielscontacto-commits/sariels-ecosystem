/**
 * SISTEMA DE BASE DE DATOS CENTRALIZADA
 *
 * Maneja toda la sincronización de ventas en tiempo real
 * desde todos los vendedores hacia un servidor central
 *
 * Incluye: flujo de fidelización por contador de transacciones (NFT a la compra #12)
 */
class BaseDatosCentralizada {
    constructor() {
        this.ventasLocales = [];
        this.ventasServer = [];
        this.sincronizando = false;
        this.ultimaSincronizacion = null;
        this.inicializado = false;
        this.errores = [];
        this.estadosNFT = {};

        // Inicializar el sistema
        this.inicializar();
    }

    /**
     * Inicializa el sistema completo
     */
    inicializar() {
        try {
            // Cargar ventas guardadas
            this.cargarVentasLocales();

            // Cargar estados de NFT por cliente
            this.cargarEstadosNFT();

            // Configurar escuchadores
            this.inicializarEscuchadores();

            // Primera sincronización después de 1 segundo
            setTimeout(() => {
                this.sincronizarConservador();
            }, 1000);

            this.inicializado = true;
            console.log('✅ Base de datos centralizada inicializada correctamente');
        } catch (error) {
            console.error('❌ Error en inicialización:', error);
            this.errores.push({
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }
    }

    /**
     * Inicializa los escuchadores de eventos
     */
    inicializarEscuchadores() {
        // Sincronización automática cada X segundos
        const intervalo = (typeof CONFIG !== 'undefined' && CONFIG.DATABASE)
            ? CONFIG.DATABASE.SYNC_INTERVAL
            : 5000;

        setInterval(() => {
            this.sincronizarConservador();
        }, intervalo);

        // Escuchar cambios en otros tabs (ventanas)
        window.addEventListener('storage', (e) => {
            const key = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS)
                ? CONFIG.STORAGE_KEYS.VENTAS
                : 'ventas_centralizadas';

            if (e.key === key || e.key === 'cache_dashboard') {
                console.log('🔄 Cambios detectados en otro tab');
                this.cargarVentasLocales();
                this.sincronizarConservador();
            }
        });

        // Escuchar nuevas ventas registradas
        window.addEventListener('ventaRegistrada', (e) => {
            console.log('📝 Nueva venta detectada:', e.detail || '');
            this.guardarVentasLocales();
            this.sincronizarConservador();
        });
    }

    /**
     * Carga las ventas desde localStorage
     */
    cargarVentasLocales() {
        try {
            const key = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS)
                ? CONFIG.STORAGE_KEYS.VENTAS
                : 'ventas_centralizadas';

            const data = localStorage.getItem(key);
            if (data) {
                this.ventasLocales = JSON.parse(data);
                console.log(`📂 Cargadas ${this.ventasLocales.length} ventas locales`);
            } else {
                this.ventasLocales = [];
            }
        } catch (error) {
            console.error('❌ Error cargando ventas locales:', error);
            this.ventasLocales = [];
        }
    }

    /**
     * Guarda las ventas en localStorage
     */
    guardarVentasLocales() {
        try {
            const key = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS)
                ? CONFIG.STORAGE_KEYS.VENTAS
                : 'ventas_centralizadas';

            localStorage.setItem(key, JSON.stringify(this.ventasLocales));
        } catch (error) {
            console.error('❌ Error guardando ventas locales:', error);
        }
    }

    /**
     * Obtiene ventas del servidor (GitHub Gist)
     */
    async obtenerVentasDelServidor() {
        try {
            if (typeof CONFIG === 'undefined' || !CONFIG.DATABASE || !CONFIG.DATABASE.URL_GIST) {
                console.warn('⚠️ CONFIG.DATABASE.URL_GIST no definido, usando datos locales');
                return this.ventasServer;
            }

            console.log('🌐 Obteniendo ventas del servidor...');
            const response = await fetch(CONFIG.DATABASE.URL_GIST, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                this.ventasServer = data.ventas || [];
                console.log(`📥 ${this.ventasServer.length} ventas obtenidas del servidor`);
                localStorage.setItem('cache_dashboard', JSON.stringify(this.ventasServer));
                return this.ventasServer;
            } else {
                console.warn(`⚠️ Error del servidor: ${response.status}`);
                return this.usarCacheServidor();
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo ventas del servidor:', error.message);
            return this.usarCacheServidor();
        }
    }

    /**
     * Usa la cache del servidor si falla la conexión
     */
    usarCacheServidor() {
        try {
            const cache = localStorage.getItem('cache_dashboard');
            if (cache) {
                this.ventasServer = JSON.parse(cache);
                console.log(`📦 Usando cache: ${this.ventasServer.length} ventas`);
                return this.ventasServer;
            }
        } catch (e) {
            console.error('Error leyendo cache:', e);
        }
        this.ventasServer = [];
        return this.ventasServer;
    }

    /**
     * Envía ventas al servidor
     */
    async enviarVentasAlServidor(ventas) {
        if (!ventas || ventas.length === 0) {
            console.log('📭 No hay ventas nuevas para enviar');
            return;
        }

        if (typeof CONFIG === 'undefined' || !CONFIG.DATABASE || !CONFIG.DATABASE.URL_GIST) {
            console.warn('⚠️ CONFIG.DATABASE.URL_GIST no definido, marcando como sincronizadas localmente');
            ventas.forEach(v => v.sincronizado = true);
            this.guardarVentasLocales();
            return;
        }

        try {
            console.log(`📤 Enviando ${ventas.length} ventas al servidor...`);
            const todasLasVentas = [...this.ventasServer, ...ventas];

            const response = await fetch(CONFIG.DATABASE.URL_GIST, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ventas: todasLasVentas,
                    ultimaActualizacion: new Date().toISOString(),
                    totalVentas: todasLasVentas.length
                })
            });

            if (response.ok) {
                this.ventasServer = todasLasVentas;
                ventas.forEach(v => v.sincronizado = true);
                this.guardarVentasLocales();
                console.log(`✅ ${ventas.length} ventas enviadas al servidor`);
            } else {
                console.warn(`⚠️ Error al enviar ventas: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error enviando ventas al servidor:', error);
        }
    }

    /**
     * Obtiene ventas que no han sido sincronizadas
     */
    obtenerVentasSinSincronizar() {
        return this.ventasLocales.filter(v => !v.sincronizado);
    }

    /**
     * Sincroniza las ventas locales con el servidor central
     */
    async sincronizarConservador() {
        if (this.sincronizando) {
            console.log('⏳ Sincronización en curso, omitiendo...');
            return;
        }

        this.sincronizando = true;

        try {
            await this.obtenerVentasDelServidor();
            const ventasParaSincronizar = this.obtenerVentasSinSincronizar();

            if (ventasParaSincronizar.length > 0) {
                await this.enviarVentasAlServidor(ventasParaSincronizar);
            }

            this.ultimaSincronizacion = new Date();
            localStorage.setItem('ultimo_sincronismo', this.ultimaSincronizacion.toISOString());

            window.dispatchEvent(new CustomEvent('sincronizacionCompleta', {
                detail: {
                    ventasLocales: this.ventasLocales.length,
                    ventasServer: this.ventasServer.length,
                    timestamp: this.ultimaSincronizacion
                }
            }));

            console.log('✅ Sincronización completada', {
                locales: this.ventasLocales.length,
                servidor: this.ventasServer.length
            });
        } catch (error) {
            console.error('❌ Error durante sincronización:', error);
        } finally {
            this.sincronizando = false;
        }
    }

    /**
     * Normaliza el identificador de cliente para conteo consistente
     * entre variantes de escritura del mismo nombre (espacios, mayúsculas, acentos).
     */
    normalizarClienteId(cliente) {
        if (!cliente) return 'anonimo';
        return cliente
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // quita acentos
            .replace(/\s+/g, ' ');
    }

    /**
     * Registra una nueva venta
     */
    registrarVenta(venta) {
        if (!venta) {
            console.error('❌ Venta inválida');
            return null;
        }

        const clienteId = this.normalizarClienteId(venta.cliente || venta.vendedorNombre);

        const nuevaVenta = {
            ...venta,
            id: Date.now(),
            clienteId: clienteId,
            fechaRegistro: new Date().toISOString(),
            sincronizado: false
        };

        this.ventasLocales.push(nuevaVenta);
        this.guardarVentasLocales();

        console.log(`📝 Nueva venta registrada: $${nuevaVenta.monto || 0}`);

        // Actualizar contador de fidelización del cliente
        this.actualizarContadorCliente(clienteId);

        window.dispatchEvent(new CustomEvent('ventaRegistrada', { detail: nuevaVenta }));

        setTimeout(() => {
            this.sincronizarConservador();
        }, 500);

        return nuevaVenta;
    }

    /**
     * Obtiene todas las ventas (locales + servidor)
     */
    obtenerTodasLasVentas() {
        const todas = [...this.ventasServer];

        this.ventasLocales.forEach(v => {
            if (!v.sincronizado) {
                todas.push(v);
            }
        });

        return todas.sort((a, b) =>
            new Date(b.fechaRegistro) - new Date(a.fechaRegistro)
        );
    }

    /**
     * Obtiene ventas de hoy
     */
    obtenerVentasDeHoy() {
        const hoy = new Date();
        const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

        return this.obtenerTodasLasVentas().filter(v => {
            const fecha = new Date(v.fechaRegistro);
            return fecha >= inicioDia;
        });
    }

    /**
     * Obtiene estadísticas completas
     */
    obtenerEstadisticas() {
        const ventas = this.obtenerTodasLasVentas();
        const ventasHoy = this.obtenerVentasDeHoy();

        const totalVentas = ventas.length;
        const ingresoTotal = ventas.reduce((sum, v) => sum + (v.monto || 0), 0);
        const ingresoHoy = ventasHoy.reduce((sum, v) => sum + (v.monto || 0), 0);

        const metaDiaria = (typeof CONFIG !== 'undefined' && CONFIG.METAS)
            ? CONFIG.METAS.DIARIA
            : 10000;

        return {
            totalVentas: totalVentas,
            ingresoTotal: ingresoTotal,
            ventasHoy: ventasHoy.length,
            ingresoHoy: ingresoHoy,
            porcentajeMeta: Math.min((ingresoHoy / metaDiaria) * 100, 100),
            ventaPromedio: totalVentas > 0 ? ingresoTotal / totalVentas : 0,
            ultimaSincronizacion: this.ultimaSincronizacion,
            sincronizado: this.ventasLocales.filter(v => v.sincronizado).length,
            pendiente: this.ventasLocales.filter(v => !v.sincronizado).length
        };
    }

    /**
     * Sincronizar con servidor (método público)
     */
    sincronizarConServidor() {
        return this.sincronizarConservador();
    }

    /**
     * Limpia todas las ventas (uso admin)
     */
    limpiarVentas() {
        if (confirm('⚠️ ¿Seguro que quieres eliminar TODAS las ventas?')) {
            this.ventasLocales = [];
            this.ventasServer = [];
            this.guardarVentasLocales();
            localStorage.removeItem('cache_dashboard');
            console.log('🗑️ Todas las ventas eliminadas');
            window.dispatchEvent(new CustomEvent('ventaRegistrada'));
        }
    }

    // ==========================================
    // FIDELIZACIÓN: CONTADOR DE TRANSACCIONES + NFT (umbral 12)
    // ==========================================

    /**
     * Carga los estados de NFT por cliente desde localStorage
     */
    cargarEstadosNFT() {
        try {
            const key = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE && CONFIG.STORAGE.NFT_CLIENTES_KEY)
                ? CONFIG.STORAGE.NFT_CLIENTES_KEY
                : 'nft_clientes_estado';

            const data = localStorage.getItem(key);
            this.estadosNFT = data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('❌ Error cargando estados NFT:', error);
            this.estadosNFT = {};
        }
    }

    /**
     * Guarda los estados de NFT por cliente en localStorage
     */
    guardarEstadosNFT() {
        try {
            const key = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE && CONFIG.STORAGE.NFT_CLIENTES_KEY)
                ? CONFIG.STORAGE.NFT_CLIENTES_KEY
                : 'nft_clientes_estado';

            localStorage.setItem(key, JSON.stringify(this.estadosNFT));
        } catch (error) {
            console.error('❌ Error guardando estados NFT:', error);
        }
    }

    /**
     * Cuenta cuántas transacciones tiene un cliente (por clienteId normalizado)
     */
    contarTransaccionesCliente(clienteId) {
        return this.obtenerTodasLasVentas().filter(v => v.clienteId === clienteId).length;
    }

    /**
     * Actualiza el contador de un cliente tras registrar una venta
     */
    actualizarContadorCliente(clienteId) {
        if (!this.estadosNFT[clienteId]) {
            this.estadosNFT[clienteId] = {
                transacciones: 0,
                emitido: false,
                canjeado: false,
                fechaEmision: null,
                fechaCanje: null
            };
        }
        this.estadosNFT[clienteId].transacciones = this.contarTransaccionesCliente(clienteId);
        this.guardarEstadosNFT();
    }

    /**
     * Obtiene el estado de fidelización/NFT de un cliente.
     * Devuelve: { transacciones, emitido, canjeado, puedeEmitirNFT, fechaEmision, fechaCanje }
     */
    obtenerEstadoClienteNFT(cliente) {
        const clienteId = this.normalizarClienteId(cliente);
        const transacciones = this.contarTransaccionesCliente(clienteId);

        if (!this.estadosNFT[clienteId]) {
            this.estadosNFT[clienteId] = {
                transacciones: transacciones,
                emitido: false,
                canjeado: false,
                fechaEmision: null,
                fechaCanje: null
            };
            this.guardarEstadosNFT();
        } else {
            this.estadosNFT[clienteId].transacciones = transacciones;
        }

        const estado = this.estadosNFT[clienteId];

        return {
            clienteId: clienteId,
            transacciones: estado.transacciones,
            emitido: estado.emitido,
            canjeado: estado.canjeado,
            puedeEmitirNFT: estado.transacciones >= 12 && !estado.emitido,
            fechaEmision: estado.fechaEmision,
            fechaCanje: estado.fechaCanje
        };
    }

    /**
     * Emite el NFT para un cliente, si ya alcanzó el umbral de 12 transacciones
     * y aún no se le había emitido uno.
     */
    emitirNFTCliente(cliente) {
        const clienteId = this.normalizarClienteId(cliente);
        const estado = this.obtenerEstadoClienteNFT(cliente);

        if (!estado.puedeEmitirNFT) {
            console.warn(`⚠️ Cliente "${cliente}" no es elegible para NFT todavía (${estado.transacciones}/12)`);
            return false;
        }

        this.estadosNFT[clienteId].emitido = true;
        this.estadosNFT[clienteId].fechaEmision = new Date().toISOString();
        this.guardarEstadosNFT();

        console.log(`🎁 NFT emitido para cliente "${cliente}" (transacción ${estado.transacciones})`);
        window.dispatchEvent(new CustomEvent('nftEmitido', { detail: { cliente, clienteId } }));

        return true;
    }

    /**
     * Marca el NFT de un cliente como canjeado (uso del beneficio en tienda).
     */
    marcarNFTCanjeado(cliente) {
        const clienteId = this.normalizarClienteId(cliente);
        const estado = this.estadosNFT[clienteId];

        if (!estado || !estado.emitido) {
            console.warn(`⚠️ Cliente "${cliente}" no tiene un NFT emitido para canjear`);
            return false;
        }

        if (estado.canjeado) {
            console.warn(`⚠️ El NFT de "${cliente}" ya fue canjeado anteriormente`);
            return false;
        }

        estado.canjeado = true;
        estado.fechaCanje = new Date().toISOString();
        this.guardarEstadosNFT();

        console.log(`✅ NFT canjeado para cliente "${cliente}"`);
        window.dispatchEvent(new CustomEvent('nftCanjeado', { detail: { cliente, clienteId } }));

        return true;
    }
}

// ==========================================
// INICIALIZACIÓN DE LA INSTANCIA GLOBAL
// ==========================================

let bd = null;

/**
 * Inicializa la base de datos centralizada
 */
function inicializarBaseDatos() {
    if (bd) {
        console.log('ℹ️ Base de datos ya inicializada');
        return bd;
    }

    try {
        bd = new BaseDatosCentralizada();
        console.log('🗄️ Base de datos centralizada inicializada');
        return bd;
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        return null;
    }
}

// Auto-inicializar si CONFIG existe
if (typeof CONFIG !== 'undefined') {
    inicializarBaseDatos();
} else {
    console.warn('⚠️ CONFIG no definido, esperando...');

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof CONFIG !== 'undefined' && !bd) {
            inicializarBaseDatos();
        }
    });

    setTimeout(() => {
        if (typeof CONFIG !== 'undefined' && !bd) {
            inicializarBaseDatos();
        }
    }, 2000);
}

// Exponer para uso global
window.bd = bd;

console.log('📦 Módulo base-datos-centralizada.js cargado');

