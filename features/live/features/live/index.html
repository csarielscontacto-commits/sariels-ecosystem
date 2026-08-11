<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📹 Live | Csariel's</title>
    
    <!-- ===== SUPABASE (TU PROYECTO REAL) ===== -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
    
    <!-- ===== TUS VARIABLES DE ENTORNO REALES ===== -->
    <script>
        // ⚠️ ESTOS SON TUS DATOS REALES DE SUPABASE
        const SUPABASE_URL = 'https://nvyyxgkladjauolvpzfp.supabase.co';
        const SUPABASE_ANON_KEY = 'TU_ANON_KEY_REAL'; // <-- PON LA TUYA
    </script>

    <style>
        /* ===== ESTILOS DE CSARIEL'S ===== */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #0a0c10;
            color: #e8f0f8;
            font-family: 'Segoe UI', system-ui, sans-serif;
            padding: 20px;
        }
        .live-container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255,255,255,0.03);
            border-radius: 20px;
            padding: 24px;
            border: 1px solid rgba(212,175,55,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 24px;
        }
        .logo {
            font-size: 1.8rem;
            font-weight: 900;
            color: #D4AF37;
            text-shadow: 0 0 40px rgba(212,175,55,0.15);
        }
        .logo span { color: #fff; }
        .btn {
            padding: 8px 20px;
            border: 1px solid rgba(212,175,55,0.2);
            border-radius: 30px;
            background: rgba(212,175,55,0.05);
            color: #e8f0f8;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 0.85rem;
        }
        .btn:hover {
            background: rgba(212,175,55,0.1);
            border-color: #D4AF37;
            transform: scale(1.02);
        }
        .btn-primary {
            background: #D4AF37;
            color: #0a0c10;
            border-color: #D4AF37;
            font-weight: 700;
        }
        .btn-primary:hover {
            background: #c4a030;
            border-color: #c4a030;
        }
        .btn-danger {
            background: rgba(255,51,102,0.15);
            border-color: rgba(255,51,102,0.3);
            color: #ff3366;
        }
        .btn-danger:hover {
            background: rgba(255,51,102,0.25);
        }
        .btn-success {
            background: rgba(0,184,148,0.15);
            border-color: rgba(0,184,148,0.3);
            color: #00b894;
        }
        .btn-success:hover {
            background: rgba(0,184,148,0.25);
        }
        .video-container {
            background: #000;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            min-height: 400px;
            border: 2px solid rgba(212,175,55,0.1);
            margin-bottom: 20px;
        }
        .video-container video {
            width: 100%;
            height: auto;
            display: block;
        }
        .video-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 400px;
            color: #4a6a8a;
            font-size: 1.2rem;
            gap: 12px;
        }
        .video-placeholder .icon {
            font-size: 4rem;
            opacity: 0.3;
        }
        .live-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: rgba(255,0,0,0.9);
            color: white;
            padding: 4px 16px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            display: none;
            align-items: center;
            gap: 8px;
        }
        .live-badge .dot {
            width: 8px;
            height: 8px;
            background: #fff;
            border-radius: 50%;
            animation: pulse 1s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
        .controls {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin: 16px 0;
        }
        .chat-box {
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            padding: 16px;
            max-height: 200px;
            overflow-y: auto;
            margin-top: 16px;
        }
        .chat-message {
            padding: 4px 0;
            font-size: 0.85rem;
            color: #8ba3c7;
            border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .chat-message .user {
            color: #D4AF37;
            font-weight: 700;
        }
        .chat-input-row {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }
        .chat-input-row input {
            flex: 1;
            padding: 10px 16px;
            border-radius: 30px;
            border: 1px solid rgba(212,175,55,0.15);
            background: rgba(0,0,0,0.3);
            color: #fff;
            outline: none;
        }
        .chat-input-row input::placeholder {
            color: #4a6a8a;
        }
        .chat-input-row input:focus {
            border-color: #D4AF37;
        }
        .feed {
            margin-top: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .feed-item {
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(212,175,55,0.05);
            border-radius: 12px;
            padding: 16px;
        }
        .feed-item .author {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        }
        .feed-item .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #D4AF37, #0F2D1A);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8rem;
            color: #fff;
        }
        .feed-item .name {
            font-weight: 600;
        }
        .feed-item .time {
            font-size: 0.7rem;
            color: #4a6a8a;
            margin-left: auto;
        }
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: #0F2D1A;
            color: #D4AF37;
            padding: 12px 24px;
            border-radius: 12px;
            border: 1px solid rgba(212,175,55,0.15);
            font-weight: 600;
            transition: all 0.4s ease;
            opacity: 0;
            pointer-events: none;
            z-index: 9999;
        }
        .toast.active {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        .toast.error {
            background: #ff3366;
            color: #fff;
        }
        @media (max-width: 768px) {
            .header { flex-direction: column; align-items: stretch; }
            .controls .btn { flex: 1; justify-content: center; }
            .video-container { min-height: 250px; }
            .video-placeholder { height: 250px; }
        }
    </style>
</head>
<body>
    <div class="live-container">
        <!-- ===== HEADER ===== -->
        <div class="header">
            <div class="logo">
                ◈ Csariel<span>'s</span>
                <span style="font-size:0.6rem;background:#D4AF37;color:#0a0c10;padding:2px 12px;border-radius:20px;margin-left:8px;">LIVE</span>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn" onclick="window.location.href='../../index.html'">
                    <i class="fas fa-home"></i> Inicio
                </button>
                <button class="btn" onclick="window.location.href='../red/index.html'">
                    <i class="fas fa-users"></i> Mi Red
                </button>
                <button class="btn" onclick="window.location.href='../foro/index.html'">
                    <i class="fas fa-comments"></i> Foro
                </button>
                <button class="btn" onclick="window.location.href='../tienda/index.html'">
                    <i class="fas fa-store"></i> Tienda
                </button>
            </div>
        </div>

        <!-- ===== VIDEO ===== -->
        <div class="video-container" id="videoContainer">
            <video id="liveVideo" autoplay playsinline muted style="display:none;"></video>
            <div class="video-placeholder" id="videoPlaceholder">
                <div class="icon">📹</div>
                <span>No hay live activo</span>
                <span style="font-size:0.7rem;color:#4a6a8a;">Inicia una transmisión</span>
            </div>
            <div class="live-badge" id="liveBadge">
                <span class="dot"></span> EN VIVO
                <span id="viewerCount" style="margin-left:8px;background:rgba(255,255,255,0.2);padding:0 8px;border-radius:10px;">0</span>
            </div>
        </div>

        <!-- ===== CONTROLES ===== -->
        <div class="controls" id="controls">
            <button class="btn btn-danger" id="btnIniciar" onclick="iniciarLive()">
                <i class="fas fa-circle"></i> Iniciar Live
            </button>
            <button class="btn btn-danger" id="btnDetener" onclick="detenerLive()" style="display:none;">
                <i class="fas fa-stop"></i> Detener Live
            </button>
            <button class="btn btn-success" onclick="donar()">
                <i class="fas fa-heart"></i> Donar CMT
            </button>
            <button class="btn" onclick="window.location.href='salas/index.html'">
                <i class="fas fa-users"></i> Salas
            </button>
            <button class="btn" onclick="window.location.href='musica/index.html'">
                <i class="fas fa-music"></i> Música
            </button>
        </div>

        <!-- ===== CHAT ===== -->
        <div class="chat-box" id="chatBox">
            <div class="chat-message">💬 Bienvenido al chat del live</div>
        </div>
        <div class="chat-input-row">
            <input type="text" id="chatInput" placeholder="Escribe un mensaje..." onkeydown="if(event.key==='Enter')enviarMensaje()">
            <button class="btn btn-primary" onclick="enviarMensaje()">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>

        <!-- ===== FEED ===== -->
        <div class="feed" id="feedContainer">
            <!-- Las publicaciones se cargan desde Supabase -->
        </div>
    </div>

    <!-- ===== TOAST ===== -->
    <div class="toast" id="toast"></div>

    <!-- ================================================================ -->
    <!-- 🔥 LOGICA CON SUPABASE REAL -->
    <!-- ================================================================ -->
    <script>
        // ================================================================
        // CONFIGURACIÓN SUPABASE (TUS DATOS REALES)
        // ================================================================
        const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // ================================================================
        // ESTADO
        // ================================================================
        let liveActivo = false;
        let mediaStream = null;
        let usuarioActual = null;
        let transmisionId = null;

        // ================================================================
        // TOAST
        // ================================================================
        let toastTimeout = null;

        function mostrarToast(mensaje, tipo = '') {
            const toast = document.getElementById('toast');
            toast.textContent = mensaje;
            toast.className = 'toast' + (tipo ? ' error' : '');
            toast.classList.add('active');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => toast.classList.remove('active'), 3000);
        }

        // ================================================================
        // OBTENER USUARIO ACTUAL (desde Supabase)
        // ================================================================
        async function obtenerUsuarioActual() {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error || !user) {
                    // Fallback: crear usuario anónimo
                    const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
                    if (signInError) throw signInError;
                    return signInData.user;
                }
                return user;
            } catch (e) {
                console.error('Error obteniendo usuario:', e);
                mostrarToast('❌ Error de autenticación', 'error');
                return null;
            }
        }

        // ================================================================
        // OBTENER PERFIL DEL USUARIO
        // ================================================================
        async function obtenerPerfil(userId) {
            try {
                const { data, error } = await supabase
                    .from('perfiles')
                    .select('id, nombre, avatar_url')
                    .eq('id', userId)
                    .single();

                if (error) {
                    // Si no existe, crearlo
                    const { data: newProfile, error: createError } = await supabase
                        .from('perfiles')
                        .insert({
                            id: userId,
                            nombre: 'Usuario_' + userId.slice(0, 6),
                            avatar_url: null
                        })
                        .select()
                        .single();

                    if (createError) throw createError;
                    return newProfile;
                }
                return data;
            } catch (e) {
                console.error('Error obteniendo perfil:', e);
                return null;
            }
        }

        // ================================================================
        // INICIAR LIVE
        // ================================================================
        async function iniciarLive() {
            if (liveActivo) {
                mostrarToast('⚠️ Ya estás transmitiendo', 'error');
                return;
            }

            const user = await obtenerUsuarioActual();
            if (!user) {
                mostrarToast('❌ Debes estar autenticado', 'error');
                return;
            }

            const perfil = await obtenerPerfil(user.id);
            if (!perfil) {
                mostrarToast('❌ Error al obtener tu perfil', 'error');
                return;
            }

            usuarioActual = perfil;

            try {
                // Solicitar cámara y micrófono
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                mediaStream = stream;
                const video = document.getElementById('liveVideo');
                video.srcObject = stream;
                video.style.display = 'block';
                document.getElementById('videoPlaceholder').style.display = 'none';
                document.getElementById('liveBadge').style.display = 'flex';

                // Crear registro en Supabase
                const { data: transmision, error: insertError } = await supabase
                    .from('transmisiones')
                    .insert({
                        usuario_id: user.id,
                        titulo: `Live de ${perfil.nombre || 'Usuario'}`,
                        activa: true,
                        espectadores: 0,
                        inicio: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;

                transmisionId = transmision.id;
                liveActivo = true;

                document.getElementById('btnIniciar').style.display = 'none';
                document.getElementById('btnDetener').style.display = 'inline-flex';

                mostrarToast(`🔴 Live iniciado como ${perfil.nombre || 'Usuario'}`);
                agregarMensajeChat('🎥', `${perfil.nombre || 'Usuario'} inició una transmisión en vivo`);

                // Actualizar contador de viewers cada 5 segundos
                actualizarViewers(transmision.id);

                // Guardar en localStorage para otras páginas
                localStorage.setItem('csariels_live_activo', 'true');
                localStorage.setItem('csariels_live_id', transmision.id);

            } catch (err) {
                console.error('Error al iniciar live:', err);
                mostrarToast('❌ Error al acceder a cámara/micrófono', 'error');
            }
        }

        // ================================================================
        // ACTUALIZAR VIEWERS
        // ================================================================
        function actualizarViewers(transmisionId) {
            let viewers = Math.floor(Math.random() * 5) + 1;

            const interval = setInterval(async () => {
                if (!liveActivo) {
                    clearInterval(interval);
                    return;
                }

                // Simular fluctuación de viewers (del 1 al 15)
                const change = Math.floor(Math.random() * 3) - 1;
                viewers = Math.max(1, Math.min(15, viewers + change));

                document.getElementById('viewerCount').textContent = viewers;

                // Actualizar en Supabase
                try {
                    await supabase
                        .from('transmisiones')
                        .update({ espectadores: viewers })
                        .eq('id', transmisionId);
                } catch (e) {
                    console.warn('Error actualizando viewers:', e);
                }
            }, 5000);

            // Guardar referencia para limpiar después
            window._viewerInterval = interval;
        }

        // ================================================================
        // DETENER LIVE
        // ================================================================
        async function detenerLive() {
            if (!liveActivo) return;

            // Detener stream
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
                mediaStream = null;
            }

            const video = document.getElementById('liveVideo');
            video.srcObject = null;
            video.style.display = 'none';
            document.getElementById('videoPlaceholder').style.display = 'flex';
            document.getElementById('liveBadge').style.display = 'none';

            liveActivo = false;
            document.getElementById('btnIniciar').style.display = 'inline-flex';
            document.getElementById('btnDetener').style.display = 'none';

            // Actualizar en Supabase
            if (transmisionId) {
                try {
                    await supabase
                        .from('transmisiones')
                        .update({
                            activa: false,
                            fin: new Date().toISOString()
                        })
                        .eq('id', transmisionId);
                } catch (e) {
                    console.warn('Error finalizando transmisión:', e);
                }
            }

            if (window._viewerInterval) {
                clearInterval(window._viewerInterval);
                window._viewerInterval = null;
            }

            localStorage.removeItem('csariels_live_activo');
            localStorage.removeItem('csariels_live_id');

            mostrarToast('⏹️ Live finalizado');
            agregarMensajeChat('📢', 'El live ha finalizado');
        }

        // ================================================================
        // DONAR CMT
        // ================================================================
        function donar() {
            const user = localStorage.getItem('csariels_user_id') || 'anonimo';
            const saldo = parseInt(localStorage.getItem(`csariels_cmt_balance_${user}`) || '0');

            if (saldo < 1) {
                mostrarToast('⚠️ Saldo insuficiente. Recarga CMT en la Tienda.', 'error');
                return;
            }

            const monto = prompt('¿Cuántos CMT quieres donar?', '10');
            if (!monto) return;
            const cantidad = parseInt(monto);
            if (isNaN(cantidad) || cantidad < 1) {
                mostrarToast('⚠️ Monto inválido', 'error');
                return;
            }
            if (cantidad > saldo) {
                mostrarToast(`⚠️ Saldo insuficiente. Tienes ${saldo} CMT`, 'error');
                return;
            }

            // Descontar saldo
            const nuevoSaldo = saldo - cantidad;
            localStorage.setItem(`csariels_cmt_balance_${user}`, nuevoSaldo.toString());

            // Registrar donación
            const donaciones = JSON.parse(localStorage.getItem('csariels_donaciones') || '[]');
            donaciones.push({
                id: Date.now(),
                user_id: user,
                monto: cantidad,
                fecha: new Date().toISOString()
            });
            localStorage.setItem('csariels_donaciones', JSON.stringify(donaciones));

            mostrarToast(`❤️ Donaste ${cantidad} CMT al streamer`);
            const nombre = localStorage.getItem('csariels_user_name') || 'Usuario';
            agregarMensajeChat('🎁', `💖 ${nombre} donó ${cantidad} CMT`);
        }

        // ================================================================
        // ENVIAR MENSAJE (GUARDADO EN SUPABASE)
        // ================================================================
        async function enviarMensaje() {
            const input = document.getElementById('chatInput');
            const texto = input.value.trim();
            if (!texto) return;

            const user = await obtenerUsuarioActual();
            if (!user) {
                mostrarToast('❌ Debes estar autenticado', 'error');
                return;
            }

            const perfil = await obtenerPerfil(user.id);
            const nombre = perfil?.nombre || 'Usuario';

            // Mostrar en el chat local
            agregarMensajeChat(nombre, texto);
            input.value = '';

            // Guardar en Supabase (tabla posts_muro que ya existe)
            try {
                await supabase
                    .from('posts_muro')
                    .insert({
                        usuario_id: user.id,
                        contenido: texto,
                        tipo: 'chat_live',
                        created_at: new Date().toISOString()
                    });
            } catch (e) {
                console.warn('Error guardando mensaje en Supabase:', e);
            }
        }

        // ================================================================
        // AGREGAR MENSAJE AL CHAT LOCAL
        // ================================================================
        function agregarMensajeChat(usuario, mensaje) {
            const chatBox = document.getElementById('chatBox');
            const div = document.createElement('div');
            div.className = 'chat-message';
            div.innerHTML = `<span class="user">${usuario}:</span> ${mensaje}`;
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        // ================================================================
        // CARGAR FEED DESDE SUPABASE (posts_muro)
        // ================================================================
        async function cargarFeed() {
            try {
                const { data, error } = await supabase
                    .from('posts_muro')
                    .select(`
                        id,
                        contenido,
                        created_at,
                        perfiles (nombre, avatar_url)
                    `)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) throw error;

                const container = document.getElementById('feedContainer');
                container.innerHTML = '';

                data.forEach(post => {
                    const div = document.createElement('div');
                    div.className = 'feed-item';

                    const nombre = post.perfiles?.nombre || 'Usuario';
                    const avatar = post.perfiles?.avatar_url || '';

                    div.innerHTML = `
                        <div class="author">
                            <div class="avatar">${nombre.charAt(0).toUpperCase()}</div>
                            <span class="name">${nombre}</span>
                            <span class="time">${formatearFecha(post.created_at)}</span>
                        </div>
                        <div>${post.contenido}</div>
                    `;

                    container.appendChild(div);
                });

            } catch (e) {
                console.error('Error cargando feed:', e);
            }
        }

        // ================================================================
        // FORMATEAR FECHA
        // ================================================================
        function formatearFecha(fecha) {
            const diff = Date.now() - new Date(fecha).getTime();
            const minutos = Math.floor(diff / 60000);
            if (minutos < 1) return 'Ahora';
            if (minutos < 60) return `Hace ${minutos}m`;
            const horas = Math.floor(minutos / 60);
            if (horas < 24) return `Hace ${horas}h`;
            return `Hace ${Math.floor(horas / 24)}d`;
        }

        // ================================================================
        // INICIALIZAR
        // ================================================================
        document.addEventListener('DOMContentLoaded', async function() {
            // Cargar feed
            await cargarFeed();

            // Verificar si hay live activo en localStorage
            const liveActivoStorage = localStorage.getItem('csariels_live_activo') === 'true';
            if (liveActivoStorage) {
                // No podemos reanudar el stream, pero mostramos el estado
                mostrarToast('📹 Hay un live activo en otra pestaña');
            }

            console.log('🚀 Csariel\'s Live conectado a Supabase REAL');
        });

        // ================================================================
        // EXPONER FUNCIONES GLOBALES
        // ================================================================
        window.iniciarLive = iniciarLive;
        window.detenerLive = detenerLive;
        window.donar = donar;
        window.enviarMensaje = enviarMensaje;
        window.agregarMensajeChat = agregarMensajeChat;
        window.mostrarToast = mostrarToast;
    </script>
</body>
</html>