(function () {
  "use strict";

  let vendedorActual = null;
  let clienteFidelizacionSeleccionado = null;

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
    const vendedores = JSON.parse(localStorage.getItem('vendedores')) || [];
    const nombres = vendedores.map(v => v.nombre);
    const nuevo = prompt('Vendedores disponibles:\n' + nombres.join('\n') + '\n\nEscribe el nombre del vendedor:', '');
    if (nuevo && nuevo.trim()) {
      const encontrado = vendedores.find(v => v.nombre === nuevo.trim());
      if (encontrado) {
        localStorage.setItem('vendedorActual', encontrado.id);
        vendedorActual = encontrado;
        document.getElementById('vendedorBadge').textContent = vendedorActual.nombre;
        actualizarEstadisticasVendedor();
      } else {
        alert('Vendedor no encontrado. Usando el actual.');
      }
    }
  };

  // =========================
  // Estadísticas del vendedor
  // =========================
  function actualizarEstadisticasVendedor() {
    if (!vendedorActual || !window.bd) return;
    
    try {
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
    } catch (error) {
      console.warn('Error actualizando estadísticas:', error);
    }
  }

  // =========================
  // Estado de sincronización
  // =========================
  function actualizarBadgeSync() {
    const badge = document.getElementById('syncBadge');
    if (!badge || !window.bd) return;
    
    try {
      if (window.bd.estaRemotoActivo()) {
        badge.textContent = '✅ Sincronizado';
        badge.classList.remove('desincronizado');
        badge.style.background = '#26a69a';
      } else {
        badge.textContent = '⚠️ Modo local';
        badge.classList.add('desincronizado');
        badge.style.background = '#ffa726';
      }
    } catch (error) {
      console.warn('Error actualizando badge:', error);
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

    // Si hay cliente de fidelización seleccionado, agregar a la venta
    if (clienteFidelizacionSeleccionado) {
      venta.clienteFidelizacionId = clienteFidelizacionSeleccionado.id;
      venta.clienteFidelizacionNombre = clienteFidelizacionSeleccionado.nombre;
      
      // Otorgar TOKs al cliente
      if (typeof window.sistemaFidelizacion !== 'undefined') {
        try {
          const toks = Math.floor(total / 75) * 10;
          window.sistemaFidelizacion.agregarTOKs(clienteFidelizacionSeleccionado.id, toks);
          console.log(`✅ ${toks} TOKs otorgados a ${clienteFidelizacionSeleccionado.nombre}`);
        } catch (error) {
          console.warn('Error otorgando TOKs:', error);
        }
      }
    }

    try {
      if (typeof window.registrarVentaCentralizada === 'function') {
        window.registrarVentaCentralizada(venta);
        successMsg.textContent = '✅ Venta registrada y sincronizada';
      } else {
        let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        ventas.push(venta);
        localStorage.setItem('ventas', JSON.stringify(ventas));
        successMsg.textContent = '✅ Venta registrada (modo local)';
      }

      successMsg.style.display = 'block';
      setTimeout(() => { successMsg.style.display = 'none'; }, 3000);

      document.getElementById('ventasForm').reset();
      document.getElementById('cantidad').value = 1;
      actualizarPrecioTotal();
      actualizarEstadisticasVendedor();
      
      limpiarClienteFidelizacion();
      
    } catch (error) {
      console.error('Error registrando venta:', error);
      errorMsg.textContent = '❌ Error al registrar: ' + error.message;
      errorMsg.style.display = 'block';
    }
  }

  // =========================
  // Funciones de Fidelización
  // =========================
  function limpiarClienteFidelizacion() {
    clienteFidelizacionSeleccionado = null;
    document.getElementById('clienteFidelizacion').value = '';
    document.getElementById('clienteFidelizacionInfo').style.display = 'none';
    document.getElementById('registrarClienteFidelizacionBtn').style.display = 'none';
    document.getElementById('limpiarClienteFidelizacionBtn').style.display = 'none';
  }

  function mostrarClienteFidelizacion(cliente) {
    if (!cliente) return;
    
    clienteFidelizacionSeleccionado = cliente;
    const infoDiv = document.getElementById('clienteFidelizacionInfo');
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
      <strong>${cliente.nombre}</strong><br>
      TOKs: ${cliente.toks || 0} | 
      Nivel: ${cliente.nivel || 'Sin nivel'} | 
      Descuento: ${cliente.descuento || 0}%
    `;
    
    document.getElementById('registrarClienteFidelizacionBtn').style.display = 'none';
    document.getElementById('limpiarClienteFidelizacionBtn').style.display = 'inline-block';
  }

  function buscarClientes(query) {
    if (!query || query.length < 2) return [];
    
    if (typeof window.sistemaFidelizacion === 'undefined') {
      console.warn('Sistema de fidelización no disponible');
      return [];
    }
    
    try {
      const clientes = window.sistemaFidelizacion.obtenerClientes();
      return clientes.filter(c => 
        c.nombre.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.warn('Error buscando clientes:', error);
      return [];
    }
  }

  // =========================
  // Inicialización
  // =========================
  function iniciar() {
    try {
      vendedorActual = obtenerOCrearVendedor();
      
      const badge = document.getElementById('vendedorBadge');
      if (badge) badge.textContent = vendedorActual.nombre;

      actualizarPrecioTotal();
      
      if (window.bd) {
        actualizarEstadisticasVendedor();
        actualizarBadgeSync();
      } else {
        console.warn('Base de datos no disponible, esperando...');
        document.addEventListener('bdReady', () => {
          actualizarEstadisticasVendedor();
          actualizarBadgeSync();
        });
      }

      const cantidadInput = document.getElementById('cantidad');
      if (cantidadInput) {
        cantidadInput.addEventListener('input', actualizarPrecioTotal);
      }

      const form = document.getElementById('ventasForm');
      if (form) {
        form.addEventListener('submit', manejarEnvio);
      }

      // Autocompletado de clientes fidelización
      const clienteInput = document.getElementById('clienteFidelizacion');
      if (clienteInput) {
        clienteInput.addEventListener('input', function() {
          const results = buscarClientes(this.value);
          const resultsDiv = document.getElementById('clienteFidelizacionResultados');
          
          if (results.length > 0) {
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = results.map(c => `
              <div class="autocomplete-item" data-id="${c.id}">
                ${c.nombre} (${c.toks || 0} TOKs)
              </div>
            `).join('');
            
            resultsDiv.querySelectorAll('.autocomplete-item').forEach(item => {
              item.addEventListener('click', function() {
                const cliente = results.find(c => c.id === this.dataset.id);
                if (cliente) {
                  document.getElementById('clienteFidelizacion').value = cliente.nombre;
                  mostrarClienteFidelizacion(cliente);
                  resultsDiv.style.display = 'none';
                }
              });
            });
          } else {
            resultsDiv.style.display = 'none';
          }
        });
        
        clienteInput.addEventListener('blur', function() {
          setTimeout(() => {
            document.getElementById('clienteFidelizacionResultados').style.display = 'none';
          }, 300);
        });
      }

      document.getElementById('limpiarClienteFidelizacionBtn').addEventListener('click', limpiarClienteFidelizacion);

      window.addEventListener('sincronizacionCompleta', () => {
        actualizarBadgeSync();
        actualizarEstadisticasVendedor();
      });
      
      window.addEventListener('ventaRegistrada', actualizarEstadisticasVendedor);

    } catch (error) {
      console.error('Error en inicialización:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  window.actualizarEstadisticasVendedor = actualizarEstadisticasVendedor;
  window.actualizarBadgeSync = actualizarBadgeSync;
  window.actualizarPrecioTotal = actualizarPrecioTotal;

})();
