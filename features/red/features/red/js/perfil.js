// ================================================================
// 👤 PERFIL - CSARIEL'S
// ================================================================

// ================================================================
// 📋 DATOS DEL PERFIL
// ================================================================
let perfilData = {
    nombre: 'Csariel',
    usuario: 'csariel',
    bio: '🚀 Explorador digital | Creador de Csariel\'s | Apasionado por la tecnología y el espacio.',
    avatar: 'C',
    amigos: 156,
    publicaciones: 42,
    logros: 8,
    verificado: false
};

// ================================================================
// 🖥️ RENDERIZAR PERFIL
// ================================================================
function renderPerfil() {
    // Avatar
    const avatar = document.getElementById('perfilAvatar');
    if (avatar) {
        avatar.textContent = perfilData.avatar;
    }

    // Nombre
    const nombre = document.getElementById('perfilNombre');
    if (nombre) {
        nombre.textContent = perfilData.nombre;
    }

    // Usuario
    const usuario = document.getElementById('perfilUsuario');
    if (usuario) {
        usuario.textContent = `@${perfilData.usuario}`;
    }

    // Biografía
    const bio = document.getElementById('perfilBio');
    if (bio) {
        bio.innerHTML = `${perfilData.bio} <span class="edit-bio" onclick="editarBio()"><i class="fas fa-pen"></i></span>`;
    }

    // Estadísticas
    const statAmigos = document.getElementById('statAmigos');
    if (statAmigos) statAmigos.textContent = perfilData.amigos;

    const statPublicaciones = document.getElementById('statPublicaciones');
    if (statPublicaciones) statPublicaciones.textContent = perfilData.publicaciones;

    const statLogros = document.getElementById('statLogros');
    if (statLogros) statLogros.textContent = perfilData.logros;

    // Verificación
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
// ✏️ EDITAR PERFIL
// ================================================================
function editarPerfil() {
    mostrarToast('✏️ Modo edición de perfil activado');
}

function editarBio() {
    const bioActual = perfilData.bio;
    const nuevaBio = prompt('✏️ Edita tu biografía:', bioActual);
    if (nuevaBio !== null && nuevaBio.trim() !== '') {
        perfilData.bio = nuevaBio.trim();
        renderPerfil();
        mostrarToast('✅ Biografía actualizada');
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
// 📊 ACTUALIZAR ESTADÍSTICAS
// ================================================================
function actualizarEstadisticasPerfil(amigos, publicaciones, logros) {
    if (amigos !== undefined) perfilData.amigos = amigos;
    if (publicaciones !== undefined) perfilData.publicaciones = publicaciones;
    if (logros !== undefined) perfilData.logros = logros;
    renderPerfil();
}

// ================================================================
// 🌐 EXPORTAR
// ================================================================
window.perfilData = perfilData;
window.renderPerfil = renderPerfil;
window.editarPerfil = editarPerfil;
window.editarBio = editarBio;
window.editarAvatar = editarAvatar;
window.compartirPerfil = compartirPerfil;
window.verificarPerfil = verificarPerfil;
window.actualizarEstadisticasPerfil = actualizarEstadisticasPerfil;