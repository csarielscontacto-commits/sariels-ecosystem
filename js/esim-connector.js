// ================================================================
// esim-connector.js - CONECTOR COMPARTIDO PARA eSIM + CONEXIÓN
// ================================================================

const SUPABASE_URL = 'https://nvyyxgkladjauolvpzfp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MTU2ODEsImV4cCI6MjA1NjE5MTY4MX0.c1Zk6QpI7m7tQnY4k8w9Tg5dDw2pXgFh1y3JkLmNpQo';

let supabaseClient = null;
let userId = localStorage.getItem('csariels_user_id') || null;
let esimCache = null;
let conexionPreferida = localStorage.getItem('csariels_conexion') || 'auto'; // 'wifi', 'esim', 'auto'

function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.warn('⚠️ Supabase no está cargado.');
        return null;
    }
    if (!supabaseClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('🔗 Supabase conectado (eSIM)');
    }
    return supabaseClient;
}

// ================================================================
// 1. DETECTAR TIPO DE CONEXIÓN (WiFi o datos móviles)
// ================================================================
function tieneWiFi() {
    if (navigator.connection) {
        const type = navigator.connection.effectiveType;
        if (type === 'wifi' || type === 'ethernet') {
            return true;
        }
        return false;
    }
    return false;
}

function getConnectionType() {
    if (navigator.connection) {
        return {
            type: navigator.connection.type || 'unknown',
            effectiveType: navigator.connection.effectiveType || 'unknown',
            downlink: navigator.connection.downlink || 0,
            rtt: navigator.connection.rtt || 0
        };
    }
    return { type: 'unknown', effectiveType: 'unknown', downlink: 0, rtt: 0 };
}

// ================================================================
// 2. OBTENER INTERNET DISPONIBLE
// ================================================================
async function obtenerInternetDisponible() {
    // Verificar preferencia del usuario
    if (conexionPreferida === 'wifi') {
        const tieneWifi = tieneWiFi();
        if (tieneWifi) {
            return {
                tipo: 'wifi',
                disponible: true,
                mensaje: '📶 Conectado a WiFi (gratis)',
                puedeUsar: true
            };
        }
        // Si no tiene WiFi pero pidió WiFi, mostrar error
        return {
            tipo: 'sin_wifi',
            disponible: false,
            mensaje: '📶 No hay WiFi disponible. Cambia a eSIM.',
            puedeUsar: false
        };
    }

    // Primero verificar WiFi
    const tieneWifi = tieneWiFi();
    
    if (tieneWifi && conexionPreferida !== 'esim') {
        return {
            tipo: 'wifi',
            disponible: true,
            mensaje: '📶 Conectado a WiFi (gratis)',
            puedeUsar: true
        };
    }
    
    // No tiene WiFi o prefirió eSIM → verificar eSIM
    const esimStatus = await consultarEsim();
    
    if (esimStatus && esimStatus.activa && esimStatus.restantes > 0) {
        return {
            tipo: 'esim',
            disponible: true,
            mensaje: `🌐 Usando eSIM Csariel's (${esimStatus.restantes} MB restantes)`,
            puedeUsar: true,
            restantes: esimStatus.restantes,
            asignados: esimStatus.asignados,
            consumidos: esimStatus.consumidos,
            porcentaje: esimStatus.porcentaje
        };
    }
    
    // No tiene WiFi ni eSIM
    return {
        tipo: 'sin_internet',
        disponible: false,
        mensaje: '⚠️ Sin conexión a internet. Activa tu eSIM o conecta WiFi.',
        puedeUsar: false
    };
}

// ================================================================
// 3. CONSULTAR ESTADO DE eSIM
// ================================================================
async function consultarEsim() {
    const client = initSupabase();
    if (!client) return { activa: false, error: 'Supabase no inicializado' };

    if (esimCache && Date.now() - esimCache.timestamp < 30000) {
        return esimCache;
    }

    try {
        const { data, error } = await client
            .from('perfiles')
            .select('esim_activa, esim_iccid, esim_datos_asignados_mb, esim_datos_consumidos_mb, esim_fecha_renovacion')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('❌ Error al obtener eSIM:', error);
            return { activa: false, error: error.message };
        }

        if (!data || !data.esim_activa) {
            return { activa: false, error: 'eSIM no activa' };
        }

        const asignados = data.esim_datos_asignados_mb || 2048;
        const consumidos = data.esim_datos_consumidos_mb || 0;
        const restantes = Math.max(0, asignados - consumidos);
        const porcentaje = Math.min(100, Math.round((consumidos / asignados) * 100));

        const resultado = {
            activa: data.esim_activa,
            iccid: data.esim_iccid,
            asignados: asignados,
            consumidos: consumidos,
            restantes: restantes,
            porcentaje: porcentaje,
            fecha_renovacion: data.esim_fecha_renovacion
        };

        esimCache = { ...resultado, timestamp: Date.now() };
        return resultado;

    } catch (error) {
        console.error('❌ Error en consultarEsim:', error);
        return { activa: false, error: error.message };
    }
}

