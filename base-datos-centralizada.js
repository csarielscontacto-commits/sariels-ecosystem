/**
 * SISTEMA DE BASE DE DATOS CENTRALIZADA
 * Versión Limpia y Robusta
 */

class BaseDatosCentralizada {
    constructor() {
        this.ventasLocales = [];
        this.ventasServer = [];
        this.sincronizando = false;
        this.ultimaSincronizacion = null;
        this.inicializar();
    }

    // 1. Motor de arranque
    inicializar() {
        this.iniciarSincronizacionAutomatica();
        window.addEventListener('storage', (e) => this.manejarCambios(e));
    }

    // 2. Ciclo de sincronización (cada 5 segundos)
    iniciarSincronizacionAutomatica() {
        setInterval(async () => {
            await this.sincronizarConServidor();
        }, CONFIG.DATABASE.SYNC_INTERVAL || 5000);
    }

    // 3. Lógica de sincronización protegida
    async sincronizarConServidor() {
        if (this.sincronizando) return;
        this.sincronizando = true;
        try {
            await this.obtenerVentasDelServidor();
            const pendientes = this.ventasLocales.filter(v => !v.sincronizado);
            if (pendientes.length > 0) {
                await this.enviarVentasAlServidor(pendientes);
            }
        } catch (error) {
            console.error("Error en sincronización:", error);
        } finally {
            this.sincronizando = false;
        }
    }

    // 4. Obtención de datos (con fallback a caché)
    async obtenerVentasDelServidor() {
        try {
            const respuesta = await fetch(CONFIG.DATABASE.URL, { cache: 'no-cache' });
            if (respuesta.ok) {
                const datos = await respuesta.json();
                this.ventasServer = datos.ventas || [];
                localStorage.setItem(CONFIG.STORAGE.CACHE_KEY, JSON.stringify(this.ventasServer));
            }
        } catch (e) {
            const cache = localStorage.getItem(CONFIG.STORAGE.CACHE_KEY);
            this.ventasServer = cache ? JSON.parse(cache) : [];
        }
    }

    // 5. Registro de ventas
    registrarVenta(venta) {
        const ventaCompleta = {
            ...venta,
            id: venta.id || `v_${Date.now()}`,
            sincronizado: false,
            fecha: new Date().toISOString()
        };
        this.ventasLocales.push(ventaCompleta);
        localStorage.setItem(CONFIG.STORAGE.VENTAS_KEY, JSON.stringify(this.ventasLocales));
        return ventaCompleta;
    }

    // 6. Estadísticas simplificadas
    obtenerEstadisticas() {
        const todas = [...this.ventasServer, ...this.ventasLocales];
        const ingresoTotal = todas.reduce((sum, v) => sum + v.monto, 0);
        return {
            totalVentas: todas.length,
            ingresoTotal: ingresoTotal
        };
    }

    manejarCambios(e) {
        if (e.key === CONFIG.STORAGE.VENTAS_KEY) {
            this.ventasLocales = JSON.parse(e.newValue) || [];
        }
    }
}

// Instancia global
const bd = new BaseDatosCentralizada();
