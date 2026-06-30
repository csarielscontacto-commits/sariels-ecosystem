/**
 * config.js
 * Configuración central de Sariel's Ecosystem.
 * IMPORTANTE: este archivo debe ir DESPUÉS de cargar el SDK de Supabase:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="config.js"></script>
 */

const CONFIG = {
    SUPABASE_URL: 'https://nvyyxgkladjauolvpzfp.supabase.co',
    SUPABASE_KEY: 'sb_publishable_GWNmmwICFc2dkJx2BXdY8Q_-5qAC-Dg',

    PRECIO_UNITARIO: 75,
    MONEDA: 'MXN',
    SIMBOLO_MONEDA: '$',

    METAS: {
        DIARIA: 10000
    },

    FIDELIZACION: {
        TOKS_PARA_NFT: 12,
        NIVELES: [
            { nombre: 'diamante', minimo: 1000 },
            { nombre: 'oro', minimo: 600 },
            { nombre: 'plata', minimo: 300 },
            { nombre: 'bronce', minimo: 100 }
        ]
    }
};

// Cliente único de Supabase, reutilizado por toda la app
const supabaseClient = (typeof window.supabase !== 'undefined')
    ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY)
    : null;

if (!supabaseClient) {
    console.error('⚠️ El SDK de Supabase no está cargado. Agrega <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> ANTES de config.js');
}

function log(...args) { console.log(...args); }
function logError(...args) { console.error(...args); }

function formatearPrecio(cantidadProductos) {
    const total = (Number(cantidadProductos) || 0) * CONFIG.PRECIO_UNITARIO;
    return `${CONFIG.SIMBOLO_MONEDA}${total.toLocaleString('es-MX')} ${CONFIG.MONEDA}`;
}

function calcularNivelPorToks(toksTotales) {
    const niveles = CONFIG.FIDELIZACION.NIVELES;
    for (const n of niveles) {
        if (toksTotales >= n.minimo) return n.nombre;
    }
    return 'sin nivel';
}

