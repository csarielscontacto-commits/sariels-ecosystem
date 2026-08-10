// ================================================================
// 🚚 DELIVERY - SERVICIOS CSARIEL'S
// ================================================================
// Scripts para la gestión de entregas a domicilio
// Hecho en Puebla, México 🇲🇽
// Versión: 1.0.0
// ================================================================

// ================================================================
// 📦 CONFIGURACIÓN
// ================================================================

const DELIVERY_CONFIG = {
    ESTADOS: ['pendiente', 'en_camino', 'entregado', 'cancelado'],
    METODOS_PAGO: ['efectivo', 'transferencia', 'cmt'],
    TIEMPO_ESTIMADO: 45, // minutos
};

// ================================================================
// 🚚 CREAR PEDIDO
// ================================================================

async function crearPedido(datos) {
    const {
        cliente,
        telefono,
        direccion,
        descripcion,
        metodo_pago,
        userId
    } = datos;

    if (!cliente || !telefono || !direccion || !descripcion) {
        throw new Error('Completa todos los campos obligatorios');
    }

    try {
        // Geocodificar dirección
        const coords = await geocodificar(direccion);

        const { data, error } = await supabase
            .from('delivery_pedidos')
            .insert({
                cliente: cliente,
                telefono: telefono,
                direccion: direccion,
                lat: coords.lat || 19.0413,
                lng: coords.lng || -98.2062,
                descripcion: descripcion,
                metodo_pago: metodo_pago || 'efectivo',
                usuario_id: userId || 'anonimo',
                estado: 'pendiente',
                created_at: new Date().toISOString()
            })
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('❌ Error creando pedido:', error);
        throw error;
    }
}

// ================================================================
// 📋 OBTENER PEDIDOS
// ================================================================

async function obtenerPedidos(filtro = {}) {
    try {
        let query = supabase
            .from('delivery_pedidos')
            .select('*')
            .order('created_at', { ascending: false });

        if (filtro.usuario_id) {
            query = query.eq('usuario_id', filtro.usuario_id);
        }
        if (filtro.estado) {
            query = query.eq('estado', filtro.estado);
        }
        if (filtro.limite) {
            query = query.limit(filtro.limite);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Error obteniendo pedidos:', error);
        return [];
    }
}

// ================================================================
://w
// ================================================================

async function actualizarEstadoPedido(pedidoId, estado) {
    if (!DELIVERY_CONFIG.ESTADOS.includes(estado)) {
        throw new Error(`Estado inválido. Estados permitidos: ${DELIVERY_CONFIG.ESTADOS.join(', ')}`);
    }

    try {
        const { data, error } = await supabase
            .from('delivery_pedidos')
            .update({
                estado: estado,
                updated_at: new Date().toISOString()
            })
            .eq('id', pedidoId)
            .select();

        if (error) throw error;

        // Si se entrega, registrar fecha de entrega
        if (estado === 'entregado') {
            await supabase
                .from('delivery_pedidos')
                .update({ fecha_entrega: new Date().toISOString() })
                .eq('id', pedidoId);
        }

        return data[0];
    } catch (error) {
        console.error('❌ Error actualizando pedido:', error);
        throw error;
    }
}

// ================================================================
// 🗺️ OBTENER PEDIDOS CERCANOS
// ================================================================

async function obtenerPedidosCercanos(lat, lng, radioKm = 5) {
    try {
        // Calcular bounding box aproximada
        const grados = radioKm / 111;
        const minLat = lat - grados;
        const maxLat = lat + grados;
        const minLng = lng - grados;
        const maxLng = lng + grados;

        const { data, error } = await supabase
            .from('delivery_pedidos')
            .select('*')
            .gte('lat', minLat)
            .lte('lat', maxLat)
            .gte('lng', minLng)
            .lte('lng', maxLng)
            .eq('estado', 'pendiente')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Error obteniendo pedidos cercanos:', error);
        return [];
    }
}

// ================================================================
://w
// ================================================================

async function cancelarPedido(pedidoId, motivo = 'Cancelado por el usuario') {
    try {
        const { data, error } = await supabase
            .from('delivery_pedidos')
            .update({
                estado: 'cancelado',
                motivo_cancelacion: motivo,
                updated_at: new Date().toISOString()
            })
            .eq('id', pedidoId)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('❌ Error cancelando pedido:', error);
        throw error;
    }
}

// ================================================================
://w
// ================================================================

async function obtenerEstadisticasDelivery(usuarioId = null) {
    try {
        let query = supabase.from('delivery_pedidos').select('*');

        if (usuarioId) {
            query = query.eq('usuario_id', usuarioId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const total = data.length;
        const pendientes = data.filter(p => p.estado === 'pendiente').length;
        const enCamino = data.filter(p => p.estado === 'en_camino').length;
        const entregados = data.filter(p => p.estado === 'entregado').length;
        const cancelados = data.filter(p => p.estado === 'cancelado').length;

        return {
            total,
            pendientes,
            enCamino,
            entregados,
            cancelados,
            tasa_exito: total > 0 ? ((entregados / total) * 100).toFixed(1) : 0
        };
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        return null;
    }
}

// ================================================================
// 🗺️ GEOCODIFICAR (compartido con comerciantes)
// ================================================================

async function geocodificar(direccion) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&countrycodes=mx&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (error) {
        console.warn('⚠️ Error en geocodificación:', error);
    }
    return { lat: 19.0413, lng: -98.2062 };
}

// ================================================================
// 🚀 EXPORTAR
// ================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DELIVERY_CONFIG,
        crearPedido,
        obtenerPedidos,
        actualizarEstadoPedido,
        obtenerPedidosCercanos,
        cancelarPedido,
        obtenerEstadisticasDelivery,
        geocodificar
    };
}

console.log('🚚 Delivery.js cargado correctamente');