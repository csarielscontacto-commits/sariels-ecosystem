/**
 * SISTEMA DE FIDELIZACIÓN CON TOKs Y NFTs
 * Gestiona clientes, recompensas y niveles NFT usando localStorage.
 */

const storageMemoriaFidelizacion = {
    datos: {},
    getItem(clave) {
        return Object.prototype.hasOwnProperty.call(this.datos, clave) ? this.datos[clave] : null;
    },
    setItem(clave, valor) {
        this.datos[clave] = String(valor);
    },
    removeItem(clave) {
        delete this.datos[clave];
    }
};

class SistemaFidelizacion {
    constructor() {
        this.storage = this.obtenerStorage();
        this.clientes = this.cargarClientes();
        this.nftsEmitidos = this.cargarNFTs();
        this.inicializarEscuchadores();
    }

    /**
     * Usa localStorage del navegador o un storage en memoria para entornos de pruebas.
     */
    obtenerStorage() {
        if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
            return globalThis.localStorage;
        }
        return storageMemoriaFidelizacion;
    }

    /**
     * Mantiene sincronizados los datos entre pestañas.
     */
    inicializarEscuchadores() {
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (event) => this.manejarCambiosStorage(event));
        }
    }

    manejarCambiosStorage(event) {
        if (!event || !event.key) return;

        if (event.key === CONFIG.TOKENS.STORAGE_CLIENTES) {
            this.clientes = this.cargarClientes();
        }

        if (event.key === CONFIG.TOKENS.STORAGE_NFTS) {
            this.nftsEmitidos = this.cargarNFTs();
        }
    }

    cargarClientes() {
        return this.cargarJSON(CONFIG.TOKENS.STORAGE_CLIENTES);
    }

    guardarClientes() {
        this.storage.setItem(CONFIG.TOKENS.STORAGE_CLIENTES, JSON.stringify(this.clientes));
    }

    cargarNFTs() {
        return this.cargarJSON(CONFIG.TOKENS.STORAGE_NFTS);
    }

    guardarNFTs() {
        this.storage.setItem(CONFIG.TOKENS.STORAGE_NFTS, JSON.stringify(this.nftsEmitidos));
    }

    cargarJSON(clave) {
        try {
            const valor = this.storage.getItem(clave);
            return valor ? JSON.parse(valor) : [];
        } catch (error) {
            if (typeof logError === 'function') {
                logError(`Error cargando datos de ${clave}`, error);
            }
            return [];
        }
    }

    obtenerFechaActual() {
        return new Date().toISOString();
    }

    obtenerClaveFecha(fecha) {
        const fechaBase = fecha ? new Date(fecha) : new Date();
        const anio = fechaBase.getFullYear();
        const mes = String(fechaBase.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaBase.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    }

    normalizarTexto(texto = '') {
        return texto.toString().trim().toLowerCase();
    }

    generarId(prefijo) {
        return `${prefijo}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    obtenerDefinicionesNFT() {
        return [
            {
                nivel: 'bronce',
                nombre: 'Bronce',
                minimo: CONFIG.TOKENS.NFT_BRONCE_MIN,
                descuento: CONFIG.TOKENS.DESCUENTO_BRONCE,
                color: '#cd7f32'
            },
            {
                nivel: 'plata',
                nombre: 'Plata',
                minimo: CONFIG.TOKENS.NFT_PLATA_MIN,
                descuento: CONFIG.TOKENS.DESCUENTO_PLATA,
                color: '#c0c0c0'
            },
            {
                nivel: 'oro',
                nombre: 'Oro',
                minimo: CONFIG.TOKENS.NFT_ORO_MIN,
                descuento: CONFIG.TOKENS.DESCUENTO_ORO,
                color: '#ffd700'
            },
            {
                nivel: 'diamante',
                nombre: 'Diamante',
                minimo: CONFIG.TOKENS.NFT_DIAMANTE_MIN,
                descuento: CONFIG.TOKENS.DESCUENTO_DIAMANTE,
                color: '#b9f2ff'
            }
        ];
    }

    obtenerDefinicionNFT(nivel) {
        return this.obtenerDefinicionesNFT().find((item) => item.nivel === nivel) || null;
    }

    /**
     * Registra un nuevo cliente y le otorga TOKs de bienvenida.
     */
    registrarCliente(nombre, telefono = '') {
        const nombreLimpio = (nombre || '').trim();
        const telefonoLimpio = (telefono || '').trim();

        if (!nombreLimpio) {
            throw new Error('El nombre del cliente es obligatorio');
        }

        const existente = this.clientes.find((cliente) =>
            this.normalizarTexto(cliente.nombre) === this.normalizarTexto(nombreLimpio) &&
            this.normalizarTexto(cliente.telefono) === this.normalizarTexto(telefonoLimpio)
        );

        if (existente) {
            return existente;
        }

        const cliente = {
            id: this.generarId('cliente'),
            nombre: nombreLimpio,
            telefono: telefonoLimpio,
            fechaRegistro: this.obtenerFechaActual(),
            toks: 0,
            historialToks: [],
            nfts: [],
            nftActual: null
        };

        this.clientes.push(cliente);
        this.guardarClientes();
        this.otorgarToks(cliente.id, CONFIG.TOKENS.TOKS_POR_REGISTRO, 'bienvenida');

        return this.obtenerCliente(cliente.id);
    }

    obtenerCliente(id) {
        return this.clientes.find((cliente) => cliente.id === id) || null;
    }

    buscarClientePorNombre(nombre) {
        const termino = this.normalizarTexto(nombre);
        if (!termino) return [];

        return this.obtenerTodosLosClientes().filter((cliente) =>
            this.normalizarTexto(cliente.nombre).includes(termino)
        );
    }

    obtenerTodosLosClientes() {
        return [...this.clientes].sort((a, b) => {
            if (b.toks !== a.toks) {
                return b.toks - a.toks;
            }
            return new Date(b.fechaRegistro) - new Date(a.fechaRegistro);
        });
    }

    /**
     * Agrega TOKs a un cliente y guarda el movimiento en el historial.
     */
    otorgarToks(clienteId, cantidad, motivo = 'bonus') {
        const cliente = this.obtenerCliente(clienteId);
        const cantidadNumerica = Number(cantidad);

        if (!cliente || !Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0) {
            return null;
        }

        cliente.toks += cantidadNumerica;
        cliente.historialToks.push({
            fecha: this.obtenerFechaActual(),
            cantidad: cantidadNumerica,
            motivo,
            saldo: cliente.toks
        });

        this.guardarClientes();
        return cliente.toks;
    }

    /**
     * Resta TOKs disponibles del cliente.
     */
    canjearToks(clienteId, cantidad) {
        const cliente = this.obtenerCliente(clienteId);
        const cantidadNumerica = Number(cantidad);

        if (!cliente || !Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0 || cliente.toks < cantidadNumerica) {
            return false;
        }

        cliente.toks -= cantidadNumerica;
        cliente.historialToks.push({
            fecha: this.obtenerFechaActual(),
            cantidad: -cantidadNumerica,
            motivo: 'canje',
            saldo: cliente.toks
        });

        this.guardarClientes();
        return true;
    }

    obtenerSaldoToks(clienteId) {
        const cliente = this.obtenerCliente(clienteId);
        return cliente ? cliente.toks : 0;
    }

    obtenerHistorialToks(clienteId) {
        const cliente = this.obtenerCliente(clienteId);
        return cliente ? [...cliente.historialToks].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : [];
    }

    /**
     * Emite automáticamente el NFT más alto disponible si el cliente subió de nivel.
     */
    verificarYEmitirNFT(clienteId) {
        const cliente = this.obtenerCliente(clienteId);
        if (!cliente) return null;

        const nivelesDisponibles = this.obtenerDefinicionesNFT().filter((nivel) => cliente.toks >= nivel.minimo);
        if (nivelesDisponibles.length === 0) return null;

        const siguienteNivel = nivelesDisponibles[nivelesDisponibles.length - 1];
        if (cliente.nftActual === siguienteNivel.nivel) {
            return null;
        }

        const nft = {
            id: this.generarId(`nft_${siguienteNivel.nivel}`),
            clienteId: cliente.id,
            clienteNombre: cliente.nombre,
            nivel: siguienteNivel.nivel,
            nombre: siguienteNivel.nombre,
            color: siguienteNivel.color,
            descuento: siguienteNivel.descuento,
            fechaEmision: this.obtenerFechaActual(),
            toksAlEmitir: cliente.toks
        };

        cliente.nfts.push(nft);
        cliente.nftActual = siguienteNivel.nivel;
        this.nftsEmitidos.push(nft);

        this.guardarClientes();
        this.guardarNFTs();

        return nft;
    }

    obtenerNFTActivo(clienteId) {
        const cliente = this.obtenerCliente(clienteId);
        if (!cliente || !cliente.nftActual) return null;

        return cliente.nfts.find((nft) => nft.nivel === cliente.nftActual) || null;
    }

    obtenerTodosLosNFTs(clienteId) {
        const cliente = this.obtenerCliente(clienteId);
        return cliente ? [...cliente.nfts].sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision)) : [];
    }

    calcularToksPorVenta(venta = {}) {
        const monto = Number(venta.monto) || 0;
        const bloques = Math.floor(monto / CONFIG.PRECIO_UNITARIO);
        return Math.max(0, bloques * CONFIG.TOKENS.TOKS_POR_VENTA);
    }

    /**
     * Procesa una venta ligada a fidelización.
     */
    procesarVenta(clienteId, venta) {
        const toksOtorgados = this.calcularToksPorVenta(venta);

        if (toksOtorgados > 0) {
            this.otorgarToks(clienteId, toksOtorgados, 'compra');
        }

        const nftNuevo = this.verificarYEmitirNFT(clienteId);

        return {
            toksOtorgados,
            toksAcumulados: this.obtenerSaldoToks(clienteId),
            nftNuevo
        };
    }

    calcularDescuentoCliente(clienteId) {
        const nft = this.obtenerNFTActivo(clienteId);
        return nft ? nft.descuento : 0;
    }

    obtenerVentasCliente(clienteId) {
        const cliente = this.obtenerCliente(clienteId);
        if (!cliente) return [];

        const ventas = this.cargarJSON(CONFIG.STORAGE.VENTAS_KEY);
        const nombreCliente = this.normalizarTexto(cliente.nombre);

        return ventas.filter((venta) => {
            const coincideId = venta.clienteFidelizacionId && venta.clienteFidelizacionId === clienteId;
            const coincideNombre = !venta.clienteFidelizacionId && this.normalizarTexto(venta.cliente) === nombreCliente;
            return coincideId || coincideNombre;
        });
    }

    obtenerSiguienteNivel(clienteId) {
        const cliente = this.obtenerCliente(clienteId);
        if (!cliente) return null;

        return this.obtenerDefinicionesNFT().find((nivel) => cliente.toks < nivel.minimo) || null;
    }

    calcularProgresoSiguienteNivel(clienteId) {
        const cliente = this.obtenerCliente(clienteId);
        if (!cliente) {
            return {
                porcentaje: 0,
                restante: 0,
                siguienteNivel: null
            };
        }

        const siguienteNivel = this.obtenerSiguienteNivel(clienteId);
        if (!siguienteNivel) {
            return {
                porcentaje: 100,
                restante: 0,
                siguienteNivel: null
            };
        }

        const definiciones = this.obtenerDefinicionesNFT();
        const indice = definiciones.findIndex((nivel) => nivel.nivel === siguienteNivel.nivel);
        const minimoAnterior = indice > 0 ? definiciones[indice - 1].minimo : 0;
        const rango = Math.max(1, siguienteNivel.minimo - minimoAnterior);
        const avance = Math.max(0, cliente.toks - minimoAnterior);
        const porcentaje = Math.min(100, Math.round((avance / rango) * 100));

        return {
            porcentaje,
            restante: Math.max(0, siguienteNivel.minimo - cliente.toks),
            siguienteNivel
        };
    }

    obtenerLeaderboard(limite = 5) {
        return this.obtenerTodosLosClientes().slice(0, limite).map((cliente) => ({
            ...cliente,
            progreso: this.calcularProgresoSiguienteNivel(cliente.id),
            nft: this.obtenerNFTActivo(cliente.id)
        }));
    }

    obtenerResumenGeneral() {
        const hoy = this.obtenerClaveFecha();
        const toksOtorgadosHoy = this.clientes.reduce((total, cliente) => {
            const toksClienteHoy = (cliente.historialToks || []).reduce((subtotal, movimiento) => {
                const esHoy = this.obtenerClaveFecha(movimiento.fecha) === hoy;
                const esOtorgado = Number(movimiento.cantidad) > 0;
                return subtotal + (esHoy && esOtorgado ? Number(movimiento.cantidad) : 0);
            }, 0);

            return total + toksClienteHoy;
        }, 0);

        const nftsActivos = this.clientes.filter((cliente) => cliente.nftActual).length;

        return {
            totalClientes: this.clientes.length,
            toksOtorgadosHoy,
            nftsActivos
        };
    }
}

const sistemaFidelizacion = new SistemaFidelizacion();

if (typeof window !== 'undefined') {
    window.sistemaFidelizacion = sistemaFidelizacion;
}

if (typeof module !== 'undefined') {
    module.exports = SistemaFidelizacion;
}
