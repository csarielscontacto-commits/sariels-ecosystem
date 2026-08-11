// ================================================================
// 🔔 NOTIFICACIONES - CSARIEL'S
// ================================================================

// ================================================================
// 📋 DATOS DE NOTIFICACIONES
// ================================================================
let notificacionesLista = [{
    id: 1,
    tipo: 'like',
    icono: '❤️',
    usuario: 'María',
    texto: 'le dio like a tu publicación',
    enlace: '../publicaciones/index.html',
    leida: false,
    fecha: new Date(Date.now() - 600000),
    accion: null
}, {
    id: 2,
    tipo: 'comment',
    icono: '💬',
    usuario: 'Javier',
    texto: 'comentó en tu publicación: "¡Increíble! 🚀"',
    enlace: '../publicaciones/index.html',
    leida: false,
    fecha: new Date(Date.now() - 1800000),
    accion: null
}, {
    id: 3,
    tipo: 'request',
    icono: '📬',
    usuario: 'Laura',
    texto: 'te envió una solicitud de amistad',
    enlace: '../solicitudes/index.html',
    leida: false,
    fecha: new Date(Date.now() - 3600000),
    accion: { tipo: 'aceptar', texto: 'Aceptar' }
}, {
    id: 4,
    tipo: 'follow',
    icono: '👤',
    usuario: 'Carlos',
    texto: 'comenzó a seguirte',
    enlace: '../perfil/index.html?user=Carlos',
    leida: true,
    fecha: new Date(Date.now() - 7200000),
    accion: null
}, {
    id: 5,
    tipo: 'system',
    icono: '⚙️',
    usuario: 'Sistema',
    texto: 'Tu perfil ha sido verificado ✅',
    enlace: '../perfil/index.html',
    leida: true,
    fecha: new Date(Date.now() - 86400000),
    accion: null
}];

let filtroActualNotificaciones = 'todas';

// ================================================================
// 🖥️ RENDERIZAR NOTIFICACIONES
// ================================================================
function renderNotificacionesLista() {
    const container = document.getElementById('notificacionesList');
    if (!container) return;

    let filtradas = [...notificacionesLista];

    if (filtroActualNotificaciones === 'no-leidas') {
        filtradas = filtradas.filter(n => !n.leida);
    } else if (filtroActualNotificaciones === 'likes') {
        filtradas = filtradas.filter(n => n.tipo === 'like');
    } else if (filtroActualNotificaciones === 'comentarios') {
        filtradas = filtradas.filter(n => n.tipo === 'comment');
    } else if (filtroActualNotificaciones === 'solicitudes') {
        filtradas = filtradas.filter(n => n.tipo === 'request');
    } else if (filtroActualNotificaciones === 'sistema') {
        filtradas = filtradas.filter(n => n.tipo === 'system');
    }

    filtradas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    const noLeidas = notificacionesLista.filter(n => !n.leida).length;
    const total = document.getElementById('totalNotificaciones');
    if (total) total.textContent = noLeidas;

    if (filtradas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔕</div>
                <h3>Sin notificaciones</h3>
                <p>No tienes notificaciones nuevas.</p>
            </div>
        `;
        return;
    }

    const clasesIcono = {
        'like': 'like',
        'comment': 'comment',
        'follow': 'follow',
        'request': 'request',
        'system': 'system'
    };

    container.innerHTML = filtradas.map(n => {
        const tiempo = calcularTiempoNotificacion(n.fecha);
        return `
            <div class="notificacion-item ${!n.leida ? 'no-leida' : ''}" onclick="irEnlaceNotificacion('${n.enlace}')">
                <div class="icono ${clasesIcono[n.tipo] || 'system'}">${n.icono}</div>
                <div class="contenido">
                    <div class="texto"><strong>${n.usuario}</strong> ${n.texto}</div>
                    <div class="tiempo">${tiempo}</div>
                </div>
                <div class="accion">
                    ${n.accion ? `<button class="btn btn-success btn-sm" onclick="event.stopPropagation();accionNotificacionLista(${n.id})">${n.accion.texto}</button>` : ''}
                    ${!n.leida ? `<button class="btn-accion" onclick="event.stopPropagation();marcarLeidaNotificacion(${n.id})" title="Marcar como leída"><i class="fas fa-check-circle"></i></button>` : ''}
                    <button class="btn-accion" onclick="event.stopPropagation();eliminarNotificacionLista(${n.id})" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

// ================================================================
// ⏱️ CALCULAR TIEMPO
// ================================================================
function calcularTiempoNotificacion(fecha) {
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
// 🔍 FILTROS
// ================================================================
function aplicarFiltroNotificaciones(filtro) {
    filtroActualNotificaciones = filtro;
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.filtro-btn[data-filtro="${filtro}"]`)?.classList.add('active');
    renderNotificacionesLista();
}

// ================================================================
// 🎯 ACCIONES
// ================================================================
function marcarLeidaNotificacion(id) {
    const noti = notificacionesLista.find(n => n.id === id);
    if (noti) {
        noti.leida = true;
        renderNotificacionesLista();
    }
}

function marcarTodasLeidasNotificaciones() {
    notificacionesLista.forEach(n => n.leida = true);
    renderNotificacionesLista();
    mostrarToast('✅ Todas marcadas como leídas');
}

function eliminarNotificacionLista(id) {
    notificacionesLista = notificacionesLista.filter(n => n.id !== id);
    renderNotificacionesLista();
}

function accionNotificacionLista(id) {
    const noti = notificacionesLista.find(n => n.id === id);
    if (!noti) return;
    if (noti.tipo === 'request') {
        mostrarToast(`✅ Solicitud de ${noti.usuario} aceptada`);
        noti.leida = true;
        renderNotificacionesLista();
    }
}

function irEnlaceNotificacion(enlace) {
    if (enlace) {
        window.location.href = enlace;
    }
}

// ================================================================
// 🌐 EXPORTAR
// ================================================================
window.notificacionesLista = notificacionesLista;
window.renderNotificacionesLista = renderNotificacionesLista;
window.aplicarFiltroNotificaciones = aplicarFiltroNotificaciones;
window.marcarLeidaNotificacion = marcarLeidaNotificacion;
window.marcarTodasLeidasNotificaciones = marcarTodasLeidasNotificaciones;
window.eliminarNotificacionLista = eliminarNotificacionLista;
window.accionNotificacionLista = accionNotificacionLista;
window.irEnlaceNotificacion = irEnlaceNotificacion;