// ================================================================
// 📝 HUB FEED - Ofertas P2P, Filtros y Tratos
// ================================================================

(function() {
    'use strict';

    // ================================================================
    // 📋 DATOS DE RESPALDO
    // ================================================================
    const publicacionesMock = [
        { id: 1, usuario: 'María G.', avatar: 'MG', tipo: 'venta', cantidad: 150, precio: 2.30, mensaje: 'Oferta especial: $2.30 c/u. Necesito liquidez para canjear galletas.', interesados: 3, tiempo: 'Hace 2 min' },
        { id: 2, usuario: 'Carlos R.', avatar: 'CR', tipo: 'compra', cantidad: 200, precio: 2.50, mensaje: 'Busco 200 Es.stoks urgentes, pago hasta $2.50. Para completar mi colección.', interesados: 5, tiempo: 'Hace 5 min' },
        { id: 3, usuario: 'Luis M.', avatar: 'LM', tipo: 'venta', cantidad: 100, precio: 2.40, mensaje: 'Vendo 100 Es.stoks a $2.40. Precio negociable para compradores serios.', interesados: 2, tiempo: 'Hace 8 min' },
        { id: 4, usuario: 'Daniela V.', avatar: 'DV', tipo: 'compra', cantidad: 80, precio: 2.35, mensaje: 'Compro 80 Es.stoks a $2.35. Pago inmediato por Stripe.', interesados: 1, tiempo: 'Hace 12 min' }
    ];

    const actividadMock = [
        { usuario: 'María G.', accion: 'transfirió 150 Es.stoks a Juan P.', tiempo: 'Hace 2 min' },
        { usuario: 'Carlos R.', accion: 'transfirió 200 Es.stoks a Ana L.', tiempo: 'Hace 5 min' },
        { usuario: 'Luis M.', accion: 'transfirió 100 Es.stoks a Sofia T.', tiempo: 'Hace 8 min' },
        { usuario: 'Daniela V.', accion: 'transfirió 80 Es.stoks a Pedro H.', tiempo: 'Hace 12 min' }
    ];

    let publicaciones = [];
    let actividad = [];
    let filtroActual = 'todas';

    // ================================================================
    // 🖥️ RENDERIZAR HUB (CON SANITIZACIÓN)
    // ================================================================
    function renderHub(lista) {
        const feed = document.getElementById('hubFeed');
        if (!feed) return;

        // Aplicar filtro
        let filtradas = lista || publicaciones;
        if (filtroActual === 'venta') {
            filtradas = filtradas.filter(p => p.tipo === 'venta');
        } else if (filtroActual === 'compra') {
            filtradas = filtradas.filter(p => p.tipo === 'compra');
        }

        feed.innerHTML = '';

        if (!filtradas || filtradas.length === 0) {
            feed.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No hay ofertas activas</p>
                    <p style="font-size:0.7rem;color:var(--text-muted);">Sé el primero en publicar una oferta</p>
                </div>
            `;
            return;
        }

        filtradas.forEach(pub => {
            // Sanitizar
            const pubSan = window.SecurityShield?.sanitizarObjeto(pub) || pub;
            const tipoLabel = pubSan.tipo === 'venta' ? 'VENTA' : 'COMPRA';
            const tipoClase = pubSan.tipo === 'venta' ? 'tipo-venta' : 'tipo-compra';
            const icono = pubSan.tipo === 'venta' ? 'fa-arrow-down' : 'fa-arrow-up';

            const card = document.createElement('div');
            card.className = 'publicacion';
            card.dataset.tipo = pubSan.tipo;
            card.innerHTML = `
                <div class="pub-header">
                    <div class="pub-avatar">${pubSan.avatar || pubSan.usuario.charAt(0)}</div>
                    <div class="pub-usuario">${pubSan.usuario}</div>
                    <span class="pub-tipo ${tipoClase}"><i class="fas ${icono}"></i> ${tipoLabel}</span>
                </div>
                <div class="pub-detalle">
                    <span><i class="fas fa-coins"></i> ${pubSan.cantidad} Es.stoks</span>
                    <span><i class="fas fa-tag"></i> $${pubSan.precio.toFixed(2)} c/u</span>
                    <span class="pub-tiempo"><i class="far fa-clock"></i> ${pubSan.tiempo}</span>
                </div>
                <div class="pub-mensaje">
                    <i class="fas fa-quote-left" style="color:var(--gold-cosmic); margin-right:6px;"></i>
                    ${pubSan.mensaje}
                </div>
                <div class="pub-acciones">
                    <button onclick="window.negociar('${pubSan.usuario}')">
                        <i class="fas fa-comment-dots"></i> Negociar
                    </button>
                    <button class="btn-aceptar" onclick="window.aceptarTrato('${pubSan.usuario}')">
                        <i class="fas fa-handshake"></i> Aceptar trato
                    </button>
                    <span class="pub-interes">
                        <i class="fas fa-user-plus"></i> ${pubSan.interesados} interesados
                    </span>
                </div>
            `;
            feed.appendChild(card);
        });
    }

    // ================================================================
    // 🖥️ RENDERIZAR ACTIVIDAD
    // ================================================================
    function renderActividad(lista) {
        const contenedor = document.getElementById('actividadFeed');
        if (!contenedor) return;

        const datos = lista || actividad;
        contenedor.innerHTML = '';

        if (!datos || datos.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align:center;padding:10px;color:var(--text-muted);font-size:0.7rem;">
                    No hay actividad reciente
                </div>
            `;
            return;
        }

        datos.forEach(item => {
            const div = document.createElement('div');
            div.className = 'actividad-item';
            const usuario = window.SecurityShield?.sanitizarTexto(item.usuario) || item.usuario;
            const accion = window.SecurityShield?.sanitizarTexto(item.accion) || item.accion;
            const tiempo = window.SecurityShield?.sanitizarTexto(item.tiempo) || item.tiempo;
            div.innerHTML = `
                <i class="fas fa-exchange-alt"></i>
                <span><strong>${usuario}</strong> ${accion}</span>
                <span class="actividad-time">${tiempo}</span>
            `;
            contenedor.appendChild(div);
        });
    }

    // ================================================================
    // 🔍 FILTROS DE OFERTAS
    // ================================================================
    function filtrarOfertas(tipo) {
        filtroActual = tipo;
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.filtro-btn[data-filtro="${tipo}"]`)?.classList.add('active');
        renderHub(publicaciones);
    }

    // ================================================================
    // 🎮 ACCIONES DEL HUB
    // ================================================================
    async function abrirFormularioOferta() {
        try {
            const user = await obtenerUsuario();
            if (!user) {
                mostrarToast('❌ Debes iniciar sesión para publicar', 'error');
                return;
            }

            const perfil = await obtenerPerfilLocal();
            if (!perfil) {
                mostrarToast('❌ Error al obtener tu perfil', 'error');
                return;
            }

            const tipo = confirm('¿Quieres publicar una VENTA? (OK = Venta, Cancelar = Compra)');
            const cantidad = prompt('¿Cuántos Es.stoks?', '100');
            if (!cantidad) return;
            const precio = prompt('¿Precio por unidad (MXN)?', '2.40');
            if (!precio) return;
            let mensaje = prompt('Mensaje para tu oferta:', 'Oferta especial');

            // Sanitizar
            const sanitizar = window.SecurityShield?.sanitizarTexto || function(t) { return t; };
            mensaje = sanitizar(mensaje || 'Oferta P2P');
            const tipoOferta = tipo ? 'venta' : 'compra';

            const client = await esperarSupabase();
            const { data, error } = await client
                .from('ofertas_muro')
                .insert({
                    usuario_id: user.id,
                    usuario_nombre: sanitizar(perfil.nombre || 'Usuario'),
                    tipo: tipoOferta,
                    cantidad: parseInt(cantidad),
                    precio: parseFloat(precio),
                    mensaje: mensaje,
                    interesados: 0,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            const nuevaPub = {
                id: data.id,
                usuario: sanitizar(perfil.nombre || 'Usuario'),
                avatar: perfil.nombre ? perfil.nombre.charAt(0) : 'U',
                tipo: tipoOferta,
                cantidad: parseInt(cantidad),
                precio: parseFloat(precio),
                mensaje: mensaje,
                interesados: 0,
                tiempo: 'Ahora'
            };

            publicaciones.unshift(nuevaPub);
            renderHub(publicaciones);
            mostrarToast(`✅ Oferta de ${tipo ? 'VENTA' : 'COMPRA'} publicada: ${cantidad} Es.stoks a $${precio}`);

        } catch (error) {
            console.error('Error publicando oferta:', error);
            mostrarToast('❌ Error al publicar la oferta: ' + error.message, 'error');
        }
    }

    function negociar(usuario) {
        const u = window.SecurityShield?.sanitizarTexto(usuario) || usuario;
        mostrarToast(`💬 Abriendo chat para negociar con ${u}...`);
    }

    function aceptarTrato(usuario) {
        const u = window.SecurityShield?.sanitizarTexto(usuario) || usuario;
        mostrarToast(`✅ ¡Trato aceptado! Transacción segura con ${u}.`, 'success');
    }

    // ================================================================
    // 🔌 CARGAR OFERTAS DESDE SUPABASE
    // ================================================================
    async function cargarOfertasDesdeSupabase() {
        try {
            const client = await esperarSupabase();
            const { data, error } = await client
                .from('ofertas_muro')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            if (data && data.length > 0) {
                const sanitizar = window.SecurityShield?.sanitizarObjeto || function(t) { return t; };
                publicaciones = data.map(o => sanitizar({
                    id: o.id,
                    usuario: o.usuario_nombre || o.usuario || 'Usuario',
                    avatar: o.usuario_nombre ? o.usuario_nombre.charAt(0) : 'U',
                    tipo: o.tipo || 'venta',
                    cantidad: o.cantidad || 0,
                    precio: o.precio || 0,
                    mensaje: o.mensaje || 'Sin descripción',
                    interesados: o.interesados || 0,
                    tiempo: o.created_at ? formatearTiempo(o.created_at) : 'Reciente'
                }));
                renderHub(publicaciones);
            } else {
                publicaciones = [...publicacionesMock];
                renderHub(publicaciones);
            }
        } catch (e) {
            console.warn('⚠️ Error cargando ofertas, usando respaldo:', e);
            publicaciones = [...publicacionesMock];
            renderHub(publicaciones);
        }
    }

    // ================================================================
    // 🔌 CARGAR ACTIVIDAD DESDE SUPABASE
    // ================================================================
    async function cargarActividadDesdeSupabase() {
        try {
            const client = await esperarSupabase();
            const { data, error } = await client
                .from('actividad_p2p')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            if (data && data.length > 0) {
                const sanitizar = window.SecurityShield?.sanitizarTexto || function(t) { return t; };
                actividad = data.map(a => ({
                    usuario: sanitizar(a.usuario_nombre || a.usuario || 'Usuario'),
                    accion: sanitizar(a.accion || 'realizó una transacción'),
                    tiempo: a.created_at ? formatearTiempo(a.created_at) : 'Reciente'
                }));
                renderActividad(actividad);
            } else {
                actividad = [...actividadMock];
                renderActividad(actividad);
            }
        } catch (e) {
            console.warn('⚠️ Error cargando actividad, usando respaldo:', e);
            actividad = [...actividadMock];
            renderActividad(actividad);
        }
    }

    // ================================================================
    // ⏱️ FORMATEAR TIEMPO
    // ================================================================
    function formatearTiempo(fecha) {
        const diff = Date.now() - new Date(fecha).getTime();
        const minutos = Math.floor(diff / 60000);
        if (minutos < 1) return 'Ahora';
        if (minutos < 60) return `Hace ${minutos}m`;
        const horas = Math.floor(minutos / 60);
        if (horas < 24) return `Hace ${horas}h`;
        return `Hace ${Math.floor(horas / 24)}d`;
    }

    // ================================================================
    // 📦 EXPORTAR
    // ================================================================
    window.HubFeed = {
        publicaciones,
        actividad,
        renderHub,
        renderActividad,
        filtrarOfertas,
        abrirFormularioOferta,
        negociar,
        aceptarTrato,
        cargarOfertasDesdeSupabase,
        cargarActividadDesdeSupabase,
        formatearTiempo
    };

    // Exponer funciones globales
    window.filtrarOfertas = filtrarOfertas;
    window.abrirFormularioOferta = abrirFormularioOferta;
    window.negociar = negociar;
    window.aceptarTrato = aceptarTrato;
    window.cargarOfertasDesdeSupabase = cargarOfertasDesdeSupabase;
    window.cargarActividadDesdeSupabase = cargarActividadDesdeSupabase;

    // Inicializar al cargar
    document.addEventListener('DOMContentLoaded', async function() {
        await cargarOfertasDesdeSupabase();
        await cargarActividadDesdeSupabase();

        // Simular nueva actividad cada 20 segundos
        setInterval(() => {
            const nombres = ['Sofía T.', 'Jorge M.', 'Ana L.', 'Pedro H.', 'Luz R.', 'Mario G.', 'Carla F.'];
            const acciones = [
                `transfirió ${Math.floor(Math.random()*100+20)} Es.stoks a ${nombres[Math.floor(Math.random()*nombres.length)]}`,
                `publicó una oferta de ${Math.floor(Math.random()*50+10)} Es.stoks`,
                `canjeó una Tarjeta Digital por producto físico`
            ];
            const item = {
                usuario: nombres[Math.floor(Math.random() * nombres.length)],
                accion: acciones[Math.floor(Math.random() * acciones.length)],
                tiempo: 'Hace unos segundos'
            };
            const contenedor = document.getElementById('actividadFeed');
            if (contenedor) {
                const div = document.createElement('div');
                div.className = 'actividad-item';
                const sanitizar = window.SecurityShield?.sanitizarTexto || function(t) { return t; };
                div.innerHTML = `
                    <i class="fas fa-exchange-alt"></i>
                    <span><strong>${sanitizar(item.usuario)}</strong> ${sanitizar(item.accion)}</span>
                    <span class="actividad-time">${item.tiempo}</span>
                `;
                contenedor.prepend(div);
                if (contenedor.children.length > 6) {
                    contenedor.removeChild(contenedor.lastChild);
                }
            }
        }, 20000);

        console.log('📝 Hub Feed cargado');
    });

})();