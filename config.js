/**
 * config.js
 * Configuración central de Csariel's Ecosystem.
 * 
 * ⚠️ IMPORTANTE: 
 * - Mi Red y Muro Live NO usan Trading ni Fidelización
 * - Servicios Comunitarios tiene su propio sistema de pagos
 * - Solo se mantiene Supabase y Web3 básico para conexión de wallets
 */
(function () {
  "use strict";

  const CONFIG = {
    // ================================================================
    // VERSIÓN
    // ================================================================
    VERSION: '2.0.0',

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
      // Solo para conexión de wallets, sin contratos de trading
      WALLETCONNECT_PROJECT_ID: "YOUR_WALLETCONNECT_PROJECT_ID"
    },

    // ================================================================
    // 🆕 WALLET DE PAGOS - Csariel's (SOLO PARA SERVICIOS COMUNITARIOS)
    // ================================================================
    WALLET_PAGOS: {
      // Dirección de la wallet para recibir pagos (DE LAS CAPTURAS)
      direccion: '0x45c6455aa01356609d96b659c6eb880b7e1d046d',
      
      // Red donde opera
      red: 'Polygon',
      
      // Tokens aceptados
      tokens: ['USDC', 'USDT', 'MATIC'],
      
      // Comisiones
      comision: {
        consulta: 0.01,      // 1% por consulta de $5 MXN
        suscripcion: 0.01,   // 1% por suscripción
        topeMinimo: 1,       // Mínimo 1 MXN para comisiones pequeñas
      }
    },

    // ================================================================
    // 🆕 PRECIOS - SERVICIOS COMUNITARIOS
    // ================================================================
    PRECIOS_SERVICIOS: {
      consulta: 5,            // $5 MXN por consulta
      suscripcionSemestral: 150,  // $150 MXN cada 6 meses
      suscripcionAnual: 250,      // $250 MXN al año
      prestadorSemestral: 50,     // $50 MXN cada 6 meses para prestadores
    },

    // ================================================================
    // 🆕 DOMINIOS EDUCATIVOS (para verificación en Mi Red)
    // ================================================================
    DOMINIOS_EDU: [
      '.edu', '.edu.mx', '.edu.co', '.edu.ar', '.edu.pe',
      '.edu.ec', '.edu.gt', '.edu.ve', '.edu.bo', '.edu.py',
      '.edu.uy', '.edu.cl', '.edu.pa', '.edu.cr', '.edu.do'
    ],

    // ================================================================
    // 🆕 UNIVERSIDADES RECONOCIDAS (para verificación en Mi Red)
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
    // 🆕 CONFIGURACIÓN DE SERVICIOS COMUNITARIOS
    // ================================================================
    SERVICIOS: {
      // Categorías disponibles
      categorias: [
        'mecanico', 'llantera', 'grua', 'gasolina', 'plomero',
        'electricista', 'albañil', 'tecnico', 'celular', 'limpieza',
        'mudanza', 'transporte', 'comida', 'medico', 'farmacia',
        'profesor', 'veterinario', 'cerrajero', 'jardineria', 'aire',
        'diseno', 'otros'
      ],
      
      // Métodos de pago aceptados por prestadores
      metodosPago: [
        'wallet', 'clabe', 'paypal', 'transferencia', 'efectivo'
      ],
      
      // Configuración de moderación
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
  // 🆕 HELPERS PARA SERVICIOS COMUNITARIOS
  // ================================================================

  /**
   * Calcular comisión para Csariel's
   */
  window.calcularComision = function calcularComision(monto, tipo = 'consulta') {
    const comisionPorcentaje = tipo === 'consulta' 
      ? CONFIG.WALLET_PAGOS.comision.consulta 
      : CONFIG.WALLET_PAGOS.comision.suscripcion;
    
    let comision = monto * comisionPorcentaje;
    const tope = CONFIG.WALLET_PAGOS.comision.topeMinimo;
    
    if (comision < tope && monto > 0) {
      comision = tope;
    }
    
    return {
      comision: parseFloat(comision.toFixed(2)),
      porcentaje: comisionPorcentaje * 100,
      montoNeto: parseFloat((monto - comision).toFixed(2))
    };
  };

  /**
   * Generar datos de pago para mostrar al usuario
   */
  window.generarDatosPago = function generarDatosPago(token = 'USDC') {
    const wallet = CONFIG.WALLET_PAGOS.direccion;
    const red = CONFIG.WALLET_PAGOS.red;
    const tokensAceptados = CONFIG.WALLET_PAGOS.tokens;
    
    return {
      wallet,
      red,
      token,
      tokensAceptados,
      mensaje: `Únicamente envía ${token} en la red ${red} a esta dirección. Si envías otra criptomoneda, podría perderse.`,
      direccionFormateada: wallet.slice(0, 6) + '...' + wallet.slice(-4)
    };
  };

  /**
   * Validar email institucional (para Mi Red)
   */
  window.esEmailInstitucional = function esEmailInstitucional(email) {
    if (!email) return false;
    const emailLower = email.toLowerCase();
    return CONFIG.DOMINIOS_EDU.some(dom => emailLower.endsWith(dom));
  };

  /**
   * Obtener universidad desde email (para Mi Red)
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

  /**
   * Generar ID único
   */
  window.generarId = function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  /**
   * Formatear fecha
   */
  window.formatearFecha = function formatearFecha(timestamp) {
    const fecha = new Date(timestamp);
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ================================================================
  // CONSOLA - INFORMACIÓN DE CARGA
  // ================================================================
  
  console.log('◈ Csariel\'s Ecosystem - Configuración cargada');
  console.log(`📦 Versión: ${CONFIG.VERSION}`);
  console.log(`🔗 Supabase: ${CONFIG.SUPABASE_URL}`);
  console.log(`💰 Wallet Pagos (Servicios): ${CONFIG.WALLET_PAGOS.direccion.slice(0, 10)}...${CONFIG.WALLET_PAGOS.direccion.slice(-6)}`);
  console.log(`🌐 Red: ${CONFIG.WALLET_PAGOS.red}`);
  console.log(`📋 ${CONFIG.SERVICIOS.categorias.length} categorías de servicios`);
  console.log(`✅ SIN Trading · SIN Fidelización · Solo Mi Red · Muro Live · Servicios`);

})();