(function (global) {
    const storageFallback = {
        datos: {},
        getItem(clave) {
            return Object.prototype.hasOwnProperty.call(this.datos, clave) ? this.datos[clave] : null;
        },
        setItem(clave, valor) {
            this.datos[clave] = String(valor);
        }
    };

    const CLAVES = {
        ventas: 'ventas_centralizadas',
        clientes: 'clientes_fidelizacion',
        nfts: 'nfts_emitidos',
        detalles: 'ia_predictiva_detalles',
        meta: 'ia_predictiva_meta'
    };

    const INTERVALO_ACTUALIZACION = 300000;
    const almacenamiento = obtenerStorage();
    const configuracion = global.CONFIG || {};
    const simboloMoneda = configuracion.SIMBOLO_MONEDA || '$';
    const moneda = configuracion.MONEDA || 'MXN';
    const toksPorVenta = configuracion.TOKENS?.TOKS_POR_VENTA || 10;
    const toksBienvenida = configuracion.TOKENS?.TOKS_POR_REGISTRO || 50;

    const CATALOGO = [
        { nombre: 'Cookie Clásica', categoria: 'tradicional', prioridad: 0.94, precioReferencia: 75 },
        { nombre: 'Sevillanos de Piñón', categoria: 'premium', prioridad: 0.88, precioReferencia: 105 },
        { nombre: 'Domo Galleta', categoria: 'experiencia', prioridad: 0.82, precioReferencia: 95 },
        { nombre: 'Caja Mix Sariel', categoria: 'regalo', prioridad: 0.74, precioReferencia: 180 },
        { nombre: 'Trío de Mini Cookies', categoria: 'impulso', prioridad: 0.69, precioReferencia: 60 }
    ];

    const CLIENTES_SEMILLA = [
        ['Ana Torres', '5510010001'],
        ['Luis Herrera', '5510010002'],
        ['Mariana Solís', '5510010003'],
        ['Diego Paredes', '5510010004'],
        ['Fernanda Cruz', '5510010005'],
        ['Carlos Mena', '5510010006'],
        ['Sofía Ramírez', '5510010007'],
        ['Valeria Campos', '5510010008']
    ];

    const METODOS = ['Efectivo', 'Tarjeta', 'Transferencia'];
    const NIVELES_NFT = [
        { nivel: 'bronce', nombre: 'Bronce', minimo: configuracion.TOKENS?.NFT_BRONCE_MIN || 100, descuento: configuracion.TOKENS?.DESCUENTO_BRONCE || 5 },
        { nivel: 'plata', nombre: 'Plata', minimo: configuracion.TOKENS?.NFT_PLATA_MIN || 300, descuento: configuracion.TOKENS?.DESCUENTO_PLATA || 10 },
        { nivel: 'oro', nombre: 'Oro', minimo: configuracion.TOKENS?.NFT_ORO_MIN || 600, descuento: configuracion.TOKENS?.DESCUENTO_ORO || 15 },
        { nivel: 'diamante', nombre: 'Diamante', minimo: configuracion.TOKENS?.NFT_DIAMANTE_MIN || 1000, descuento: configuracion.TOKENS?.DESCUENTO_DIAMANTE || 20 }
    ];

    function obtenerStorage() {
        try {
            if (global.localStorage) {
                return global.localStorage;
            }
        } catch (error) {
            return storageFallback;
        }
        return storageFallback;
    }

    function leerJSON(clave, predeterminado) {
        try {
            const valor = almacenamiento.getItem(clave);
            return valor ? JSON.parse(valor) : predeterminado;
        } catch (error) {
            return predeterminado;
        }
    }

    function guardarJSON(clave, valor) {
        almacenamiento.setItem(clave, JSON.stringify(valor));
    }

    function numeroSeguro(valor, fallback = 0) {
        const numero = Number(valor);
        return Number.isFinite(numero) ? numero : fallback;
    }

    function formatearMoneda(valor) {
        return `${simboloMoneda}${numeroSeguro(valor).toLocaleString('es-MX', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })} ${moneda}`;
    }

    function formatearNumero(valor) {
        return numeroSeguro(valor).toLocaleString('es-MX');
    }

    function formatearFecha(valor, incluirHora = false) {
        const fecha = valor ? new Date(valor) : new Date();
        return fecha.toLocaleString('es-MX', incluirHora ? {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        } : {
            day: '2-digit',
            month: 'short'
        });
    }

    function diasDesde(valor) {
        if (!valor) return 999;
        const delta = Date.now() - new Date(valor).getTime();
        return Math.max(0, Math.floor(delta / 86400000));
    }

    function claveDia(valor) {
        const fecha = new Date(valor);
        return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    }

    function tituloRiesgo(riesgo) {
        return riesgo === 'alto' ? 'Alto' : riesgo === 'medio' ? 'Medio' : 'Bajo';
    }

    function claseRiesgo(riesgo) {
        return riesgo === 'alto' ? 'alert' : riesgo === 'medio' ? 'neutral' : 'positive';
    }

    function obtenerNivelNFTPorToks(toks) {
        return NIVELES_NFT.filter((nivel) => toks >= nivel.minimo).slice(-1)[0] || null;
    }

    function crearClientesSemilla() {
        return CLIENTES_SEMILLA.map(([nombre, telefono], indice) => ({
            id: `cliente_semilla_${indice + 1}`,
            nombre,
            telefono,
            fechaRegistro: new Date(Date.now() - (indice + 12) * 86400000).toISOString(),
            toks: 0,
            historialToks: [],
            nfts: [],
            nftActual: null
        }));
    }

    function crearVentasSemilla(clientes) {
        const ventas = [];
        for (let dia = 35; dia >= 1; dia -= 1) {
            const volumen = dia % 5 === 0 ? 3 : 2;
            for (let turno = 0; turno < volumen; turno += 1) {
                const clientesActivos = dia <= 7
                    ? clientes.slice(0, 4)
                    : dia <= 16
                        ? clientes.slice(0, 5)
                        : dia <= 24
                            ? clientes.slice(0, 6)
                            : clientes;
                const cliente = clientesActivos[(dia + turno) % clientesActivos.length];
                const productoBase = CATALOGO[(dia + turno) % CATALOGO.length];
                const complemento = CATALOGO[(dia + turno + 2) % CATALOGO.length];
                const cantidad = productoBase.nombre === 'Caja Mix Sariel' ? 2 : ((dia + turno) % 3) + 1;
                const monto = cantidad * (configuracion.PRECIO_UNITARIO || 75) + (productoBase.nombre === 'Sevillanos de Piñón' ? 30 : 0);
                const fecha = new Date(Date.now() - dia * 86400000 + turno * 7200000);
                ventas.push({
                    id: `venta_semilla_${dia}_${turno}`,
                    vendedorId: `vendedor_${((dia + turno) % 4) + 1}`,
                    vendedorNombre: `Vendedor ${((dia + turno) % 4) + 1}`,
                    cantidad,
                    cliente: cliente.nombre,
                    metodo: METODOS[(dia + turno) % METODOS.length],
                    monto,
                    timestamp: fecha.getTime(),
                    sincronizado: true,
                    fechaRegistro: fecha.toISOString(),
                    clienteFidelizacionId: cliente.id,
                    items: [
                        { nombre: productoBase.nombre, cantidad: Math.max(1, cantidad - 1) },
                        { nombre: complemento.nombre, cantidad: 1 }
                    ]
                });
            }
        }
        return ventas;
    }

    function enriquecerVenta(venta, detallePersistido, indice) {
        const productoPrincipal = CATALOGO[(indice + Math.max(1, numeroSeguro(venta.cantidad))) % CATALOGO.length];
        const detalleBase = detallePersistido || {};
        const items = Array.isArray(venta.items) && venta.items.length > 0 ? venta.items : (Array.isArray(detalleBase.items) && detalleBase.items.length > 0 ? detalleBase.items : [
            { nombre: productoPrincipal.nombre, cantidad: Math.max(1, numeroSeguro(venta.cantidad, 1)) },
            { nombre: CATALOGO[(indice + 1) % CATALOGO.length].nombre, cantidad: numeroSeguro(venta.cantidad, 1) > 1 ? 1 : 0 }
        ].filter((item) => item.cantidad > 0));

        const factorRecurrencia = (indice % 4) + 1;
        return {
            ...venta,
            fechaRegistro: venta.fechaRegistro || new Date(venta.timestamp || Date.now()).toISOString(),
            timestamp: venta.timestamp || new Date(venta.fechaRegistro || Date.now()).getTime(),
            cantidad: numeroSeguro(venta.cantidad, 1),
            monto: numeroSeguro(venta.monto, numeroSeguro(venta.cantidad, 1) * (configuracion.PRECIO_UNITARIO || 75)),
            items,
            canal: detalleBase.canal || (factorRecurrencia > 2 ? 'online' : 'boutique'),
            recurrenciaEsperada: 7 + factorRecurrencia * 3,
            confianzaIA: detalleBase.confianzaIA || 72 + (indice % 22)
        };
    }

    function asegurarDatosBase() {
        let ventas = leerJSON(CLAVES.ventas, []);
        let clientes = leerJSON(CLAVES.clientes, []);
        let nfts = leerJSON(CLAVES.nfts, []);
        let detalles = leerJSON(CLAVES.detalles, {});
        let huboCambios = false;

        if (!Array.isArray(clientes) || clientes.length === 0) {
            clientes = crearClientesSemilla();
            huboCambios = true;
        }

        if (!Array.isArray(ventas) || ventas.length === 0) {
            ventas = crearVentasSemilla(clientes);
            huboCambios = true;
        }

        const ventasEnriquecidas = ventas.map((venta, indice) => {
            const enriquecida = enriquecerVenta(venta, detalles[venta.id], indice);
            if (!detalles[venta.id]) {
                detalles[venta.id] = {
                    items: enriquecida.items,
                    canal: enriquecida.canal,
                    confianzaIA: enriquecida.confianzaIA
                };
                huboCambios = true;
            }
            return enriquecida;
        });

        if (!Array.isArray(nfts) || nfts.length === 0) {
            clientes = clientes.map((cliente, indice) => {
                const ventasCliente = ventasEnriquecidas.filter((venta) => venta.clienteFidelizacionId === cliente.id || venta.cliente === cliente.nombre);
                const toksCompra = ventasCliente.reduce((total, venta) => total + Math.max(toksPorVenta, Math.round(venta.monto / Math.max(1, configuracion.PRECIO_UNITARIO || 75)) * toksPorVenta), 0);
                const toks = cliente.toks || toksBienvenida + toksCompra;
                const historial = Array.isArray(cliente.historialToks) && cliente.historialToks.length > 0 ? cliente.historialToks : [
                    { fecha: cliente.fechaRegistro, cantidad: toksBienvenida, motivo: 'bienvenida', saldo: toksBienvenida },
                    { fecha: ventasCliente[0]?.fechaRegistro || new Date().toISOString(), cantidad: toksCompra, motivo: 'compras', saldo: toks }
                ];
                const nivel = obtenerNivelNFTPorToks(toks);
                const nft = nivel ? {
                    id: `nft_${cliente.id}_${nivel.nivel}`,
                    clienteId: cliente.id,
                    clienteNombre: cliente.nombre,
                    nivel: nivel.nivel,
                    nombre: nivel.nombre,
                    descuento: nivel.descuento,
                    fechaEmision: ventasCliente[0]?.fechaRegistro || cliente.fechaRegistro,
                    toksAlEmitir: toks
                } : null;
                if (nft) {
                    nfts.push(nft);
                }
                return {
                    ...cliente,
                    toks,
                    historialToks: historial,
                    nfts: nft ? [nft] : [],
                    nftActual: nft ? nft.nivel : null
                };
            });
            huboCambios = true;
        }

        const meta = leerJSON(CLAVES.meta, null) || {
            ultimaActualizacion: new Date().toISOString(),
            origen: 'localStorage',
            version: '1.0.0'
        };
        meta.ultimaActualizacion = new Date().toISOString();

        if (huboCambios) {
            guardarJSON(CLAVES.ventas, ventasEnriquecidas);
            guardarJSON(CLAVES.clientes, clientes);
            guardarJSON(CLAVES.nfts, nfts);
            guardarJSON(CLAVES.detalles, detalles);
        }
        guardarJSON(CLAVES.meta, meta);
    }

    function obtenerVentasEnriquecidas() {
        const ventas = leerJSON(CLAVES.ventas, []);
        const detalles = leerJSON(CLAVES.detalles, {});
        return ventas.map((venta, indice) => enriquecerVenta(venta, detalles[venta.id], indice)).sort((a, b) => b.timestamp - a.timestamp);
    }

    function programarActualizacion(callback) {
        callback();
        const intervalo = global.setInterval(callback, INTERVALO_ACTUALIZACION);
        const escuchador = () => callback();
        if (global.addEventListener) {
            global.addEventListener('storage', escuchador);
        }
        return () => {
            global.clearInterval(intervalo);
            if (global.removeEventListener) {
                global.removeEventListener('storage', escuchador);
            }
        };
    }

    class BaseModeloSariel {
        constructor() {
            asegurarDatosBase();
            this.refrescar();
        }

        // Punto de integración futuro: sustituir esta carga local por fetch a API propia, GitHub Gist o endpoint remoto.
        refrescar() {
            this.ventas = obtenerVentasEnriquecidas();
            this.clientes = leerJSON(CLAVES.clientes, []);
            this.nfts = leerJSON(CLAVES.nfts, []);
            this.meta = leerJSON(CLAVES.meta, {});
        }

        obtenerClientesActivos(dias = 30) {
            const limite = Date.now() - dias * 86400000;
            const ids = new Set(this.ventas.filter((venta) => venta.timestamp >= limite).map((venta) => venta.clienteFidelizacionId || venta.cliente));
            return ids.size;
        }

        obtenerMapaClientes() {
            return this.clientes.reduce((mapa, cliente) => {
                mapa[cliente.id] = cliente;
                mapa[cliente.nombre] = cliente;
                return mapa;
            }, {});
        }

        obtenerVentasPorCliente() {
            return this.ventas.reduce((mapa, venta) => {
                const clave = venta.clienteFidelizacionId || venta.cliente;
                if (!mapa[clave]) {
                    mapa[clave] = [];
                }
                mapa[clave].push(venta);
                return mapa;
            }, {});
        }
    }

    class ModeloPredictivoVentas extends BaseModeloSariel {
        obtenerResumenGeneral() {
            this.refrescar();
            const ingresoTotal = this.ventas.reduce((total, venta) => total + venta.monto, 0);
            const ventas7d = this.obtenerSerieSemanal(7);
            const semanaActual = ventas7d.reduce((total, dia) => total + dia.ingreso, 0);
            const semanaAnterior = this.obtenerSerieComparativa(7, 14).reduce((total, dia) => total + dia.ingreso, 0);
            const crecimiento = semanaAnterior > 0 ? Math.round(((semanaActual - semanaAnterior) / semanaAnterior) * 100) : 12;
            const productoEstrella = this.obtenerProductoEstrella();
            const proyeccion = this.obtenerProyeccionMensual();
            return {
                ingresoTotal,
                clientesActivos: this.obtenerClientesActivos(),
                ticketPromedio: this.ventas.length ? Math.round(ingresoTotal / this.ventas.length) : 0,
                crecimiento,
                productoEstrella,
                proyeccion
            };
        }

        obtenerSerieSemanal(dias = 7) {
            this.refrescar();
            return Array.from({ length: dias }).map((_, indice) => {
                const fecha = new Date();
                fecha.setDate(fecha.getDate() - (dias - indice - 1));
                const clave = claveDia(fecha);
                const ventasDia = this.ventas.filter((venta) => claveDia(venta.fechaRegistro) === clave);
                return {
                    fecha: formatearFecha(fecha),
                    clave,
                    ventas: ventasDia.length,
                    ingreso: ventasDia.reduce((total, venta) => total + venta.monto, 0)
                };
            });
        }

        obtenerSerieComparativa(inicioDias, finDias) {
            return Array.from({ length: finDias - inicioDias }).map((_, indice) => {
                const fecha = new Date();
                fecha.setDate(fecha.getDate() - (finDias - indice - 1));
                const clave = claveDia(fecha);
                const ventasDia = this.ventas.filter((venta) => claveDia(venta.fechaRegistro) === clave);
                return {
                    clave,
                    ingreso: ventasDia.reduce((total, venta) => total + venta.monto, 0)
                };
            });
        }

        obtenerProductoEstrella() {
            this.refrescar();
            const acumulado = {};
            this.ventas.forEach((venta) => {
                const totalItems = venta.items.reduce((suma, item) => suma + item.cantidad, 0) || 1;
                venta.items.forEach((item) => {
                    if (!acumulado[item.nombre]) {
                        acumulado[item.nombre] = { nombre: item.nombre, unidades: 0, ingreso: 0 };
                    }
                    acumulado[item.nombre].unidades += item.cantidad;
                    acumulado[item.nombre].ingreso += venta.monto * (item.cantidad / totalItems);
                });
            });
            return Object.values(acumulado).sort((a, b) => b.ingreso - a.ingreso)[0] || { nombre: 'Sin datos', unidades: 0, ingreso: 0 };
        }

        obtenerDesempenoProductos() {
            this.refrescar();
            const estrella = this.obtenerProductoEstrella().nombre;
            const acumulado = {};
            this.ventas.forEach((venta) => {
                venta.items.forEach((item) => {
                    if (!acumulado[item.nombre]) {
                        acumulado[item.nombre] = { nombre: item.nombre, unidades: 0, ventas: 0 };
                    }
                    acumulado[item.nombre].unidades += item.cantidad;
                    acumulado[item.nombre].ventas += 1;
                });
            });
            return Object.values(acumulado)
                .map((producto) => ({
                    ...producto,
                    tendencia: producto.nombre === estrella ? 'Demanda líder' : producto.ventas > 12 ? 'Rotación estable' : 'Escalar promoción'
                }))
                .sort((a, b) => b.unidades - a.unidades);
        }

        obtenerProyeccionMensual() {
            this.refrescar();
            const serie = this.obtenerSerieSemanal(14);
            const ultimos7 = serie.slice(-7).reduce((total, dia) => total + dia.ingreso, 0);
            const primeros7 = serie.slice(0, 7).reduce((total, dia) => total + dia.ingreso, 0);
            const tendencia = primeros7 > 0 ? Math.round(((ultimos7 - primeros7) / primeros7) * 100) : 9;
            const promedioDiario = ultimos7 / 7;
            return {
                monto: Math.round(promedioDiario * 30),
                tendencia,
                confianza: Math.max(74, 89 - Math.abs(tendencia))
            };
        }

        obtenerUltimasVentas(limite = 8) {
            this.refrescar();
            return this.ventas.slice(0, limite).map((venta) => ({
                cliente: venta.cliente,
                productos: venta.items.map((item) => `${item.nombre} x${item.cantidad}`).join(', '),
                monto: venta.monto,
                fecha: formatearFecha(venta.fechaRegistro, true),
                canal: venta.canal
            }));
        }

        generarInsightEjecutivo() {
            const resumen = this.obtenerResumenGeneral();
            return `Las ventas proyectadas del mes se ubican en ${formatearMoneda(resumen.proyeccion.monto)} y ${resumen.productoEstrella.nombre} sigue liderando la mezcla comercial.`;
        }
    }

    class ModeloChurn extends BaseModeloSariel {
        obtenerSegmentos() {
            this.refrescar();
            const ventasPorCliente = this.obtenerVentasPorCliente();
            return this.clientes.map((cliente) => {
                const clave = cliente.id || cliente.nombre;
                const ventasCliente = (ventasPorCliente[clave] || []).sort((a, b) => b.timestamp - a.timestamp);
                const ultimaVenta = ventasCliente[0];
                const recencia = diasDesde(ultimaVenta?.fechaRegistro || cliente.fechaRegistro);
                const frecuencia30 = ventasCliente.filter((venta) => diasDesde(venta.fechaRegistro) <= 30).length;
                const gasto = ventasCliente.reduce((total, venta) => total + venta.monto, 0);
                const score = Math.round(Math.min(100, recencia * 2.5 + Math.max(0, 18 - frecuencia30 * 6)));
                const riesgo = score >= 60 ? 'alto' : score >= 35 ? 'medio' : 'bajo';
                return {
                    id: cliente.id,
                    nombre: cliente.nombre,
                    recencia,
                    frecuencia30,
                    gasto,
                    riesgo,
                    score,
                    probabilidadRetencion: Math.max(12, 100 - score),
                    ultimaVenta: ultimaVenta ? formatearFecha(ultimaVenta.fechaRegistro, true) : 'Sin compras recientes',
                    accion: riesgo === 'alto' ? 'Cupón + contacto directo' : riesgo === 'medio' ? 'Recordatorio de temporada' : 'Upsell premium'
                };
            }).sort((a, b) => b.score - a.score);
        }

        obtenerResumenRiesgo() {
            const segmentos = this.obtenerSegmentos();
            const total = segmentos.length || 1;
            const altos = segmentos.filter((cliente) => cliente.riesgo === 'alto').length;
            const medios = segmentos.filter((cliente) => cliente.riesgo === 'medio').length;
            const bajos = segmentos.filter((cliente) => cliente.riesgo === 'bajo').length;
            return {
                altos,
                medios,
                bajos,
                tasaRetencion: Math.round((bajos / total) * 100),
                promedioScore: Math.round(segmentos.reduce((totalScore, cliente) => totalScore + cliente.score, 0) / total)
            };
        }

        obtenerClientesEnRiesgo(limite = 5) {
            return this.obtenerSegmentos().filter((cliente) => cliente.riesgo !== 'bajo').slice(0, limite);
        }

        obtenerAccionesSugeridas() {
            const riesgo = this.obtenerClientesEnRiesgo(4);
            return riesgo.map((cliente) => `${cliente.nombre}: ${cliente.accion} · recencia ${cliente.recencia} días.`);
        }

        generarInsightEjecutivo() {
            const resumen = this.obtenerResumenRiesgo();
            return `La retención estimada es de ${resumen.tasaRetencion}% y ${resumen.altos} clientes requieren intervención inmediata para evitar churn.`;
        }
    }

    class ModeloRecomendacion extends BaseModeloSariel {
        obtenerMatrizAfinidad() {
            this.refrescar();
            const matriz = {};
            this.ventas.forEach((venta) => {
                const productos = [...new Set(venta.items.map((item) => item.nombre))];
                productos.forEach((base) => {
                    if (!matriz[base]) {
                        matriz[base] = {};
                    }
                    productos.filter((item) => item !== base).forEach((relacionado) => {
                        matriz[base][relacionado] = (matriz[base][relacionado] || 0) + 1;
                    });
                });
            });
            return matriz;
        }

        obtenerTopCombinaciones(limite = 5) {
            const matriz = this.obtenerMatrizAfinidad();
            const combinaciones = [];
            Object.entries(matriz).forEach(([producto, relacionados]) => {
                Object.entries(relacionados).forEach(([relacionado, apariciones]) => {
                    combinaciones.push({
                        producto,
                        relacionado,
                        apariciones,
                        afinidad: Math.min(98, 55 + apariciones * 6)
                    });
                });
            });
            return combinaciones.sort((a, b) => b.apariciones - a.apariciones).slice(0, limite);
        }

        obtenerRecomendacionesPorCliente(limite = 6) {
            const ventasPorCliente = this.obtenerVentasPorCliente();
            const topCombos = this.obtenerTopCombinaciones(10);
            return this.clientes.map((cliente) => {
                const clave = cliente.id || cliente.nombre;
                const historial = (ventasPorCliente[clave] || []).flatMap((venta) => venta.items.map((item) => item.nombre));
                const favoritos = [...new Set(historial)].slice(0, 3);
                const candidato = topCombos.find((combo) => favoritos.includes(combo.producto) && !favoritos.includes(combo.relacionado)) || topCombos[0];
                const ventanaRecompra = 4 + (historial.length % 6);
                return {
                    cliente: cliente.nombre,
                    favorita: favoritos[0] || 'Cookie Clásica',
                    recomendacion: candidato?.relacionado || 'Sevillanos de Piñón',
                    confianza: candidato?.afinidad || 78,
                    campaña: historial.length > 5 ? 'Paquete premium' : 'Combo de descubrimiento',
                    ventanaRecompra
                };
            }).sort((a, b) => b.confianza - a.confianza).slice(0, limite);
        }

        obtenerResumen() {
            const top = this.obtenerTopCombinaciones(1)[0] || { producto: 'Cookie Clásica', relacionado: 'Domo Galleta', afinidad: 78 };
            const recomendaciones = this.obtenerRecomendacionesPorCliente();
            const confianzaPromedio = recomendaciones.length ? Math.round(recomendaciones.reduce((total, item) => total + item.confianza, 0) / recomendaciones.length) : 0;
            return {
                comboGanador: `${top.producto} + ${top.relacionado}`,
                afinidad: top.afinidad,
                confianzaPromedio,
                campañasActivas: recomendaciones.filter((item) => item.confianza >= 80).length
            };
        }

        generarInsightEjecutivo() {
            const resumen = this.obtenerResumen();
            return `El motor recomienda priorizar ${resumen.comboGanador} con ${resumen.afinidad}% de afinidad esperada para aumentar ticket promedio.`;
        }
    }

    class ModeloToks extends BaseModeloSariel {
        obtenerMovimientos() {
            this.refrescar();
            return this.clientes.flatMap((cliente) => (cliente.historialToks || []).map((movimiento) => ({
                cliente: cliente.nombre,
                fecha: movimiento.fecha,
                cantidad: numeroSeguro(movimiento.cantidad),
                motivo: movimiento.motivo,
                saldo: numeroSeguro(movimiento.saldo, cliente.toks)
            }))).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        }

        obtenerResumen() {
            const movimientos = this.obtenerMovimientos();
            const emitidos = movimientos.filter((movimiento) => movimiento.cantidad > 0).reduce((total, movimiento) => total + movimiento.cantidad, 0);
            const canjeados = Math.abs(movimientos.filter((movimiento) => movimiento.cantidad < 0).reduce((total, movimiento) => total + movimiento.cantidad, 0));
            const circulacion = emitidos - canjeados;
            const leaderboard = this.obtenerLeaderboard(3);
            const prediccion = this.obtenerPrediccion();
            return {
                emitidos,
                canjeados,
                circulacion,
                clientesConNFT: this.clientes.filter((cliente) => cliente.nftActual).length,
                líder: leaderboard[0] || null,
                prediccion
            };
        }

        obtenerLeaderboard(limite = 6) {
            return [...this.clientes].sort((a, b) => numeroSeguro(b.toks) - numeroSeguro(a.toks)).slice(0, limite).map((cliente) => {
                const siguiente = NIVELES_NFT.find((nivel) => numeroSeguro(cliente.toks) < nivel.minimo) || null;
                const porcentaje = siguiente ? Math.min(100, Math.round((numeroSeguro(cliente.toks) / siguiente.minimo) * 100)) : 100;
                return {
                    nombre: cliente.nombre,
                    toks: numeroSeguro(cliente.toks),
                    nftActual: cliente.nftActual ? cliente.nftActual.toUpperCase() : 'Sin NFT',
                    siguienteNivel: siguiente ? siguiente.nombre : 'Nivel máximo',
                    porcentaje
                };
            });
        }

        obtenerPrediccion() {
            const movimientos = this.obtenerMovimientos();
            const recientes = movimientos.filter((movimiento) => diasDesde(movimiento.fecha) <= 14);
            const emitidos = recientes.filter((movimiento) => movimiento.cantidad > 0).reduce((total, movimiento) => total + movimiento.cantidad, 0);
            const canjes = Math.abs(recientes.filter((movimiento) => movimiento.cantidad < 0).reduce((total, movimiento) => total + movimiento.cantidad, 0));
            const promedioDiarioEmitido = emitidos / 14;
            const promedioDiarioCanjeado = canjes / 14;
            return {
                emision7d: Math.round(promedioDiarioEmitido * 7),
                canje7d: Math.round(promedioDiarioCanjeado * 7),
                circulacion7d: Math.round((promedioDiarioEmitido - promedioDiarioCanjeado) * 7)
            };
        }

        obtenerMovimientosRecientes(limite = 8) {
            return this.obtenerMovimientos().slice(0, limite).map((movimiento) => ({
                cliente: movimiento.cliente,
                fecha: formatearFecha(movimiento.fecha, true),
                cantidad: movimiento.cantidad,
                motivo: movimiento.motivo,
                saldo: movimiento.saldo
            }));
        }

        generarInsightEjecutivo() {
            const resumen = this.obtenerResumen();
            return `Hay ${formatearNumero(resumen.circulacion)} TOKs en circulación y la próxima semana se prevé una variación neta de ${formatearNumero(resumen.prediccion.circulacion7d)} TOKs.`;
        }
    }

    global.SarielIA = {
        CLAVES,
        CATALOGO,
        INTERVALO_ACTUALIZACION,
        formatearMoneda,
        formatearNumero,
        formatearFecha,
        tituloRiesgo,
        claseRiesgo,
        programarActualizacion,
        asegurarDatosBase,
        leerJSON
    };
    global.ModeloPredictivoVentas = ModeloPredictivoVentas;
    global.ModeloChurn = ModeloChurn;
    global.ModeloRecomendacion = ModeloRecomendacion;
    global.ModeloToks = ModeloToks;
}(typeof window !== 'undefined' ? window : globalThis));
