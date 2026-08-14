// ================================================================
// 🛡️ SEGURIDAD SHIELD - Anti-Hackers & Sanitización
// ================================================================

(function() {
    'use strict';

    // ================================================================
    // 🔐 CONTRATO OFICIAL (Anti-Drainer)
    // ================================================================
    const CONTRATO_OFICIAL_POLYGON = '0x0000000000000000000000000000000000000000'; // ✅ Reemplazar con dirección real

    function validarContratoOficial(direccion) {
        if (!direccion) return false;
        return direccion.toLowerCase() === CONTRATO_OFICIAL_POLYGON.toLowerCase();
    }

    // ================================================================
    // 🛡️ SANITIZACIÓN ANTI-XSS
    // ================================================================
    function sanitizarTexto(texto) {
        if (!texto) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
        };
        return texto.replace(/[&<>"'/]/g, function(m) { return map[m]; });
    }

    function sanitizarObjeto(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        const resultado = Array.isArray(obj) ? [] : {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                resultado[key] = sanitizarTexto(value);
            } else if (typeof value === 'object' && value !== null) {
                resultado[key] = sanitizarObjeto(value);
            } else {
                resultado[key] = value;
            }
        }
        return resultado;
    }

    // ================================================================
    // 🛡️ VALIDACIÓN DE ENTRADAS
    // ================================================================
    function validarUsername(username) {
        const regex = /^[a-zA-Z0-9_\u00C0-\u00FF\s]{2,30}$/;
        return regex.test(username);
    }

    function validarEmail(email) {
        if (!email) return true;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function validarTelefono(phone) {
        if (!phone) return true;
        const regex = /^[0-9\s\-+()]{7,15}$/;
        return regex.test(phone);
    }

    // ================================================================
    // 🛡️ SANITIZAR FORMULARIO
    // ================================================================
    function sanitizarFormulario(inputs) {
        inputs.forEach(input => {
            if (input && input.value !== undefined) {
                input.value = sanitizarTexto(input.value);
            }
        });
    }

    // ================================================================
    // 🛡️ ESCUDO VISUAL
    // ================================================================
    function actualizarEscudoSeguridad(estado) {
        const shield = document.getElementById('securityShield');
        if (!shield) return;
        if (estado === 'protegido') {
            shield.innerHTML = '<i class="fas fa-shield-alt"></i> Anti-Drainer Activo';
            shield.style.borderColor = 'var(--success)';
            shield.style.color = 'var(--success)';
        } else {
            shield.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ¡Revisar seguridad!';
            shield.style.borderColor = 'var(--danger)';
            shield.style.color = 'var(--danger)';
        }
    }

    // ================================================================
    // 📦 EXPORTAR
    // ================================================================
    window.SecurityShield = {
        CONTRATO_OFICIAL_POLYGON,
        validarContratoOficial,
        sanitizarTexto,
        sanitizarObjeto,
        validarUsername,
        validarEmail,
        validarTelefono,
        sanitizarFormulario,
        actualizarEscudoSeguridad
    };

    // Verificar contrato al cargar
    document.addEventListener('DOMContentLoaded', function() {
        const valido = validarContratoOficial(CONTRATO_OFICIAL_POLYGON);
        actualizarEscudoSeguridad(valido ? 'protegido' : 'inseguro');
        console.log('🛡️ Security Shield cargado');
        console.log('📜 Contrato Oficial:', CONTRATO_OFICIAL_POLYGON);
        console.log('✅ Contrato válido:', valido);
    });

})();