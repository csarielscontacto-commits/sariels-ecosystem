let chartHoras = null;
let chartVendedores = null;
let appIniciada = false;
let intervaloDashboard = null;

function setSyncTxt(txt) {
  const el = document.getElementById('syncTxt');
  if (el) el.textContent = txt;
}

function iniciarApp() {
  if (appIniciada) return;
  appIniciada = true;

  setSyncTxt('⏳ Sincronizando…');

  // 1) Pintar de inmediato con datos locales para evitar pantalla "colgada"
  actualizarDashboardSegura();

  const inicio = Date.now();
  const esperaMax = 7000;

  const t = setInterval(async () => {
    const bdListo = (typeof window.bd !== 'undefined' && window.bd !== null);

    if (bdListo) {
      clearInterval(t);

      try {
        await window.bd.sincronizarConServidor();
      } catch (e) {
        console.warn('sincronizarConServidor error:', e);
      } finally {
        actualizarDashboardSegura();
        crearGraficasSeguras();

        if (!intervaloDashboard) {
          intervaloDashboard = setInterval(actualizarDashboardSegura, 5000);
        }
      }
      return;
    }

    if (Date.now() - inicio > esperaMax) {
      clearInterval(t);
      setSyncTxt('⚠️ Modo local (sin conexión remota)');
      actualizarDashboardSegura();
      crearGraficasSeguras();

      if (!intervaloDashboard) {
        intervaloDashboard = setInterval(actualizarDashboardSegura, 5000);
      }
    }
  }, 250);
}

function actualizarDashboardSegura() {
  try {
    actualizarDashboard();
  } catch (e) {
    console.error('actualizarDashboard error:', e);
    setSyncTxt('⚠️ Error UI');
    const sub = document.getElementById('d-syncSub');
    if (sub) sub.textContent = 'No se pudo renderizar el dashboard. Revisa conexión/configuración.';
  }
}

function crearGraficasSeguras() {
  let intentos = 0;
  const maxIntentos = 20;

  const tryCrear = () => {
    if (typeof window.Chart === 'undefined') {
      intentos += 1;
      if (intentos < maxIntentos) {
        return setTimeout(tryCrear, 250);
      }
      console.warn('Chart.js no cargó a tiempo');
      const sub = document.getElementById('d-syncSub');
      if (sub) sub.textContent = 'Datos cargados sin gráficas (Chart.js no disponible).';
      return;
    }

    try {
      if (!chartHoras || !chartVendedores) {
        crearGraficas();
      }
    } catch (e) {
      console.error('crearGraficas error:', e);
    }
  };

  tryCrear();
}

function actualizarDashboard() {
  const statsDefault = {
    totalVentas: 0,
    ingresoTotal: 0,
    ventasHoy: 0,
    ingresoHoy: 0,
    porcentajeMeta: 0,
    ventaPromedio: 0
  };

  let stats = statsDefault;
  let ventas = [];

  if (typeof window.bd !== 'undefined' && window.bd !== null) {
    try {
      stats = window.bd.obtenerEstadisticas() || statsDefault;
      ventas = window.bd.obtenerTodasLasVentas() || [];
    } catch (e) {
      console.warn('Error leyendo bd:', e);
    }
  } else {
    try {
      ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
      const totalVentas = ventas.length;
      const ingresoTotal = ventas.reduce((a, v) => a + (Number(v.monto) || 0), 0);

      const hoy = new Date();
      const esHoy = (iso) => {
        const d = new Date(iso);
        return (
          d.getFullYear() === hoy.getFullYear() &&
          d.getMonth() === hoy.getMonth() &&
          d.getDate() === hoy.getDate()
        );
      };

      const ventasHoyArr = ventas.filter((v) => esHoy(v.fechaRegistro));
      const ventasHoy = ventasHoyArr.length;
      const ingresoHoy = ventasHoyArr.reduce((a, v) => a + (Number(v.monto) || 0), 0);
      const meta = (window.CONFIG && window.CONFIG.METAS) ? window.CONFIG.METAS.DIARIA : 10000;

      stats = {
        totalVentas,
        ingresoTotal,
        ventasHoy,
        ingresoHoy,
        porcentajeMeta: meta > 0 ? (ingresoHoy / meta) * 100 : 0,
        ventaPromedio: totalVentas ? ingresoTotal / totalVentas : 0
      };
    } catch (_) {}
  }

  const metaDiaria = (window.CONFIG && window.CONFIG.METAS) ? window.CONFIG.METAS.DIARIA : 10000;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('d-ingresoHoy', '$' + Math.round(stats.ingresoHoy || 0).toLocaleString('es-MX'));
  setText('d-ventasHoy', String(stats.ventasHoy || 0));
  setText(
    'd-promedio',
    '$' + (stats.ventasHoy > 0
      ? Math.round((stats.ingresoHoy || 0) / stats.ventasHoy)
      : 0).toLocaleString('es-MX')
  );
  setText('d-meta', Math.round(stats.porcentajeMeta || 0) + '%');

  const barra = document.getElementById('d-barraFill');
  if (barra) barra.style.width = Math.min(stats.porcentajeMeta || 0, 100) + '%';

  setText('d-metaVal', Number(metaDiaria).toLocaleString('es-MX'));
  setText('d-falta', '$' + Math.max(0, metaDiaria - (stats.ingresoHoy || 0)).toLocaleString('es-MX') + ' falta');
  setText('d-totalVentas', String(stats.totalVentas || 0));
  setText('d-ingresoTotal', '$' + Math.round(stats.ingresoTotal || 0).toLocaleString('es-MX'));

  const ahora = new Date();
  setText('d-hora', ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));

  if (window.bd && window.bd.estaRemotoActivo && window.bd.estaRemotoActivo()) {
    setSyncTxt('✅ Sincronizado');
    setText('d-syncSub', 'Datos remotos conectados');
  } else {
    setSyncTxt('⚠️ Modo local');
    setText('d-syncSub', 'Mostrando datos locales (sin conexión remota)');
  }

  actualizarTabla((ventas || []).slice(0, 10));

  if (chartHoras) actualizarGraficaHoras(ventas || []);
  if (chartVendedores) actualizarGraficaVendedores(ventas || []);

  if (typeof window.actualizarFidelizacion === 'function') {
    try { window.actualizarFidelizacion(); } catch (_) {}
  }
}

