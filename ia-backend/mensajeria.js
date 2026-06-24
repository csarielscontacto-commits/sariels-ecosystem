const fs = require('fs').promises;
const path = require('path');
const SincronizadorWeb3 = require('./sincronizador');

const DATA_PATH = path.join(__dirname, '../ia-data/datos_historicos');
const MENSAJES_PATH = path.join(DATA_PATH, 'mensajes.json');
const VENTAS_PATH = path.join(DATA_PATH, 'ventas.json');

const sincronizador = new SincronizadorWeb3();

async function asegurarDirectorioDatos() {
    await fs.mkdir(DATA_PATH, { recursive: true });
}

async function leerJson(ruta, valorPorDefecto) {
    try {
        const data = await fs.readFile(ruta, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return valorPorDefecto;
    }
}

async function leerMensajes() {
    await asegurarDirectorioDatos();
    return leerJson(MENSAJES_PATH, []);
}

async function guardarMensajes(mensajes) {
    await asegurarDirectorioDatos();
    await fs.writeFile(MENSAJES_PATH, JSON.stringify(mensajes, null, 2));
}

class MensajeriaIA {
    static async generarMensaje(tipo, clienteId, datos) {
        const templates = {
            VENTA: (d) => `✅ ¡Gracias por tu compra de ${d.producto || 'Domo Galleta'}! Has ganado +1 TOK.`,
            NFT: (d) => `🎉 ¡Felicidades, ${d.nombre || 'cliente'}! Has alcanzado ${d.toks} TOKs. Canjea tu NFT.`,
            CHURN: (d) => `🍪 ¡Te extrañamos, ${d.nombre || 'cliente'}! Vuelve con 15% descuento.`,
            PROMO: (d) => `🌟 ${d.nombre || 'Cliente'}, eres premium. 10% descuento en tu próxima compra.`
        };
        const texto = templates[tipo] ? templates[tipo](datos) : `Mensaje ${tipo} para ${clienteId}`;
        return {
            id: Date.now(),
            fecha: new Date().toISOString(),
            tipo: tipo,
            clienteId: clienteId,
            texto: texto,
            estado: 'pendiente',
            metadata: datos
        };
    }
    
    static async guardarMensaje(mensaje) {
        const mensajes = await leerMensajes();
        mensajes.unshift(mensaje);
        await guardarMensajes(mensajes.slice(0, 200));
        return mensaje;
    }
    
    static async procesarVenta(venta) {
        const mensajes = [];
        const clienteId = venta.clienteId;
        const clienteNombre = venta.clienteNombre || 'cliente';
        
        const msgVenta = await this.generarMensaje('VENTA', clienteId, {
            producto: venta.producto || 'Domo Galleta'
        });
        mensajes.push(await this.guardarMensaje(msgVenta));
        
        const toks = await this.obtenerTOKs(clienteId);
        if (toks >= 12) {
            const msgNFT = await this.generarMensaje('NFT', clienteId, {
                nombre: clienteNombre,
                toks: toks
            });
            mensajes.push(await this.guardarMensaje(msgNFT));
        }
        
        const totalCompras = await this.contarCompras(clienteId);
        if (totalCompras >= 10) {
            const msgPromo = await this.generarMensaje('PROMO', clienteId, {
                nombre: clienteNombre
            });
            mensajes.push(await this.guardarMensaje(msgPromo));
        }
        
        return mensajes;
    }
    
    static async detectarChurn(umbralDias = 15) {
        const ventas = await leerJson(VENTAS_PATH, []);
        const clientesMap = new Map();
        ventas.forEach(v => {
            if (!clientesMap.has(v.clienteId)) {
                clientesMap.set(v.clienteId, {
                    id: v.clienteId,
                    nombre: v.clienteNombre || 'cliente',
                    ultimaCompra: v.fecha
                });
            }
            const cliente = clientesMap.get(v.clienteId);
            if (new Date(v.fecha) > new Date(cliente.ultimaCompra)) {
                cliente.ultimaCompra = v.fecha;
            }
        });
        const hoy = new Date();
        const mensajes = [];
        for (const [id, cliente] of clientesMap) {
            const diasSinCompra = (hoy - new Date(cliente.ultimaCompra)) / (1000 * 60 * 60 * 24);
            if (diasSinCompra > umbralDias) {
                const msgChurn = await this.generarMensaje('CHURN', id, {
                    nombre: cliente.nombre,
                    dias: Math.floor(diasSinCompra)
                });
                mensajes.push(await this.guardarMensaje(msgChurn));
            }
        }
        return mensajes;
    }
    
    static async obtenerTOKs(clienteId) {
        try {
            return await sincronizador.obtenerTOKs(clienteId);
        } catch (error) {
            return 0;
        }
    }
    
    static async contarCompras(clienteId) {
        const ventas = await leerJson(VENTAS_PATH, []);
        return ventas.filter((venta) => venta.clienteId === clienteId).length;
    }
}

module.exports = MensajeriaIA;
