// ================================================================
// 🛡️ SEGURIDAD - CSARIEL'S ECOSYSTEM (VERSIÓN UNIFICADA)
// ================================================================
// Protección contra hackeos, XSS, inyecciones y clickjacking.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// 1. SCRIPTS PERMITIDOS (CDNs seguros)
// ================================================================

const SCRIPTS_PERMITIDOS = [
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net',
    'unpkg.com',
    'fonts.googleapis.com',
    'cdn.tailwindcss.com',
    '*.supabase.co'
];

// ================================================================
// 2. VERIFICAR Y BLOQUEAR SCRIPTS MALICIOSOS
// ================================================================

export function verificarScriptsSeguridad() {
    const scripts = document.querySelectorAll('script');
    let scriptsEliminados = 0;
    
    for (const script of scripts) {
        if (script.src) {
            const esPermitido = SCRIPTS_PERMITIDOS.some(p => 
                script.src.includes(p) || script.src.includes(p.replace('*.', ''))
            );
            const esLocal = script.src.includes(window.location.hostname) || 
                           !script.src.startsWith('http');
            
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
    return scriptsEliminados;
}

// ================================================================
// 3. PROTEGER CONSOLA (anti-inyección)
// ================================================================

export function protegerConsola() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Palabras sensibles a bloquear
    const palabrasProhibidas = [
        'private', 'mnemonic', 'seed', 'password', 
        'token', 'key', 'secret', 'wallet', 'privkey'
    ];
    
    console.log = function(...args) {
        if (args.length > 0 && typeof args[0] === 'string') {
            if (palabrasProhibidas.some(p => args[0].toLowerCase().includes(p))) {
                console.warn('🛡️ Intento de acceso a datos sensibles bloqueado');
                return;
            }
        }
        originalLog.apply(console, args);
    };
    
    console.warn = function(...args) {
        // Filtrar advertencias falsas de Web3
        if (args.length > 0 && typeof args[0] === 'string') {
            if (args[0].includes('MetaMask') || 
                args[0].includes('web3') || 
                args[0].includes('ethereum')) {
                return;
            }
        }
        originalWarn.apply(console, args);
    };
}

// ================================================================
// 4. PROTEGER localStorage
// ================================================================

export function protegerLocalStorage() {
    const originalSetItem = localStorage.setItem;
    
    localStorage.setItem = function(key, value) {
        // Bloquear inyección de scripts en localStorage
        if (typeof value === 'string' && 
            (value.includes('<script') || value.includes('javascript:'))) {
            console.warn('🛡️ Intento de inyección en localStorage bloqueado');
            return;
        }
        originalSetItem.call(this, key, value);
    };
}

// ================================================================
// 5. PROTEGER CONTRA XSS (Cross-Site Scripting)
// ================================================================

export function protegerXSS() {
    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            const valor = e.target.value;
            if (valor.includes('<') || valor.includes('>') || valor.includes('javascript:')) {
                e.target.value = valor.replace(/[<>]/g, '');
                console.warn('🛡️ Caracteres peligrosos eliminados');
            }
        }
    });
}

// ================================================================
// 6. PROTEGER CONTRA CLICKJACKING
// ================================================================

export function protegerClickjacking() {
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'X-Frame-Options';
    meta.content = 'DENY';
    document.head.appendChild(meta);
}

// ================================================================
// 7. VERIFICAR HTTPS
// ================================================================

export function verificarHTTPS() {
    if (window.location.protocol !== 'https:' && 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
        console.warn('⚠️ No estás usando HTTPS. Recomendado para seguridad.');
        return false;
    }
    return true;
}

// ================================================================
// 8. TOAST DE SEGURIDAD
// ================================================================

export function mostrarToastSeguridad(mensaje, tipo = 'info') {
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
// 9. INICIALIZAR SEGURIDAD
// ================================================================

export function initSeguridad() {
    verificarScriptsSeguridad();
    protegerConsola();
    protegerLocalStorage();
    verificarHTTPS();
    protegerXSS();
    protegerClickjacking();
    
    console.log('🛡️ Csariel\'s Security activada (modo local)');
    console.log('✅ Sistema seguro');
}

// ================================================================
// 📦 EXPORTAR TODO
// ================================================================

export default {
    initSeguridad,
    verificarScriptsSeguridad,
    protegerConsola,
    protegerLocalStorage,
    protegerXSS,
    protegerClickjacking,
    verificarHTTPS,
    mostrarToastSeguridad
};

// ================================================================
// 📋 AUTO-INICIALIZAR AL CARGAR
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
    initSeguridad();
});

console.log('🛡️ Security.js cargado (versión unificada)');
console.log('📍 Hecho en Puebla, México 🇲🇽');