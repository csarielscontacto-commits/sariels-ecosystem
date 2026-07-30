// ============================================================
// ASISTENTE IA - Csariel's
// Lógica Principal - Módulo Independiente
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // ESTADO DEL ASISTENTE
    // ============================================================
    let asistenteEstado = {
        abierto: false,
        personajeSeleccionado: null,
        planSeleccionado: null,
        activado: false,
        chatHistorial: [],
        postresLocales: [],
        seccionActual: 'general' // 'panel-web3', 'muro-live', 'ayuda-comunitaria'
    };

    // ============================================================
    // INICIALIZACIÓN POR SECCIÓN
    // ============================================================
    function inicializarAsistente(seccion) {
        console.log(`🤖 Asistente IA - Csariel's cargado en: ${seccion}`);
        asistenteEstado.seccionActual = seccion;

        // Filtrar personajes según la sección
        const personajesFiltrados = filtrarPersonajesPorSeccion(seccion);
        renderizarPersonajes(personajesFiltrados);

        // Configurar comportamiento según sección
        configurarPorSeccion(seccion);

        // Cargar estado guardado
        cargarEstadoGuardado();
    }

    // ============================================================
    // FILTRAR PERSONAJES POR SECCIÓN
    // ============================================================
    function filtrarPersonajesPorSeccion(seccion) {
        const todos = ASISTENTE_CONFIG.personajes;
        const filtrados = {};

        for (const [key, personaje] of Object.entries(todos)) {
            // Si el personaje tiene sección específica y coincide
            if (personaje.seccion === seccion) {
                filtrados[key] = personaje;
            }
            // Si no tiene sección definida, aparece en todas
            else if (!personaje.seccion) {
                filtrados[key] = personaje;
            }
        }

        // Si no hay personajes para la sección, mostrar todos
        if (Object.keys(filtrados).length === 0) {
            return todos;
        }

        return filtrados;
    }

    // ============================================================
    // CONFIGURAR POR SECCIÓN
    // ============================================================
    function configurarPorSeccion(seccion) {
        const configs = {
            'panel-web3': {
                titulo: '🤖 Asistente de Negocios',
                personajeRecomendado: 'amasu',
                mensajeBienvenida: '¡Bienvenido al Panel de Negocios! 🚀'
            },
            'muro-live': {
                titulo: '🤖 Asistente Social',
                personajeRecomendado: 'galletita',
                mensajeBienvenida: '¡Bienvenido al Muro Live! 🌟'
            },
            'ayuda-comunitaria': {
                titulo: '🤖 Asistente de Ayuda',
                personajeRecomendado: 'miel',
                mensajeBienvenida: '¡Bienvenido a Ayuda Comunitaria! 💛'
            }
        };

        const config = configs[seccion] || configs['panel-web3'];
        document.getElementById('asistenteTitle').textContent = config.titulo;

        // Auto-seleccionar personaje recomendado si no hay selección
        if (!asistenteEstado.personajeSeleccionado) {
            setTimeout(() => {
                seleccionarPersonaje(config.personajeRecomendado);
            }, 500);
        }
    }

    // ============================================================
    // RENDERIZAR PERSONAJES
    // ============================================================
    function renderizarPersonajes(personajes) {
        const grid = document.getElementById('personajesGrid');
        if (!grid) return;

        grid.innerHTML = '';
        for (const [id, personaje] of Object.entries(personajes)) {
            const card = document.createElement('div');
            card.className = 'personaje-card';
            card.dataset.id = id;
            card.onclick = () => seleccionarPersonaje(id);
            card.innerHTML = `
                    <span class="avatar">${personaje.emoji}</span>
                    <div class="name">${personaje.nombre}</div>
                    <div class="role">${personaje.rol}</div>
                    <span class="tag ${personaje.tipo === 'comunidad' ? 'tag-social' : 'tag-business'}">
                        ${personaje.tipo === 'comunidad' ? '🎭 Comunidad' : '📊 Negocios'}
                    </span>
                `;
            grid.appendChild(card);
        }
    }

    // ============================================================
    // SELECCIÓN DE PERSONAJE
    // ============================================================
    function seleccionarPersonaje(id) {
        const personaje = ASISTENTE_CONFIG.personajes[id];
        if (!personaje) return;

        // Verificar que el personaje esté disponible en esta sección
        if (personaje.seccion && personaje.seccion !== asistenteEstado.seccionActual) {
            mostrarToast(`⚠️ ${personaje.nombre} no está disponible en esta sección`, 'error');
            return;
        }

        // ... (resto de la lógica de selección igual que antes)
        // Aquí va todo el código de selección de personaje, planes, etc.
    }

    // ============================================================
    // EXPONER API PÚBLICA
    // ============================================================
    window.CsarielsAsistente = {
        iniciar: function(seccion) {
            inicializarAsistente(seccion || 'general');
        },
        abrir: function() {
            // Abrir panel
        },
        cerrar: function() {
            // Cerrar panel
        },
        seleccionarPersonaje: function(id) {
            seleccionarPersonaje(id);
        },
        getEstado: function() {
            return { ...asistenteEstado };
        },
        enviarMensaje: function(texto) {
            // Enviar mensaje al chat
        },
        mostrarToast: function(mensaje, tipo) {
            // Mostrar notificación
        },
        cambiarSeccion: function(seccion) {
            configurarPorSeccion(seccion);
        }
    };

})();