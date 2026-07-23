// ================================================================
// REGISTRO DE VENTAS CENTRALIZADO - Sariel's Ecosystem
// ================================================================

(function () {
  "use strict";

  let vendedorActual = null;

  // =========================
  // Vendedor (local, simple)
  // =========================
  function obtenerOCrearVendedor() {
    let vendedorId = localStorage.getItem('vendedorActual');

    if (!vendedorId) {
      const vendedores = JSON.parse(localStorage.getItem('vendedores')) || [];
      const numeroVendedor = vendedores.length + 1;
      vendedorId = 'vendedor_' + numeroVendedor;
      vendedores.push({
        id: vendedorId,
        nombre: 'Vendedor ' + numeroVendedor,
        numero: numeroVendedor,
        fechaRegistro: new Date().toISOString()
      });
      localStorage.setItem('vendedores', JSON.stringify(vendedores));
      localStorage.setItem('vendedorActual', vendedorId);
    }

    const vendedores = JSON.parse(localStorage.getItem('vendedores')) || [];
    return vendedores.find(v => v.id === vendedorId);
  }

  // =========================
  // Cambiar vendedor (expuesto globalmente)
  // =========================
  window.cambiarVendedor = function () {
    localStorage.removeItem('vendedorActual');
    vendedorActual = obtenerOCrearVendedor();
    const badge = document.getElementById('vendedorBadge');
    if (badge) badge.textContent = vendedorActual.nombre;
    actualizarEstadisticasVendedor();
    renderHistorial();
  };

  // =========================
  // Estadísticas del vendedor
  // =========================
  function actualizarEstadisticasVendedor() {
    if (!vendedorActual) return;
    
    let todas = [];
    let deHoy = [];

    if (typeof window.obtenerTodasLasVentas === 'function') {
      todas = window.obtenerTodasLasVentas() || [];
    } else if (typeof window.bd?.obtenerTodasLasVentas === 'function') {
      todas = window.bd.obtenerTodasLasVentas() || [];
    } else {
      todas = JSON.parse(localStorage.getItem('ventas') || '[]');
    }

    if (typeof window.obtenerVentasDeHoy === 'function') {
      deHoy = window.obtenerVentasDeHoy() || [];
    } else if (typeof window.bd?.obtenerVentasDeHoy === 'function') {
      deHoy = window.bd.obtenerVentasDeHoy() || [];
    } else {
      const hoy = new Date().toDateString();
      deHoy = todas.filter(v => new Date(v.fecha || v.fechaRegistro).toDateString() === hoy);
    }

    const delVendedor = todas.filter(v => v.vendedorId === vendedorActual.id);
    const delVendedorHoy = deHoy.filter(v => v.vendedorId === vendedorActual.id);

    const ingresoHoy = delVendedorHoy.reduce((s, v) => s + (Number(v.monto) || 0), 0);
    const ingresoTotal = delVendedor.reduce((s, v) => s + (Number(v.monto) || 0), 0);

    const elVentasHoy = document.getElementById('ventasHoyVendedor');
    const elIngresoHoy = document.getElementById('ingresoHoyVendedor');
    const elTotalVentas = document.getElementById('totalVentasVendedor');
    const elTotalIngreso = document.getElementById('totalIngresoVendedor');

    if (elVentasHoy) elVentasHoy.textContent = delVendedorHoy.length;
    if (elIngresoHoy) elIngresoHoy.textContent = '$' + ingresoHoy.toLocaleString();
    if (elTotalVentas) elTotalVentas.textContent = delVendedor.length;
    if (elTotalIngreso) elTotalIngreso.textContent = '$' + ingresoTotal.toLocaleString();

    actualizarBadgeSync();
  }

  // =========================
  // Estado de sincronización
  // =========================
  function actualizarBadgeSync() {
    const dot = document.getElementById('syncDot');
    const text = document.getElementById('syncText');
    if (!dot || !text) return;

    let remotoActivo = false;
    if (typeof window.estaRemotoActivo === 'function') {
      remotoActivo = window.estaRemotoActivo();
    } else if (typeof window.bd?.estaRemotoActivo === 'function') {
      remotoActivo = window.bd.estaRemotoActivo();
    }

    if (remotoActivo) {
      dot.className = 'status-dot online';
      text.textContent = 'Sincronizado';
    } else {
      dot.className = 'status-dot offline';
      text.textContent = 'Modo local';
    }
  }

  // =========================
  // Precio total según cantidad
  // =========================
  function actualizarPrecioTotal() {
    const precioUnitario = (window.CONFIG && window.CONFIG.PRECIO_UNITARIO) || 75;
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const total = cantidad * precioUnitario;
    const elPrecioTotal = document.getElementById('precioTotal');
    if (elPrecioTotal) elPrecioTotal.value = `$${total.toLocaleString()} MXN`;
  }

  // =========================
  // Envío del formulario
  // =========================
  function manejarEnvio(e) {
    e.preventDefault();

    const precioUnitario = (window.CONFIG && window.CONFIG.PRECIO_UNITARIO) || 75;
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const cliente = document.getElementById('cliente').value.trim();
    const metodo = document.getElementById('metodo').value;
    const total = cantidad * precioUnitario;

    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'none';

    if (!metodo) {
      if (errorText) errorText.textContent = 'Selecciona un método de pago.';
      if (errorMsg) errorMsg.style.display = 'block';
      return;
    }

    const venta = {
      vendedorId: vendedorActual ? vendedorActual.id : null,
      vendedorNombre: vendedorActual ? vendedorActual.nombre : 'N/A',
      cantidad: cantidad,
      cliente: cliente || 'Anónimo',
      metodoPago: metodo,
      metodo: metodo,
      monto: total,
      fecha: new Date().toISOString(),
      fechaRegistro: new Date().toISOString()
    };

    if (typeof window.registrarVentaCentralizada === 'function') {
      window.registrarVentaCentralizada(venta);
    } else if (typeof window.bd?.registrarVenta === 'function') {
      window.bd.registrarVenta(venta);
    } else {
      let ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
      ventas.push(venta);
      localStorage.setItem('ventas', JSON.stringify(ventas));
    }

    if (successMsg) {
      successMsg.style.display = 'block';
      setTimeout(() => { successMsg.style.display = 'none'; }, 3000);
    }

    document.getElementById('ventasForm').reset();
    const cantidadInput = document.getElementById('cantidad');
    if (cantidadInput) cantidadInput.value = 1;
    actualizarPrecioTotal();
    actualizarEstadisticasVendedor();
    renderHistorial();

    window.dispatchEvent(new CustomEvent('ventaRegistrada'));
  }

  // =========================
  // RENDER HISTORIAL
  // =========================
  function renderHistorial() {
    const container = document.getElementById('historialList');
    if (!container) return;

    let todas = [];
    if (typeof window.obtenerTodasLasVentas === 'function') {
      todas = window.obtenerTodasLasVentas() || [];
    } else if (typeof window.bd?.obtenerTodasLasVentas === 'function') {
      todas = window.bd.obtenerTodasLasVentas() || [];
    } else {
      todas = JSON.parse(localStorage.getItem('ventas') || '[]');
    }

    const delVendedor = todas.filter(v => v.vendedorId === vendedorActual?.id);

    if (delVendedor.length === 0) {
      container.innerHTML = `
        <div class="venta-empty">
          <i class="fas fa-inbox"></i>
          <p>Sin ventas registradas todavía</p>
        </div>
      `;
      return;
    }

    const ultimas = delVendedor.slice(-20).reverse();

    container.innerHTML = ultimas.map(v => {
      const fecha = new Date(v.fecha || v.fechaRegistro);
      const hora = fecha.toLocaleTimeString();
      const metodo = v.metodoPago || v.metodo || 'Efectivo';
      const monto = v.monto || 0;
      const cliente = v.cliente || 'Anónimo';
      
      return `
        <div class="venta-item">
          <div class="info">
            <div class="cliente">${escapeHtml(cliente)}</div>
            <div class="detalle">${hora} · ${v.cantidad || 1} unidad(es) · <span class="metodo-badge">${escapeHtml(metodo)}</span></div>
          </div>
          <div class="monto">$${monto.toLocaleString()}</div>
        </div>
      `;
    }).join('');
  }

  // =========================
  // ESCAPAR HTML (seguridad)
  // =========================
  function escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  // =========================
  // INICIALIZACIÓN
  // =========================
  function iniciar() {
    vendedorActual = obtenerOCrearVendedor();
    const badge = document.getElementById('vendedorBadge');
    if (badge) badge.textContent = vendedorActual.nombre;

    actualizarPrecioTotal();
    actualizarEstadisticasVendedor();
    renderHistorial();

    const cantidadInput = document.getElementById('cantidad');
    const ventasForm = document.getElementById('ventasForm');

    if (cantidadInput) cantidadInput.addEventListener('input', actualizarPrecioTotal);
    if (ventasForm) ventasForm.addEventListener('submit', manejarEnvio);

    window.addEventListener('sincronizacionCompleta', () => {
      actualizarBadgeSync();
      actualizarEstadisticasVendedor();
      renderHistorial();
    });
    window.addEventListener('ventaRegistrada', () => {
      actualizarEstadisticasVendedor();
      renderHistorial();
    });
  }

  // =========================
  // INICIAR CUANDO EL DOM ESTÉ LISTO
  // =========================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    setTimeout(iniciar, 100);
  }

})();