// ================================================================
// 🆕 PUBLICIDAD EN MARQUINHOS - UI
// ================================================================

// 1. MOSTRAR ANUNCIO EN LA BURBUJA
async function mostrarAnuncioEnBurbuja() {
    const anuncio = await Engine.getAnuncioParaBurbuja?.();
    const burbuja = document.getElementById('m-burbuja');
    if (!burbuja) return;

    // Colores por nivel
    const colores = {
        'basico': { bg: '#0a1a12', border: '#00d68f', glow: 'rgba(0,214,143,0.2)' },
        'estandar': { bg: '#1a1a0a', border: '#D4AF37', glow: 'rgba(212,175,55,0.3)' },
        'premium': { bg: '#1a0f0a', border: '#FF6B00', glow: 'rgba(255,107,0,0.4)' },
        'patrocinado': { bg: '#1a0a0a', border: '#FF3366', glow: 'rgba(255,51,102,0.5)' }
    };

    if (!anuncio) {
        // Estado normal
        burbuja.style.background = 'linear-gradient(135deg, #d4a373, #c2683e)';
        burbuja.style.border = '1px solid rgba(255,255,255,0.2)';
        burbuja.style.boxShadow = '0 8px 32px rgba(212,168,87,0.3)';
        burbuja.dataset.tieneAnuncio = 'false';
        return;
    }

    const estilo = colores[anuncio.nivel] || colores['basico'];
    burbuja.style.background = estilo.bg;
    burbuja.style.border = `2px solid ${estilo.border}`;
    burbuja.style.boxShadow = `0 0 40px ${estilo.glow}`;
    burbuja.dataset.tieneAnuncio = 'true';
    burbuja.dataset.anuncioId = anuncio.id;
    burbuja.title = `📢 ${anuncio.empresa}: ${anuncio.mensaje}`;

    // Efecto de pulso para premium y patrocinado
    if (anuncio.nivel === 'premium' || anuncio.nivel === 'patrocinado') {
        burbuja.style.animation = 'bubble-pulse 2s ease-in-out infinite';
    } else {
        burbuja.style.animation = 'none';
    }

    // Mostrar etiqueta "AD"
    let label = burbuja.querySelector('.m-ad-label');
    if (!label) {
        label = document.createElement('span');
        label.className = 'm-ad-label';
        label.style.cssText = `
            position: absolute;
            top: -6px;
            right: -6px;
            background: ${estilo.border};
            color: #000;
            font-size: 0.35rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 10px;
            font-family: 'Orbitron', monospace;
            z-index: 10;
        `;
        burbuja.appendChild(label);
    }
    label.textContent = 'AD';
    label.style.background = estilo.border;

    console.log(`📢 Anuncio mostrado: ${anuncio.empresa} (${anuncio.nivel})`);
}

// 2. ABRIR MODAL DE PUBLICIDAD
function abrirModalPublicidad() {
    // Modal para comprar publicidad
}

// 3. INICIALIZAR PUBLICIDAD
function initPublicidad() {
    mostrarAnuncioEnBurbuja();
    setInterval(mostrarAnuncioEnBurbuja, 30000);
}