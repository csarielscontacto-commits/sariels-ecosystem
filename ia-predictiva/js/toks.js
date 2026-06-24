(function (global) {
    function renderizarDashboardToks() {
        const modelo = new global.ModeloToks();
        const resumen = modelo.obtenerResumen();
        const leaderboard = modelo.obtenerLeaderboard(6);
        const movimientos = modelo.obtenerMovimientosRecientes(8);

        document.getElementById('toksEmitidos').textContent = global.SarielIA.formatearNumero(resumen.emitidos);
        document.getElementById('toksCanjeados').textContent = global.SarielIA.formatearNumero(resumen.canjeados);
        document.getElementById('toksCirculacion').textContent = global.SarielIA.formatearNumero(resumen.circulacion);
        document.getElementById('clientesNFT').textContent = global.SarielIA.formatearNumero(resumen.clientesConNFT);
        document.getElementById('prediccionToks').textContent = modelo.generarInsightEjecutivo();
        document.getElementById('variacion7d').textContent = `${resumen.prediccion.circulacion7d >= 0 ? '+' : ''}${global.SarielIA.formatearNumero(resumen.prediccion.circulacion7d)} TOKs en 7 días`;

        document.getElementById('tablaToks').innerHTML = leaderboard.map((cliente) => `
            <tr>
                <td>${cliente.nombre}</td>
                <td>${global.SarielIA.formatearNumero(cliente.toks)}</td>
                <td>${cliente.nftActual}</td>
                <td>${cliente.siguienteNivel}</td>
                <td>
                    <div class="progress-bar"><div class="progress-fill" style="width:${cliente.porcentaje}%"></div></div>
                </td>
            </tr>
        `).join('');

        document.getElementById('movimientosToks').innerHTML = movimientos.map((movimiento) => `
            <li>
                <div class="split-stat">
                    <strong>${movimiento.cliente}</strong>
                    <span class="status-pill ${movimiento.cantidad >= 0 ? 'positive' : 'alert'}">${movimiento.cantidad >= 0 ? '+' : ''}${movimiento.cantidad} TOKs</span>
                </div>
                <p class="helper">${movimiento.motivo} · saldo ${global.SarielIA.formatearNumero(movimiento.saldo)} · ${movimiento.fecha}</p>
            </li>
        `).join('');

        document.getElementById('proyeccionNFT').innerHTML = `
            <div class="mini-card"><span class="muted">Emisión estimada</span><strong>${global.SarielIA.formatearNumero(resumen.prediccion.emision7d)} TOKs</strong></div>
            <div class="mini-card"><span class="muted">Canje estimado</span><strong>${global.SarielIA.formatearNumero(resumen.prediccion.canje7d)} TOKs</strong></div>
            <div class="mini-card"><span class="muted">Próximo líder</span><strong>${resumen.líder ? resumen.líder.nombre : 'Sin datos'}</strong></div>
        `;
    }

    global.inicializarDashboardToks = function () {
        return global.SarielIA.programarActualizacion(renderizarDashboardToks);
    };
}(typeof window !== 'undefined' ? window : globalThis));
