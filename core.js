// --- 1. Verificación de seguridad legal ---
function verificarAcceso() {
    if (!localStorage.getItem('aceptoTerminos')) {
        window.location.href = '../legales/terminos.html';
    }
}
verificarAcceso();

// --- 2. Persistencia de Datos (Local Storage) ---
function guardarDatos() {
    const estadoGuardar = { relaciones, miPerfil };
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
    { id: 'cli_001', nombre: 'María García', telefono: '55 1234 5678', nivel: 'oro', privacidad: 'publico', fotoPerfil: null },
    { id: 'cli_002', nombre: 'Carlos Ruiz', telefono: '55 2345 6789', nivel: 'plata', privacidad: 'publico', fotoPerfil: null },
    { id: 'cli_003', nombre: 'Ana López', telefono: '55 3456 7890', nivel: 'diamante', privacidad: 'privado', fotoPerfil: null },
    { id: 'cli_004', nombre: 'Luis Morales', telefono: '55 4567 8901', nivel: 'bronce', privacidad: 'publico', fotoPerfil: null },
    { id: 'cli_005', nombre: 'Pedro Sánchez', telefono: '55 5678 9012', nivel: 'plata', privacidad: 'publico', fotoPerfil: null },
    { id: 'cli_006', nombre: 'Lupita Vega', telefono: '55 6789 0123', nivel: 'bronce', privacidad: 'privado', fotoPerfil: null },
];

let relaciones = {
    'cli_001': 'contacto',
    'cli_002': 'contacto',
    'cli_003': 'solicitud_recibida',
    'cli_004': 'solicitud_enviada',
};

// --- Funciones de Renderizado ---
function emojiNivel(nivel) { return { bronce: '🥉', plata: '🥈', oro: '🥇', diamante: '💎' }[nivel] || '🍪'; }
function avatarHTML(persona) { return persona.fotoPerfil ? `<img src="${persona.fotoPerfil}" alt="${persona.nombre}">` : persona.nombre.charAt(0); }

function renderContactos() {
    const ids = Object.keys(relaciones).filter(id => relaciones[id] === 'contacto');
    const cont = document.getElementById('listaContactos');
    if (!cont) return;
    document.getElementById('miContactosCount').textContent = ids.length;
    cont.innerHTML = ids.map(id => {
        const p = todosLosClientes.find(c => c.id === id);
        return `
        <div class="persona-card">
            <div class="avatar" onclick="abrirPerfil('${p.id}')">${avatarHTML(p)}</div>
            <div class="persona-info" onclick="abrirPerfil('${p.id}')">
                <div class="nombre">${p.nombre}</div>
                <div class="meta"><span class="nivel-chip ${p.nivel}">${emojiNivel(p.nivel)} ${p.nivel}</span></div>
                <button class="btn-ver-perfil" style="font-size: 0.7em; margin-top: 5px; background: none; border: 1px solid var(--trigo); color: var(--trigo); border-radius: 4px; padding: 2px 8px;">Ver perfil</button>
            </div>
            <div class="acciones-persona">
                <button class="btn-accion btn-mensaje" onclick="irAChat('${p.id}')">💬 Chat</button>
            </div>
        </div>`;
    }).join('');
}

// --- Acciones de Usuario ---
function renderizarAccionesFidelizacion(id, contenedor) {
    const toks = 150; 
    if (toks >= 100) {
        contenedor.innerHTML += `
            <div class="fidelizacion-box" style="margin-top: 15px; border-top: 1px solid var(--linea); padding-top: 10px;">
                <p style="color: var(--trigo); font-size: 0.9em; margin-bottom: 8px;">⭐ Elegible para NFT: ${toks} TOKs</p>
                <button class="btn-accion btn-web3" onclick="iniciarCanjeNFT('${id}')" style="width:100%; background: var(--salvia); border: none; padding: 10px; border-radius: 6px; cursor: pointer;">💎 Canjear NFT / Mint</button>
            </div>
        `;
    }
}

function abrirPerfil(id) {
    const p = todosLosClientes.find(c => c.id === id);
    if (!p) return;
    
    document.getElementById('perfilAvatarGrande').innerHTML = avatarHTML(p);
    document.getElementById('perfilNombreModal').textContent = p.nombre;
    
    // Lógica de privacidad
    const esContacto = relaciones[id] === 'contacto';
    const telDisplay = (p.privacidad === 'publico' || esContacto) ? p.telefono : '🔒 Número privado';
    document.getElementById('perfilTelefonoModal').textContent = telDisplay;
    
    const nivelEl = document.getElementById('perfilNivelModal');
    nivelEl.textContent = `${emojiNivel(p.nivel)} ${p.nivel}`;
    nivelEl.className = `nivel-chip ${p.nivel}`;
    
    const acciones = document.getElementById('perfilAccionesModal');
    acciones.innerHTML = '';
    
    if (esContacto) {
        acciones.innerHTML = `<button class="btn-accion btn-mensaje" style="flex:1;" onclick="cerrarModal(); irAChat('${id}')">💬 Enviar mensaje</button>`;
        if (p.privacidad === 'publico' || esContacto) {
            acciones.innerHTML += `<button class="btn-accion" onclick="window.open('https://wa.me/${p.telefono.replace(/\s/g, '')}', '_blank')" style="background:#25D366; color:white; margin-top:5px;">📱 WhatsApp</button>`;
        }
        renderizarAccionesFidelizacion(id, acciones);
    } else if (relaciones[id] === 'solicitud_enviada') {
        acciones.innerHTML = `<button class="btn-accion" disabled>Solicitud enviada</button>`;
    } else {
        acciones.innerHTML = `<button class="btn-accion" onclick="enviarSolicitud('${id}'); cerrarModal();">➕ Agregar contacto</button>`;
    }
    document.getElementById('modalPerfil').classList.add('activo');
}

function cerrarModal() { document.getElementById('modalPerfil').classList.remove('activo'); }
function mostrarToast(mensaje) { /* ... tu lógica de toast existente ... */ }

// --- Inicialización ---
cargarDatos();
renderContactos();
// (Asegúrate de mantener tus otras funciones de renderizado abajo)
