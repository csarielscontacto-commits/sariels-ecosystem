/**
 * config.js
 * Configuración central de Sariel's Ecosystem.
 * Debe cargarse ANTES que módulos que consumen CONFIG.
 */
(function () {
  "use strict";

  const CONFIG = {
    // =========================
    // Supabase (remoto)
    // =========================
    SUPABASE_URL: "https://nvyyxgkladjauolvpzfp.supabase.co",

    // CLAVE CORREGIDA: base-datos-centralizada.js espera SUPABASE_ANON_KEY
    SUPABASE_ANON_KEY: "sb_publishable_GWNmmwICFc2dkJx2BXdY8Q_-5qAC-Dg",

    // Compatibilidad temporal con código legado que aún lea SUPABASE_KEY
    SUPABASE_KEY: "sb_publishable_GWNmmwICFc2dkJx2BXdY8Q_-5qAC-Dg",

    // =========================
    // Negocio
    // =========================
    PRECIO_UNITARIO: 75,
    MONEDA: "MXN",
    SIMBOLO_MONEDA: "$",

    METAS: {
      DIARIA: 10000
    },

    FIDELIZACION: {
      TOKS_PARA_NFT: 12,
      NIVELES: [
        { nombre: "diamante", minimo: 1000 },
        { nombre: "oro", minimo: 600 },
        { nombre: "plata", minimo: 300 },
        { nombre: "bronce", minimo: 100 }
      ]
    },

    // =========================
    // Web3 Rewards (Amoy)
    // =========================
    WEB3_REWARDS: {
      CHAIN: {
        ID: 80002,
        HEX_ID: "0x13882",
        NAME: "Polygon Amoy",
        RPC_URL: "https://rpc-amoy.polygon.technology",
        EXPLORER: "https://amoy.polygonscan.com"
      },

      // IMPORTANTE: reemplaza estos placeholders por direcciones reales de deploy
      STOK_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
      SNFT_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
      REWARD_NFT_ADDRESS: "0x0000000000000000000000000000000000000000",

      // WalletConnect v2 Project ID
      WALLETCONNECT_PROJECT_ID: "YOUR_WALLETCONNECT_PROJECT_ID",

      // Parámetros funcionales usados por fidelizacion/claim
      TOKS_UMBRAL_CANJE: 12,
      TOKS_POR_GALLETA: 1,

      // Catálogo QR para claim.html
      QR_CODES_URL: "https://raw.githubusercontent.com/csarielscontacto-commits/sariels-ecosystem/main/data/codigos-qr.json"
    }
  };

  // Exposición global explícita (crítica para módulos legacy)
  window.CONFIG = CONFIG;

  // Cliente Supabase opcional global (solo si SDK está cargado)
  window.supabaseClient =
    (typeof window.supabase !== "undefined" && window.supabase?.createClient)
      ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
      : null;

  // Helpers globales usados en varias pantallas
  window.log = (...args) => console.log(...args);
  window.logError = (...args) => console.error(...args);

  window.formatearPrecio = function formatearPrecio(cantidadProductos) {
    const total = (Number(cantidadProductos) || 0) * CONFIG.PRECIO_UNITARIO;
    return `${CONFIG.SIMBOLO_MONEDA}${total.toLocaleString("es-MX")} ${CONFIG.MONEDA}`;
  };

  window.calcularNivelPorToks = function calcularNivelPorToks(toksTotales) {
    const niveles = CONFIG.FIDELIZACION.NIVELES;
    for (const n of niveles) {
      if (Number(toksTotales) >= n.minimo) return n.nombre;
    }
    return "sin nivel";
  };
})();
