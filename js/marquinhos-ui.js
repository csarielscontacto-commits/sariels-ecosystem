// ================================================================
// 📢 ESCUCHAR CAMPAÑAS DESDE ENGINE (NUEVO)
// ================================================================

/**
 * Escucha los eventos de campaña que dispara el Engine
 * y actualiza la burbuja de Marquinhos con la campaña activa.
 */
escucharCampanas() {
    // Escuchar campaña actualizada desde el Engine
    document.addEventListener('marquinhos:campana-actualizada', (e) => {
        const { campaña, tieneCampana } = e.detail;
        if (tieneCampana && campaña) {
            this.aplicarCampana(campaña);
        } else {
            this.aplicarEstiloPorDefecto();
        }
    });

    // Escuchar evento de estilo por defecto
    document.addEventListener('marquinhos:campana-default', () => {
        this.aplicarEstiloPorDefecto();
    });

    console.log('📢 Marquinhos UI: Escuchando campañas del Engine');
},

/**
 * Aplica una campaña a la burbuja de Marquinhos
 */
aplicarCampana(campaña) {
    const bubble = document.getElementById('m-burbuja');
    const adLabel = document.getElementById('m-ad-label');
    
    if (!bubble) return;

    // Guardar campaña actual
    this.campanaActiva = campaña;

    // Cambiar color de la burbuja según la campaña
    const color = campaña.color || '#D4AF37';
    bubble.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
    bubble.style.boxShadow = `0 4px 20px ${color}66`;

    // Cambiar icono si tiene emoji personalizado
    const icono = bubble.querySelector('.m-icono');
    if (icono) {
        icono.textContent = campaña.emoji || '🧠';
    }

    // Mostrar etiqueta de publicidad
    if (adLabel) {
        adLabel.style.display = 'block';
        adLabel.textContent = `📢 ${campaña.empresa || 'Promoción'}`;
        adLabel.style.background = color;
        adLabel.style.color = '#fff';
    }

    // Cambiar título en la ventana
    const titulo = document.querySelector('.m-titulo');
    if (titulo) {
        titulo.textContent = `🧠 ${campaña.empresa || 'Marquinhos'}`;
    }

    // Mostrar mensaje de campaña en el chat
    const mensajes = document.getElementById('m-mensajes');
    if (mensajes) {
        // Buscar si ya hay un mensaje de campaña
        let campanaMsg = mensajes.querySelector('.m-campana-mensaje');
        if (!campanaMsg) {
            campanaMsg = document.createElement('div');
            campanaMsg.className = 'm-campana-mensaje';
            campanaMsg.style.cssText = `
                padding: 10px 12px;
                margin: 8px 0;
                background: rgba(212,175,55,0.05);
                border-radius: 10px;
                border-left: 3px solid ${color};
                font-size: 0.75rem;
                color: var(--text-secondary);
            `;
            // Insertar al inicio del chat
            mensajes.prepend(campanaMsg);
        }
        
        campanaMsg.innerHTML = `
            <div style="font-weight:bold; color:${color}; font-size:0.8rem;">
                📢 ${campaña.empresa || 'Promoción'}
            </div>
            <div style="margin-top:2px;">${campaña.mensaje || ''}</div>
            ${campaña.url ? `<a href="${campaña.url}" target="_blank" style="color:${color};text-decoration:underline;font-size:0.7rem;margin-top:4px;display:inline-block;">🔗 Ver más</a>` : ''}
        `;
        
        campanaMsg.style.borderLeftColor = color;
    }

    // Guardar en localStorage para persistencia
    try {
        localStorage.setItem('marquinhos_campana_activa', JSON.stringify(campaña));
        localStorage.setItem('marquinhos_campana_fecha', Date.now().toString());
    } catch (e) {}

    console.log('🎨 Marquinhos: Campaña aplicada -', campaña.empresa);
},

/**
 * Restaura el estilo por defecto (rosa) cuando no hay campaña activa
 */
aplicarEstiloPorDefecto() {
    const bubble = document.getElementById('m-burbuja');
    const adLabel = document.getElementById('m-ad-label');
    const icono = bubble?.querySelector('.m-icono');
    const titulo = document.querySelector('.m-titulo');

    if (bubble) {
        bubble.style.background = 'linear-gradient(135deg, #ff6b9d, #ff3366)';
        bubble.style.boxShadow = '0 4px 20px rgba(255,51,102,0.3)';
    }

    if (icono) {
        icono.textContent = '🧠';
    }

    if (adLabel) {
        adLabel.style.display = 'none';
    }

    if (titulo) {
        titulo.textContent = '🧠 Marquinhos';
    }

    // Eliminar mensaje de campaña del chat
    const mensajes = document.getElementById('m-mensajes');
    if (mensajes) {
        const campanaMsg = mensajes.querySelector('.m-campana-mensaje');
        if (campanaMsg) {
            campanaMsg.remove();
        }
    }

    // Limpiar localStorage
    try {
        localStorage.removeItem('marquinhos_campana_activa');
        localStorage.removeItem('marquinhos_campana_fecha');
    } catch (e) {}

    this.campanaActiva = null;
    console.log('🌸 Marquinhos: Estilo rosa por defecto');
},

/**
 * Cargar campaña desde caché al iniciar
 */
cargarCampanaDesdeCache() {
    try {
        const saved = localStorage.getItem('marquinhos_campana_activa');
        if (saved) {
            const campaña = JSON.parse(saved);
            const fecha = parseInt(localStorage.getItem('marquinhos_campana_fecha') || '0');
            const expiracion = 24 * 60 * 60 * 1000; // 24 horas
            if (Date.now() - fecha < expiracion) {
                this.aplicarCampana(campaña);
                console.log('📢 Marquinhos: Campaña cargada desde caché');
                return;
            }
        }
        // Si no hay caché válida, usar estilo por defecto
        this.aplicarEstiloPorDefecto();
    } catch (e) {
        console.warn('⚠️ Error al cargar campaña de caché:', e);
        this.aplicarEstiloPorDefecto();
    }
}