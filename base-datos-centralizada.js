// ================================================================
// BASE DE DATOS CENTRALIZADA - Sariel's Ecosystem
// ================================================================
// Fuente única de la verdad para el registro de ventas.
// Unifica los distintos nombres de función/clave que usan:
//   - panel-web3.html
//   - registro-ventas-centralizado.js
//   - dashboard-central.html (Dashboard Ventas)
//   - dashboard-central.html (Dashboard Central con IA)
//
// Requiere (opcional): config.js cargado antes, con
// window.CONFIG.SUPABASE_URL y window.CONFIG.SUPABASE_ANON_KEY.
// Si no existen, funciona 100% en modo local sin romperse.
//
// Columnas reales de la tabla 'ventas' en Supabase:
//   vendedorNombra, cliente, cantidad, metodo, monto, id,
//   fechaRegistro, vendedorId, sincronizado
// ================================================================

(function () {
  "use strict";

  // =========================
  // CONFIGURACIÓN
  // =========================
  const CONFIG_LOCAL = window.CONFIG || {};
  const SUPABASE_URL = CONFIG_LOCAL.SUPABASE_URL || 'https://nvyyxgkladjauolvpzfp.supabase.co';
  const SUPABASE_ANON_KEY = CONFIG_LOCAL.SUPABASE_ANON_KEY || 'sb_publishable_GWNmmwICFc2dkJx2BXdY8Q_-5qAC-Dg';
  const TABLA_VENTAS = 'ventas';

  // Clave única de localStorage (unificada). La clave vieja 'ventas'
  // se migra automáticamente una sola vez si existe.
  const STORAGE_KEY = 'ventas_centralizadas';
  const STORAGE_KEY_LEGACY = 'ventas';
  const MIGRACION_FLAG = 'ventas_migracion_v1_hecha';

  let supabaseClient = null;
  let remotoActivo = false;
  let ventasCache = [];

  // =========================
  // INICIALIZAR SUPABASE
  // =========================
  function initSupabase() {
    try {
      if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado para Base de Datos Centralizada (ventas)');
      } else {
        console.warn('⚠️ SDK de Supabase no disponible, Base de Datos Centralizada operará en modo local');
      }
    } catch (error) {
      console.error('❌ Error inicializando Supabase en base-datos-centralizada.js:', error);
    }
  }

  // =========================
  // MIGRACIÓN ÚNICA (clave vieja 'ventas' -> 'ventas_centralizadas')
  // =========================
  function migrarClaveLegacySiHaceFalta() {
    try {
      if (localStorage.getItem(MIGRACION_FLAG) === 'true') return;

      const actuales = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const legacy = JSON.parse(localStorage.getItem(STORAGE_KEY_LEGACY) || '[]');

      if (legacy.length > 0) {
        // Combinar sin duplicar (por fecha+monto+cliente como huella simple)
        const huellas = new Set(actuales.map(v => `${v.fechaRegistro || v.fecha}_${v.monto}_${v.cliente}`));
        const nuevas = legacy.filter(v => !huellas.has(`${v.fechaRegistro || v.fecha}_${v.monto}_${v.cliente}`));
        const combinadas = actuales.concat(nuevas);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combinadas));
        console.log(`✅ Migración: ${nuevas.length} ventas antiguas incorporadas desde la clave 'ventas'`);
      }

      localStorage.setItem(MIGRACION_FLAG, 'true');
    } catch (error) {
      console.warn('⚠️ No se pudo migrar la clave legacy de ventas:', error);
    }
  }

  // =========================
  // NORMALIZAR OBJETO VENTA
  // =========================
  // Acepta ventas escritas por cualquiera de los 4 módulos y las
  // deja con un shape consistente, sin perder los campos originales.
  function normalizarVenta(venta) {
    const ahora = new Date().toISOString();
    const nombreVendedor = venta.vendedorNombre || venta.vendedorNombra || venta.vendedor || 'Desconocido';

    return Object.assign({}, venta, {
      id: venta.id || ('venta_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
      cliente: venta.cliente || 'Anónimo',
      monto: Number(venta.monto) || 0,
      cantidad: venta.cantidad || 1,
      metodoPago: venta.metodoPago || venta.metodo || 'Efectivo',
      metodo: venta.metodo || venta.metodoPago || 'Efectivo',
      fecha: venta.fecha || venta.fechaRegistro || ahora,
      fechaRegistro: venta.fechaRegistro || venta.fecha || ahora,
      // Todos los nombres disponibles, para que ningún módulo quede huérfano:
      vendedorNombre: nombreVendedor,
      vendedorNombra: nombreVendedor,
      vendedor: nombreVendedor
    });
  }

  // =========================
  // CARGAR CACHÉ LOCAL
  // =========================
  function cargarCacheLocal() {
    try {
      ventasCache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
      console.error('❌ Error leyendo caché local de ventas:', error);
      ventasCache = [];
    }
  }

  function guardarCacheLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ventasCache));
    } catch (error) {
      console.error('❌ Error guardando caché local de ventas:', error);
    }
  }

  // =========================
  // CARGAR DESDE SUPABASE
  // =========================
  async function cargarDesdeServidor() {
    if (!supabaseClient) return;
    try {
      const { data, error } = await supabaseClient
        .from(TABLA_VENTAS)
        .select('*')
        .order('fechaRegistro', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        ventasCache = data.map(normalizarVenta);
        guardarCacheLocal();
        remotoActivo = true;
        window.dispatchEvent(new CustomEvent('sincronizacionCompleta'));
        console.log(`✅ ${ventasCache.length} ventas sincronizadas desde Supabase`);
      } else {
        remotoActivo = true; // conexión funcionó, solo no hay datos aún
      }
    } catch (error) {
      remotoActivo = false;
      console.warn('⚠️ No se pudo sincronizar ventas con Supabase, usando caché local:', error.message || error);
    }
  }

  // =========================
  // REGISTRAR VENTA
  // =========================
  function registrarVenta(venta) {
    const ventaNormalizada = normalizarVenta(venta);

    ventasCache.push(ventaNormalizada);
    guardarCacheLocal();

    // Intentar guardar en Supabase (no bloqueante)
    // Columnas reales de la tabla 'ventas': vendedorNombra, cliente,
    // cantidad, metodo, monto, id, fechaRegistro, vendedorId, sincronizado
    if (supabaseClient) {
      supabaseClient.from(TABLA_VENTAS).insert({
        id: ventaNormalizada.id,
        cliente: ventaNormalizada.cliente,
        monto: ventaNormalizada.monto,
        cantidad: ventaNormalizada.cantidad,
        metodo: ventaNormalizada.metodoPago,
        vendedorId: ventaNormalizada.vendedorId || null,
        vendedorNombra: ventaNormalizada.vendedorNombre,
        fechaRegistro: ventaNormalizada.fechaRegistro,
        sincronizado: true
      }).then(({ error }) => {
        if (error) {
          console.error('❌ Error guardando venta en Supabase (queda en caché local):', error);
        } else {
          console.log('✅ Venta guardada en Supabase');
        }
      });
    } else {
      console.log('ℹ️ Venta guardada solo localmente (Supabase no disponible)');
    }

    window.dispatchEvent(new CustomEvent('ventaRegistrada'));
    return ventaNormalizada;
  }

  // =========================
  // OBTENER VENTAS
  // =========================
  function obtenerTodasLasVentas() {
    return [...ventasCache];
  }

  function obtenerVentasDeHoy() {
    const hoy = new Date().toDateString();
    return ventasCache.filter(v => new Date(v.fechaRegistro || v.fecha).toDateString() === hoy);
  }

  function estaRemotoActivo() {
    return remotoActivo;
  }

  // =========================
  // INICIALIZAR TODO
  // =========================
  function iniciar() {
    initSupabase();
    migrarClaveLegacySiHaceFalta();
    cargarCacheLocal();
    if (supabaseClient) {
      cargarDesdeServidor();
    }
  }

  iniciar();

  // ================================================================
  // EXPONER TODOS LOS NOMBRES QUE LOS MÓDULOS YA BUSCAN
  // (así ningún archivo existente necesita cambiar cómo llama a esto)
  // ================================================================

  // --- Nombres usados por panel-web3.html y registro-ventas-centralizado.js ---
  window.registrarVentaCentralizada = registrarVenta;
  window.obtenerTodasLasVentas = obtenerTodasLasVentas;
  window.obtenerVentasDeHoy = obtenerVentasDeHoy;
  window.estaRemotoActivo = estaRemotoActivo;

  // --- Nombres usados por Dashboard Ventas ---
  window.obtenerVentasCentralizadas = obtenerTodasLasVentas;

  // --- Objeto bd.* (registro-ventas-centralizado.js) ---
  window.bd = window.bd || {};
  window.bd.registrarVenta = registrarVenta;
  window.bd.obtenerTodasLasVentas = obtenerTodasLasVentas;
  window.bd.obtenerVentasDeHoy = obtenerVentasDeHoy;
  window.bd.estaRemotoActivo = estaRemotoActivo;

  // --- Objeto BaseDatosCentralizada.* (Dashboard Ventas) ---
  window.BaseDatosCentralizada = window.BaseDatosCentralizada || {};
  window.BaseDatosCentralizada.registrarVenta = registrarVenta;
  window.BaseDatosCentralizada.obtenerVentas = obtenerTodasLasVentas;
  window.BaseDatosCentralizada.obtenerVentasDeHoy = obtenerVentasDeHoy;
  window.BaseDatosCentralizada.estaRemotoActivo = estaRemotoActivo;

  console.log('🗄️ Base de Datos Centralizada (ventas) inicializada — todos los módulos comparten la misma fuente');

})();