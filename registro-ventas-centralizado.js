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

  window.cambiarVendedor = function () {
    localStorage.removeItem('vendedorActual');
    vendedorActual = obtenerOCrearVendedor();
    document.getElementById('vendedorBadge').textContent = vendedorActual.nombre;
    actualizarEstadisticasVendedor();
  };

  // =========================
  // Estadísticas del vendedor
  // =========================
  function actualizarEstadisticasVendedor() {
    if (!vendedorActual || !window.bd) return;
    const todas = window.bd.obtenerTodasLasVentas();
    const deHoy = window.bd.obtenerVentasDeHoy();

    const delVendedor = todas.filter(v => v.vendedorId === vendedorActual.id);
    const delVendedorHoy = deHoy.filter(v => v.vendedorId === vendedorActual.id);

    const ingresoHoy = delVendedorHoy.reduce((s, v) => s + (Number(v.monto) || 0), 0);
    const ingresoTotal = delVendedor.reduce((s, v) => s + (Number(v.monto) || 0), 0);

    document.getElementById('ventasHoyVendedor').textContent = delVendedorHoy.length;
    document.getElementById('ingresoHoyVendedor').textContent = '$' + ingresoHoy.toLocaleString();
    document.getElementById('totalVentasVendedor').textContent = delVendedor.length;
    document.getElementById('totalIngresoVendedor').textContent = '$' + ingresoTotal.toLocaleString();
  }

  // =========================
  // Estado de sincronización
  // =========================
  function actualizarBadgeSync() {
    const badge = document.getElementById('syncBadge');
    if (!badge || !window.bd) return;
    if (window.bd.estaRemotoActivo()) {
      badge.textContent = '✅ Sincronizado';
      badge.classList.remove('desincronizado');
    } else {
      badge.textContent = '⚠️ Modo local';
      badge.classList.add('desincronizado');
    }
  }

  // =========================
  // Precio total según cantidad
  // =========================
  function actualizarPrecioTotal() {
    const precioUnitario = (window.CONFIG && window.CONFIG.PRECIO_UNITARIO) || 75;
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const total = cantidad * precioUnitario;
    document.getElementById('precioTotal').textContent = `Total: $${total.toLocaleString()} MXN`;
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
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    if (!metodo) {
      errorMsg.textContent = '❌ Selecciona un método de pago.';
      errorMsg.style.display = 'block';
      return;
    }

    const venta = {
      vendedorId: vendedorActual ? vendedorActual.id : null,
      vendedorNombre: vendedorActual ? vendedorActual.nombre : 'N/A',
      cantidad: cantidad,
      cliente: cliente || 'Anónimo',
      metodo: metodo,
      monto: total,
      fechaRegistro: new Date().toISOString()
    };

    if (typeof window.registrarVentaCentralizada === 'function') {
      window.registrarVentaCentralizada(venta);
    } else {
      let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
      ventas.push(venta);
      localStorage.setItem('ventas', JSON.stringify(ventas));
    }

    successMsg.style.display = 'block';
    setTimeout(() => { successMsg.style.display = 'none'; }, 3000);

    document.getElementById('ventasForm').reset();
    actualizarPrecioTotal();
    actualizarEstadisticasVendedor();
  }

  // =========================
  // Inicialización
  // =========================
  function iniciar() {
    vendedorActual = obtenerOCrearVendedor();
    document.getElementById('vendedorBadge').textContent = vendedorActual.nombre;

    actualizarPrecioTotal();
    actualizarEstadisticasVendedor();
    actualizarBadgeSync();

    document.getElementById('cantidad').addEventListener('input', actualizarPrecioTotal);
    document.getElementById('ventasForm').addEventListener('submit', manejarEnvio);

    window.addEventListener('sincronizacionCompleta', () => {
      actualizarBadgeSync();
      actualizarEstadisticasVendedor();
    });
    window.addEventListener('ventaRegistrada', actualizarEstadisticasVendedor);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
