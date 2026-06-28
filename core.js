// --- 1. Verificación de seguridad legal ---
function verificarAcceso() {
    if (!localStorage.getItem('aceptoTerminos')) {
        window.location.href = '../legales/terminos.html';
    }
}
verificarAcceso();

// --- 2. Persistencia de Datos (Local Storage) ---
function guardarDatos() {
    const estadoGuardar = {
        relaciones: relaciones,
        miPerfil: miPerfil
    };
    localStorage.setItem('sariel_ecosystem_data', JSON.stringify(estadoGuardar));
}

function cargarDatos() {
    const guardado = localStorage.getItem('sariel_ecosystem_data');
    if (guardado) {
        const datos = JSON.parse(guardado);
        relaciones = datos.relaciones || relaciones;
        miPerfil = datos.miPerfil || miPerfil;
    }
}

// --- 3. Lógica principal de la red ---
let miPerfil = { nombre: 'Tú', telefono: '55 0000 0000', fotoPerfil: null };

let todosLosClientes = [
    { id: 'cli_001', nombre: 'María García', telefono: '55 1234 5678', nivel: 'oro', fotoPerfil: null },
    { id: 'cli_002', nombre: 'Carlos Ruiz', telefono: '55 2345 6789', nivel: 'plata', fotoPerfil: null },
    { id: 'cli_003', nombre: 'Ana López', telefono: '55 3456 7890', nivel: 'diamante', fotoPerfil: null },
    { id: 'cli_004', nombre: 'Luis Morales', telefono: '55 4567 8901', nivel: 'bronce', fotoPerfil: null },
    { id: 'cli_005', nombre: 'Pedro Sánchez', telefono: '55 5678 9012', nivel: 'plata', fotoPerfil: null },
    { id: 'cli_006', nombre: 'Lupita Vega', telefono: '55 6789 0123', nivel: 'bronce', fotoPerfil: null },
];

let relaciones = {
    'cli_001': 'contacto',
    'cli_002': 'contacto',
    'cli_003': 'solicitud_recibida',
    'cli_004': 'solicitud_enviada',
};

// --- Funciones de Renderizado ---
function emojiNivel(nivel) {
    return { bronce: '🥉', plata: '🥈', oro: '🥇', diamante: '💎' }[nivel] || '🍪';
}

function avatarHTML(persona) {
    return persona.fotoPerfil ? `<img src="${persona.fotoPerfil}" alt="${persona.nombre}">` : persona.nombre.charAt(0);
}

function renderContactos() {
    const ids = Object.keys(relaciones).filter(id => relaciones[id] === 'contacto');
    const cont = document.getElementById('listaContactos');
    if (!cont) return;
    if (ids.length === 0) {
        cont.innerHTML = `<div class="estado-vacio"><div class="icono">👥</div>Todavía no tienes contactos.</div>`;
        document.getElementById('miContactosCount').textContent = '0';
        return;
    }
    document.getElementById('miContactosCount').textContent = ids.length;
    cont.innerHTML = ids.map(id => {
        const p = todosLosClientes.find(c => c.id === id);
        return `<div class="persona-card"><div class="avatar" onclick="abrirPerfil('${p.id}')">${avatarHTML(p)}</div><div class="persona-info" onclick="abrirPerfil('${p.id}')"><div class="nombre">${p.nombre}</div><div class="meta"><span class="nivel-chip ${p.nivel}">${emojiNivel(p.nivel)} ${p.nivel}</span></div></div><div class="acciones-persona"><button class="btn-accion btn-mensaje" onclick="irAChat('${p.id}')">💬 Chat</button></div></div>`;
    }).join('');
}

function renderSolicitudes() {
    const ids = Object.keys(relaciones).filter(id => relaciones[id] === 'solicitud_recibida');
    const cont = document.getElementById('listaSolicitudes');
    const badge = document.getElementById('badgeSolicitudes');
    if (!cont) return;
    if (ids.length === 0) { badge.style.display = 'none'; cont.innerHTML = `<div class="estado-vacio"><div class="icono">📭</div>No hay solicitudes.</div>`; return; }
    badge.style.display = 'inline-block'; badge.textContent = ids.length;
    cont.innerHTML = ids.map(id => {
        const p = todosLosClientes.find(c => c.id === id);
        return `<div class="persona-card"><div class="avatar">${avatarHTML(p)}</div><div class="persona-info"><div class="nombre">${p.nombre}</div></div><div class="acciones-persona"><button class="btn-accion btn-aceptar" onclick="aceptarSolicitud('${p.id}')">Aceptar</button><button class="btn-accion btn-rechazar" onclick="rechazarSolicitud('${p.id}')">Rechazar</button></div></div>`;
    }).join('');
}

