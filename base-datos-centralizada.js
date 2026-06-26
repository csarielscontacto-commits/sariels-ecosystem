/**
 * SISTEMA DE BASE DE DATOS CENTRALIZADA
 * 
 * Maneja toda la sincronización de ventas en tiempo real
 * desde todos los vendedores hacia un servidor central
 * 
 * VERSIÓN CORREGIDA - SIN ERRORES DE SINTAXIS
 */

class BaseDatosCentralizada {
    constructor() {
        this.ventasLocales = [];
        this.ventasServer = [];
        this.sincronizando = false;
        this.ultimaSincronizacion = null;
        this.inicializado = false;
        this.errores = [];
        
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
            // Verificar si CONFIG existe
            if (typeof CONFIG === 'undefined' || !CONFIG.DATABASE || !CONFIG.DATABASE.URL_GIST) {
                console.warn('⚠️ CONFIG.DATABASE.URL_GIST no definido, usando datos locales');
                return this.ventasServer;
            }

            console.log('🌐 Obteniendo ventas del servidor...');
            
            const response = await fetch(CONFIG.DATABASE.URL_GIST, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.ventasServer = data.ventas || [];
                console.log(`📥 ${this.ventasServer.length} ventas obtenidas del servidor`);
                
                // Guardar en cache
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
        
        // Verificar si CONFIG existe
        if (typeof CONFIG === 'undefined' || !CONFIG.DATABASE || !CONFIG.DATABASE.URL_GIST) {
            console.warn('⚠️ CONFIG.DATABASE.URL_GIST no definido, marcando como sincronizadas localmente');
            ventas.forEach(v => v.sincronizado = true);
            this.guardarVentasLocales();
            return;
        }
        
        try {
            console.log(`📤 Enviando ${ventas.length} ventas al servidor...`);
            
            // Combinar ventas existentes con las nuevas
            const todasLasVentas = [...this.ventasServer, ...ventas];
            
            const response = await fetch(CONFIG.DATABASE.URL_GIST, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ventas: todasLasVentas,
                    ultimaActualizacion: new Date().toISOString(),
                    totalVentas: todasLasVentas.length
                })
            });
            
            if (response.ok) {
                this.ventasServer = todasLasVentas;
                // Marcar ventas como sincronizadas
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
            localStorage.setItem('ultimo_sincronismo', this.ultimaSincronizacion.toISOString());
            
            // 5. Disparar evento de sincronización completada
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
     * Registra una nueva venta
     */
    registrarVenta(venta) {
        if (!venta) {
            console.error('❌ Venta inválida');
            return null;
        }
        
        const nuevaVenta = {
            ...venta,
            id: Date.now(),
            fechaRegistro: new Date().toISOString(),
            sincronizado: false
        };
        
        this.ventasLocales.push(nuevaVenta);
        this.guardarVentasLocales();
        
        console.log(`📝 Nueva venta registrada: $${nuevaVenta.monto || 0}`);
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('ventaRegistrada', {
            detail: nuevaVenta
        }));
        
        // Intentar sincronizar inmediatamente
        setTimeout(() => {
            this.sincronizarConservador();
        }, 500);
        
        return nuevaVenta;
    }

    /**
     * Obtiene todas las ventas (locales + servidor)
     */
    obtenerTodasLasVentas() {
        // Combinar ventas locales y del servidor
        const todas = [...this.ventasServer];
        
        // Agregar ventas locales que no estén en el servidor
        this.ventasLocales.forEach(v => {
            if (!v.sincronizado) {
                todas.push(v);
            }
        });
        
        // Ordenar por fecha (más reciente primero)
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
    
    // Esperar a que CONFIG esté disponible
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof CONFIG !== 'undefined' && !bd) {
            inicializarBaseDatos();
        }
    });
    
    // Intentar después de 2 segundos por si acaso
    setTimeout(() => {
        if (typeof CONFIG !== 'undefined' && !bd) {
            inicializarBaseDatos();
        }
    }, 2000);
}

// Exponer para uso global
window.bd = bd;

console.log('📦 Módulo base-datos-centralizada.js cargado');
