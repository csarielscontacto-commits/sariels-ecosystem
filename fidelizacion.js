/**
 * fidelizacion.js
 * Sistema de clientes, TOKs y niveles (Bronce/Plata/Oro/Diamante), respaldado en Supabase.
 * Requiere config.js y base-datos-centralizada.js cargados antes.
 */

class SistemaFidelizacion {
    constructor() {
        this.clientesCache = JSON.parse(localStorage.getItem('cache_clientes_fidelizacion') || '[]');
        this._cargarDesdeServidor();
    }

    async _cargarDesdeServidor() {
        if (!supabaseClient) return;
        try {
            const { data, error } = await supabaseClient
                .from('clientes_fidelizacion')
                .select('*')
                .order('creado_en', { ascending: false });
            if (error) throw error;

            this.clientesCache = (data || []).map(this._mapearFila);
            this._guardarCacheLocal();
            window.dispatchEvent(new CustomEvent('fidelizacionSincronizada'));
        } catch (err) {
            logError('❌ Error cargando clientes de fidelización:', err);
        }
    }

    _mapearFila(fila) {
        return {
            id: fila.id,
            nombre: fila.nombre,
            telefono: fila.telefono,
            toks: fila.toks,
            toksTotales: fila.toks_totales,
            transacciones: fila.transacciones,
            nftEmitido: fila.nft_emitido,
            nftCanjeado: fila.nft_canjeado,
            nivel: fila.nivel
        };
    }

    _guardarCacheLocal() {
        try {
            localStorage.setItem('cache_clientes_fidelizacion', JSON.stringify(this.clientesCache));
        } catch (e) { /* no crítico */ }
    }

    obtenerTodosLosClientes() {
        return [...this.clientesCache].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    obtenerCliente(id) {
        return this.clientesCache.find(c => c.id === id) || null;
    }

    buscarClientePorNombre(termino) {
        const t = (termino || '').trim().toLowerCase();
        if (!t) return this.obtenerTodosLosClientes();
        return this.clientesCache.filter(c => c.nombre.toLowerCase().includes(t));
    }

    calcularDescuentoCliente(id) {
        const cliente = this.obtenerCliente(id);
        if (!cliente) return 0;
        if (cliente.nivel === 'diamante') return 15;
        if (cliente.nivel === 'oro') return 10;
        if (cliente.nivel === 'plata') return 5;
        return 0;
    }

    registrarCliente(nombre, telefono = '') {
        const nombreLimpio = (nombre || '').trim();
        if (!nombreLimpio) throw new Error('El nombre del cliente es obligatorio.');

        const yaExiste = this.clientesCache.some(
            c => c.nombre.toLowerCase() === nombreLimpio.toLowerCase()
        );
        if (yaExiste) throw new Error('Ya existe un cliente con ese nombre.');

        const cliente = {
            id: `cli_${Date.now()}`,
            nombre: nombreLimpio,
            telefono,
            toks: 0,
            toksTotales: 0,
            transacciones: 0,
            nftEmitido: false,
            nftCanjeado: false,
            nivel: 'sin nivel'
        };

        this.clientesCache.unshift(cliente);
        this._guardarCacheLocal();

        if (supabaseClient) {
            supabaseClient.from('clientes_fidelizacion').insert({
                id: cliente.id,
                nombre: cliente.nombre,
                telefono: cliente.telefono,
                toks: 0,
                toks_totales: 0,
                transacciones: 0,
                nft_emitido: false,
                nft_canjeado: false,
                nivel: 'sin nivel'
            }).then(({ error }) => {
                if (error) logError('❌ Error registrando cliente en Supabase:', error);
            });
        }

        return cliente;
    }

    procesarVenta(clienteId, venta) {
        const cliente = this.obtenerCliente(clienteId);
        if (!cliente) return null;

        const toksOtorgados = 1; // 1 compra = 1 TOK, ajustable si quieres dar TOKs por cantidad
        cliente.toks += toksOtorgados;
        cliente.toksTotales += toksOtorgados;
        cliente.transacciones += 1;

        const nivelAnterior = cliente.nivel;
        cliente.nivel = calcularNivelPorToks(cliente.toksTotales);

        let nftNuevo = null;
        if (cliente.transacciones >= CONFIG.FIDELIZACION.TOKS_PARA_NFT && !cliente.nftEmitido) {
            cliente.nftEmitido = true;
            nftNuevo = { nombre: `NFT ${cliente.nivel} de ${cliente.nombre}` };
        }

        this._guardarCacheLocal();

        if (supabaseClient) {
            supabaseClient.from('clientes_fidelizacion').update({
                toks: cliente.toks,
                toks_totales: cliente.toksTotales,
                transacciones: cliente.transacciones,
                nivel: cliente.nivel,
                nft_emitido: cliente.nftEmitido
            }).eq('id', cliente.id).then(({ error }) => {
                if (error) logError('❌ Error actualizando fidelización en Supabase:', error);
            });
        }

        return {
            toksOtorgados,
            nivelAnterior,
            nivelNuevo: cliente.nivel,
            nftNuevo
        };
    }

    obtenerResumenGeneral() {
        const hoy = new Date().toDateString();
        const ventasHoy = (typeof bd !== 'undefined') ? bd.obtenerVentasDeHoy() : [];
        const toksOtorgadosHoy = ventasHoy.filter(v => v.clienteFidelizacionId).length;

        return {
            totalClientes: this.clientesCache.length,
            toksOtorgadosHoy,
            nftsActivos: this.clientesCache.filter(c => c.nftEmitido && !c.nftCanjeado).length
        };
    }
}

const sistemaFidelizacion = new SistemaFidelizacion();

