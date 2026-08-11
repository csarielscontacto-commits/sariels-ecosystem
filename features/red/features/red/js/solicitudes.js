// ================================================================
// 📬 SOLICITUDES - CSARIEL'S
// ================================================================

// ================================================================
// 📋 DATOS DE SOLICITUDES
// ================================================================
let solicitudesLista = [{
    id: 1,
    nombre: 'Carlos Ruiz',
    username: 'carlos_dev',
    online: true,
    mensaje: 'Hola, me encantaría conectar contigo',
    tiempo: 'Hace 2 horas',
    tipo: 'recibida',
    estado: 'pendiente'
}, {
    id: 2,
    nombre: 'Ana Martínez',
    username: 'ana_space',
    online: true,
    mensaje: '¡Hola! Vi tu perfil y me interesa tu trabajo',
    tiempo: 'Hace 4 horas',
    tipo: 'recibida',
    estado: 'pendiente'
}, {
    id: 3,
    nombre: 'Patricia López',
    username: 'paty_creator',
    online: false,
    mensaje: '¿Te gustaría colaborar en un proyecto?',
    tiempo: 'Hace 1 día',
    tipo: 'recibida',
    estado: 'pendiente'
}, {
    id: 4,
    nombre: 'Roberto Fernández',
    username: 'roberto_quantum',
    online: false,
    mensaje: 'Gracias por la solicitud',
    tiempo: 'Hace 2 días',
    tipo: 'enviada',
    estado: 'pendiente'
}, {
    id: 5,
    nombre: 'Miguel Ángel',
    username: 'mike_tech',
    online: true,
    mensaje: '¡Claro! Con gusto',
    tiempo: 'Hace 3 días',
    tipo: 'enviada',
    estado: 'aceptada'
}];

let tabActualSolicitudes = 'recibidas';

// ================================================================
// 🖥️ RENDERIZAR SOLICITUDES
// ================================================================
function renderSolicitudesLista() {
    const grid = document.getElementById('solicitudesGrid');
    if (!grid) return;

    let filtradas = [...solicitudesLista];

    if (tabActualSolicitudes === 'recibidas') {
        filtradas = filtradas.filter(s => s.tipo === 'recibida' && s.estado === 'pendiente');
    } else if (tabActualSolicitudes === 'pendientes') {
        filtradas = filtradas.filter(s => s.estado === 'pendiente');
    } else if (tabActualSolicitudes === 'enviadas') {
        filtradas = filtradas.filter(s => s.tipo === 'enviada');
    }

    const recibidas = solicitudesLista.filter(s => s.tipo === 'recibida' && s.estado === 'pendiente').length;
    const enviadas = solicitudesLista.filter(s => s.tipo === 'enviada').length;
    const pendientes = solicitudesLista.filter(s => s.estado === 'pendiente').length;

    const total = document.getElementById('totalSolicitudes');
    if (total) total.textContent = recibidas;

    const badgeRecibidas = document.getElementById('badgeRecibidas');
    if (badgeRecibidas) badgeRecibidas.textContent = recibidas;

    const badgeEnviadas = document.getElementById('badgeEnviadas');
    if (badgeEnviadas) badgeEnviadas.textContent = enviadas;

    const badgePendientes = document.getElementById('badgePendientes');
    if (badgePendientes) badgePendientes.textContent = pendientes;

    if (filtradas.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <div class="icon">📭</div>
                <h3>Sin solicitudes</h3>
                <p>No tienes solicitudes pendientes.</p>
                <a href="../descubrir/index.html" class="btn btn-primary btn-sm" style="margin-top:8px;">
                    <i class="fas fa-compass"></i> Descubrir personas
                </a>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtradas.map(s => {
        const esRecibida = s.tipo === 'recibida';
        return `
            <div class="solicitud-card" data-id="${s.id}">
                <div class="solicitud-avatar" onclick="verPerfilSolicitud('${s.id}')">
                    ${s.nombre.charAt(0)}
                    <span class="online-dot ${s.online ? 'online' : 'offline'}"></span>
                </div>
                <div class="solicitud-info">
                    <div class="solicitud-nombre">${s.nombre}</div>
                    <div class="solicitud-username">@${s.username}</div>
                    <div class="solicitud-mensaje">
                        <i class="fas fa-quote-left"></i> ${s.mensaje}
                    </div>
                    <div class="solicitud-tiempo">${s.tiempo}</div>
                </div>
                <div class="solicitud-acciones">
                    ${esRecibida ? `
                        <button class="btn btn-success btn-sm" onclick="aceptarSolicitudLista(${s.id})">
                            <i class="fas fa-check"></i> Aceptar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="rechazarSolicitudLista(${s.id})">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    ` : `
                        <button class="btn btn-outline btn-sm" onclick="cancelarSolicitudLista(${s.id})">
                            <i class="fas fa-undo"></i> Cancelar
                        </button>
                        <span style="font-size:0.45rem;color:var(--text-muted);text-align:center;">
                            ${s.estado === 'aceptada' ? '✅ Aceptada' : '⏳ Pendiente'}
                        </span>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// ================================================================
// 🎯 ACCIONES
// ================================================================
function cambiarTabSolicitudes(tab) {
    tabActualSolicitudes = tab;
    document.querySelectorAll('.tab-sol').forEach(b => b.classList.remove('active'));
    document.querySelector(`.tab-sol[data-tab="${tab}"]`)?.classList.add('active');
    renderSolicitudesLista();
}

function aceptarSolicitudLista(id) {
    const sol = solicitudesLista.find(s => s.id === id);
    if (!sol) return;
    sol.estado = 'aceptada';
    mostrarToast(`✅ Aceptaste la solicitud de ${sol.nombre}`);
    renderSolicitudesLista();
}

function rechazarSolicitudLista(id) {
    const sol = solicitudesLista.find(s => s.id === id);
    if (!sol) return;
    solicitudesLista = solicitudesLista.filter(s => s.id !== id);
    mostrarToast(`❌ Rechazaste la solicitud de ${sol.nombre}`);
    renderSolicitudesLista();
}

function cancelarSolicitudLista(id) {
    const sol = solicitudesLista.find(s => s.id === id);
    if (!sol) return;
    solicitudesLista = solicitudesLista.filter(s => s.id !== id);
    mostrarToast(`↩️ Cancelaste la solicitud a ${sol.nombre}`);
    renderSolicitudesLista();
}

function verPerfilSolicitud(id) {
    const sol = solicitudesLista.find(s => s.id === id);
    if (sol) {
        mostrarToast(`👤 Perfil de ${sol.nombre}`);
    }
}

// ================================================================
// 🌐 EXPORTAR
// ================================================================
window.solicitudesLista = solicitudesLista;
window.renderSolicitudesLista = renderSolicitudesLista;
window.cambiarTabSolicitudes = cambiarTabSolicitudes;
window.aceptarSolicitudLista = aceptarSolicitudLista;
window.rechazarSolicitudLista = rechazarSolicitudLista;
window.cancelarSolicitudLista = cancelarSolicitudLista;
window.verPerfilSolicitud = verPerfilSolicitud;