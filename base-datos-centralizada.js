(function () {
  "use strict";

  // =========================
  // Configuración básica
  // =========================
  const LS_KEY = "ventas";
  const TABLA = "ventas";
  const CHANNEL = "sariels-sync-channel";
  const TIMEOUT_MS = 8000;

  let supabase = null;
  let remotoActivo = false;
  let inicializado = false;
  let bc = null;

  // =========================
  // Utilidades seguras
  // =========================
  const log = (...a) => console.log("[BD]", ...a);
  const warn = (...a) => console.warn("[BD]", ...a);
  const err = (...a) => console.error("[BD]", ...a);

  function safeParse(text, fallback = []) {
    try {
      const v = JSON.parse(text);
      return Array.isArray(v) ? v : fallback;
    } catch {
      return fallback;
    }
  }

  function leerLocal() {
    return safeParse(localStorage.getItem(LS_KEY), []);
  }

  function guardarLocal(ventas) {
    localStorage.setItem(LS_KEY, JSON.stringify(ventas));
  }

  function uid() {
    return "v_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function normalizarVenta(v = {}) {
    return {
      idLocal: v.idLocal || uid(),
      vendedorId: v.vendedorId ?? null,
      vendedorNombre: (v.vendedorNombre || "N/A").toString(),
      cantidad: Number.isFinite(Number(v.cantidad)) ? Number(v.cantidad) : 1,
      cliente: (v.cliente || "Anónimo").toString().trim() || "Anónimo",
      metodo: (v.metodo || "N/A").toString(),
      monto: Number.isFinite(Number(v.monto)) ? Number(v.monto) : 0,
      fechaRegistro: v.fechaRegistro || nowISO(),
      sincronizado: !!v.sincronizado
    };
  }

  function ordenarDescPorFecha(arr) {
    return [...arr].sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));
  }

  function ventasDelDia(ventas, fecha = new Date()) {
    const y = fecha.getFullYear();
    const m = fecha.getMonth();
    const d = fecha.getDate();
    return ventas.filter((v) => {
      const f = new Date(v.fechaRegistro);
      return f.getFullYear() === y && f.getMonth() === m && f.getDate() === d;
    });
  }

  function obtenerStats(ventas) {
    const totalVentas = ventas.length;
    const ingresoTotal = ventas.reduce((s, v) => s + (Number(v.monto) || 0), 0);

    const hoy = ventasDelDia(ventas);
    const ventasHoy = hoy.length;
    const ingresoHoy = hoy.reduce((s, v) => s + (Number(v.monto) || 0), 0);

    const meta = Number(window.CONFIG?.METAS?.DIARIA || 10000);
    const porcentajeMeta = meta > 0 ? (ingresoHoy / meta) * 100 : 0;
    const ventaPromedio = totalVentas > 0 ? ingresoTotal / totalVentas : 0;

    return { totalVentas, ingresoTotal, ventasHoy, ingresoHoy, porcentajeMeta, ventaPromedio };
  }

  function emitir(nombre, detail = {}) {
    window.dispatchEvent(new CustomEvent(nombre, { detail }));
    if (bc) {
      try { bc.postMessage({ nombre, detail }); } catch (_) {}
    }
  }

  function actualizarEstadoSync(texto = "✅ Sincronizado") {
    const el = document.getElementById("syncTxt");
    if (el) el.textContent = texto;
  }

  // =========================
  // BroadcastChannel para multi-tab
  // =========================
  function initBroadcast() {
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.onmessage = (e) => {
        if (!e?.data?.nombre) return;
        if (e.data.nombre === "ventaRegistrada" || e.data.nombre === "sincronizacionCompleta") {
          window.dispatchEvent(new CustomEvent(e.data.nombre, { detail: e.data.detail || {} }));
        }
      };
    } catch {
      bc = null;
    }
  }

  // =========================
  // Supabase init robusto
  // =========================
  function withTimeout(promise, ms, label = "timeout") {
    let t;
    const timeout = new Promise((_, reject) => {
      t = setTimeout(() => reject(new Error(label)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
  }

  async function cargarSDKSupabase() {
    if (window.supabase?.createClient) return true;

    await withTimeout(new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("No se pudo cargar supabase-js"));
      document.head.appendChild(s);
    }), TIMEOUT_MS, "Carga SDK Supabase excedió tiempo");

    return !!window.supabase?.createClient;
  }

  async function initRemoto() {
    try {
      const url = window.CONFIG?.SUPABASE_URL;
      const anon = window.CONFIG?.SUPABASE_ANON_KEY;

      if (!url || !anon) {
        warn("CONFIG incompleta. Modo local.");
        remotoActivo = false;
        return false;
      }

      await cargarSDKSupabase();

      supabase = window.supabase.createClient(url, anon, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });

      const ping = supabase.from(TABLA).select("id", { count: "exact", head: true });
      const { error } = await withTimeout(ping, TIMEOUT_MS, "Ping Supabase excedió tiempo");

      if (error) {
        warn("Supabase no activo:", error.message);
        remotoActivo = false;
        return false;
      }

      remotoActivo = true;
      log("Supabase conectado.");
      return true;
    } catch (e) {
      warn("initRemoto fallo:", e.message || e);
      remotoActivo = false;
      return false;
    }
  }

  // =========================
  // Operaciones remotas
  // =========================
  async function pullRemoto() {
    if (!remotoActivo || !supabase) return leerLocal();

    const q = supabase
      .from(TABLA)
      .select("vendedorId,vendedorNombre,cantidad,cliente,metodo,monto,fechaRegistro,sincronizado")
      .order("fechaRegistro", { ascending: false })
      .limit(5000);

    const { data, error } = await withTimeout(q, TIMEOUT_MS, "Lectura remota excedió tiempo");
    if (error) throw error;

    const ventas = (data || []).map(normalizarVenta);
    guardarLocal(ventas);
    return ventas;
  }

  async function pushRemoto(ventaNorm) {
    if (!remotoActivo || !supabase) return { ok: false, local: true };

    const payload = {
      vendedorId: ventaNorm.vendedorId,
      vendedorNombre: ventaNorm.vendedorNombre,
      cantidad: ventaNorm.cantidad,
      cliente: ventaNorm.cliente,
      metodo: ventaNorm.metodo,
      monto: ventaNorm.monto,
      fechaRegistro: ventaNorm.fechaRegistro,
      sincronizado: true
    };

    const ins = supabase.from(TABLA).insert(payload);
    const { error } = await withTimeout(ins, TIMEOUT_MS, "Insert remoto excedió tiempo");
    if (error) throw error;

    return { ok: true };
  }

  // =========================
  // API pública window.bd
  // =========================
  const bd = {
    estaRemotoActivo() {
      return remotoActivo;
    },

    obtenerTodasLasVentas() {
      return ordenarDescPorFecha(leerLocal());
    },

    obtenerVentasDeHoy() {
      try {
        const ventas = leerLocal();
        return ventasDelDia(Array.isArray(ventas) ? ventas : []);
      } catch (e) {
        warn("obtenerVentasDeHoy:", e?.message || e);
        return [];
      }
    },

    obtenerEstadisticas() {
      return obtenerStats(leerLocal());
    },

    async recargarDesdeRemoto() {
      try {
        const ventas = await pullRemoto();
        emitir("sincronizacionCompleta", { modo: remotoActivo ? "remoto" : "local", total: ventas.length });
        actualizarEstadoSync(remotoActivo ? "✅ Sincronizado" : "⚠️ Modo local");
        return ventas;
      } catch (e) {
        warn("recargarDesdeRemoto:", e.message);
        emitir("sincronizacionCompleta", { modo: "local", error: e.message });
        actualizarEstadoSync("⚠️ Modo local");
        return leerLocal();
      }
    },

    registrarVenta(venta) {
      const v = normalizarVenta({ ...venta, sincronizado: false });
      const arr = leerLocal();
      arr.push(v);
      guardarLocal(arr);

      emitir("ventaRegistrada", { venta: v });
      actualizarEstadoSync("⏳ Sincronizando…");

      pushRemoto(v)
        .then(() => {
          const actual = leerLocal().map((x) =>
            x.idLocal === v.idLocal ? { ...x, sincronizado: true } : x
          );
          guardarLocal(actual);

          emitir("sincronizacionCompleta", { modo: "remoto", ventaId: v.idLocal });
          actualizarEstadoSync("✅ Sincronizado");
        })
        .catch((e) => {
          warn("pushRemoto fallo, se conserva local:", e.message);
          emitir("sincronizacionCompleta", { modo: "local", error: e.message, ventaId: v.idLocal });
          actualizarEstadoSync("⚠️ Modo local");
        });
    },

    async sincronizarConServidor() {
      try {
        if (remotoActivo) {
          await pullRemoto();
          emitir("sincronizacionCompleta", { modo: "remoto" });
          actualizarEstadoSync("✅ Sincronizado");
          return { ok: true, modo: "remoto" };
        }
        emitir("sincronizacionCompleta", { modo: "local" });
        actualizarEstadoSync("⚠️ Modo local");
        return { ok: true, modo: "local" };
      } catch (e) {
        warn("sincronizarConServidor:", e.message);
        emitir("sincronizacionCompleta", { modo: "local", error: e.message });
        actualizarEstadoSync("⚠️ Modo local");
        return { ok: false, modo: "local", error: e.message };
      }
    }
  };

  window.bd = bd;
  window.obtenerVentasCentralizadas = () => bd.obtenerTodasLasVentas();
  window.registrarVentaCentralizada = (venta) => bd.registrarVenta(venta);

  async function bootstrap() {
    if (inicializado) return;
    inicializado = true;

    initBroadcast();
    actualizarEstadoSync("⏳ Sincronizando…");

    try {
      await initRemoto();
      if (remotoActivo) {
        await bd.recargarDesdeRemoto();
      } else {
        emitir("sincronizacionCompleta", { modo: "local" });
        actualizarEstadoSync("⚠️ Modo local");
      }
    } catch (e) {
      err("bootstrap:", e.message || e);
      emitir("sincronizacionCompleta", { modo: "local", error: e.message || String(e) });
      actualizarEstadoSync("⚠️ Modo local");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();

