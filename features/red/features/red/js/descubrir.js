// ================================================================
// 🔍 DESCUBRIR - CSARIEL'S
// ================================================================

// ================================================================
// 📋 DATOS DE PERSONAS
// ================================================================
let personasDescubrir = [{
    id: 1,
    nombre: 'Sofía Ramírez',
    username: 'sofia_tech',
    online: true,
    intereses: ['💻 Tecnología', '📷 Fotografía', '🎵 Música'],
    amigosComun: 3,
    ubicacion: 'CDMX'
}, {
    id: 2,
    nombre: 'Diego Torres',
    username: 'diego_dev',
    online: false,
    intereses: ['🚀 Programación', '🎮 Gaming', '📚 Libros'],
    amigosComun: 1,
    ubicacion: 'Guadalajara'
}, {
    id: 3,
    nombre: 'Valentina Mendoza',
    username: 'vale_creator',
    online: true,
    intereses: ['🎨 Diseño', '✍️ Escritura', '🌿 Naturaleza'],
    amigosComun: 5,
    ubicacion: 'Monterrey'
}, {
    id: 4,
    nombre: 'Andrés Gómez',
    username: 'andres_astro',
    online: false,
    intereses: ['🌌 Astronomía', '📡 Ciencia', '🧘 Meditación'],
    amigosComun: 0,
    ubicacion: 'Puebla'
}, {
    id: 5,
    nombre: 'Camila Fernández',
    username: 'cami_art',
    online: true,
    intereses: ['🎨 Arte', '🎭 Teatro', '📸 Cine'],
    amigosComun: 2,
    ubicacion: 'Querétaro'
}, {
    id: 6,
    nombre: 'Luis Martínez',
    username: 'luis_quantum',
    online: false,
    intereses: ['⚛️ Física', '💡 Innovación', '📊 Datos'],
    amigosComun: 4,
    ubicacion: 'Toluca'
}, {
    id: 7,
    nombre: 'Elena Rojas',
    username: 'elena_space',
    online: true,
    intereses: ['🚀 Exploración', '🔭 Telescopios', '📖 Lectura'],
    amigosComun: 1,
    ubicacion: 'CDMX'
}, {
    id: 8,
    nombre: 'Pablo Herrera',
    username: 'pablo_creative',
    online: false,
    intereses: ['💡 Creatividad', '🎬 Video', '✏️ Dibujo'],
    amigosComun: 3,
    ubicacion: 'Morelia'
}];

let filtroActualDescubrir = 'todos';

// ================================================================
// 🖥️ RENDERIZAR PERSONAS
// ================================================================
function renderPersonasDescubrir() {
    const grid = document.getElementById('personasGrid');
    if (!grid) return;

    let filtrados = [...personasDescubrir];

    if (filtroActualDescubrir === 'online') {
        filtrados = filtrados.filter(p => p.online);
    } else if (filtroActualDescubrir === 'cercanos') {
        filtrados = filtrados.filter(p => p.ubicacion === 'CDMX');
    } else if (filtroActualDescubrir === 'intereses') {
        filtrados = filtrados.filter(p => p.intereses.length >= 2);
    } else if (filtroActualDescubrir === 'nuevos') {
        filtrados = filtrados.slice(0, 4);
    }

    const busqueda = document.getElementById('buscarPersonas')?.value.toLowerCase() || '';
    if (busqueda) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(busqueda) ||
            p.username.toLowerCase().includes(busqueda) ||
            p.intereses.some(i => i.toLowerCase().includes(busqueda))
        );
    }

    if (filtrados.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <div class="icon">🔍</div>
                <h3>Sin resultados</h3>
                <p>No se encontraron personas con esos criterios.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtrados.map(p => `
        <div class="persona-card" data-id="${p.id}">
            <div class="persona-avatar" onclick="verPerfilDescubrir('${p.id}')">
                ${p.nombre.charAt(0)}
                <span class="online-dot ${p.online ? 'online' : 'offline'}"></span>
            </div>
            <div class="persona-info">
                <div class="persona-nombre">${p.nombre}</div>
                <div class="persona-username">@${p.username}</div>
                <div class="persona-intereses">
                    ${p.intereses.map(i => `<span class="tag">${i}</span>`).join('')}
                </div>
                <div class="persona-mutual">
                    <i class="fas fa-users"></i> ${p.amigosComun} amigos en común
                    ${p.ubicacion ? `· 📍 ${p.ubicacion}` : ''}
                </div>
            </div>
            <div class="persona-acciones">
                <button class="btn btn-primary btn-sm" onclick="enviarSolicitudDescubrir('${p.id}')">
                    <i class="fas fa-user-plus"></i> Conectar
                </button>
            </div>
        </div>
    `).join('');
}

// ================================================================
// 🔍 FILTROS Y BÚSQUEDA
// ================================================================
function filtrarPersonasDescubrir() {
    renderPersonasDescubrir();
}

function aplicarFiltroDescubrir(filtro) {
    filtroActualDescubrir = filtro;
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.filtro-btn[data-filtro="${filtro}"]`)?.classList.add('active');
    renderPersonasDescubrir();
}

// ================================================================
// 🎯 ACCIONES
// ================================================================
function enviarSolicitudDescubrir(id) {
    const p = personasDescubrir.find(p => p.id == id);
    if (!p) return;

    const btn = document.querySelector(`.persona-card[data-id="${id}"] .btn`);
    if (btn) {
        btn.innerHTML = `<i class="fas fa-check"></i> Solicitud enviada`;
        btn.className = 'btn btn-success btn-sm';
        btn.disabled = true;
    }

    mostrarToast(`📨 Solicitud enviada a ${p.nombre}`);
}

function verPerfilDescubrir(id) {
    const p = personasDescubrir.find(p => p.id == id);
    if (p) {
        mostrarToast(`👤 Perfil de ${p.nombre}`);
    }
}

// ================================================================
// 🌐 EXPORTAR
// ================================================================
window.personasDescubrir = personasDescubrir;
window.renderPersonasDescubrir = renderPersonasDescubrir;
window.filtrarPersonasDescubrir = filtrarPersonasDescubrir;
window.aplicarFiltroDescubrir = aplicarFiltroDescubrir;
window.enviarSolicitudDescubrir = enviarSolicitudDescubrir;
window.verPerfilDescubrir = verPerfilDescubrir;