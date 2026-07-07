const log = (...args) => console.log('[RegistroVentas]', ...args);
const logError = (...args) => console.error('[RegistroVentas]', ...args);

let vendedorActual = null;
let clienteFidelizacionSeleccionado = null;

document.addEventListener('DOMContentLoaded', () => {
    log('🚀 Inicializando Registro de Ventas');
    inicializarVendedor();
    inicializarFidelizacion();
    actualizarEstadoSync();
    setInterval(actualizarEstadoSync, 5000);
});

function inicializarVendedor() {
    let vendedorId = localStorage.getItem('vendedorActual');
    
    if (!vendedorId) {
        const numero = Math.floor(Math.random() * 1000) + 1;
        vendedorId = `vendedor_${numero}`;
        vendedorActual = {
            id: vendedorId,
            nombre: `Vendedor ${numero}`,
            numero: numero,
            fechaRegistro: new Date().toISOString()
        };
        
        localStorage.setItem('vendedorActual', vendedorId);
        localStorage.setItem('vendedorActualData', JSON.stringify(vendedorActual));
    } else {
        vendedorActual = JSON.parse(localStorage.getItem('vendedorActualData')) || {
            id: vendedorId,
            nombre: `Vendedor ${vendedorId.split('_')[1]}`,
            numero: parseInt(vendedorId.split('_')[1], 10)
        };
    }
    
    document.getElementById('vendedorBadge').textContent = vendedorActual.nombre;
    actualizarEstadisticasVendedor();
}

function formatearPrecio(valor) {
    return `${CONFIG.SIMBOLO_MONEDA}${Number(valor || 0).toLocaleString('es-MX')} ${CONFIG.MONEDA}`;
}

function actualizarEstadisticasVendedor() {
    const ventas = bd.obtenerTodasLasVentas();
    const ventasVendedor = ventas.filter(v => v.vendedorId === vendedorActual.id);
    
    const ventasHoy = bd.obtenerVentasDeHoy().filter(v => v.vendedorId === vendedorActual.id);
    const ingresoHoy = ventasHoy.reduce((sum, v) => sum + (Number(v.monto) || 0), 0);
    const totalIngreso = ventasVendedor.reduce((sum, v) => sum + (Number(v.monto) || 0), 0);
    
    document.getElementById('ventasHoyVendedor').textContent = ventasHoy.length;
    document.getElementById('ingresoHoyVendedor').textContent = formatearPrecio(ingresoHoy);
    document.getElementById('totalVentasVendedor').textContent = ventasVendedor.length;
    document.getElementById('totalIngresoVendedor').textContent = formatearPrecio(totalIngreso);
}

function actualizarEstadoSync() {
    const badge = document.getElementById('syncBadge');
    const remotoActivo = typeof bd?.estaRemotoActivo === 'function' ? bd.estaRemotoActivo() : false;

    if (remotoActivo) {
        badge.textContent = '✅ Sincronizado';
        badge.classList.remove('desincronizado');
    } else {
        badge.textContent = '⚠️ Modo local';
        badge.classList.add('desincronizado');
    }
}

function cambiarVendedor() {
    const nuevoNumero = prompt('Ingresa el número del nuevo vendedor (o deja en blanco para generar uno nuevo):', '');
    
    if (nuevoNumero !== null) {
        let vendedorId, nombre, numero;
        
        if (nuevoNumero.trim() === '') {
            numero = Math.floor(Math.random() * 1000) + 1;
            nombre = `Vendedor ${numero}`;
        } else {
            numero = parseInt(nuevoNumero, 10);
            nombre = `Vendedor ${numero}`;
        }
        
        vendedorId = `vendedor_${numero}`;
        
        vendedorActual = {
            id: vendedorId,
            nombre: nombre,
            numero: numero,
            fechaRegistro: new Date().toISOString()
        };
        
        localStorage.setItem('vendedorActual', vendedorId);
        localStorage.setItem('vendedorActualData', JSON.stringify(vendedorActual));
        
        document.getElementById('vendedorBadge').textContent = vendedorActual.nombre;
        actualizarEstadisticasVendedor();
        
        log('🔄 Vendedor cambiado a:', vendedorActual.nombre);
    }
}