function renderDescubrir(filtro = '') {
    const cont = document.getElementById('listaDescubrir');
    if (!cont) return;
    const ids = todosLosClientes.filter(c => !relaciones[c.id] || relaciones[c.id] === 'solicitud_enviada').filter(c => c.nombre.toLowerCase().includes(filtro.toLowerCase())).map(c => c.id);
    if (ids.length === 0) { cont.innerHTML = `<div class="estado-vacio"><div class="icono">🔎</div>No hay más clientes.</div>`; return; }
    cont.innerHTML = ids.map(id => {
        const p = todosLosClientes.find(c => c.id === id);
        const enviada = relaciones[id] === 'solicitud_enviada';
        return `<div class="persona-card"><div class="avatar">${avatarHTML(p)}</div><div class="persona-info"><div class="nombre">${p.nombre}</div></div><div class="acciones-persona">${enviada ? `<button class="btn-accion btn-pendiente" disabled>Solicitud enviada</button>` : `<button class="btn-accion btn-agregar" onclick="enviarSolicitud('${p.id}')">➕ Agregar</button>`}</div></div>`;
    }).join('');
}

// --- Acciones de Usuario ---
function enviarSolicitud(id) {
    relaciones[id] = 'solicitud_enviada';
    guardarDatos();
    renderDescubrir(document.getElementById('inputBuscar').value);
    mostrarToast('✅ Solicitud enviada');
}

function aceptarSolicitud(id) {
    relaciones[id] = 'contacto';
    guardarDatos();
    renderSolicitudes();
    renderContactos();
    mostrarToast('🎉 Ahora son contactos');
}

function rechazarSolicitud(id) {
    delete relaciones[id];
    guardarDatos();
    renderSolicitudes();
    mostrarToast('Solicitud rechazada');
}

// --- Integración Web3 / Fidelización en el Modal ---
function renderizarAccionesFidelizacion(id, contenedor) {
    const toks = 150; // Ejemplo: Esto vendría de tu clase SistemaFidelizacion
    if (toks >= 100) {
        contenedor.innerHTML += `
            <div class="fidelizacion-box" style="margin-top: 15px; border-top: 1px solid var(--linea); padding-top: 10px;">
                <p style="color: var(--trigo); font-size: 0.9em; margin-bottom: 8px;">⭐ Elegible para NFT: ${toks} TOKs</p>
                <button class="btn-accion btn-web3" onclick="iniciarCanjeNFT('${id}')" style="width:100%; background: var(--salvia); border: none; padding: 10px; border-radius: 6px; cursor: pointer;">
                    💎 Canjear NFT / Mint
                </button>
            </div>
        `;
    }
}

function iniciarCanjeNFT(id) {
    mostrarToast('🚀 Conectando a Polygon Amoy...');
    console.log("Iniciando mint para:", id);
}

function abrirPerfil(id) {
    const p = todosLosClientes.find(c => c.id === id);
    if (!p) return;
    document.getElementById('perfilAvatarGrande').innerHTML = avatarHTML(p);
    document.getElementById('perfilNombreModal').textContent = p.nombre;
    document.getElementById('perfilTelefonoModal').textContent = p.telefono;
    const nivelEl = document.getElementById('perfilNivelModal');
    nivelEl.textContent = `${emojiNivel(p.nivel)} ${p.nivel}`;
    nivelEl.className = `nivel-chip ${p.nivel}`;
    
    const acciones = document.getElementById('perfilAccionesModal');
    const estado = relaciones[id];
    
    if (estado === 'contacto') {
        acciones.innerHTML = `<button class="btn-accion btn-mensaje" style="flex:1;" onclick="cerrarModal(); irAChat('${id}')">💬 Enviar mensaje</button>`;
        renderizarAccionesFidelizacion(id, acciones); // Inyectamos botón de fidelización
    } else if (estado === 'solicitud_enviada') acciones.innerHTML = `<button class="btn-accion btn-pendiente" style="flex:1;" disabled>Solicitud enviada</button>`;
    else if (estado === 'solicitud_recibida') acciones.innerHTML = `<button class="btn-accion btn-aceptar" onclick="aceptarSolicitud('${id}'); cerrarModal();">Aceptar</button><button class="btn-accion btn-rechazar" onclick="rechazarSolicitud('${id}'); cerrarModal();">Rechazar</button>`;
    else acciones.innerHTML = `<button class="btn-accion btn-agregar" style="flex:1;" onclick="enviarSolicitud('${id}'); cerrarModal();">➕ Agregar contacto</button>`;
    
    document.getElementById('modalPerfil').classList.add('activo');
}

function cerrarModal() { document.getElementById('modalPerfil').classList.remove('activo'); }

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.classList.add('activo');
    setTimeout(() => toast.classList.remove('activo'), 2800);
}

// --- Inicio ---
cargarDatos();
renderContactos();
renderSolicitudes();
renderDescubrir();

