// ================================================================
// REGISTRO DE VENTAS CENTRALIZADO - Sariel's Ecosystem
// ================================================================

(function () {
  "use strict";

  let vendedorActual = null;
  let inicializado = false;

  // =========================
  // Vendedor (local, simple)
  // =========================
  function obtenerOCrearVendedor() {
    try {
      let vendedorId = localStorage.getItem('vendedorActual');

      if (!vendedorId) {
        const vendedores = JSON.parse(localStorage.getItem('vendedores') || '[]');
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

      const vendedores = JSON.parse(localStorage.getItem('vendedores') || '[]');
      return vendedores.find(v => v.id === vendedorId);
    } catch (error) {
      console.error('Error obteniendo vendedor:', error);
      // Fallback: crear vendedor por defecto
      return {
        id: 'vendedor_1',
        nombre: 'Vendedor 1',
        numero: 1,
        fechaRegistro: new Date().toISOString()
      };
    }
  }

  // =========================
  // Cambiar vendedor
  // =========================
  window.cambiarVendedor = function () {
    try {
      localStorage.removeItem('vendedorActual');
      vendedorActual = obtenerOCrearVendedor();
      const badge = document.getElementById('vendedorBadge');
      if (badge) badge.textContent = vendedorActual.nombre;
      actualizarEstadisticasVendedor();
      renderHistorial();
    } catch (error) {
      console.error('Error cambiando vendedor:', error);
    }
  };

  // =========================
  // Obtener ventas (seguro)
  // =========================
  function obtenerVentasSeguro() {
    try {
      if (typeof window.obtenerTodasLasVentas === 'function') {
        return window.obtenerTodasLasVentas() || [];
      }
      if (typeof window.bd?.obtenerTodasLasVentas === 'function') {
        return window.bd.obtenerTodasLasVentas() || [];
      }
      return JSON.parse(localStorage.getItem('ventas') || '[]');
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      return [];
    }
  }

  function obtenerVentasDeHoySeguro() {
    try {
      if (typeof window.obtenerVentasDeHoy === 'function') {
        return window.obtenerVentasDeHoy() || [];
      }
      if (typeof window.bd?.obtenerVentasDeHoy === 'function') {
        return window.bd.obtenerVentasDeHoy() || [];
      }
      const todas = obtenerVentasSeguro();
      const hoy = new Date().toDateString();
      return todas.filter(v => new Date(v.fecha || v.fechaRegistro).toDateString() === hoy);
    } catch (error) {
      console.error('Error obteniendo ventas de hoy:', error);
      return [];
    }
  }

  // =========================
  // Estadísticas del vendedor
  // =========================
  function actualizarEstadisticasVendedor() {
    try {
      if (!vendedorActual) return;
      
      const todas = obtenerVentasSeguro();
      const deHoy = obtenerVentasDeHoySeguro();

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
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
    }
  }

  // =========================
  // Estado de sincronización
  // =========================
  function actualizarBadgeSync() {
    try {
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
    } catch (error) {
      console.error('Error actualizando badge:', error);
    }
  }

  // =========================
  // Precio total según cantidad
  // =========================
  function actualizarPrecioTotal() {
    try {
      const precioUnitario = (window.CONFIG && window.CONFIG.PRECIO_UNITARIO) || 75;
      const cantidad = parseInt(document.getElementById('cantidad')?.value) || 1;
      const total = cantidad * precioUnitario;
      const elPrecioTotal = document.getElementById('precioTotal');
      if (elPrecioTotal) elPrecioTotal.value = `$${total.toLocaleString()} MXN`;
    } catch (error) {
      console.error('Error actualizando precio total:', error);
    }
  }

  // =========================
  // Envío del formulario
  // =========================
  function manejarEnvio(e) {
    e.preventDefault();

    try {
      const precioUnitario = (window.CONFIG && window.CONFIG.PRECIO_UNITARIO) || 75;
      const cantidad = parseInt(document.getElementById('cantidad')?.value) || 1;
      const cliente = document.getElementById('cliente')?.value?.trim() || '';
      const metodo = document.getElementById('metodo')?.value || '';
      const total = cantidad * precioUnitario;

      const successMsg = document.getElementById('successMessage');
      const errorMsg = document.getElementById('errorMessage');
      const errorText = document.getElementById('errorText');
      
      if (successMsg) successMsg.style.display = 'none';
      if (errorMsg) errorMsg.style.display = 'none';

      // Validación: método de pago requerido
      if (!metodo) {
        if (errorText) errorText.textContent = 'Selecciona un método de pago.';
        if (errorMsg) errorMsg.style.display = 'block';
        return;
      }

      // Validación: vendedor existente
      if (!vendedorActual) {
        if (errorText) errorText.textContent = 'Error: Vendedor no identificado. Recarga la página.';
        if (errorMsg) errorMsg.style.display = 'block';
        return;
      }

      const venta = {
        vendedorId: vendedorActual.id,
        vendedorNombre: vendedorActual.nombre || 'N/A',
        cantidad: cantidad,
        cliente: cliente || 'Anónimo',
        metodoPago: metodo,
        metodo: metodo,
        monto: total,
        fecha: new Date().toISOString(),
        fechaRegistro: new Date().toISOString()
      };

      // Guardar usando el sistema centralizado
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

      // Resetear formulario
      const form = document.getElementById('ventasForm');
      if (form) form.reset();
      const cantidadInput = document.getElementById('cantidad');
      if (cantidadInput) cantidadInput.value = 1;
      
      actualizarPrecioTotal();
      actualizarEstadisticasVendedor();
      renderHistorial();

      window.dispatchEvent(new CustomEvent('ventaRegistrada'));

    } catch (error) {
      console.error('Error al registrar venta:', error);
      const errorMsg = document.getElementById('errorMessage');
      const errorText = document.getElementById('errorText');
      if (errorText) errorText.textContent = 'Error al registrar: ' + error.message;
      if (errorMsg) errorMsg.style.display = 'block';
    }
  }

  // =========================
  // RENDER HISTORIAL
  // =========================
  function renderHistorial() {
    try {
      const container = document.getElementById('historialList');
      if (!container) return;

      const todas = obtenerVentasSeguro();
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
    } catch (error) {
      console.error('Error renderizando historial:', error);
    }
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
  // INICIALIZACIÓN SEGURA
  // =========================
  function iniciar() {
    try {
      // Verificar que el DOM esté listo
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
        return;
      }

      // Verificar que los elementos existan
      const badge = document.getElementById('vendedorBadge');
      if (!badge) {
        console.warn('Elemento vendedorBadge no encontrado, reintentando...');
        setTimeout(iniciar, 500);
        return;
      }

      // Inicializar vendedor
      vendedorActual = obtenerOCrearVendedor();
      badge.textContent = vendedorActual.nombre || 'Vendedor';

      // Actualizar todo
      actualizarPrecioTotal();
      actualizarEstadisticasVendedor();
      renderHistorial();

      // Configurar eventos
      const cantidadInput = document.getElementById('cantidad');
      const ventasForm = document.getElementById('ventasForm');

      if (cantidadInput) {
        cantidadInput.removeEventListener('input', actualizarPrecioTotal);
        cantidadInput.addEventListener('input', actualizarPrecioTotal);
      }
      if (ventasForm) {
        ventasForm.removeEventListener('submit', manejarEnvio);
        ventasForm.addEventListener('submit', manejarEnvio);
      }

      // Eventos globales
      window.addEventListener('sincronizacionCompleta', () => {
        actualizarBadgeSync();
        actualizarEstadisticasVendedor();
        renderHistorial();
      });
      window.addEventListener('ventaRegistrada', () => {
        actualizarEstadisticasVendedor();
        renderHistorial();
      });

      inicializado = true;
      console.log('✅ Registro de Ventas inicializado correctamente');

    } catch (error) {
      console.error('Error en iniciar():', error);
      // Reintentar después de 1 segundo
      setTimeout(iniciar, 1000);
    }
  }

  // =========================
  // INICIAR
  // =========================
  iniciar();

})();