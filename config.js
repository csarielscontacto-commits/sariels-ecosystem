/**
 * config.js
 * Configuración central de Csariel's Ecosystem.
 * Versión unificada para: Muro Live, Mi Red, Servicios Comunitarios y Donaciones en Directo.
 * 
 * ⚠️ IMPORTANTE: 
 * - Mi Red y Muro Live NO usan Trading ni Fidelización
 * - Servicios Comunitarios tiene su propio sistema de pagos
 * - Donaciones en Directo: 50% Csariel's · 50% Streamer
 * - Soporte para USDT, USDC y TOK (Utility Token 1:1 con USDT)
 * 
 * Debe cargarse ANTES que módulos que consumen CONFIG.
 */
(function () {
  "use strict";

  const CONFIG = {
    // ================================================================
    // VERSIÓN
    // ================================================================
    VERSION: '2.1.0',

    // ================================================================
    // SUPABASE (remoto)
    // ================================================================
    SUPABASE_URL: "https://nvyyxgkladjauolvpzfp.supabase.co",
    SUPABASE_ANON_KEY: "sb_publishable_GWNmmwICFc2dkJx2BXdY8Q_-5qAC-Dg",
    SUPABASE_KEY: "sb_publishable_GWNmmwICFc2dkJx2BXdY8Q_-5qAC-Dg",

    // ================================================================
    // WEB3 - CONFIGURACIÓN BÁSICA (solo para conectar wallets)
    // ================================================================
    WEB3: {
      CHAIN: {
        ID: 80002,
        HEX_ID: "0x13882",
        NAME: "Polygon Amoy",
        RPC_URL: "https://rpc-amoy.polygon.technology",
        EXPLORER: "https://amoy.polygonscan.com"
      },
      WALLETCONNECT_PROJECT_ID: "YOUR_WALLETCONNECT_PROJECT_ID"
    },

    // ================================================================
    // WALLET DE PAGOS - Csariel's (Para comisiones de donaciones)
    // ================================================================
    WALLET_PAGOS: {
      // Dirección de la wallet para recibir pagos (DE LAS CAPTURAS)
      direccion: '0x45c6455aa01356609d96b659c6eb880b7e1d046d',
      red: 'Polygon',
      tokens: ['USDC', 'USDT', 'MATIC', 'TOK']
    },

    // ================================================================
    // COMISIONES DE DIRECTOS
    // ================================================================
    COMISIONES: {
      directo: 0.50,      // 50% para Csariel's
      streamer: 0.50,     // 50% para el streamer
      topeMinimo: 0.50    // Mínimo 0.50 USDT para donación
    },

    // ================================================================
    // TOKEN UTILITY (Csariel's Token - 1:1 con USDT)
    // ================================================================
    TOKEN_UTILITY: {
      simbolo: 'TOK',
      nombre: 'Csariel\'s Token',
      decimales: 18,
      ratioUSDT: 1,       // 1 TOK = 1 USDT
      contrato: '0x0000000000000000000000000000000000000000', // Reemplazar cuando se despliegue
      activo: false       // Cambiar a true cuando el token esté desplegado
    },

    // ================================================================
    // PRECIOS - SERVICIOS COMUNITARIOS
    // ================================================================
    PRECIOS_SERVICIOS: {
      consulta: 5,                // $5 MXN por consulta
      suscripcionSemestral: 150,  // $150 MXN cada 6 meses
      suscripcionAnual: 250,      // $250 MXN al año
      prestadorSemestral: 50,     // $50 MXN cada 6 meses para prestadores
    },

    // ================================================================
    // DOMINIOS EDUCATIVOS (para verificación en Mi Red)
    // ================================================================
    DOMINIOS_EDU: [
      '.edu', '.edu.mx', '.edu.co', '.edu.ar', '.edu.pe',
      '.edu.ec', '.edu.gt', '.edu.ve', '.edu.bo', '.edu.py',
      '.edu.uy', '.edu.cl', '.edu.pa', '.edu.cr', '.edu.do'
    ],

    // ================================================================
    // UNIVERSIDADES RECONOCIDAS (para verificación en Mi Red)
    // ================================================================
    UNIVERSIDADES: {
      'udlap.mx': 'UDLAP',
      'buap.mx': 'BUAP',
      'ibero.mx': 'Ibero Puebla',
      'tec.mx': 'Tec de Monterrey',
      'upaep.mx': 'UPAEP',
      'uv.mx': 'UV',
      'unam.mx': 'UNAM',
      'ipn.mx': 'IPN',
      'uanl.mx': 'UANL',
      'ugto.mx': 'UGTO',
      'umich.mx': 'UMSNH',
      'uach.mx': 'UACH',
      'uaslp.mx': 'UASLP',
      'ujed.mx': 'UJED',
      'uabc.mx': 'UABC',
      'uadec.mx': 'UAdeC',
      'uaq.mx': 'UAQ',
      'uady.mx': 'UADY',
      'ujat.mx': 'UJAT',
      'uac.mx': 'UAC'
    },

    // ================================================================
    // CONFIGURACIÓN DE SERVICIOS COMUNITARIOS
    // ================================================================
    SERVICIOS: {
      categorias: [
        'mecanico', 'llantera', 'grua', 'gasolina', 'plomero',
        'electricista', 'albañil', 'tecnico', 'celular', 'limpieza',
        'mudanza', 'transporte', 'comida', 'medico', 'farmacia',
        'profesor', 'veterinario', 'cerrajero', 'jardineria', 'aire',
        'diseno', 'otros'
      ],
      metodosPago: ['wallet', 'clabe', 'paypal', 'transferencia', 'efectivo'],
      moderacion: {
        umbralSpam: 3,
        maxEmojisConsecutivos: 5,
        maxMayusculasConsecutivas: 5,
        maxPalabrasRepetidas: 3,
        confianzaMinima: 60,
        confianzaServicio: 50
      }
    }
  };

  // ================================================================
  // EXPOSICIÓN GLOBAL
  // ================================================================
  window.CONFIG = CONFIG;

  // ================================================================
  // CLIENTE SUPABASE
  // ================================================================
  window.supabaseClient =
    (typeof window.supabase !== "undefined" && window.supabase?.createClient)
      ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
      : null;

  // ================================================================
  // HELPERS GLOBALES
  // ================================================================
  window.log = (...args) => console.log(...args);
  window.logError = (...args) => console.error(...args);

  // ================================================================
  // HELPERS PARA DONACIONES EN DIRECTO
  // ================================================================

  /**
   * Calcula comisión para el directo
   * @param {number} monto - Monto de la donación
   * @param {string} token - Token utilizado (USDT, USDC, TOK)
   * @returns {Object} Desglose de la donación
   */
  window.calcularComisionDirecto = function calcularComisionDirecto(monto, token = 'USDT') {
    const comisionPorcentaje = CONFIG.COMISIONES.directo;
    const streamerPorcentaje = CONFIG.COMISIONES.streamer;
    const topeMinimo = CONFIG.COMISIONES.topeMinimo;

    let comision = monto * comisionPorcentaje;
    let streamerMonto = monto * streamerPorcentaje;

    // Asegurar mínimo
    if (comision < topeMinimo && monto > 0) {
      comision = topeMinimo;
      streamerMonto = monto - topeMinimo;
    }

    return {
      montoTotal: parseFloat(monto.toFixed(2)),
      comision: parseFloat(comision.toFixed(2)),
      streamerMonto: parseFloat(streamerMonto.toFixed(2)),
      porcentajeCsariels: comisionPorcentaje * 100,
      porcentajeStreamer: streamerPorcentaje * 100,
      token: token,
      walletCsariels: CONFIG.WALLET_PAGOS.direccion,
      red: CONFIG.WALLET_PAGOS.red
    };
  };

  /**
   * Genera un ID único para transacciones
   */
  window.generarId = function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  };

  /**
   * Formatea una dirección de wallet para mostrar
   */
  window.formatearWallet = function formatearWallet(direccion) {
    if (!direccion) return '--';
    return direccion.slice(0, 6) + '...' + direccion.slice(-4);
  };

  /**
   * Verifica si una dirección es una wallet válida
   */
  window.esWalletValida = function esWalletValida(direccion) {
    return /^0x[a-fA-F0-9]{40}$/.test(direccion);
  };

  /**
   * Obtiene el símbolo del token por defecto
   */
  window.obtenerTokenPorDefecto = function obtenerTokenPorDefecto() {
    return CONFIG.WALLET_PAGOS.tokens[0] || 'USDT';
  };

  /**
   * Verifica si el token es soportado
   */
  window.tokenSoportado = function tokenSoportado(token) {
    return CONFIG.WALLET_PAGOS.tokens.includes(token.toUpperCase());
  };

  // ================================================================
  // HELPERS PARA VERIFICACIÓN EDU
  // ================================================================

  /**
   * Validar email institucional
   */
  window.esEmailInstitucional = function esEmailInstitucional(email) {
    if (!email) return false;
    const emailLower = email.toLowerCase();
    return CONFIG.DOMINIOS_EDU.some(dom => emailLower.endsWith(dom));
  };

  /**
   * Obtener universidad desde email
   */
  window.obtenerUniversidad = function obtenerUniversidad(email) {
    if (!email) return 'Universidad';
    const domain = email.split('@')[1];
    if (!domain) return 'Universidad';
    for (const [key, value] of Object.entries(CONFIG.UNIVERSIDADES)) {
      if (domain.includes(key)) {
        return value;
      }
    }
    return 'Universidad';
  };

  // ================================================================
  // CONSOLA - INFORMACIÓN DE CARGA
  // ================================================================
  console.log('◈ Csariel\'s Ecosystem - Configuración cargada');
  console.log(`📦 Versión: ${CONFIG.VERSION}`);
  console.log(`🔗 Supabase: ${CONFIG.SUPABASE_URL}`);
  console.log(`💰 Wallet Csariel's: ${CONFIG.WALLET_PAGOS.direccion.slice(0, 10)}...${CONFIG.WALLET_PAGOS.direccion.slice(-6)}`);
  console.log(`📊 Comisión Directos: ${CONFIG.COMISIONES.directo * 100}% Csariel's · ${CONFIG.COMISIONES.streamer * 100}% Streamer`);
  console.log(`🪙 Utility Token: ${CONFIG.TOKEN_UTILITY.simbolo} (${CONFIG.TOKEN_UTILITY.activo ? '✅ Activo' : '⏳ Próximamente'})`);
  console.log(`📋 ${CONFIG.SERVICIOS.categorias.length} categorías de servicios`);
  console.log(`✅ SIN Trading · SIN Fidelización · Solo Mi Red · Muro Live · Servicios · Donaciones`);

})();