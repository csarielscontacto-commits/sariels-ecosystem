// ================================================================
// 👤 PERFIL - CSARIEL'S (CONECTADO A SUPABASE)
// Requiere que en el HTML, ANTES de este script, se carguen en orden:
//   <script src="ruta/js/client-config-loader.js"></script>
//   <script src="ruta/js/perfil-connector.js"></script>
// ================================================================

let perfilData = {
    nombre: 'Usuario',
    usuario: '',
    bio: '',
    avatar: null,
    amigos: 0,
    publicaciones: 0,
    logros: 0,
    verificado: false
};

// ================================================================
// 🖥️ RENDERIZAR PERFIL
// ================================================================
function renderPerfil() {
    const avatarEl = document.getElementById('perfilAvatar');
    if (avatarEl) {
        if (perfilData.avatar) {
            avatarEl.innerHTML = `<img src="${perfilData.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
                <span class="edit-avatar" onclick="editarAvatar()"><i class="fas fa-camera"></i></span>`;
        } else {
            avatarEl.innerHTML = `${(perfilData.nombre || 'U').charAt(0).toUpperCase()}
                <span class="edit-avatar" onclick="editarAvatar()"><i class="fas fa-camera"></i></span>`;
        }
    }

    const nombre = document.getElementById('perfilNombre');
    if (nombre) nombre.textContent = perfilData.nombre;

    const usuario = document.getElementById('perfilUsuario');
    if (usuario) usuario.textContent = perfilData.usuario ? `@${perfilData.usuario}` : '';

    const bio = document.getElementById('perfilBio');
    if (bio) {
        bio.innerHTML = `${perfilData.bio || 'Sin biografía aún.'} <span class="edit-bio" onclick="editarBio()"><i class="fas fa-pen"></i></span>`;
    }

    const statAmigos = document.getElementById('statAmigos');
    if (statAmigos) statAmigos.textContent = perfilData.amigos;

    const statPublicaciones = document.getElementById('statPublicaciones');
    if (statPublicaciones) statPublicaciones.textContent = perfilData.publicaciones;

    const statLogros = document.getElementById('statLogros');
    if (statLogros) statLogros.textContent = perfilData.logros;

    const badge = document.getElementById('verificationBadge');
    if (badge) {
        if (perfilData.verificado) {
            badge.innerHTML = `<i class="fas fa-check-circle" style="color:var(--success);"></i> Verificado`;
            badge.className = 'badge-verified';
        } else {
            badge.innerHTML = `<i class="fas fa-times-circle"></i> No verificado`;
            badge.className = 'badge-unverified';
        }
    }
}

// ================================================================
// 🔄 CARGAR PERFIL REAL DESDE SUPABASE
// ================================================================
async function cargarPerfilReal() {
    try {
        await window.PerfilConnector.init();
        const perfil = await window.PerfilConnector.cargarPerfil();

        perfilData.nombre = perfil.nombre || 'Usuario';
        perfilData.usuario = perfil.usuario || '';
        perfilData.bio = perfil.bio || '';
        perfilData.avatar = perfil.foto_perfil_url || null;
        perfilData.verificado = perfil.verificado || false;

        const [contactos, publicaciones] = await Promise.all([
            window.PerfilConnector.obtenerContactos(),
            window.PerfilConnector.contarPublicaciones()
        ]);
        perfilData.amigos = contactos.length;
        perfilData.publicaciones = publicaciones;
        perfilData.logros = 0; // ⚠️ Aún no existe tabla de logros

        renderPerfil();
    } catch (err) {
        console.error('❌ Error cargando perfil real:', err);
        mostrarToast('⚠️ No se pudo cargar tu perfil', 'error');
        renderPerfil();
    }
}

// ================================================================
// ✏️ EDITAR PERFIL
// ================================================================
function editarPerfil() {
    mostrarToast('✏️ Modo edición de perfil activado');
}

async function editarBio() {
    const nuevaBio = prompt('✏️ Edita tu biografía:', perfilData.bio);
    if (nuevaBio !== null && nuevaBio.trim() !== '') {
        try {
            await window.PerfilConnector.actualizarPerfil({ bio: nuevaBio.trim() });
            perfilData.bio = nuevaBio.trim();
            renderPerfil();
            mostrarToast('✅ Biografía actualizada');
        } catch (err) {
            console.error(err);
            mostrarToast('❌ No se pudo guardar la biografía', 'error');
        }
    }
}

function editarAvatar() {
    mostrarToast('🖼️ Función de cambio de avatar (próximamente)');
}

function compartirPerfil() {
    if (navigator.share) {
        navigator.share({
            title: `Perfil de ${perfilData.nombre}`,
            text: `¡Mira mi perfil en Csariel's! 🚀`,
            url: window.location.href
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            mostrarToast('✅ Enlace copiado al portapapeles');
        });
    }
}

function verificarPerfil() {
    mostrarToast('📧 Función de verificación (próximamente)');
}

// ================================================================
// 🌐 EXPORTAR
// ================================================================
window.perfilData = perfilData;
window.renderPerfil = renderPerfil;
window.cargarPerfilReal = cargarPerfilReal;
window.editarPerfil = editarPerfil;
window.editarBio = editarBio;
window.editarAvatar = editarAvatar;
window.compartirPerfil = compartirPerfil;
window.verificarPerfil = verificarPerfil;

document.addEventListener('DOMContentLoaded', cargarPerfilReal);