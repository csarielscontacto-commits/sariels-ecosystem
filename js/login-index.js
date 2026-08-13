// js/login-index.js
// Lógica de login para la página principal de Csariel's

// ================================================================
// 👤 GUARDAR PERFIL EN SUPABASE
// ================================================================
async function guardarPerfilSupabase(uid, { nombre, email, phone } = {}) {
    if (!window.supabase) return false;
    const payload = { user_id: uid, ultimo_acceso: new Date().toISOString() };
    if (nombre) payload.nombre = nombre;
    if (email) payload.email = email;
    if (phone) payload.telefono = phone;

    const { error } = await window.supabase
        .from('perfiles')
        .upsert(payload, { onConflict: 'user_id' });

    if (error) {
        console.warn('⚠️ Error guardando perfil en Supabase:', error);
        return false;
    }
    return true;
}

// ================================================================
// 🚀 LOGIN
// ================================================================
async function handleLogin() {
    const username = document.getElementById('inputUsername').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();
    const accept = document.getElementById('acceptTerms').checked;

    if (!username || username.length < 2) {
        mostrarToast('⚠️ Ingresa un nombre de usuario válido', 'error');
        return;
    }
    if (!accept) {
        mostrarToast('⚠️ Debes aceptar los Términos y Condiciones', 'error');
        return;
    }

    localStorage.setItem('csariels_user_name', username);
    if (email) localStorage.setItem('csariels_email', email);
    if (phone) localStorage.setItem('csariels_phone', phone);
    localStorage.setItem('csariels_login', 'true');
    localStorage.setItem('csariels_member_since', new Date().getFullYear());

    let supabaseOk = false;
    if (window.supabase) {
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            let uid = session?.user?.id;
            if (!uid) {
                const { data, error } = await window.supabase.auth.signInAnonymously();
                if (error) throw error;
                uid = data.session.user.id;
                console.log('🆕 Sesión anónima creada:', uid);
            }
            localStorage.setItem('csariels_user_id', uid);
            supabaseOk = await guardarPerfilSupabase(uid, { nombre: username, email, phone });
            if (supabaseOk) console.log('✅ Perfil guardado en Supabase con uid:', uid);
        } catch (e) {
            console.warn('⚠️ Supabase no disponible, guardando solo en localStorage:', e);
        }
    }

    if (!localStorage.getItem('csariels_user_id')) {
        localStorage.setItem('csariels_user_id', 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
    }

    const mensaje = supabaseOk ?
        `✅ Bienvenido ${username}! (datos en Supabase)` :
        `✅ Bienvenido ${username}! (modo local)`;
    mostrarToast(mensaje);
    setTimeout(() => {
        window.location.href = '/features/red/index.html';
    }, 800);
}

// ================================================================
// 🔵 GOOGLE OAUTH
// ================================================================
async function loginWithGoogle() {
    if (!window.supabase) {
        mostrarToast('⚠️ Supabase no está disponible', 'error');
        return;
    }
    const accept = document.getElementById('acceptTerms').checked;
    if (!accept) {
        mostrarToast('⚠️ Debes aceptar los Términos y Condiciones', 'error');
        return;
    }

    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        const redirectTo = window.location.origin + window.location.pathname;

        if (session?.user?.is_anonymous) {
            const { error } = await window.supabase.auth.linkIdentity({
                provider: 'google',
                options: { redirectTo }
            });
            if (error) throw error;
        } else {
            const { error } = await window.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo }
            });
            if (error) throw error;
        }
    } catch (e) {
        console.error(e);
        mostrarToast('⚠️ No se pudo iniciar con Google: ' + e.message, 'error');
    }
}

// ================================================================
// 🔁 PROCESAR RETORNO DE GOOGLE
// ================================================================
let googleRedirectDone = false;

async function handleOAuthReturn() {
    if (googleRedirectDone) return;
    if (!window.supabase) return;
    
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session?.user || session.user.is_anonymous) return;

    const uid = session.user.id;
    const nombreGoogle = session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Usuario';
    const emailGoogle = session.user.email || null;

    localStorage.setItem('csariels_user_id', uid);
    localStorage.setItem('csariels_user_name', nombreGoogle);
    if (emailGoogle) localStorage.setItem('csariels_email', emailGoogle);
    localStorage.setItem('csariels_login', 'true');

    await guardarPerfilSupabase(uid, { nombre: nombreGoogle, email: emailGoogle });

    googleRedirectDone = true;
    mostrarToast(`✅ Bienvenido ${nombreGoogle}! (Google)`);
    setTimeout(() => {
        window.location.href = '/features/red/index.html';
    }, 600);
}

// ================================================================
// 🚀 INICIALIZAR
// ================================================================
document.addEventListener('DOMContentLoaded', async function() {
    // initStars() y CSARIELS_IDIOMA.init() vienen de red-main.js
    if (typeof initStars === 'function') initStars();

    if (window.Security) {
        window.Security.initSeguridad();
        console.log('🛡️ Seguridad activada');
    }

    if (typeof CSARIELS_IDIOMA !== 'undefined') {
        await CSARIELS_IDIOMA.init();
    }

    console.log('◈ Csariel\'s - Inicio (con Supabase)');

    // ✅ Manejar retorno de Google sin duplicar redirección
    await handleOAuthReturn();

    // ✅ Solo verificar sesión si NO hubo redirección por Google
    if (!googleRedirectDone && localStorage.getItem('csariels_login') === 'true') {
        const username = localStorage.getItem('csariels_user_name');
        if (username) {
            mostrarToast(`✅ Sesión activa como ${username}. Redirigiendo...`);
            setTimeout(() => {
                window.location.href = '/features/red/index.html';
            }, 600);
        }
    }

    document.querySelectorAll('#inputUsername, #inputEmail, #inputPhone').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    });

    // Escuchar cambios de idioma desde otras pestañas
    window.addEventListener('storage', (e) => {
        if (e.key === 'csariels_idioma' && e.newValue !== CSARIELS_IDIOMA?.actual) {
            CSARIELS_IDIOMA?.cambiar(e.newValue);
        }
    });
});

// Exponer funciones globales
window.handleLogin = handleLogin;
window.loginWithGoogle = loginWithGoogle;
if (typeof mostrarToast !== 'function') {
    window.mostrarToast = function(mensaje, tipo = '') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = mensaje;
        toast.className = `toast${tipo ? ' error' : ''}`;
        toast.classList.add('active');
        clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => toast.classList.remove('active'), 3000);
    };
}
window.CSARIELS_IDIOMA = CSARIELS_IDIOMA;