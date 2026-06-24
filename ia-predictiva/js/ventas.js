(function (global) {
    function renderizarBarras(contenedorId, datos, campo, formateador, clase = 'positive') {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;
        const maximo = Math.max(...datos.map((item) => item[campo]), 1);
        contenedor.innerHTML = datos.map((item) => {
            const porcentaje = Math.max(8, Math.round((item[campo] / maximo) * 100));
            return `
                <div class="progress-row">
                    <div class="progress-meta">
                        <span>${item.fecha}</span>
                        <strong>${formateador(item[campo])}</strong>
                    </div>
                    <div class="progress-bar"><div class="progress-fill ${clase}" style="width:${porcentaje}%"></div></div>
                </div>
            `;
        }).join('');
    }

    function renderizarDashboardVentas() {
        const modelo = new global.ModeloPredictivoVentas();
        const resumen = modelo.obtenerResumenGeneral();
        const serie = modelo.obtenerSerieSemanal(7);
        const productos = modelo.obtenerDesempenoProductos().slice(0, 5);
        const ultimasVentas = modelo.obtenerUltimasVentas(8);
        const proyeccion = resumen.proyeccion;

        document.getElementById('ventasSemana').textContent = global.SarielIA.formatearMoneda(serie.reduce((total, dia) => total + dia.ingreso, 0));
        document.getElementById('ticketPromedio').textContent = global.SarielIA.formatearMoneda(resumen.ticketPromedio);
        document.getElementById('productoEstrella').textContent = resumen.productoEstrella.nombre;
        document.getElementById('proyeccionMensual').textContent = global.SarielIA.formatearMoneda(proyeccion.monto);
        document.getElementById('crecimientoSemanal').textContent = `${resumen.crecimiento >= 0 ? '+' : ''}${resumen.crecimiento}% vs. semana previa`;
        document.getElementById('confianzaProyeccion').textContent = `${proyeccion.confianza}% de confianza predictiva`;
        document.getElementById('insightVentas').textContent = modelo.generarInsightEjecutivo();

        renderizarBarras('serieVentas', serie, 'ingreso', global.SarielIA.formatearMoneda);

        document.getElementById('tablaProductos').innerHTML = productos.map((producto) => `
            <tr>
                <td><strong>${producto.nombre}</strong></td>
                <td>${global.SarielIA.formatearNumero(producto.unidades)}</td>
                <td>${global.SarielIA.formatearNumero(producto.ventas)}</td>
                <td><span class="status-pill ${producto.tendencia === 'Escalar promoción' ? 'neutral' : 'positive'}">${producto.tendencia}</span></td>
            </tr>
        `).join('');

        document.getElementById('tablaVentas').innerHTML = ultimasVentas.map((venta) => `
            <tr>
                <td>${venta.cliente}</td>
                <td>${venta.productos}</td>
                <td>${global.SarielIA.formatearMoneda(venta.monto)}</td>
                <td>${venta.canal}</td>
                <td>${venta.fecha}</td>
            </tr>
        `).join('');
    }

    global.inicializarDashboardVentas = function () {
        return global.SarielIA.programarActualizacion(renderizarDashboardVentas);
    };
}(typeof window !== 'undefined' ? window : globalThis));
