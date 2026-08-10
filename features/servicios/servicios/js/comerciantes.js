// ================================================================
// 🏪 COMERCIANTES - SERVICIOS CSARIEL'S
// ================================================================
// Scripts para la gestión de comerciantes en la sección Servicios
// Hecho en Puebla, México 🇲🇽
// Versión: 1.0.0
// ================================================================

// ================================================================
// 📦 CONFIGURACIÓN
// ================================================================

const COMERCIANTES_CONFIG = {
    COSTO_MENSUAL: 100,
    DIAS_ACTIVACION: 30,
    METODOS_PAGO: ['transferencia', 'stripe', 'oxxo'],
    CATEGORIAS: [
        'mecanico', 'llantera', 'plomero', 'electricista',
        'albañil', 'tecnico', 'limpieza', 'transporte',
        'comida', 'otros'
    ]
};

// ================================================================
// 🏪 REGISTRAR COMERCIANTE
// ================================================================

async function registrarComerciante(datos) {
    const {
        nombre,
        categoria,
        descripcion,
        direccion,
        telefono,
        email,
        userId
    } = datos;

    if (!nombre || !descripcion || !direccion || !telefono || !email) {
        throw new Error('Completa todos los campos obligatorios');
    }

    try {
        // Geocodificar dirección
        const coords = await geocodificar(direccion);

        // Registrar en Supabase
        const { data, error } = await supabase
            .from('servicios')
            .insert({
                nombre: nombre,
                categoria: categoria,
                descripcion: descripcion,
                telefono: telefono,
                email: email,
                lat: coords.lat || 19.0413,
                lng: coords.lng || -98.2062,
                comerciante_id: userId,
                verificado: false,
                activo: false,
                created_at: new Date().toISOString()
            })
            .select();

        if (error) throw error;

        // Registrar pago pendiente
        const { error: pagoError } = await supabase
            .from('pagos_comerciantes')
            .insert({
                comerciante_id: userId,
                servicio_id: data[0].id,
                monto: COMERCIANTES_CONFIG.COSTO_MENSUAL,
                metodo_pago: 'pendiente',
                status: 'pendiente',
                concepto: `Registro comerciante - ${nombre}`
            });

        if (pagoError) throw pagoError;

        return data[0];
    } catch (error) {
        console.error('❌ Error registrando comerciante:', error);
        throw error;
    }
}

// ================================================================
// 🗺️ GEOCODIFICAR DIRECCIÓN
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
// 📋 OBTENER SERVICIOS DE COMERCIANTE
// ================================================================

async function obtenerServiciosComerciante(userId) {
    try {
        const { data, error } = await supabase
            .from('servicios')
            .select('*')
            .eq('comerciante_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Error obteniendo servicios:', error);
        return [];
    }
}

// ================================================================
://w
// ================================================================

async function actualizarEstadoServicio(servicioId, activo) {
    try {
        const { data, error } = await supabase
            .from('servicios')
            .update({ activo: activo })
            .eq('id', servicioId)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('❌ Error actualizando servicio:', error);
        throw error;
    }
}

// ================================================================
// 🗑️ ELIMINAR SERVICIO
// ================================================================

async function eliminarServicio(servicioId) {
    try {
        const { error } = await supabase
            .from('servicios')
            .delete()
            .eq('id', servicioId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('❌ Error eliminando servicio:', error);
        throw error;
    }
}

// ================================================================
// 💳 OBTENER PAGOS DE COMERCIANTE
// ================================================================

async function obtenerPagosComerciante(userId) {
    try {
        const { data, error } = await supabase
            .from('pagos_comerciantes')
            .select('*')
            .eq('comerciante_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Error obteniendo pagos:', error);
        return [];
    }
}

// ================================================================
// 🏦 VERIFICAR PAGO (para admin)
// ================================================================

async function verificarPago(pagoId, status = 'pagado') {
    try {
        const { data, error } = await supabase
            .from('pagos_comerciantes')
            .update({
                status: status,
                fecha_pago: new Date().toISOString(),
                fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', pagoId)
            .select();

        if (error) throw error;

        // Si el pago está pagado, activar el servicio
        if (status === 'pagado') {
            const pago = data[0];
            await supabase
                .from('servicios')
                .update({ activo: true })
                .eq('id', pago.servicio_id);
        }

        return data[0];
    } catch (error) {
        console.error('❌ Error verificando pago:', error);
        throw error;
    }
}

// ================================================================
// 📊 OBTENER ESTADÍSTICAS DE COMERCIANTE
// ================================================================

async function obtenerEstadisticasComerciante(userId) {
    try {
        const servicios = await obtenerServiciosComerciante(userId);
        const pagos = await obtenerPagosComerciante(userId);

        const totalPagado = pagos
            .filter(p => p.status === 'pagado')
            .reduce((sum, p) => sum + (p.monto || 0), 0);

        const activos = servicios.filter(s => s.activo).length;

        return {
            total_servicios: servicios.length,
            servicios_activos: activos,
            servicios_inactivos: servicios.length - activos,
            total_pagado: totalPagado,
            pagos: pagos.length,
            ultimo_pago: pagos[0]?.created_at || null
        };
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        return null;
    }
}

// ================================================================
// 🚀 EXPORTAR (si se usa como módulo)
// ================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COMERCIANTES_CONFIG,
        registrarComerciante,
        geocodificar,
        obtenerServiciosComerciante,
        actualizarEstadoServicio,
        eliminarServicio,
        obtenerPagosComerciante,
        verificarPago,
        obtenerEstadisticasComerciante
    };
}

console.log('🏪 Comerciantes.js cargado correctamente');