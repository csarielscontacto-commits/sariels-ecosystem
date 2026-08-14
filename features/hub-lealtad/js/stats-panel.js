// ================================================================
// 📊 STATS PANEL - Estadísticas y Calculadora de Canje
// ================================================================

(function() {
    'use strict';

    // ================================================================
    // 📋 DATOS INICIALES
    // ================================================================
    const volumenDiario = [320000, 280000, 410000, 390000, 450000, 380000, 220000];

    // ================================================================
    // 📊 RENDERIZAR GRÁFICA
    // ================================================================
    function renderGrafica(datos) {
        const contenedor = document.getElementById('graficaBarras');
        if (!contenedor) return;
        const maxValor = Math.max(...datos);

        contenedor.innerHTML = '';
        datos.forEach((valor) => {
            const altura = Math.max((valor / maxValor) * 70, 8);
            const barra = document.createElement('div');
            barra.className = 'barra';
            barra.style.height = altura + 'px';
            barra.title = `$${valor.toLocaleString()} MXN`;
            contenedor.appendChild(barra);
        });
    }

    // ================================================================
    // 🧮 CALCULADORA DE CANJE
    // ================================================================
    const BLOQUE_CANJE = 12;

    function calcularCanje() {
        const input = document.getElementById('esstoksInput');
        const actualEl = document.getElementById('calcActual');
        const faltanteEl = document.getElementById('calcFaltante');
        const nftsEl = document.getElementById('calcNfts');
        const progressEl = document.getElementById('calcProgress');
        const mensajeEl = document.getElementById('calcMensaje');

        if (!input || !actualEl || !faltanteEl || !nftsEl || !progressEl || !mensajeEl) return;

        const cantidad = parseInt(input.value) || 0;
        const bloques = Math.floor(cantidad / BLOQUE_CANJE);
        const sobrante = cantidad % BLOQUE_CANJE;
        const faltante = Math.max(0, BLOQUE_CANJE - sobrante);

        actualEl.textContent = cantidad;
        faltanteEl.textContent = faltante > 0 ? faltante : '✅ ¡Completo!';
        nftsEl.textContent = bloques;

        // Barra de progreso
        const porcentaje = Math.min((sobrante / BLOQUE_CANJE) * 100, 100);
        progressEl.style.width = porcentaje + '%';

        // Mensaje personalizado
        if (cantidad === 0) {
            mensajeEl.textContent = '💡 Acumula 12 Es.stoks para canjear tu Tarjeta Digital';
            mensajeEl.style.color = 'var(--text-muted)';
        } else if (faltante === 0 && sobrante === 0) {
            mensajeEl.textContent = `🎉 ¡Tienes ${bloques} bloque(s) completo(s)! Canjea tus NFTs.`;
            mensajeEl.style.color = 'var(--success)';
        } else if (faltante > 0) {
            mensajeEl.textContent = `📦 Te faltan ${faltante} Es.stoks para completar el siguiente bloque.`;
            mensajeEl.style.color = 'var(--gold-cosmic)';
        } else {
            mensajeEl.textContent = `🔄 Tienes ${bloques} NFT(s) listos para canjear.`;
            mensajeEl.style.color = 'var(--quantum)';
        }
    }

    // ================================================================
    // 🔄 ACTUALIZAR MÉTRICAS EN VIVO
    // ================================================================
    function actualizarMetricas() {
        const baseCirc = 1250000;
        const baseCanjes = 18750;
        const baseVol = 2450000;
        const basePrecio = 2.45;
        const variacion = (Math.random() * 0.02) - 0.01;

        const circulanteEl = document.getElementById('circulante');
        const canjesEl = document.getElementById('totalCanjes');
        const volumenEl = document.getElementById('volumenP2P');
        const precioEl = document.getElementById('precioPromedio');
        const volumen7dEl = document.getElementById('volumen7d');
        const productosEl = document.getElementById('productosEntregados');

        if (circulanteEl) {
            circulanteEl.innerHTML = `${Math.round(baseCirc * (1 + variacion * 0.3)).toLocaleString()} <small>Es.stoks</small>`;
        }
        if (canjesEl) {
            canjesEl.innerHTML = `${Math.round(baseCanjes * (1 + variacion * 0.2))} <small>NFTs</small>`;
        }
        if (volumenEl) {
            volumenEl.innerHTML = `$${Math.round(baseVol * (1 + variacion * 0.4)).toLocaleString()} <small>MXN</small>`;
        }
        if (precioEl) {
            precioEl.innerHTML = `$${(basePrecio * (1 + variacion * 0.1)).toFixed(2)} <small>MXN</small>`;
        }
        if (volumen7dEl) {
            volumen7dEl.textContent = `$${Math.round(baseVol * (1 + variacion * 0.3)).toLocaleString()}`;
        }
        if (productosEl) {
            productosEl.textContent = Math.round(18320 * (1 + variacion * 0.1));
        }
    }

    // ================================================================
    // 📦 EXPORTAR
    // ================================================================
    window.StatsPanel = {
        renderGrafica,
        calcularCanje,
        actualizarMetricas,
        volumenDiario
    };

    // Exponer funciones globales
    window.calcularCanje = calcularCanje;
    window.actualizarMetricas = actualizarMetricas;

    // Inicializar al cargar
    document.addEventListener('DOMContentLoaded', function() {
        renderGrafica(volumenDiario);
        calcularCanje();

        // Actualizar métricas cada 15 segundos
        setInterval(actualizarMetricas, 15000);

        console.log('📊 Stats Panel cargado');
    });

})();