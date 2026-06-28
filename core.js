// --- 0. CONFIGURACIÓN DE NUBE (PENDIENTE DE ACTIVAR) ---
// Cuando tengas tus datos de Supabase, solo escribe aquí tu URL y Key.
const NUBE = {
    url: 'AQUI_PEGARAS_TU_URL_DE_SUPABASE',
    key: 'AQUI_PEGARAS_TU_ANON_KEY'
};
// const supabase = supabase.createClient(NUBE.url, NUBE.key); // Esto lo activaremos luego

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
function irAChat(id) {
    // Aquí es donde en el futuro llamaremos a CometChat
    alert("Conectando con el Ecosistema Sariel: Chat para " + id);
}

function abrirPerfil(id) {
    const p = todosLosClientes.find(c => c.id === id);
    if (!p) return;
    
    document.getElementById('perfilAvatarGrande').innerHTML = avatarHTML(p);
    document.getElementById('perfilNombreModal').textContent = p.nombre;
    
    const esContacto = relaciones[id] === 'contacto';
    const telDisplay = (p.privacidad === 'publico' || esContacto) ? p.telefono : '🔒 Número privado';
    document.getElementById('perfilTelefonoModal').textContent = telDisplay;
    
    document.getElementById('modalPerfil').classList.add('activo');
}

function cerrarModal() { document.getElementById('modalPerfil').classList.remove('activo'); }

// --- Inicialización ---
cargarDatos();
renderContactos();
