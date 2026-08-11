// ================================================================
// 👤 PERFIL-CONNECTOR.JS — Csariel's Ecosystem
// Conecta Mi Perfil + Mi Red (Contactos/Solicitudes/Bloqueados)
// a Supabase usando auth.uid() (Anonymous Sign-In)
// Requiere: client-config-loader.js cargado ANTES que este archivo
// ================================================================

(function () {
    'use strict';

    let _client = null;
    let _miId = null;

    // ------------------------------------------------------------
    // 🔌 OBTENER CLIENTE SUPABASE (reutiliza el ya creado)
    // ------------------------------------------------------------
    function obtenerCliente() {
        if (window.supabase && typeof window.supabase.from === 'function') {
            return window.supabase;
        }
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            return window.supabaseClient;
        }
        return null;
    }

    function esperarCliente(intentos = 40) {
        return new Promise((resolve, reject) => {
            const check = () => {
                const c = obtenerCliente();
                if (c) return resolve(c);
                if (intentos <= 0) return reject(new Error('❌ Supabase no se inicializó a tiempo'));
                intentos--;
                setTimeout(check, 150);
            };
            check();
        });
    }

    // ------------------------------------------------------------
    // 🔐 INICIALIZAR: obtiene el cliente + auth.uid()
    // ------------------------------------------------------------
    async function init() {
        _client = await esperarCliente();
        const { data, error } = await _client.auth.getUser();
        if (error || !data?.user) {
            throw new Error('❌ No hay sesión anónima activa. Revisa client-config-loader.js');
        }
        _miId = data.user.id;
        console.log('✅ PerfilConnector listo. auth.uid():', _miId);
        return _miId;
    }

    function miId() {
        if (!_miId) throw new Error('⚠️ PerfilConnector no inicializado. Llama a init() primero.');
        return _miId;
    }

    // ================================================================
    // 👤 PERFIL
    // ================================================================

    async function cargarPerfil() {
        const { data, error } = await _client
            .from('perfiles')
            .select('*')
            .eq('user_id', miId())
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const { data: nuevo, error: errCrear } = await _client
                .from('perfiles')
                .insert({ user_id: miId() })
                .select()
                .single();
            if (errCrear) throw errCrear;
            return nuevo;
        }
        return data;
    }

    async function actualizarPerfil(campos) {
        const { data, error } = await _client
            .from('perfiles')
            .update({ ...campos, updated_at: new Date().toISOString() })
            .eq('user_id', miId())
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ================================================================
    // 👥 CONTACTOS
    // ================================================================

    async function obtenerContactos() {
        const { data: relaciones, error } = await _client
            .from('relaciones_contactos')
            .select('contacto_id, favorito, silenciado')
            .eq('user_id', miId())
            .eq('tipo', 'contacto')
            .eq('bloqueado', false);

        if (error) throw error;
        if (!relaciones || relaciones.length === 0) return [];

        const ids = relaciones.map(r => r.contacto_id);

        const [{ data: perfiles }, { data: presencias }] = await Promise.all([
            _client.from('perfiles').select('user_id, nombre, foto_perfil_url, verificado').in('user_id', ids),
            _client.from('presencias').select('usuario_id, estado, ultima_conexion').in('usuario_id', ids)
        ]);

        return relaciones.map(rel => {
            const perfil = perfiles?.find(p => p.user_id === rel.contacto_id) || {};
            const presencia = presencias?.find(p => p.usuario_id === rel.contacto_id) || {};
            return {
                id: rel.contacto_id,
                nombre: perfil.nombre || 'Usuario',
                foto: perfil.foto_perfil_url || null,
                verificado: perfil.verificado || false,
                favorito: rel.favorito,
                online: presencia.estado === 'online'
            };
        });
    }

    // ================================================================
    // 📬 SOLICITUDES
    // ================================================================

    async function obtenerSolicitudesRecibidas() {
        const { data: solicitudes, error } = await _client
            .from('relaciones_contactos')
            .select('user_id, created_at')
            .eq('contacto_id', miId())
            .eq('tipo', 'solicitud_enviada');

        if (error) throw error;
        if (!solicitudes || solicitudes.length === 0) return [];

        const ids = solicitudes.map(s => s.user_id);
        const { data: perfiles } = await _client
            .from('perfiles')
            .select('user_id, nombre, foto_perfil_url')
            .in('user_id', ids);

        return solicitudes.map(sol => {
            const perfil = perfiles?.find(p => p.user_id === sol.user_id) || {};
            return {
                id: sol.user_id,
                nombre: perfil.nombre || 'Usuario',
                foto: perfil.foto_perfil_url || null,
                fecha: sol.created_at
            };
        });
    }

    async function enviarSolicitud(destinoId) {
        const { error } = await _client
            .from('relaciones_contactos')
            .upsert(
                { user_id: miId(), contacto_id: destinoId, tipo: 'solicitud_enviada' },
                { onConflict: 'user_id,contacto_id' }
            );
        if (error) throw error;
        return true;
    }

    async function aceptarSolicitud(remitenteId) {
        const { error: err1 } = await _client
            .from('relaciones_contactos')
            .update({ tipo: 'contacto', updated_at: new Date().toISOString() })
            .eq('user_id', remitenteId)
            .eq('contacto_id', miId());
        if (err1) throw err1;

        const { error: err2 } = await _client
            .from('relaciones_contactos')
            .upsert(
                { user_id: miId(), contacto_id: remitenteId, tipo: 'contacto' },
                { onConflict: 'user_id,contacto_id' }
            );
        if (err2) throw err2;
        return true;
    }

    async function rechazarSolicitud(remitenteId) {
        const { error } = await _client
            .from('relaciones_contactos')
            .delete()
            .eq('user_id', remitenteId)
            .eq('contacto_id', miId())
            .eq('tipo', 'solicitud_enviada');
        if (error) throw error;
        return true;
    }

    // ================================================================
    // 🚫 BLOQUEADOS
    // ================================================================

    async function bloquearContacto(id) {
        const { error } = await _client
            .from('relaciones_contactos')
            .upsert(
                { user_id: miId(), contacto_id: id, tipo: 'contacto', bloqueado: true },
                { onConflict: 'user_id,contacto_id' }
            );
        if (error) throw error;
        return true;
    }

    async function desbloquearContacto(id) {
        const { error } = await _client
            .from('relaciones_contactos')
            .update({ bloqueado: false })
            .eq('user_id', miId())
            .eq('contacto_id', id);
        if (error) throw error;
        return true;
    }

    async function obtenerBloqueados() {
        const { data: relaciones, error } = await _client
            .from('relaciones_contactos')
            .select('contacto_id')
            .eq('user_id', miId())
            .eq('bloqueado', true);

        if (error) throw error;
        if (!relaciones || relaciones.length === 0) return [];

        const ids = relaciones.map(r => r.contacto_id);
        const { data: perfiles } = await _client
            .from('perfiles')
            .select('user_id, nombre, foto_perfil_url')
            .in('user_id', ids);

        return ids.map(id => {
            const perfil = perfiles?.find(p => p.user_id === id) || {};
            return { id, nombre: perfil.nombre || 'Usuario', foto: perfil.foto_perfil_url || null };
        });
    }

    // ================================================================
    // 🔍 DESCUBRIR
    // ================================================================

    async function obtenerDescubrir(limite = 20) {
        const { data: relacionados } = await _client
            .from('relaciones_contactos')
            .select('contacto_id')
            .eq('user_id', miId());

        const idsExcluir = [miId(), ...(relacionados || []).map(r => r.contacto_id)];

        const { data, error } = await _client
            .from('perfiles')
            .select('user_id, nombre, foto_perfil_url, origen, verificado')
            .not('user_id', 'in', `(${idsExcluir.join(',')})`)
            .limit(limite);

        if (error) throw error;
        return (data || []).map(p => ({
            id: p.user_id,
            nombre: p.nombre || 'Usuario',
            foto: p.foto_perfil_url || null,
            ubicacion: p.origen || 'Sin ubicación',
            verificado: p.verificado || false
        }));
    }

    // ================================================================
    // 📊 CONTADORES
    // ================================================================

    async function contarPublicaciones() {
        const { count, error } = await _client
            .from('posts_muro')
            .select('id', { count: 'exact', head: true })
            .eq('usuario_id', miId());
        if (error) throw error;
        return count || 0;
    }

    // ------------------------------------------------------------
    // 🌍 EXPONER GLOBALMENTE
    // ------------------------------------------------------------
    window.PerfilConnector = {
        init,
        miId,
        cargarPerfil,
        actualizarPerfil,
        obtenerContactos,
        obtenerSolicitudesRecibidas,
        enviarSolicitud,
        aceptarSolicitud,
        rechazarSolicitud,
        bloquearContacto,
        desbloquearContacto,
        obtenerBloqueados,
        obtenerDescubrir,
        contarPublicaciones
    };

    console.log('📦 perfil-connector.js cargado');
})();