function actualizarTabla(ventas) {
  const tbody = document.getElementById('tablaBody');
  if (!tbody) return;

  if (!ventas || ventas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="vacio">Sin ventas registradas todavía</td></tr>';
    return;
  }

  tbody.innerHTML = ventas.map(v => `
    <tr>
      <td>${new Date(v.fechaRegistro).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td>
      <td><span class="badge badge-v">${v.vendedorNombre || 'N/A'}</span></td>
      <td>${v.cliente || 'Anónimo'}</td>
      <td>${v.cantidad || 0}</td>
      <td><span class="badge badge-m">${v.metodo || 'N/A'}</span></td>
      <td><strong>$${Math.round(v.monto || 0).toLocaleString('es-MX')}</strong></td>
    </tr>
  `).join('');
}

function crearGraficas() {
  if (typeof Chart === 'undefined') return;

  const PALETA = {
    t: 'rgba(212,168,87,.75)', tL: 'rgba(212,168,87,1)',
    h: 'rgba(194,104,62,.75)', hL: 'rgba(194,104,62,1)',
    s: 'rgba(123,168,138,.75)', sL: 'rgba(123,168,138,1)',
    a: 'rgba(120,144,196,.75)', aL: 'rgba(120,144,196,1)',
    r: 'rgba(176,120,90,.75)', rL: 'rgba(176,120,90,1)'
  };

  const cH = document.getElementById('graficoHoras');
  const cV = document.getElementById('graficoVendedores');
  if (!cH || !cV) return;

  if (!chartHoras) {
    chartHoras = new Chart(cH.getContext('2d'), {
      type: 'bar',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
          label: 'Ingresos',
          data: Array(24).fill(0),
          backgroundColor: PALETA.t,
          borderColor: PALETA.tL,
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#a99c8c' }, grid: { color: 'rgba(255,255,255,.04)' } },
          x: { ticks: { color: '#a99c8c', maxTicksLimit: 12 }, grid: { display: false } }
        }
      }
    });
  }

  if (!chartVendedores) {
    chartVendedores = new Chart(cV.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [PALETA.t, PALETA.h, PALETA.s, PALETA.a, PALETA.r],
          borderColor: [PALETA.tL, PALETA.hL, PALETA.sL, PALETA.aL, PALETA.rL],
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { color: '#a99c8c' } } }
      }
    });
  }

  const ventas = (window.bd && window.bd.obtenerTodasLasVentas) ? window.bd.obtenerTodasLasVentas() : [];
  actualizarGraficaHoras(ventas);
  actualizarGraficaVendedores(ventas);
}

function actualizarGraficaHoras(ventas) {
  if (!chartHoras) return;
  const por = {};
  (ventas || []).forEach(v => {
    const h = new Date(v.fechaRegistro).getHours();
    por[h] = (por[h] || 0) + (Number(v.monto) || 0);
  });
  chartHoras.data.datasets[0].data = Array.from({ length: 24 }, (_, i) => por[i] || 0);
  chartHoras.update();
}

function actualizarGraficaVendedores(ventas) {
  if (!chartVendedores) return;
  const por = {};
  (ventas || []).forEach(v => {
    const n = v.vendedorNombre || 'Desconocido';
    por[n] = (por[n] || 0) + (Number(v.monto) || 0);
  });
  chartVendedores.data.labels = Object.keys(por);
  chartVendedores.data.datasets[0].data = Object.values(por);
  chartVendedores.update();
}

window.addEventListener('sincronizacionCompleta', actualizarDashboardSegura);
window.addEventListener('ventaRegistrada', actualizarDashboardSegura);
document.addEventListener('DOMContentLoaded', iniciarApp);