// ================================================================
// 4. VERIFICAR SI PUEDE EJECUTAR UNA ACCIÓN
// ================================================================
async function puedeEjecutarAccion(consumo_mb = 0, modulo = 'general') {
    const estado = await obtenerInternetDisponible();
    
    // Si tiene WiFi → siempre puede
    if (estado.tipo === 'wifi') {
        return { puede: true, mensaje: '✅ Usando WiFi' };
    }
    
    // Si tiene eSIM → verificar datos suficientes
    if (estado.tipo === 'esim') {
        if (estado.restantes >= consumo_mb) {
            // Registrar consumo
            await registrarConsumo(consumo_mb, modulo);
            return { 
                puede: true, 
                mensaje: `✅ Usando eSIM (${(estado.restantes - consumo_mb).toFixed(1)} MB restantes)`,
                restantes: estado.restantes - consumo_mb
            };
        } else {
            return { 
                puede: false, 
                mensaje: `⚠️ Datos insuficientes. Necesitas ${consumo_mb} MB, te quedan ${estado.restantes.toFixed(1)} MB`,
                recargar: true
            };
        }
    }
    
    // Sin internet
    return {
        puede: false,
        mensaje: '⚠️ Sin conexión a internet. Activa tu eSIM o conecta WiFi.',
        recargar: true
    };
}

