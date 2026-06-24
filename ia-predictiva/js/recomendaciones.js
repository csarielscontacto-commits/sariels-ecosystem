(function (global) {
    function renderizarDashboardRecomendaciones() {
        const modelo = new global.ModeloRecomendacion();
        const resumen = modelo.obtenerResumen();
        const combos = modelo.obtenerTopCombinaciones(6);
        const clientes = modelo.obtenerRecomendacionesPorCliente(6);

        document.getElementById('comboGanador').textContent = resumen.comboGanador;
        document.getElementById('afinidadMedia').textContent = `${resumen.afinidad}%`;
        document.getElementById('confianzaMedia').textContent = `${resumen.confianzaPromedio}%`;
        document.getElementById('campanasActivas').textContent = global.SarielIA.formatearNumero(resumen.campanasActivas);
        document.getElementById('insightRecomendaciones').textContent = modelo.generarInsightEjecutivo();

        document.getElementById('listaCombos').innerHTML = combos.map((combo) => `
            <li>
                <div class="split-stat">
                    <strong>${combo.producto} + ${combo.relacionado}</strong>
                    <span class="status-pill positive">${combo.afinidad}%</span>
                </div>
                <p class="helper">${combo.apariciones} compras conjuntas detectadas en la base simulada.</p>
            </li>
        `).join('');

        document.getElementById('tablaRecomendaciones').innerHTML = clientes.map((cliente) => `
            <tr>
                <td>${cliente.cliente}</td>
                <td>${cliente.favorita}</td>
                <td>${cliente.recomendacion}</td>
                <td>${cliente.campana}</td>
                <td>${cliente.ventanaRecompra} días</td>
                <td><span class="status-pill ${cliente.confianza >= 80 ? 'positive' : 'neutral'}">${cliente.confianza}%</span></td>
            </tr>
        `).join('');

        document.getElementById('listaCampanas').innerHTML = clientes.slice(0, 4).map((cliente) => `<li>Enviar a ${cliente.cliente} la campaña <strong>${cliente.campana}</strong> con foco en ${cliente.recomendacion}.</li>`).join('');
    }

    global.inicializarDashboardRecomendaciones = function () {
        return global.SarielIA.programarActualizacion(renderizarDashboardRecomendaciones);
    };
}(typeof window !== 'undefined' ? window : globalThis));
