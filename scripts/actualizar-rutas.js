/**
 * ================================================================
 * 🔧 ACTUALIZADOR DE RUTAS - Csariel's Ecosystem
 * ================================================================
 * Script para actualizar automáticamente las rutas de los archivos.
 * 
 * Hecho en Puebla, México 🇲🇽
 * Versión: 4.0.0 (CORREGIDO - BASADO EN ESTRUCTURA ACTUAL)
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

// ================================================================
// 📋 CONFIGURACIÓN
// ================================================================

const FEATURES_DIR = './features';
const ARCHIVOS = [
    // Features principales
    'red/index.html',
    'live/index.html',
    'trading/index.html',
    'servicios/index.html',
    'internet/index.html',
    'wallet/index.html',
    'admin/index.html',
    'foro/index.html',
    // Legales
    'contrato-creador/index.html',
    'derechos-autor/index.html',
    'legal-hub/index.html',
    'moderacion/index.html',
    'talaverin/index.html',
    'rewards/index.html',
    'takedown/index.html',
    'terminos-servicios/index.html',
    'faq-legal/index.html'
];

// ================================================================
// 🔄 PATRONES DE REEMPLAZO (CORREGIDOS)
// ================================================================

const REPLACEMENTS = [
    // === TIENDA (ahora está en la raíz) ===
    { 
        find: /href="\.\.\/tienda\/index\.html"/g, 
        replace: 'href="/tienda.html"' 
    },
    { 
        find: /href="\.\.\/features\/tienda\/index\.html"/g, 
        replace: 'href="/tienda.html"' 
    },
    { 
        find: /href="tienda\/index\.html"/g, 
        replace: 'href="/tienda.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/tienda\.html"/g, 
        replace: 'href="/tienda.html"' 
    },
    { 
        find: /href="\/tienda\.html"/g, 
        replace: 'href="/tienda.html"' 
    },

    // === RED SOCIAL ===
    { 
        find: /href="\.\.\/usuario\/index\.html"/g, 
        replace: 'href="/features/red/index.html"' 
    },
    { 
        find: /href="\.\.\/mired\/index\.html"/g, 
        replace: 'href="/features/red/index.html"' 
    },
    { 
        find: /href="\.\.\/red\/index\.html"/g, 
        replace: 'href="/features/red/index.html"' 
    },

    // === FORO (reemplazar memes) ===
    { 
        find: /href="\.\.\/memes\/index\.html"/g, 
        replace: 'href="/features/foro/index.html"' 
    },
    { 
        find: /href="memes\/index\.html"/g, 
        replace: 'href="/features/foro/index.html"' 
    },

    // === TÉRMINOS Y CONDICIONES ===
    { 
        find: /href="\.\.\/terminos-uso\/index\.html"/g, 
        replace: 'href="/terminos-completos.html"' 
    },
    { 
        find: /href="\.\.\/terminos-completos\.html"/g, 
        replace: 'href="/terminos-completos.html"' 
    },
    { 
        find: /href="terminos-completos\.html"/g, 
        replace: 'href="/terminos-completos.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/terminos-completos\.html"/g, 
        replace: 'href="/terminos-completos.html"' 
    },

    // === AVISO DE PRIVACIDAD ===
    { 
        find: /href="\.\.\/privacidad\/index\.html"/g, 
        replace: 'href="/aviso-privacidad.html"' 
    },
    { 
        find: /href="aviso-privacidad\.html"/g, 
        replace: 'href="/aviso-privacidad.html"' 
    },
    { 
        find: /href="\.\.\/aviso-privacidad\.html"/g, 
        replace: 'href="/aviso-privacidad.html"' 
    },

    // === FEATURES (desde cualquier nivel a la raíz) ===
    { 
        find: /href="\.\.\/admin\/index\.html"/g, 
        replace: 'href="/features/admin/index.html"' 
    },
    { 
        find: /href="\.\.\/live\/index\.html"/g, 
        replace: 'href="/features/live/index.html"' 
    },
    { 
        find: /href="\.\.\/trading\/index\.html"/g, 
        replace: 'href="/features/trading/index.html"' 
    },
    { 
        find: /href="\.\.\/servicios\/index\.html"/g, 
        replace: 'href="/features/servicios/index.html"' 
    },
    { 
        find: /href="\.\.\/internet\/index\.html"/g, 
        replace: 'href="/features/internet/index.html"' 
    },
    { 
        find: /href="\.\.\/wallet\/index\.html"/g, 
        replace: 'href="/features/wallet/index.html"' 
    },
    { 
        find: /href="\.\.\/foro\/index\.html"/g, 
        replace: 'href="/features/foro/index.html"' 
    },

    // === FEATURES (desde subcarpetas) ===
    { 
        find: /href="\.\.\/\.\.\/admin\/index\.html"/g, 
        replace: 'href="/features/admin/index.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/live\/index\.html"/g, 
        replace: 'href="/features/live/index.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/trading\/index\.html"/g, 
        replace: 'href="/features/trading/index.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/servicios\/index\.html"/g, 
        replace: 'href="/features/servicios/index.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/internet\/index\.html"/g, 
        replace: 'href="/features/internet/index.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/wallet\/index\.html"/g, 
        replace: 'href="/features/wallet/index.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/foro\/index\.html"/g, 
        replace: 'href="/features/foro/index.html"' 
    },

    // === ENLACES A INICIO ===
    { 
        find: /href="\.\.\/index\.html"/g, 
        replace: 'href="/index.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/index\.html"/g, 
        replace: 'href="/index.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/\.\.\/index\.html"/g, 
        replace: 'href="/index.html"' 
    },
    { 
        find: /href="\/index\.html"/g, 
        replace: 'href="/index.html"' 
    },

    // === RUTAS DE JS (absolutas) ===
    { 
        find: /src="\.\.\/\.\.\/js\//g, 
        replace: 'src="/js/"' 
    },
    { 
        find: /src="\.\.\/js\//g, 
        replace: 'src="/js/"' 
    },
    { 
        find: /src="\.\.\/\.\.\/\.\.\/js\//g, 
        replace: 'src="/js/"' 
    },
    { 
        find: /src="\/js\//g, 
        replace: 'src="/js/"' 
    },

    // === RUTAS DE CSS (absolutas) ===
    { 
        find: /href="\.\.\/\.\.\/css\//g, 
        replace: 'href="/css/"' 
    },
    { 
        find: /href="\.\.\/css\//g, 
        replace: 'href="/css/"' 
    },
    { 
        find: /href="\.\.\/\.\.\/\.\.\/css\//g, 
        replace: 'href="/css/"' 
    },
    { 
        find: /href="\/css\//g, 
        replace: 'href="/css/"' 
    },

    // === RUTAS DE IMÁGENES (absolutas) ===
    { 
        find: /src="\.\.\/\.\.\/img\//g, 
        replace: 'src="/img/"' 
    },
    { 
        find: /src="\.\.\/img\//g, 
        replace: 'src="/img/"' 
    },
    { 
        find: /src="\.\.\/\.\.\/\.\.\/img\//g, 
        replace: 'src="/img/"' 
    },
    { 
        find: /src="\/img\//g, 
        replace: 'src="/img/"' 
    },

    // === RUTAS DE ASSETS (absolutas) ===
    { 
        find: /href="\.\.\/\.\.\/assets\//g, 
        replace: 'href="/assets/"' 
    },
    { 
        find: /href="\.\.\/assets\//g, 
        replace: 'href="/assets/"' 
    },
    { 
        find: /href="\.\.\/\.\.\/\.\.\/assets\//g, 
        replace: 'href="/assets/"' 
    },
    { 
        find: /href="\/assets\//g, 
        replace: 'href="/assets/"' 
    },

    // === RUTAS DE FAVICON ===
    { 
        find: /href="\.\.\/\.\.\/icon-192\.png"/g, 
        replace: 'href="/icon-192.png"' 
    },
    { 
        find: /href="\.\.\/icon-192\.png"/g, 
        replace: 'href="/icon-192.png"' 
    },
    { 
        find: /href="\.\.\/\.\.\/icon-512\.png"/g, 
        replace: 'href="/icon-512.png"' 
    },
    { 
        find: /href="\.\.\/icon-512\.png"/g, 
        replace: 'href="/icon-512.png"' 
    },
    { 
        find: /href="\.\.\/\.\.\/manifest\.json"/g, 
        replace: 'href="/manifest.json"' 
    },
    { 
        find: /href="\.\.\/manifest\.json"/g, 
        replace: 'href="/manifest.json"' 
    },

    // === RUTAS DE SUPABASE ===
    { 
        find: /src="\.\.\/\.\.\/supabase\//g, 
        replace: 'src="/supabase/"' 
    },
    { 
        find: /src="\.\.\/supabase\//g, 
        replace: 'src="/supabase/"' 
    },
    { 
        find: /src="\/supabase\//g, 
        replace: 'src="/supabase/"' 
    },

    // === RUTAS DE PERFIL-CONNECTOR ===
    { 
        find: /src="\.\.\/\.\.\/js\/perfil-connector\.js"/g, 
        replace: 'src="/js/perfil-connector.js"' 
    },
    { 
        find: /src="\.\.\/js\/perfil-connector\.js"/g, 
        replace: 'src="/js/perfil-connector.js"' 
    },

    // === RUTAS DE CLIENT-CONFIG ===
    { 
        find: /src="\.\.\/\.\.\/js\/client-config-loader\.js"/g, 
        replace: 'src="/js/client-config-loader.js"' 
    },
    { 
        find: /src="\.\.\/js\/client-config-loader\.js"/g, 
        replace: 'src="/js/client-config-loader.js"' 
    },

    // === CORREGIR DOBLES BARRAS ===
    { 
        find: /href="\/\//g, 
        replace: 'href="/"' 
    },
    { 
        find: /src="\/\//g, 
        replace: 'src="/"' 
    },

    // === LOGOS Y BADGES ===
    { 
        find: /logo-badge" data-i18n="ecosistema">Ecosistema/g, 
        replace: 'logo-badge">Ecosistema' 
    },
    { 
        find: /<span data-i18n="conectado">Conectado<\/span>/g, 
        replace: '<span>Conectado</span>' 
    },
    { 
        find: /data-i18n="mi_red">Mi Red<\/span>/g, 
        replace: 'Mi Red</span>' 
    },
    { 
        find: /data-i18n="live">Live<\/span>/g, 
        replace: 'Live</span>' 
    },
    { 
        find: /data-i18n="foro">Foro<\/span>/g, 
        replace: 'Foro</span>' 
    },
    { 
        find: /data-i18n="trading">Trading<\/span>/g, 
        replace: 'Trading</span>' 
    },
    { 
        find: /data-i18n="servicios">Servicios<\/span>/g, 
        replace: 'Servicios</span>' 
    },
    { 
        find: /data-i18n="internet">Internet<\/span>/g, 
        replace: 'Internet</span>' 
    },
    { 
        find: /data-i18n="tienda">Tienda<\/span>/g, 
        replace: 'Tienda</span>' 
    },
    { 
        find: /data-i18n="wallet">Wallet<\/span>/g, 
        replace: 'Wallet</span>' 
    },
    { 
        find: /data-i18n="admin">Admin<\/span>/g, 
        replace: 'Admin</span>' 
    },
    { 
        find: /data-i18n="terminos">Términos<\/span>/g, 
        replace: 'Términos</span>' 
    }
];

// ================================================================
// 🚀 FUNCIÓN PRINCIPAL
// ================================================================

function procesarArchivo(ruta) {
    const rutaCompleta = path.join(FEATURES_DIR, ruta);
    
    if (!fs.existsSync(rutaCompleta)) {
        console.log(`⚠️ Archivo no encontrado: ${ruta}`);
        return false;
    }

    let contenido = fs.readFileSync(rutaCompleta, 'utf8');
    let modificado = false;
    let cambios = [];

    for (const replacement of REPLACEMENTS) {
        if (replacement.find.test(contenido)) {
            const coincidencias = contenido.match(replacement.find)?.length || 0;
            contenido = contenido.replace(replacement.find, replacement.replace);
            modificado = true;
            cambios.push({
                patron: replacement.find.toString(),
                reemplazo: replacement.replace,
                coincidencias: coincidencias
            });
        }
    }

    if (modificado) {
        fs.writeFileSync(rutaCompleta, contenido);
        console.log(`✅ Actualizado: ${ruta} (${cambios.length} cambios)`);
        for (const cambio of cambios) {
            console.log(`   └─ ${cambio.coincidencias} coincidencia(s): ${cambio.reemplazo}`);
        }
        return true;
    } else {
        console.log(`⏭️ Sin cambios: ${ruta}`);
        return false;
    }
}

// ================================================================
// 📊 EJECUTAR
// ================================================================

console.log('🔧 Actualizando rutas de features...');
console.log(`📁 Procesando ${ARCHIVOS.length} archivos...`);
console.log('');

let totalModificados = 0;
let totalErrores = 0;
let totalSinCambios = 0;

for (const archivo of ARCHIVOS) {
    try {
        const result = procesarArchivo(archivo);
        if (result) {
            totalModificados++;
        } else {
            totalSinCambios++;
        }
    } catch (error) {
        console.error(`❌ Error procesando ${archivo}:`, error.message);
        totalErrores++;
    }
}

console.log('');
console.log(`✅ Proceso completado.`);
console.log(`   📄 ${totalModificados} archivos modificados`);
console.log(`   ⚠️ ${totalErrores} errores`);
console.log(`   📁 ${totalSinCambios} archivos sin cambios`);
console.log('');
console.log('📍 Hecho en Puebla, México 🇲🇽');
console.log('🛍️ Tienda ahora en la raíz (tienda.html)');
console.log('📌 Todas las rutas son absolutas (/)');