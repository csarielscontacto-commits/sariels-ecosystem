// ================================================================
// 📝 PUBLICACIONES - CSARIEL'S
// ================================================================

// ================================================================
// 📋 DATOS
// ================================================================
let publicaciones = [];
let nextId = 1;

// ================================================================
// 🖥️ RENDERIZAR PUBLICACIONES
// ================================================================
function renderPublicaciones(containerId) {
    const container = document.getElementById(containerId || 'publicacionesContainer');
    if (!container) return;

    const idioma = localStorage.getItem('csariels_idioma') || 'es';
    const t = CSARIELS_IDIOMA.traducciones || {};

    if (publicaciones.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--text-muted);">
                <div style="font-size:3rem;opacity:0.3;margin-bottom:8px;">📝</div>
                <h3 style="font-family:'Orbitron',monospace;font-size:0.85rem;color:var(--text-secondary);">
                    ${t.sin_publicaciones || 'Sin publicaciones'}
                </h3>
                <p style="font-size:0.65rem;">
                    ${t.sin_publicaciones_desc || 'Sé el primero en compartir algo con la comunidad.'}
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = publicaciones.map(p => {
        const tiempo = calcularTiempo(p.fecha);
        const likes = p.likes || 0;
        const comentarios = p.comentarios || [];

        return `
            <div class="publicacion" data-id="${p.id}">
                <div class="pub-header">
                    <div class="pub-avatar" onclick="verPerfil('${p.autor}')">${p.avatar || p.autor.charAt(0)}</div>
                    <div class="pub-info">
                        <div class="pub-autor" onclick="verPerfil('${p.autor}')">${p.autor}</div>
                        <div class="pub-fecha">${tiempo}</div>
                    </div>
                    <button class="pub-menu" onclick="mostrarOpcionesPublicacion(${p.id})">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>

                <div class="pub-contenido">
                    ${p.contenido}
                    ${p.imagen ? `<img src="${p.imagen}" alt="Imagen de publicación" />` : ''}
                </div>

                <div class="pub-acciones">
                    <button onclick="darLike(${p.id})" class="${p.liked ? 'liked' : ''}">
                        <i class="fas fa-heart"></i> <span>${likes}</span>
                    </button>
                    <button onclick="toggleComentarios(${p.id})">
                        <i class="fas fa-comment"></i> <span>${comentarios.length}</span>
                    </button>
                    <button onclick="compartirPublicacion(${p.id})">
                        <i class="fas fa-share"></i> ${t.compartir || 'Compartir'}
                    </button>
                </div>

                <div class="pub-comentarios" id="comentarios-${p.id}" style="display:${p.mostrarComentarios ? 'block' : 'none'}">
                    ${comentarios.map(c => `
                        <div class="comentario">
                            <div class="c-avatar">${c.avatar || c.autor.charAt(0)}</div>
                            <div class="c-texto">
                                <span class="c-nombre">${c.autor}</span>
                                ${c.texto}
                                <span class="c-hora">${calcularTiempo(c.fecha)}</span>
                            </div>
                        </div>
                    `).join('')}
                    <div class="input-comentario">
                        <input type="text" id="inputComentario-${p.id}" placeholder="${t.escribe_comentario || 'Escribe un comentario...'}" />
                        <button class="btn btn-primary btn-sm" onclick="agregarComentario(${p.id})">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ================================================================
// 📝 CREAR PUBLICACIÓN
// ================================================================
function crearPublicacion(texto, imagen = null) {
    if (!texto || texto.trim() === '') {
        mostrarToast('⚠️ Escribe algo para publicar', 'error');
        return null;
    }

    const nueva = {
        id: nextId++,
        autor: 'Csariel',
        avatar: 'C',
        contenido: texto.trim(),
        imagen: imagen,
        fecha: new Date(),
        likes: 0,
        comentarios: [],
        liked: false,
        mostrarComentarios: false
    };

    publicaciones.unshift(nueva);
    renderPublicaciones();
    return nueva;
}

// ================================================================
// ❤️ LIKES
// ================================================================
function darLike(id) {
    const pub = publicaciones.find(p => p.id === id);
    if (!pub) return;
    pub.liked = !pub.liked;
    pub.likes += pub.liked ? 1 : -1;
    renderPublicaciones();
}

// ================================================================
// 💬 COMENTARIOS
// ================================================================
function toggleComentarios(id) {
    const pub = publicaciones.find(p => p.id === id);
    if (!pub) return;
    pub.mostrarComentarios = !pub.mostrarComentarios;
    renderPublicaciones();
    if (pub.mostrarComentarios) {
        setTimeout(() => {
            const input = document.getElementById(`inputComentario-${id}`);
            if (input) input.focus();
        }, 100);
    }
}

function agregarComentario(id) {
    const input = document.getElementById(`inputComentario-${id}`);
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) return;

    const pub = publicaciones.find(p => p.id === id);
    if (!pub) return;

    pub.comentarios.push({
        autor: 'Csariel',
        avatar: 'C',
        texto: texto,
        fecha: new Date()
    });

    input.value = '';
    renderPublicaciones();
}

// ================================================================
// 📤 COMPARTIR
// ================================================================
function compartirPublicacion(id) {
    const pub = publicaciones.find(p => p.id === id);
    if (!pub) return;

    if (navigator.share) {
        navigator.share({
            title: 'Publicación de Csariel\'s',
            text: pub.contenido,
        }).catch(() => {});
    } else {
        mostrarToast('📤 Compartir');
    }
}

// ================================================================
// ⚙️ OPCIONES
// ================================================================
function mostrarOpcionesPublicacion(id) {
    const pub = publicaciones.find(p => p.id === id);
    if (!pub) return;

    if (confirm(`¿Eliminar esta publicación de ${pub.autor}?`)) {
        publicaciones = publicaciones.filter(p => p.id !== id);
        renderPublicaciones();
        mostrarToast('🗑️ Publicación eliminada');
    }
}

// ================================================================
// 👤 VER PERFIL
// ================================================================
function verPerfil(autor) {
    mostrarToast(`👤 Perfil de ${autor}`);
}

// ================================================================
// ⏱️ CALCULAR TIEMPO
// ================================================================
function calcularTiempo(fecha) {
    if (!fecha) return 'Recién';
    const diff = Date.now() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos} min`;
    if (horas < 24) return `${horas} h`;
    if (dias < 7) return `${dias} d`;
    return fecha.toLocaleDateString();
}

// ================================================================
// 📥 CARGAR PUBLICACIONES INICIALES
// ================================================================
function cargarPublicacionesIniciales() {
    if (publicaciones.length === 0) {
        publicaciones = [{
            id: nextId++,
            autor: 'Csariel',
            avatar: 'C',
            contenido: '🚀 ¡Bienvenidos a la sección de Publicaciones! Comparte tus ideas, proyectos y momentos con la comunidad. 🌟',
            imagen: null,
            fecha: new Date(Date.now() - 120000),
            likes: 24,
            comentarios: [
                { autor: 'María', avatar: 'M', texto: '¡Excelente iniciativa!', fecha: new Date(Date.now() - 60000) },
                { autor: 'Javier', avatar: 'J', texto: 'Me encanta esta comunidad 🚀', fecha: new Date(Date.now() - 30000) }
            ],
            liked: false,
            mostrarComentarios: false
        }, {
            id: nextId++,
            autor: 'María',
            avatar: 'M',
            contenido: '🎉 ¡Acabo de lanzar mi nuevo proyecto! Estoy muy emocionada de compartirlo con todos. ¿Qué opinan?',
            imagen: null,
            fecha: new Date(Date.now() - 3600000),
            likes: 18,
            comentarios: [
                { autor: 'Csariel', avatar: 'C', texto: '¡Felicidades María! Se ve increíble 💪', fecha: new Date(Date.now() - 1800000) }
            ],
            liked: false,
            mostrarComentarios: false
        }, {
            id: nextId++,
            autor: 'Javier',
            avatar: 'J',
            contenido: '🌌 Explorando nuevas fronteras en el mundo de la tecnología. ¿Alguien más está trabajando en algo interesante?',
            imagen: null,
            fecha: new Date(Date.now() - 7200000),
            likes: 12,
            comentarios: [],
            liked: false,
            mostrarComentarios: false
        }];
    }
}

// ================================================================
// 🌐 EXPORTAR
// ================================================================
window.publicaciones = publicaciones;
window.renderPublicaciones = renderPublicaciones;
window.crearPublicacion = crearPublicacion;
window.darLike = darLike;
window.toggleComentarios = toggleComentarios;
window.agregarComentario = agregarComentario;
window.compartirPublicacion = compartirPublicacion;
window.mostrarOpcionesPublicacion = mostrarOpcionesPublicacion;
window.verPerfil = verPerfil;
window.calcularTiempo = calcularTiempo;
window.cargarPublicacionesIniciales = cargarPublicacionesIniciales;