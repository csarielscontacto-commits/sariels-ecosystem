(function (global) {
    const STORAGE_KEY = 'mensajes_ia';
    const VENTAS_KEY = 'ventas_centralizadas';
    const CHURN_KEY = 'resultado_churn';
    const PREDICCION_KEY = 'resultado_prediccion';
    const LIMITE_MENSAJES = 100;

    function leerJSON(clave, fallback) {
        try {
            const valor = global.localStorage.getItem(clave);
            return valor ? JSON.parse(valor) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function guardarJSON(clave, valor) {
        global.localStorage.setItem(clave, JSON.stringify(valor));
    }

    function crearMensaje(tipo, texto, meta = {}) {
        return {
            id: `${tipo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            tipo,
            texto,
            fecha: new Date().toISOString(),
            ...meta
        };
    }

    function obtenerMensajes() {
        return leerJSON(STORAGE_KEY, []);
    }

    function guardarMensajes(mensajes) {
        const normalizados = mensajes
            .filter(Boolean)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, LIMITE_MENSAJES);

        guardarJSON(STORAGE_KEY, normalizados);
        global.dispatchEvent(new CustomEvent('nuevoMensajeIA', { detail: normalizados[0] || null }));
    }

    function agregarMensaje(tipo, texto, meta = {}) {
        const mensajes = obtenerMensajes();
        const mensaje = crearMensaje(tipo, texto, meta);
        mensajes.unshift(mensaje);
        guardarMensajes(mensajes);
        return mensaje;
    }

    function calcularResultadosIA() {
        const modeloChurn = typeof global.ModeloChurn === 'function' ? new global.ModeloChurn() : null;
        const modeloVentas = typeof global.ModeloPredictivoVentas === 'function' ? new global.ModeloPredictivoVentas() : null;

        const churnData = modeloChurn
            ? modeloChurn.obtenerSegmentos().map((cliente) => ({ ...cliente, riesgo: cliente.score }))
            : [];

        const ventasEsperadas = modeloVentas
            ? modeloVentas.obtenerSerieSemanal(7).reduce((total, dia) => total + dia.ingreso, 0)
            : 0;

        const resultados = {
            churn: { updatedAt: new Date().toISOString(), data: churnData },
            prediccion: { updatedAt: new Date().toISOString(), data: { ventasEsperadas } }
        };

        guardarJSON(CHURN_KEY, resultados.churn);
        guardarJSON(PREDICCION_KEY, resultados.prediccion);
        global.dispatchEvent(new CustomEvent('iaActualizada', { detail: resultados }));
        return resultados;
    }

    function cargarResultadosIA() {
        const churn = leerJSON(CHURN_KEY, null);
        const prediccion = leerJSON(PREDICCION_KEY, null);

        if (churn && prediccion) {
            return { churn, prediccion };
        }

        return calcularResultadosIA();
    }

    function generarMensajePorNuevaVenta(ventasActuales, ventasPrevias) {
        if (ventasActuales.length <= ventasPrevias.length) {
            return;
        }

        const ultimaVenta = ventasActuales
            .slice()
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];

        if (!ultimaVenta) {
            return;
        }

        agregarMensaje(
            'VENTA',
            `Nueva venta registrada por ${ultimaVenta.cliente || 'cliente'} por ${ultimaVenta.monto || 0}.`,
            { ventaId: ultimaVenta.id || null }
        );

        const resultados = calcularResultadosIA();
        const clientesEnRiesgo = resultados.churn.data.filter(cliente => Number(cliente.riesgo) >= 70);

        if (clientesEnRiesgo.length > 0) {
            agregarMensaje(
                'CHURN',
                `${clientesEnRiesgo.length} clientes están en riesgo alto. Activa una campaña de retención.`
            );
        }

        if ((resultados.prediccion.data.ventasEsperadas || 0) > 0) {
            agregarMensaje(
                'PROMO',
                `Ventas estimadas en 7 días: ${resultados.prediccion.data.ventasEsperadas}. Revisa inventario y promociones.`
            );
        }
    }

    function inicializarMensajeriaIA() {
        cargarResultadosIA();

        let ventasCache = leerJSON(VENTAS_KEY, []);

        global.addEventListener('storage', (event) => {
            if (event.key !== VENTAS_KEY) {
                return;
            }

            const ventasActuales = leerJSON(VENTAS_KEY, []);
            generarMensajePorNuevaVenta(ventasActuales, ventasCache);
            ventasCache = ventasActuales;
        });
    }

    document.addEventListener('DOMContentLoaded', inicializarMensajeriaIA);

    global.MensajesIA = {
        STORAGE_KEY,
        obtenerMensajes,
        agregarMensaje,
        cargarResultadosIA,
        calcularResultadosIA
    };

    global.cargarResultadosIA = cargarResultadosIA;
})(typeof window !== 'undefined' ? window : globalThis);
