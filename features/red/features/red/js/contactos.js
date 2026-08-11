// ================================================================
// 👥 CONTACTOS - CSARIEL'S
// ================================================================

// ================================================================
// 📋 DATOS DE CONTACTOS
// ================================================================
let contactosLista = [{
    id: 1,
    nombre: 'María García',
    username: 'maria_tech',
    online: true,
    ubicacion: 'México DF',
    ultimoMensaje: 'Hola, ¿cómo estás?',
    hora: '10:30 AM'
}, {
    id: 2,
    nombre: 'Javier Morales',
    username: 'javi_astro',
    online: false,
    ubicacion: 'Guadalajara',
    ultimoMensaje: 'Nos vemos mañana',
    hora: 'Ayer'
}, {
    id: 3,
    nombre: 'Laura Sánchez',
    username: 'laura_cosmic',
    online: true,
    ubicacion: 'Monterrey',
    ultimoMensaje: '¡Excelente!',
    hora: '9:15 AM'
}, {
    id: 4,
    nombre: 'Carlos Ruiz',
    username: 'carlos_dev',
    online: false,
    ubicacion: 'Puebla',
    ultimoMensaje: 'Estoy trabajando en eso',
    hora: 'Ayer'
}, {
    id: 5,
    nombre: 'Ana Martínez',
    username: 'ana_space',
    online: true,
    ubicacion: 'Querétaro',
    ultimoMensaje: 'Gracias por la ayuda 👍',
    hora: '8:45 AM'
}, {
    id: 6,
    nombre: 'Roberto Fernández',
    username: 'roberto_quantum',
    online: false,
    ubicacion: 'Toluca',
    ultimoMensaje: '¿Qué opinas?',
    hora: 'Hace 2 días'
}, {
    id: 7,
    nombre: 'Patricia López',
    username: 'paty_creator',
    online: true,
    ubicacion: 'CDMX',
    ultimoMensaje: '¡Fue increíble!',
    hora: '11:00 AM'
}, {
    id: 8,
    nombre: 'Miguel Ángel',
    username: 'mike_tech',
    online: false,
    ubicacion: 'Morelia',
    ultimoMensaje: 'Nos vemos pronto',
    hora: 'Hace 3 días'
}];

let filtroActualContactos = 'todos';

// ================================================================
// 🖥️ RENDERIZAR CONTACTOS
// ================================================================
function renderContactosLista() {
    const grid = document.getElementById('contactosGrid');
    if (!grid) return;

    let filtrados = [...contactosLista];

    if (filtroActualContactos === 'online') {
        filtrados = filtrados.filter(c => c.online);
    } else if (filtroActualContactos === 'offline') {
        filtrados = filtrados.filter(c => !c.online);
    } else if (filtroActualContactos === 'recientes') {
        filtrados = filtrados.slice(0, 4);
    }

    const busqueda = document.getElementById('buscarContactos')?.value.toLowerCase() || '';
    if (busqueda) {
        filtrados = filtrados.filter(c =>
            c.nombre.toLowerCase().includes(busqueda) ||
            c.username.toLowerCase().includes(busqueda)
        );
    }

    const total = document.getElementById('totalContactos');
    if (total) total.textContent = `(${filtrados.length})`;

    if (filtrados.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <div class="icon">👥</div>
                <h3>Sin contactos</h3>
                <p>Aún no tienes contactos. ¡Empieza a conectar!</p>
                <a href="../descubrir/index.html" class="btn btn-primary btn-sm" style="margin-top:8px;">
                    <i class="fas fa-compass"></i> Ir a Descubrir
                </a>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtrados.map(c => `
        <div class="contacto-card" data-id="${c.id}">
            <div class="contacto-avatar" onclick="verPerfilContacto('${c.id}')">
                ${c.nombre.charAt(0)}
                <span class="online-dot ${c.online ? 'online' : 'offline'}"></span>
            </div>
            <div class="contacto-info" onclick="verPerfilContacto('${c.id}')">
                <div class="contacto-nombre">${c.nombre}</div>
                <div class="contacto-username">@${c.username}</div>
                <div class="contacto-ubicacion">
                    <i class="fas fa-map-marker-alt"></i> ${c.ubicacion}
                    ${c.online ? ' 🟢' : ' ⚪'}
                </div>
            </div>
            <div class="contacto-acciones">
                <button class="btn btn-primary btn-sm" onclick="abrirChatContacto('${c.id}')" title="Chat">
                    <i class="fas fa-comment"></i>
                </button>
                <button class="btn btn-outline btn-sm" onclick="verPerfilContacto('${c.id}')" title="Perfil">
                    <i class="fas fa-user"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarContactoLista('${c.id}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ================================================================
// 🔍 FILTROS Y BÚSQUEDA
// ================================================================
function filtrarContactosLista() {
    renderContactosLista();
}

function aplicarFiltroContactos(filtro) {
    filtroActualContactos = filtro;
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.filtro-btn[data-filtro="${filtro}"]`)?.classList.add('active');
    renderContactosLista();
}

// ================================================================
// 🎯 ACCIONES
// ================================================================
function abrirChatContacto(id) {
    const c = contactosLista.find(c => c.id == id);
    if (c) {
        mostrarToast(`💬 Abriendo chat con ${c.nombre}...`);
    }
}

function verPerfilContacto(id) {
    const c = contactosLista.find(c => c.id == id);
    if (c) {
        mostrarToast(`👤 Perfil de ${c.nombre}`);
    }
}

function eliminarContactoLista(id) {
    const c = contactosLista.find(c => c.id == id);
    if (!c) return;
    if (confirm(`¿Eliminar a ${c.nombre} de tus contactos?`)) {
        contactosLista = contactosLista.filter(c => c.id != id);
        renderContactosLista();
        mostrarToast(`✅ ${c.nombre} eliminado de contactos`);
    }
}

function agregarContactoLista() {
    mostrarToast('👤 Buscar personas para agregar...');
}

// ================================================================
// 🌐 EXPORTAR
// ================================================================
window.contactosLista = contactosLista;
window.renderContactosLista = renderContactosLista;
window.filtrarContactosLista = filtrarContactosLista;
window.aplicarFiltroContactos = aplicarFiltroContactos;
window.abrirChatContacto = abrirChatContacto;
window.verPerfilContacto = verPerfilContacto;
window.eliminarContactoLista = eliminarContactoLista;
window.agregarContactoLista = agregarContactoLista;