/**
 * SISTEMA CENTRALIZADO: CONEXIÓN AUTOMÁTICA A SUPABASE
 */
class BaseDatosCentralizada {
    constructor() {
        this.supabaseUrl = 'https://nvyyxgkladjauolvpzfp.supabase.co';
        // PEGA AQUÍ ABAJO TU CLAVE API (ANON PUBLIC) - CÓPIALA DE SETTINGS > API
        this.supabaseKey = 'AQUI_VA_TU_CLAVE_ANON_PUBLIC'; 
        this.ventasLocales = [];
        this.inicializar();
    }

    inicializar() {
        this.cargarVentasLocales();
        console.log('✅ Sistema conectado a la nube en: ' + this.supabaseUrl);
    }

    cargarVentasLocales() {
        const data = localStorage.getItem('ventas_centralizadas');
        this.ventasLocales = data ? JSON.parse(data) : [];
    }

    async registrarVenta(venta) {
        const nuevaVenta = {
            vendedorNombre: venta.vendedorNombre || 'vendedor',
            cliente: venta.cliente || 'anonimo',
            cantidad: parseInt(venta.cantidad) || 0,
            monto: parseInt(venta.monto) || 0,
            fechaRegistro: new Date().toISOString()
        };

        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/ventas`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(nuevaVenta)
            });

            if (response.ok) {
                console.log('🚀 ¡Éxito! Venta enviada a la base de datos.');
            } else {
                const errorData = await response.text();
                console.error('❌ Error al guardar en Supabase:', errorData);
            }
        } catch (e) {
            console.error('❌ Error de conexión:', e);
        }

        // Guardar localmente y disparar evento para el Dashboard
        this.ventasLocales.push(nuevaVenta);
        localStorage.setItem('ventas_centralizadas', JSON.stringify(this.ventasLocales));
        window.dispatchEvent(new CustomEvent('ventaRegistrada', { detail: nuevaVenta }));
    }
}

window.bd = new BaseDatosCentralizada();

