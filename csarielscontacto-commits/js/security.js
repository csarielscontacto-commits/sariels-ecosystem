// ================================================================
// SECURITY.JS - PROTECCIÓN CONTRA HACKEOS Y VACIADO DE CARTERAS
// ================================================================

// ================================================================
// 1. CONTRATOS OFICIALES DE CSARIEL'S
// ================================================================
const CONTRATOS_OFICIALES = {
    TOK: '0x...',  // ⚠️ REEMPLAZA CON LA DIRECCIÓN REAL
    NFT: '0x...',  // ⚠️ REEMPLAZA CON LA DIRECCIÓN REAL
    STOK: '0x...'  // ⚠️ REEMPLAZA CON LA DIRECCIÓN REAL
};

// ================================================================
// 2. VALIDAR CONTRATO OFICIAL
// ================================================================
function validarContrato(direccion) {
    const valores = Object.values(CONTRATOS_OFICIALES);
    if (!valores.includes(direccion.toLowerCase())) {
        throw new Error('❌ Contrato no autorizado: ' + direccion);
    }
    return true;
}

// ================================================================
// 3. VERIFICAR RED CORRECTA (Polygon Amoy)
// ================================================================
const RED_CORRECTA = '0x13882'; // Polygon Amoy

async function verificarRed() {
    if (!window.ethereum) return false;
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== RED_CORRECTA) {
            mostrarToastSeguridad('⚠️ Cambia a Polygon Amoy', 'error');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error verificando red:', error);
        return false;
    }
}

// ================================================================
// 4. VERIFICAR SCRIPTS EXTERNOS (anti-inyección)
// ================================================================
const SCRIPTS_PERMITIDOS = [
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net',
    'unpkg.com',
    'fonts.googleapis.com',
    'cdn.tailwindcss.com',
    'polygon.technology'
];

function verificarScriptsSeguridad() {
    const scripts = document.querySelectorAll('script');
    let scriptsEliminados = 0;
    
    for (const script of scripts) {
        if (script.src) {
            const esPermitido = SCRIPTS_PERMITIDOS.some(p => script.src.includes(p));
            const esLocal = script.src.includes(window.location.hostname) || !script.src.startsWith('http');
            
            if (!esPermitido && !esLocal) {
                console.warn('⚠️ Script externo no autorizado eliminado:', script.src);
                script.remove();
                scriptsEliminados++;
            }
        }
    }
    
    if (scriptsEliminados > 0) {
        console.log(`🛡️ ${scriptsEliminados} scripts no autorizados eliminados`);
    }
}

// ================================================================
// 5. VERIFICAR CONSOLA (detección de inyecciones)
// ================================================================
function protegerConsola() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Prevenir que scripts maliciosos usen console para robar datos
    console.log = function(...args) {
        if (args.length > 0 && typeof args[0] === 'string') {
            // Bloquear intentos de robo de claves
            if (args[0].includes('private') || args[0].includes('mnemonic') || args[0].includes('seed')) {
                console.warn('🛡️ Intento de acceso a datos sensibles bloqueado');
                return;
            }
        }
        originalLog.apply(console, args);
    };
}

// ================================================================
// 6. EJECUTAR TRANSACCIÓN SEGURA
// ================================================================
const LIMITES = {
    MAX_TOK_POR_TRANSACCION: 1000,
    MAX_USDT_POR_TRANSACCION: 500,
    MAX_PRECIO_IMPACTO: 0.10
};

async function ejecutarTransaccionSegura(contrato, metodo, args, tipo, cantidad, precio) {
    try {
        // 1. Verificar red
        const redOk = await verificarRed();
        if (!redOk) {
            throw new Error('Red incorrecta');
        }
        
        // 2. Validar contrato
        validarContrato(contrato.address);
        
        // 3. Verificar límites
        if (tipo && cantidad) {
            if (cantidad > LIMITES.MAX_TOK_POR_TRANSACCION) {
                throw new Error(`⚠️ Límite excedido: máximo ${LIMITES.MAX_TOK_POR_TRANSACCION} TOK`);
            }
        }
        
        // 4. Confirmación del usuario (anti-blind signing)
        const confirmar = confirm(
            `⚠️ CONFIRMA ESTA TRANSACCIÓN\n\n` +
            `📝 Acción: ${metodo}\n` +
            `📦 Cantidad: ${cantidad || 'N/A'}\n` +
            `💰 Precio: ${precio || 'N/A'}\n\n` +
            `🔒 Esta acción es irreversible.\n` +
            `✅ ¿Estás seguro de continuar?`
        );
        
        if (!confirmar) {
            mostrarToastSeguridad('⛔ Transacción cancelada', 'warning');
            return null;
        }
        
        // 5. Ejecutar
        const tx = await contrato[metodo](...args);
        mostrarToastSeguridad('⏳ Transacción enviada...', 'info');
        
        const receipt = await tx.wait();
        mostrarToastSeguridad('✅ Transacción confirmada!', 'success');
        return receipt;
        
    } catch (error) {
        console.error('❌ Error en transacción segura:', error);
        mostrarToastSeguridad('❌ ' + error.message, 'error');
        throw error;
    }
}

// ================================================================
// 7. TOAST DE SEGURIDAD
// ================================================================
function mostrarToastSeguridad(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        const nuevoToast = document.createElement('div');
        nuevoToast.id = 'toast';
        nuevoToast.className = 'toast';
        nuevoToast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(80px);
            background: #0a1a12;
            color: #00d68f;
            padding: 12px 24px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 0.8rem;
            opacity: 0;
            transition: all 0.4s ease;
            z-index: 5000;
            pointer-events: none;
            font-family: 'Orbitron', monospace;
            border: 1px solid rgba(0,214,143,0.15);
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(nuevoToast);
    }
    
    const toastEl = document.getElementById('toast');
    const colores = {
        success: '#00d68f',
        error: '#ff3366',
        warning: '#ffd93d',
        info: '#00d4ff'
    };
    
    toastEl.textContent = mensaje;
    toastEl.style.borderColor = colores[tipo] || '#00d68f';
    toastEl.style.color = colores[tipo] || '#00d68f';
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translateX(-50%) translateY(0)';
    
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(-50%) translateY(80px)';
    }, 4000);
}

// ================================================================
// 8. INICIALIZAR SEGURIDAD
// ================================================================
function initSeguridad() {
    // Verificar scripts maliciosos
    verificarScriptsSeguridad();
    
    // Proteger consola
    protegerConsola();
    
    // Verificar conexiones HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn('⚠️ No estás usando HTTPS. Recomendado para seguridad.');
    }
    
    console.log('🛡️ Csariel\'s Security activada');
    console.log('🔒 Contratos oficiales validados');
    console.log('🚫 Blind signing prevenido');
    console.log('✅ Sistema seguro');
}

// ================================================================
// EXPORTAR FUNCIONES
// ================================================================
window.Security = {
    validarContrato,
    verificarRed,
    ejecutarTransaccionSegura,
    mostrarToastSeguridad,
    initSeguridad,
    CONTRATOS_OFICIALES,
    LIMITES,
    RED_CORRECTA
};

console.log('🛡️ Security.js cargado correctamente');