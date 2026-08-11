// ================================================================
// 💬 CHAT - CSARIEL'S
// ================================================================

// ================================================================
// 📋 DATOS
// ================================================================
let contactosChat = [
    { id: 1, nombre: 'María', online: true, ultimo: 'Hola, ¿cómo estás?', hora: '10:30' },
    { id: 2, nombre: 'Javier', online: false, ultimo: 'Nos vemos mañana', hora: 'Ayer' },
    { id: 3, nombre: 'Laura', online: true, ultimo: '¡Excelente!', hora: '9:15' },
    { id: 4, nombre: 'Carlos', online: false, ultimo: 'Estoy trabajando', hora: 'Ayer' },
    { id: 5, nombre: 'Ana', online: true, ultimo: 'Gracias 👍', hora: '8:45' },
];

let mensajesChat = [
    { id: 1, contactoId: 1, texto: '¡Hola María! ¿Cómo estás?', enviado: true, hora: '10:00' },
    { id: 2, contactoId: 1, texto: 'Hola, estoy bien, ¿y tú?', enviado: false, hora: '10:05' },
    { id: 3, contactoId: 1, texto: 'Muy bien, gracias por preguntar 😊', enviado: true, hora: '10:10' },
    { id: 4, contactoId: 1, texto: '¿Qué tal el proyecto?', enviado: false, hora: '10:20' },
    { id: 5, contactoId: 1, texto: 'Va muy bien, casi terminamos 🚀', enviado: true, hora: '10:30' },
    { id: 6, contactoId: 3, texto: 'Hola Laura, ¿todo bien?', enviado: true, hora: '9:00' },
    { id: 7, contactoId: 3, texto: '¡Sí! Todo excelente por aquí', enviado: false, hora: '9:05' },
    { id: 8, contactoId: 3, texto: 'Nos vemos en la reunión', enviado: true, hora: '9:10' },
];

let contactoActivoChat = 1;

// ================================================================
// 🖥️ RENDERIZAR
// ================================================================
function renderChatContactos() {
    const cont = document.getElementById('listaChatContactos');
    if (!cont) return;

    const busqueda = document.getElementById('buscarChat')?.value.toLowerCase() || '';

    let filtrados = contactosChat;
    if (busqueda) {
        filtrados = filtrados.filter(c => c.nombre.toLowerCase().includes(busqueda));
    }

    if (filtrados.length === 0) {
        cont.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.6rem;">
                <i class="fas fa-search" style="font-size:1.5rem;opacity:0.3;display:block;margin-bottom:6px;"></i>
                Sin resultados
            </div>
        `;
        return;
    }

    cont.innerHTML = filtrados.map(c => `
        <div class="chat-contacto ${c.id === contactoActivoChat ? 'active' : ''}" onclick="seleccionarContactoChat(${c.id})">
            <div class="chat-contacto-avatar">
                ${c.nombre.charAt(0)}
                <span class="estado-dot ${c.online ? 'online' : 'offline'}"></span>
            </div>
            <div class="chat-contacto-info">
                <div class="chat-contacto-nombre">${c.nombre}</div>
                <div class="chat-contacto-ultimo">${c.ultimo}</div>
            </div>
            <div class="chat-contacto-tiempo">${c.hora}</div>
            ${c.id === 1 ? '<div class="chat-contacto-noti">3</div>' : ''}
        </div>
    `).join('');
}

function renderMensajesChat() {
    const cont = document.getElementById('chatMensajes');
    if (!cont) return;

    const filtrados = mensajesChat.filter(m => m.contactoId === contactoActivoChat);

    if (filtrados.length === 0) {
        cont.innerHTML = `
            <div class="chat-vacio">
                <i class="fas fa-comment"></i>
                <p>💬 Sin mensajes</p>
                <p style="font-size:0.55rem;opacity:0.5;">Envía un mensaje para empezar la conversación.</p>
            </div>
        `;
        return;
    }

    cont.innerHTML = filtrados.map(m => `
        <div class="mensaje ${m.enviado ? 'enviado' : 'recibido'}">
            ${m.texto}
            <span class="hora">${m.hora}</span>
        </div>
    `).join('');

    cont.scrollTop = cont.scrollHeight;
}

function renderChatCompleto() {
    renderChatContactos();

    const contacto = contactosChat.find(c => c.id === contactoActivoChat);
    if (contacto) {
        const avatar = document.getElementById('chatAvatar');
        const nombre = document.getElementById('chatNombre');
        const estado = document.getElementById('chatEstado');
        if (avatar) avatar.textContent = contacto.nombre.charAt(0);
        if (nombre) nombre.textContent = contacto.nombre;
        if (estado) {
            estado.textContent = contacto.online ? '🟢 En línea' : '⚪ Desconectado';
            estado.style.color = contacto.online ? 'var(--success)' : 'var(--text-muted)';
        }
    }

    renderMensajesChat();
}

// ================================================================
// 🎯 ACCIONES
// ================================================================
function seleccionarContactoChat(id) {
    contactoActivoChat = id;
    renderChatCompleto();
}

function filtrarChat() {
    renderChatContactos();
}

function enviarMensajeChat(e) {
    if (e && e.key !== 'Enter') return;

    const input = document.getElementById('mensajeInput');
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) return;

    const nuevo = {
        id: mensajesChat.length + 1,
        contactoId: contactoActivoChat,
        texto: texto,
        enviado: true,
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    mensajesChat.push(nuevo);
    input.value = '';

    const contacto = contactosChat.find(c => c.id === contactoActivoChat);
    if (contacto) {
        contacto.ultimo = texto;
        contacto.hora = 'Ahora';
    }

    renderChatCompleto();
}

// ================================================================
// 🌐 EXPORTAR
// ================================================================
window.contactosChat = contactosChat;
window.mensajesChat = mensajesChat;
window.contactoActivoChat = contactoActivoChat;
window.renderChatCompleto = renderChatCompleto;
window.seleccionarContactoChat = seleccionarContactoChat;
window.filtrarChat = filtrarChat;
window.enviarMensajeChat = enviarMensajeChat;