/**
 * ================================================================
 * 🔧 ACTUALIZADOR DE RUTAS - Csariel's Ecosystem
 * ================================================================
 * Script para actualizar automáticamente las rutas de los archivos features.
 * 
 * Hecho en Puebla, México 🇲🇽
 * Versión: 2.1.0 (SIN MEMES)
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

// ================================================================
// 📋 CONFIGURACIÓN (ACTUALIZADO - SIN MEMES)
// ================================================================

const FEATURES_DIR = './features';
const ARCHIVOS = [
    'red/index.html',
    'live/index.html',
    'trading/index.html',
    'servicios/index.html',
    'internet/index.html',
    'tienda/index.html',
    'wallet/index.html',
    'admin/index.html',
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
// 🔄 PATRONES DE REEMPLAZO
// ================================================================

const REPLACEMENTS = [
    // === ENLACES A FEATURES ===
    { 
        find: /href="\.\.\/usuario\/index\.html"/g, 
        replace: 'href="../red/index.html"' 
    },
    { 
        find: /href="\.\.\/mired\/index\.html"/g, 
        replace: 'href="../red/index.html"' 
    },
    { 
        find: /href="\.\.\/memes\/index\.html"/g, 
        replace: 'href="../foro/index.html"' 
    },
    { 
        find: /href="memes\/index\.html"/g, 
        replace: 'href="foro/index.html"' 
    },
    { 
        find: /href="\.\.\/terminos-uso\/index\.html"/g, 
        replace: 'href="../../terminos-completos.html"' 
    },
    { 
        find: /href="\.\.\/terminos-completos\.html"/g, 
        replace: 'href="../../terminos-completos.html"' 
    },
    { 
        find: /href="terminos-completos\.html"/g, 
        replace: 'href="../../terminos-completos.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/terminos-completos\.html"/g, 
        replace: 'href="../../terminos-completos.html"' 
    },
    { 
        find: /href="\.\.\/privacidad\/index\.html"/g, 
        replace: 'href="../../aviso-privacidad.html"' 
    },
    { 
        find: /href="aviso-privacidad\.html"/g, 
        replace: 'href="../../aviso-privacidad.html"' 
    },
    { 
        find: /href="\.\.\/aviso-privacidad\.html"/g, 
        replace: 'href="../../aviso-privacidad.html"' 
    },

    // === RUTAS DE ADMIN Y LEGALES ===
    { 
        find: /href="\.\.\/admin\/index\.html"/g, 
        replace: 'href="../admin/index.html"' 
    },
    { 
        find: /href="\.\.\/contrato-creador\/index\.html"/g, 
        replace: 'href="../contrato-creador/index.html"' 
    },
    { 
        find: /href="\.\.\/derechos-autor\/index\.html"/g, 
        replace: 'href="../derechos-autor/index.html"' 
    },
    { 
        find: /href="\.\.\/legal-hub\/index\.html"/g, 
        replace: 'href="../legal-hub/index.html"' 
    },
    { 
        find: /href="\.\.\/moderacion\/index\.html"/g, 
        replace: 'href="../moderacion/index.html"' 
    },
    { 
        find: /href="\.\.\/talaverin\/index\.html"/g, 
        replace: 'href="../talaverin/index.html"' 
    },
    { 
        find: /href="\.\.\/rewards\/index\.html"/g, 
        replace: 'href="../rewards/index.html"' 
    },
    { 
        find: /href="\.\.\/takedown\/index\.html"/g, 
        replace: 'href="../takedown/index.html"' 
    },
    { 
        find: /href="\.\.\/terminos-servicios\/index\.html"/g, 
        replace: 'href="../terminos-servicios/index.html"' 
    },
    { 
        find: /href="\.\.\/faq-legal\/index\.html"/g, 
        replace: 'href="../faq-legal/index.html"' 
    },

    // === ENLACES A INICIO ===
    { 
        find: /href="\.\.\/index\.html"/g, 
        replace: 'href="../../index.html"' 
    },
    { 
        find: /href="\.\.\/\.\.\/\.\.\/index\.html"/g, 
        replace: 'href="../../index.html"' 
    },

    // === RUTAS DE JS ===
    { 
        find: /src="\.\.\/\.\.\/js\//g, 
        replace: 'src="../../js/"' 
    },
    { 
        find: /src="\.\.\/js\//g, 
        replace: 'src="../../js/"' 
    },
    { 
        find: /src="\.\.\/\.\.\/\.\.\/js\//g, 
        replace: 'src="../../js/"' 
    },

    // === RUTAS DE CSS ===
    { 
        find: /href="\.\.\/\.\.\/css\//g, 
        replace: 'href="../../css/"' 
    },
    { 
        find: /href="\.\.\/css\//g, 
        replace: 'href="../../css/"' 
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

for (const archivo of ARCHIVOS) {
    const result = procesarArchivo(archivo);
    if (result) totalModificados++;
}

console.log('');
console.log(`✅ Proceso completado. ${totalModificados} de ${ARCHIVOS.length} archivos modificados.`);
console.log('📍 Hecho en Puebla, México 🇲🇽');
console.log('📌 MEMES eliminado del ecosistema');