// ================================================================
// 5. ACTIVAR eSIM
// ================================================================
async function activarEsim() {
    const client = initSupabase();
    if (!client) return { success: false, error: 'Supabase no inicializado' };

    try {
        const { data: user, error: userError } = await client
            .from('perfiles')
            .select('esim_activa')
            .eq('user_id', userId)
            .single();

        if (userError) throw new Error('Usuario no encontrado');

        if (user.esim_activa) {
            return { success: false, error: 'Ya tienes una eSIM activa' };
        }

        // Crear eSIM (simulado por ahora)
        const iccid = 'esim_' + Date.now() + '_' + userId.slice(0, 6);
        
        await client
            .from('perfiles')
            .update({
                esim_activa: true,
                esim_iccid: iccid,
                esim_proveedor: 'soracom',
                esim_datos_asignados_mb: 2048,
                esim_datos_consumidos_mb: 0,
                esim_fecha_renovacion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('user_id', userId);

        esimCache = {
            activa: true,
            iccid: iccid,
            asignados: 2048,
            consumidos: 0,
            restantes: 2048,
            porcentaje: 0,
            timestamp: Date.now()
        };

        return { 
            success: true, 
            iccid: iccid,
            mensaje: '✅ eSIM activada correctamente! Tienes 2048 MB gratis.'
        };

    } catch (error) {
        console.error('❌ Error en activarEsim:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// 6. RECARGAR DATOS
// ================================================================
async function recargarDatos(megabytes = 1024) {
    const client = initSupabase();
    if (!client) return { success: false, error: 'Supabase no inicializado' };

    try {
        const { data: user, error } = await client
            .from('perfiles')
            .select('esim_datos_asignados_mb, esim_iccid')
            .eq('user_id', userId)
            .single();

        if (error) throw new Error('Usuario no encontrado');

        const nuevoTotal = (user.esim_datos_asignados_mb || 0) + megabytes;

        await client
            .from('perfiles')
            .update({
                esim_datos_asignados_mb: nuevoTotal,
                esim_fecha_renovacion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('user_id', userId);

        esimCache = null;
        await consultarEsim();

        return { 
            success: true, 
            mensaje: `✅ Recargados ${megabytes} MB correctamente. Total: ${nuevoTotal} MB`
        };

    } catch (error) {
        console.error('❌ Error en recargarDatos:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// 7. REGISTRAR CONSUMO
// ================================================================
async function registrarConsumo(megabytes, modulo) {
    const client = initSupabase();
    if (!client) return { success: false, error: 'Supabase no inicializado' };

    try {
        const { data: user, error } = await client
            .from('perfiles')
            .select('esim_datos_consumidos_mb, esim_datos_asignados_mb')
            .eq('user_id', userId)
            .single();

        if (error) throw new Error('Usuario no encontrado');

        const nuevoConsumo = (user.esim_datos_consumidos_mb || 0) + megabytes;

        await client
            .from('perfiles')
            .update({
                esim_datos_consumidos_mb: nuevoConsumo
            })
            .eq('user_id', userId);

        // Registrar transacción
        await client
            .from('esim_transacciones')
            .insert({
                usuario_id: userId,
                tipo: 'consumo',
                mb_consumidos: megabytes,
                modulo: modulo,
                timestamp: new Date().toISOString()
            });

        esimCache = null;
        return { success: true };

    } catch (error) {
        console.error('❌ Error en registrarConsumo:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// 8. MOSTRAR ESTADO DE CONEXIÓN EN LA UI
// ================================================================
async function mostrarEstadoConexion() {
    const statusDiv = document.getElementById('connectionStatus');
    if (!statusDiv) return;
    
    const estado = await obtenerInternetDisponible();
    
    if (estado.tipo === 'wifi') {
        statusDiv.innerHTML = `
            <span style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.2rem;">📶</span>
                <span style="color:var(--success);font-weight:600;">WiFi</span>
                <span style="color:var(--text-muted);font-size:0.6rem;">● Gratis</span>
            </span>
            <span style="font-size:0.6rem;color:var(--text-muted);font-family:'Orbitron',monospace;">
                ${estado.mensaje}
            </span>
        `;
        statusDiv.style.borderColor = 'var(--success)';
        statusDiv.style.background = 'rgba(0,184,148,0.05)';
    } else if (estado.tipo === 'esim') {
        statusDiv.innerHTML = `
            <span style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.2rem;">🌐</span>
                <span style="color:var(--gold-cosmic);font-weight:600;">eSIM Csariel's</span>
                <span style="color:var(--gold-cosmic);font-size:0.6rem;">● ${estado.restantes.toFixed(0)} MB</span>
            </span>
            <div style="display:flex;align-items:center;gap:8px;flex:1;">
                <div style="flex:1;max-width:100px;height:4px;background:var(--gold-dim);border-radius:2px;overflow:hidden;">
                    <div style="width:${estado.porcentaje}%;height:100%;background:var(--gold-cosmic);border-radius:2px;transition:width 0.5s;"></div>
                </div>
                <span style="font-size:0.5rem;color:var(--text-muted);font-family:'Orbitron',monospace;">
                    ${estado.consumidos.toFixed(0)}/${estado.asignados.toFixed(0)} MB
                </span>
            </div>
        `;
        statusDiv.style.borderColor = 'var(--gold-cosmic)';
        statusDiv.style.background = 'rgba(212,175,55,0.05)';
    } else {
        statusDiv.innerHTML = `
            <span style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.2rem;">⚠️</span>
                <span style="color:var(--danger);font-weight:600;">Sin conexión</span>
            </span>
            <button class="btn btn-gold btn-sm" onclick="window.location.href='./mi-red.html#esim'">
                <i class="fas fa-sim-card"></i> Activar eSIM
            </button>
        `;
        statusDiv.style.borderColor = 'var(--danger)';
        statusDiv.style.background = 'rgba(255,51,102,0.05)';
    }
}

// ================================================================
// 9. SELECTOR DE CONEXIÓN (Wifi / eSIM / Auto)
// ================================================================
function seleccionarConexion(tipo) {
    conexionPreferida = tipo;
    localStorage.setItem('csariels_conexion', tipo);
    
    const modal = document.getElementById('conexionModal');
    if (modal) modal.classList.remove('active');
    
    mostrarToast(`📶 Conexión cambiada a: ${tipo === 'wifi' ? 'WiFi' : tipo === 'esim' ? 'eSIM Csariel\'s' : 'Automático'}`);
    mostrarEstadoConexion();
}

function forzarConexionWifi() {
    seleccionarConexion('wifi');
}

function forzarConexionEsim() {
    seleccionarConexion('esim');
}

function forzarConexionAuto() {
    seleccionarConexion('auto');
}

// ================================================================
// 10. TOAST (mensajes)
// ================================================================
function mostrarToast(mensaje, tipo = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = mensaje;
    toast.className = `toast${tipo ? ' ' + tipo : ''}`;
    toast.classList.add('active');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('active'), 3000);
}

// ================================================================
// EXPORTAR FUNCIONES
// ================================================================
window.esimConnector = {
    initSupabase,
    tieneWiFi,
    getConnectionType,
    obtenerInternetDisponible,
    consultarEsim,
    puedeEjecutarAccion,
    activarEsim,
    recargarDatos,
    registrarConsumo,
    mostrarEstadoConexion,
    seleccionarConexion,
    forzarConexionWifi,
    forzarConexionEsim,
    forzarConexionAuto,
    getUserId: () => userId,
    setUserId: (id) => { userId = id; },
    getConexionPreferida: () => conexionPreferida
};

console.log('📦 esim-connector.js cargado');
console.log('📶 Preferencia de conexión:', conexionPreferida);