function inicializarFidelizacion() {
    const input = document.getElementById('clienteFidelizacion');
    const resultados = document.getElementById('clienteFidelizacionResultados');
    const registrarBtn = document.getElementById('registrarClienteFidelizacionBtn');
    const limpiarBtn = document.getElementById('limpiarClienteFidelizacionBtn');

    input.addEventListener('input', () => {
        clienteFidelizacionSeleccionado = null;
        actualizarInfoClienteFidelizacion();
        renderResultadosFidelizacion(input.value);
    });

    input.addEventListener('focus', () => renderResultadosFidelizacion(input.value));

    registrarBtn.addEventListener('click', registrarNuevoClienteFidelizacion);
    limpiarBtn.addEventListener('click', limpiarClienteFidelizacion);

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.autocomplete-wrapper')) {
            resultados.style.display = 'none';
        }
    });
}

function escaparHTML(texto = '') {
    return texto
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderResultadosFidelizacion(valor) {
    const resultados = document.getElementById('clienteFidelizacionResultados');
    const registrarBtn = document.getElementById('registrarClienteFidelizacionBtn');
    const termino = valor.trim();
    const clientes = termino
        ? sistemaFidelizacion.buscarClientePorNombre(termino)
        : sistemaFidelizacion.obtenerTodosLosClientes().slice(0, 5);

    registrarBtn.style.display = termino ? 'inline-block' : 'none';

    if (clientes.length === 0 && !termino) {
        resultados.style.display = 'none';
        resultados.innerHTML = '';
        return;
    }

    resultados.innerHTML = clientes.map((cliente) => `
        <div class="autocomplete-item" data-cliente-id="${cliente.id}">
            <strong>${escaparHTML(cliente.nombre)}</strong><br>
            <small>${escaparHTML(cliente.telefono || 'Sin teléfono')} · ${cliente.toks} TOKs</small>
        </div>
    `).join('') || '<div class="autocomplete-item">Sin coincidencias</div>';

    resultados.style.display = 'block';

    resultados.querySelectorAll('[data-cliente-id]').forEach((item) => {
        item.addEventListener('click', () => seleccionarClienteFidelizacion(item.dataset.clienteId));
    });
}

function seleccionarClienteFidelizacion(clienteId) {
    const cliente = sistemaFidelizacion.obtenerCliente(clienteId);
    if (!cliente) return;

    clienteFidelizacionSeleccionado = cliente;
    document.getElementById('clienteFidelizacion').value = cliente.nombre;
    if (!document.getElementById('cliente').value.trim()) {
        document.getElementById('cliente').value = cliente.nombre;
    }
    document.getElementById('clienteFidelizacionResultados').style.display = 'none';
    actualizarInfoClienteFidelizacion();
}

function actualizarInfoClienteFidelizacion() {
    const info = document.getElementById('clienteFidelizacionInfo');
    const limpiarBtn = document.getElementById('limpiarClienteFidelizacionBtn');

    if (!clienteFidelizacionSeleccionado) {
        info.style.display = 'none';
        info.textContent = '';
        limpiarBtn.style.display = 'none';
        return;
    }

    const descuento = sistemaFidelizacion.calcularDescuentoCliente(clienteFidelizacionSeleccionado.id);
    info.style.display = 'block';
    info.textContent = `Cliente asociado: ${clienteFidelizacionSeleccionado.nombre} · ${clienteFidelizacionSeleccionado.toks} TOKs · Descuento actual ${descuento}%`;
    limpiarBtn.style.display = 'inline-block';
}

function registrarNuevoClienteFidelizacion() {
    const nombre = document.getElementById('clienteFidelizacion').value.trim();
    if (!nombre) {
        alert('Escribe primero el nombre del cliente para registrarlo.');
        return;
    }

    const telefono = prompt(`Ingresa el teléfono de ${nombre} (opcional):`, '') || '';

    try {
        const cliente = sistemaFidelizacion.registrarCliente(nombre, telefono);
        seleccionarClienteFidelizacion(cliente.id);
        actualizarInfoClienteFidelizacion();
    } catch (error) {
        alert(error.message);
    }
}

function limpiarClienteFidelizacion() {
    clienteFidelizacionSeleccionado = null;
    document.getElementById('clienteFidelizacion').value = '';
    document.getElementById('clienteFidelizacionResultados').style.display = 'none';
    actualizarInfoClienteFidelizacion();
}

document.getElementById('cantidad').addEventListener('change', function() {
    const cantidad = parseInt(this.value, 10) || 1;
    const total = cantidad * CONFIG.PRECIO_UNITARIO;
    document.getElementById('precioTotal').textContent =
        `Total: ${CONFIG.SIMBOLO_MONEDA}${total.toLocaleString('es-MX')} ${CONFIG.MONEDA}`;
});

document.getElementById('ventasForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Registrando...';
    
    try {
        const cantidad = parseInt(document.getElementById('cantidad').value, 10);
        const cliente = document.getElementById('cliente').value;
        const metodo = document.getElementById('metodo').value;
        const total = cantidad * CONFIG.PRECIO_UNITARIO;
        let resultadoFidelizacion = null;
        
        const venta = {
            id: `venta_${Date.now()}`,
            vendedorId: vendedorActual.id,
            vendedorNombre: vendedorActual.nombre,
            cantidad,
            cliente,
            metodo,
            monto: total,
            timestamp: Date.now(),
            sincronizado: false,
            fechaRegistro: new Date().toISOString(),
            clienteFidelizacionId: clienteFidelizacionSeleccionado ? clienteFidelizacionSeleccionado.id : null
        };
        
        bd.registrarVenta(venta);

        if (clienteFidelizacionSeleccionado) {
            resultadoFidelizacion = sistemaFidelizacion.procesarVenta(clienteFidelizacionSeleccionado.id, venta);
            clienteFidelizacionSeleccionado = sistemaFidelizacion.obtenerCliente(clienteFidelizacionSeleccionado.id);
        }
        
        await bd.sincronizarConServidor();
        
        const successMsg = document.getElementById('successMessage');
        if (resultadoFidelizacion) {
            const mensajeNFT = resultadoFidelizacion.nftNuevo
                ? ` · 🎉 ¡Nuevo NFT ${resultadoFidelizacion.nftNuevo.nombre} desbloqueado!`
                : '';
            successMsg.textContent = `✅ Venta registrada · +${resultadoFidelizacion.toksOtorgados} TOKs otorgados a ${clienteFidelizacionSeleccionado.nombre}${mensajeNFT}`;
        } else {
            successMsg.textContent = '✅ ¡Venta registrada exitosamente!';
        }
        successMsg.style.display = 'block';
        
        actualizarEstadisticasVendedor();
        actualizarInfoClienteFidelizacion();
        
        this.reset();
        limpiarClienteFidelizacion();
        document.getElementById('precioTotal').textContent =
            `Total: ${CONFIG.SIMBOLO_MONEDA}${CONFIG.PRECIO_UNITARIO.toLocaleString('es-MX')} ${CONFIG.MONEDA}`;
        
        log('✅ Venta registrada y sincronizada');
        
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        logError('Error registrando venta', error);
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.style.display = 'block';
        
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 3000);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '📊 Registrar Venta';
    }
});

window.addEventListener('sincronizacionCompleta', () => {
    actualizarEstadisticasVendedor();
    actualizarEstadoSync();
});

window.addEventListener('ventaRegistrada', () => {
    actualizarEstadisticasVendedor();
});
