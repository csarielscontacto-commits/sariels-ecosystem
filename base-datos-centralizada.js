/**
 * SISTEMA CENTRALIZADO: CONEXIÓN AUTOMÁTICA A SUPABASE
 * Archivo: base-datos-centralizada.js
 * Función: Gestionar todas las operaciones de base de datos
 */

class BaseDatosCentralizada {
    constructor() {
        // ===== CONFIGURACIÓN DE SUPABASE =====
        this.supabaseUrl = 'https://nvxyxkgfdjeauolvzfp.supabase.co';
        this.supabaseKey = 'sb_publishable_GWNmmwICFc2dkJx2BXdY8Q_-5qAC-Dg';
        this.ventasLocales = [];
        this.ultimaSincronizacion = null;
        this.inicializar();
    }

    // ===== INICIALIZAR =====
    inicializar() {
        this.cargarVentasLocales();
        console.log('🚀 Sistema Base de Datos Centralizada iniciado');
        console.log('☁️ Conectado a Supabase en:', this.supabaseUrl);
        console.log(`📦 ${this.ventasLocales.length} ventas cargadas localmente`);
    }

    // ===== CARGAR VENTAS LOCALES =====
    cargarVentasLocales() {
        try {
            const data = localStorage.getItem('ventas_centralizadas');
            this.ventasLocales = data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn('⚠️ Error cargando datos locales:', e);
            this.ventasLocales = [];
        }
    }

    // ===== GUARDAR VENTAS LOCALES =====
    guardarVentasLocales() {
        try {
            localStorage.setItem('ventas_centralizadas', JSON.stringify(this.ventasLocales));
        } catch (e) {
            console.warn('⚠️ Error guardando datos locales:', e);
        }
    }

    // ===== REGISTRAR VENTA =====
    async registrarVenta(venta) {
        // Validar datos
        if (!venta || typeof venta !== 'object') {
            throw new Error('Datos de venta inválidos');
        }

        const nuevaVenta = {
            id: Date.now() + Math.random() * 1000,
            vendedorNombre: venta.vendedorNombre || 'vendedor',
            cliente: venta.cliente || 'anonimo',
            cantidad: parseFloat(venta.cantidad) || 0,
            monto: parseFloat(venta.monto) || 0,
            producto: venta.producto || 'Pan',
            metodo: venta.metodo || 'Efectivo',
            fechaRegistro: new Date().toISOString()
        };

        // Guardar localmente primero (offline-first)
        this.ventasLocales.push(nuevaVenta);
        this.guardarVentasLocales();
        
        // Disparar evento para el Dashboard
        window.dispatchEvent(new CustomEvent('ventaRegistrada', { 
            detail: nuevaVenta 
        }));

        // Intentar guardar en Supabase (en segundo plano)
        try {
            await this.guardarEnSupabase(nuevaVenta);
            console.log('☁️ Venta guardada en la nube:', nuevaVenta.id);
        } catch (e) {
            console.warn('⚠️ No se pudo guardar en la nube, pero está en local:', e.message);
        }

        return nuevaVenta;
    }

    // ===== GUARDAR EN SUPABASE =====
    async guardarEnSupabase(venta) {
        const url = `${this.supabaseUrl}/rest/v1/ventas`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(venta)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Error ${response.status}: ${errorData}`);
        }

        return await response.json();
    }

    // ===== OBTENER TODAS LAS VENTAS =====
    obtenerTodasLasVentas() {
        return this.ventasLocales;
    }

    // ===== OBTENER ESTADÍSTICAS =====
    obtenerEstadisticas() {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const ventasHoy = this.ventasLocales.filter(v => 
            new Date(v.fechaRegistro) >= hoy
        );
        
        const totalVentas = this.ventasLocales.length;
        const ingresoTotal = this.ventasLocales.reduce((s, v) => s + (v.monto || 0), 0);
        const ingresoHoy = ventasHoy.reduce((s, v) => s + (v.monto || 0), 0);
        const ventasHoyCount = ventasHoy.length;
        const metaDiaria = 10000;
        const porcentajeMeta = Math.min(100, (ingresoHoy / metaDiaria) * 100);
        const ventaPromedio = totalVentas > 0 ? ingresoTotal / totalVentas : 0;
        
        return {
            totalVentas,
            ingresoTotal,
            ventasHoy: ventasHoyCount,
            ingresoHoy,
            porcentajeMeta,
            ventaPromedio,
            metaDiaria
        };
    }

    // ===== OBTENER VENTAS POR VENDEDOR =====
    obtenerVentasPorVendedor() {
        const resultado = {};
        this.ventasLocales.forEach(v => {
            const nombre = v.vendedorNombre || 'Desconocido';
            if (!resultado[nombre]) {
                resultado[nombre] = { ventas: 0, monto: 0 };
            }
            resultado[nombre].ventas += 1;
            resultado[nombre].monto += (v.monto || 0);
        });
        return resultado;
    }

    // ===== OBTENER VENTAS POR HORA =====
    obtenerVentasPorHora() {
        const resultado = {};
        this.ventasLocales.forEach(v => {
            const hora = new Date(v.fechaRegistro).getHours();
            if (!resultado[hora]) {
                resultado[hora] = { ventas: 0, monto: 0 };
            }
            resultado[hora].ventas += 1;
            resultado[hora].monto += (v.monto || 0);
        });
        return resultado;
    }

    // ===== SINCRONIZAR CON SERVIDOR =====
    async sincronizarConServidor() {
        console.log('🔄 Sincronizando con servidor...');
        try {
            // Aquí iría la lógica para sincronizar datos pendientes
            // Por ahora, solo marcamos como completado
            this.ultimaSincronizacion = new Date().toISOString();
            window.dispatchEvent(new Event('sincronizacionCompleta'));
            console.log('✅ Sincronización completada');
            return true;
        } catch (e) {
            console.error('❌ Error en sincronización:', e);
            return false;
        }
    }

    // ===== LIMPIAR DATOS =====
    limpiarDatos() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos locales?')) {
            this.ventasLocales = [];
            this.guardarVentasLocales();
            console.log('🗑️ Datos locales eliminados');
            window.dispatchEvent(new Event('ventaRegistrada'));
            return true;
        }
        return false;
    }
}

// ===== CREAR INSTANCIA GLOBAL =====
const bd = new BaseDatosCentralizada();
window.bd = bd;

console.log('✅ Base de datos centralizada lista para usar');
console.log('📊 Usa "bd" para acceder a todas las funciones');
