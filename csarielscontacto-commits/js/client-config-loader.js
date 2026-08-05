// js/client-config-loader.js
// Carga la configuración pública desde /api/config y crea supabaseClient si la librería está disponible.

(async function loadClientConfig() {
  try {
    const resp = await fetch('/api/config', { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`config fetch failed: ${resp.status}`);
    const cfg = await resp.json();

    // Merge con cualquier CONFIG existente sin sobrescribir otras propiedades
    window.CONFIG = Object.assign({}, window.CONFIG || {}, cfg);

    // Crear cliente de Supabase si la librería está cargada y hay credenciales públicas
    if (window.supabase?.createClient && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
      window.supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    }

    console.log('◈ Config cliente cargada', {
      SUPABASE_URL: cfg.SUPABASE_URL,
      SUPABASE_ANON_KEY: cfg.SUPABASE_ANON_KEY ? '***present***' : 'missing'
    });
  } catch (err) {
    console.error('No se pudo cargar /api/config:', err);
    // Manejar la ausencia de CONFIG en el código que dependa de ella.
  }
})();