// js/client-config-loader.js
// Carga la configuración pública desde /api/config o fallback a js/config.js
// y expone window.supabase para todo el ecosistema.

(async function loadClientConfig() {
  let cfg = null;
  let fallbackUsed = false;

  try {
    // 1. Intentar desde /api/config (Vercel serverless)
    const resp = await fetch('/api/config', { cache: 'no-cache' });
    if (resp.ok) {
      cfg = await resp.json();
      console.log('✅ Config cargada desde /api/config');
    } else {
      throw new Error(`Status ${resp.status}`);
    }
  } catch (err) {
    console.warn('⚠️ Fallback a js/config.js (no se pudo cargar /api/config):', err.message);
    fallbackUsed = true;
    try {
      // 2. Fallback: cargar desde js/config.js (debe exponer window.CONFIG o variables globales)
      const script = document.createElement('script');
      script.src = './js/config.js';
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () => reject(new Error('No se pudo cargar config.js'));
        document.head.appendChild(script);
      });
      // config.js debería haber definido window.CONFIG o window.SUPABASE_URL, etc.
      if (window.CONFIG && window.CONFIG.SUPABASE_URL) {
        cfg = window.CONFIG;
        console.log('✅ Config cargada desde js/config.js (window.CONFIG)');
      } else if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
        cfg = {
          SUPABASE_URL: window.SUPABASE_URL,
          SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY,
          VERSION: window.APP_VERSION || '2.1.0'
        };
        console.log('✅ Config cargada desde variables globales window.SUPABASE_*');
      } else {
        throw new Error('No se encontraron credenciales en config.js');
      }
    } catch (fallbackErr) {
      console.error('❌ Error crítico: no se pudo cargar la configuración de Supabase.', fallbackErr);
      // No detener la ejecución, pero mostrar un toast si es posible
      if (typeof mostrarToast === 'function') {
        mostrarToast('⚠️ Error cargando configuración. Revisa la conexión.', 'error');
      }
      return;
    }
  }

  // 3. Unificar configuración en window.CONFIG
  if (cfg) {
    window.CONFIG = Object.assign({}, window.CONFIG || {}, cfg);
    // 4. Crear cliente de Supabase y exponerlo en window.supabase (para todo el ecosistema)
    if (window.supabase?.createClient && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
      window.supabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      // También mantener window.supabaseClient por compatibilidad
      window.supabaseClient = window.supabase;
      console.log('🟢 Supabase cliente inicializado correctamente.');
    } else {
      // Si la librería no está cargada, intentar cargarla antes de crear el cliente
      if (typeof supabase === 'undefined' && typeof window.supabase === 'undefined') {
        console.warn('⚠️ Librería supabase no encontrada, intentando cargar desde CDN...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
          script.onload = () => {
            if (window.supabase?.createClient && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
              window.supabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
              window.supabaseClient = window.supabase;
              resolve();
            } else {
              reject(new Error('Supabase no se pudo cargar desde CDN'));
            }
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
        console.log('✅ Supabase cargado desde CDN');
      }
    }

    // 5. Emitir evento para que otros scripts sepan que la config está lista
    document.dispatchEvent(new CustomEvent('config:loaded', { detail: { config: cfg, fallback: fallbackUsed } }));
    console.log(`◈ Config lista (${fallbackUsed ? 'fallback local' : 'API remota'})`);
  }
})();