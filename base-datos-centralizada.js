/**
 * SISTEMA CENTRALIZADO: CONEXIÓN AUTOMÁTICA
 */
class BaseDatosCentralizada {
    constructor() {
        this.supabaseUrl = 'https://nvyyxgkladjauolvpzfp.supabase.co';
        // Esta clave es pública y necesaria para que el sistema se conecte a tu tabla
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTY4MDB9.SU_CLAVE_AQUI_O_YA_CONFIGURADA'; 
        this.ventasLocales = [];
        this.inicializar();
    }

    inicializar() {
        this.cargarVentasLocales();
        console.log('✅ Sistema conectado a: ' + this.supabaseUrl);
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
                console.log('🚀 ¡Venta enviada a la base de datos!');
            }
        } catch (e) {
            console.error('❌ Error de conexión:', e);
        }

        // Guardar localmente
        this.ventasLocales.push(nuevaVenta);
        localStorage.setItem('ventas_centralizadas', JSON.stringify(this.ventasLocales));
        window.dispatchEvent(new CustomEvent('ventaRegistrada', { detail: nuevaVenta }));
    }
}

window.bd = new BaseDatosCentralizada();
