const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const MensajeriaIA = require('./mensajeria');

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, '../ia-data/datos_historicos');

app.use(cors());
app.use(express.json());

async function asegurarDirectorioDatos() {
    await fs.mkdir(DATA_PATH, { recursive: true });
}

async function leerArchivo(nombre) {
    try {
        const ruta = path.join(DATA_PATH, nombre);
        const data = await fs.readFile(ruta, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function guardarArchivo(nombre, data) {
    await asegurarDirectorioDatos();
    const ruta = path.join(DATA_PATH, nombre);
    await fs.writeFile(ruta, JSON.stringify(data, null, 2));
    return { success: true };
}

app.post('/api/ventas', async (req, res) => {
    try {
        const nuevaVenta = {
            ...req.body,
            fecha: new Date().toISOString(),
            id: Date.now()
        };
        const ventas = await leerArchivo('ventas.json');
        ventas.push(nuevaVenta);
        await guardarArchivo('ventas.json', ventas);

        const mensajes = await MensajeriaIA.procesarVenta(nuevaVenta);

        res.status(201).json({
            message: 'Venta registrada',
            venta: nuevaVenta,
            mensajesGenerados: mensajes
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/ventas', async (req, res) => {
    try {
        const ventas = await leerArchivo('ventas.json');
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/clientes', async (req, res) => {
    try {
        const ventas = await leerArchivo('ventas.json');
        const clientesMap = new Map();
        ventas.forEach(v => {
            if (!clientesMap.has(v.clienteId)) {
                clientesMap.set(v.clienteId, {
                    id: v.clienteId,
                    nombre: v.clienteNombre || `Cliente ${v.clienteId}`,
                    totalCompras: 0,
                    totalGastado: 0,
                    ultimaCompra: v.fecha
                });
            }
            const cliente = clientesMap.get(v.clienteId);
            cliente.totalCompras += 1;
            cliente.totalGastado += v.monto || 0;
            if (new Date(v.fecha) > new Date(cliente.ultimaCompra)) {
                cliente.ultimaCompra = v.fecha;
            }
        });
        res.json(Array.from(clientesMap.values()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/predicciones', async (req, res) => {
    try {
        const { tipo, data } = req.body;
        await guardarArchivo(`prediccion_${tipo}.json`, {
            timestamp: Date.now(),
            data: data
        });
        res.json({ message: 'Predicción guardada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/predicciones/:tipo', async (req, res) => {
    try {
        const { tipo } = req.params;
        const prediccion = await leerArchivo(`prediccion_${tipo}.json`);
        res.json(prediccion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

asegurarDirectorioDatos()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ API de IA Sariel corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Error inicializando directorio de datos:', error.message);
        process.exit(1);
    });
