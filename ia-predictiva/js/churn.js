(function (global) {
    function renderizarDashboardChurn() {
        const modelo = new global.ModeloChurn();
        const resumen = modelo.obtenerResumenRiesgo();
        const segmentos = modelo.obtenerSegmentos();
        const riesgo = modelo.obtenerClientesEnRiesgo(5);

        document.getElementById('retencionGlobal').textContent = `${resumen.tasaRetencion}%`;
        document.getElementById('clientesBajo').textContent = global.SarielIA.formatearNumero(resumen.bajos);
        document.getElementById('clientesMedio').textContent = global.SarielIA.formatearNumero(resumen.medios);
        document.getElementById('clientesAlto').textContent = global.SarielIA.formatearNumero(resumen.altos);
        document.getElementById('scorePromedio').textContent = `${resumen.promedioScore}/100`;
        document.getElementById('insightChurn').textContent = modelo.generarInsightEjecutivo();

        document.getElementById('listaRiesgo').innerHTML = riesgo.map((cliente) => `
            <li>
                <div class="split-stat">
                    <strong>${cliente.nombre}</strong>
                    <span class="status-pill ${global.SarielIA.claseRiesgo(cliente.riesgo)}">${global.SarielIA.tituloRiesgo(cliente.riesgo)}</span>
                </div>
                <p class="helper">${cliente.accion}</p>
                <div class="progress-row">
                    <div class="progress-meta"><span>Prob. retención</span><strong>${cliente.probabilidadRetencion}%</strong></div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${cliente.probabilidadRetencion}%"></div></div>
                </div>
            </li>
        `).join('');

        document.getElementById('tablaChurn').innerHTML = segmentos.map((cliente) => `
            <tr>
                <td>${cliente.nombre}</td>
                <td>${cliente.ultimaVenta}</td>
                <td>${cliente.frecuencia30}</td>
                <td>${global.SarielIA.formatearMoneda(cliente.gasto)}</td>
                <td><span class="status-pill ${global.SarielIA.claseRiesgo(cliente.riesgo)}">${global.SarielIA.tituloRiesgo(cliente.riesgo)}</span></td>
                <td>${cliente.accion}</td>
            </tr>
        `).join('');

        document.getElementById('accionesChurn').innerHTML = modelo.obtenerAccionesSugeridas().map((item) => `<li>${item}</li>`).join('');
    }

    global.inicializarDashboardChurn = function () {
        return global.SarielIA.programarActualizacion(renderizarDashboardChurn);
    };
}(typeof window !== 'undefined' ? window : globalThis));
