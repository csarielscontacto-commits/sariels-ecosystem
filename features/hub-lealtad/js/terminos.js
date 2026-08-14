// ================================================================
// 📋 TÉRMINOS Y CONDICIONES - Modal
// ================================================================

(function() {
    'use strict';

    // ================================================================
    // 📋 ABRIR MODAL
    // ================================================================
    function abrirModalTerminos() {
        const modal = document.getElementById('modalTerminos');
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // ================================================================
    // 📋 CERRAR MODAL
    // ================================================================
    function cerrarModalTerminos() {
        const modal = document.getElementById('modalTerminos');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ================================================================
    // 📋 CERRAR MODAL CON ESC
    // ================================================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModalTerminos();
        }
    });

    // ================================================================
    // 📋 CERRAR MODAL CLIC FUERA
    // ================================================================
    document.addEventListener('DOMContentLoaded', function() {
        const modal = document.getElementById('modalTerminos');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    cerrarModalTerminos();
                }
            });
        }
    });

    // ================================================================
    // 📦 EXPORTAR
    // ================================================================
    window.TerminosModal = {
        abrirModalTerminos,
        cerrarModalTerminos
    };

    // Exponer funciones globales
    window.abrirModalTerminos = abrirModalTerminos;
    window.cerrarModalTerminos = cerrarModalTerminos;

    console.log('📋 Modal de Términos cargado');

})();