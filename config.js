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
    },

    WEB3_REWARDS: {
        ADMIN_WALLET: '0x8F742964244AE588dF7C5B2b27Ded374fDdAd69b',
        STRICT_ADMIN_ONLY: true,
        AUTO_SWITCH: true,
        TOKS_POR_GALLETA: 1,
        TOKS_UMBRAL_CANJE: 12,
        WALLETCONNECT_PROJECT_ID: '',
        STOK_CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
        SNFT_CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
        REWARD_NFT_ADDRESS: '0x0000000000000000000000000000000000000000',
        QR_CODES_URL: 'https://raw.githubusercontent.com/csarielscontacto-commits/sariels-ecosystem/main/data/codigos-qr.json',
        STORAGE_KEY: 'sariel_wallet_overlay_v1',
        CHAIN: {
            ID: 80002,
            HEX_ID: '0x13882',
            NAME: 'Polygon Amoy',
            RPC_URL: 'https://rpc-amoy.polygon.technology',
            EXPLORER: 'https://amoy.polygonscan.com'
        },
        WINDOW: {
            ID: 'sariel-wallet-overlay',
            DEFAULT_VIEW: 'connect',
            TITLE: 'Sariel Wallet',
            ENABLE_FLOATING_OVERLAY: true
        }
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
