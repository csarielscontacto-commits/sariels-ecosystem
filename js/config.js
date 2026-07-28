// ================================================================
// CONFIGURACIÓN GLOBAL - Csariel's Platform
// ================================================================

export const CONFIG = {
    // Versión de la plataforma
    VERSION: '3.0.0',

    // ================================================================
    // SUPABASE
    // ================================================================
    SUPABASE_URL: 'https://nvyyxgkladjauolvpzfp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MTU2ODEsImV4cCI6MjA1NjE5MTY4MX0.c1Zk6QpI7m7tQnY4k8w9Tg5dDw2pXgFh1y3JkLmNpQo',

    // ================================================================
    // SISTEMA DE DONACIONES
    // ================================================================
    DONACIONES: {
        COMISION: 0.50, // 50% para la plataforma
        TOKENS_ACEPTADOS: ['USDT', 'USDC', 'TOK'],
        MONTO_MINIMO: 1
    },

    // ================================================================
    // SISTEMA COMMIT (CMT)
    // ================================================================
    COMMIT: {
        SIMBOLO: 'CMT',
        VALOR_MXN: 1, // 1 CMT = $1 MXN
        COMISION: 0.50, // 50% para la plataforma
        ACTIVOS: {
            PLATA: { id: 'PLATA', nombre: 'Cubo Plata', precio: 1, codigo: 'CUBO-PLATA-001', rareza: 'COMÚN', emoji: '🥈', color: '#C0C0C0' },
            BRONCE: { id: 'BRONCE', nombre: 'Cubo Bronce', precio: 5, codigo: 'CUBO-BRONCE-005', rareza: 'POCO COMÚN', emoji: '🪙', color: '#B87333' },
            ORO: { id: 'ORO', nombre: 'Cubo Oro', precio: 10, codigo: 'CUBO-ORO-010', rareza: 'RARO', emoji: '🥇', color: '#FFD700' },
            DIAMANTE: { id: 'DIAMANTE', nombre: 'Diamante Cohete', precio: 200, codigo: 'DIAMANTE-COHETE-200', rareza: 'ÉPICO', emoji: '💎', color: '#00BFFF' },
            LEGENDARIO: { id: 'LEGENDARIO', nombre: 'Cubo Legendario', precio: 500, codigo: 'CUBO-LEGENDARIO-500', rareza: 'LEGENDARIO', emoji: '⭐', color: '#FF6B00' }
        }
    },

    // ================================================================
    // MODERACIÓN
    // ================================================================
    MODERACION: {
        ADVERTENCIAS: {
            PRIMERA: { tiempo: 15, mensaje: 'Primera advertencia' },
            SEGUNDA: { tiempo: 15, mensaje: 'Segunda advertencia' },
            TERCERA: { tiempo: 180, mensaje: 'Advertencia final - 3 minutos' }
        },
        CIERRE_AUTOMATICO: 180 // 3 minutos
    },

    // ================================================================
    // JUEGOS DETECTABLES
    // ================================================================
    JUEGOS: [
        { nombre: 'Free Fire', proceso: 'freefire.exe', icono: '🔥' },
        { nombre: 'Call of Duty', proceso: 'cod.exe', icono: '⚔️' },
        { nombre: 'Roblox', proceso: 'robloxplayer.exe', icono: '🧱' },
        { nombre: 'League of Legends', proceso: 'league.exe', icono: '⚡' },
        { nombre: 'Valorant', proceso: 'valorant.exe', icono: '🎯' },
        { nombre: 'Fortnite', proceso: 'fortnite.exe', icono: '🎮' },
        { nombre: 'Minecraft', proceso: 'minecraft.exe', icono: '⛏️' },
        { nombre: 'CS:GO', proceso: 'csgo.exe', icono: '🔫' },
        { nombre: 'DOTA 2', proceso: 'dota2.exe', icono: '🏆' },
        { nombre: 'Genshin Impact', proceso: 'genshinimpact.exe', icono: '✨' },
        { nombre: 'Among Us', proceso: 'amongus.exe', icono: '👾' },
        { nombre: 'FIFA', proceso: 'fifa.exe', icono: '⚽' },
        { nombre: 'Apex Legends', proceso: 'apex.exe', icono: '🦅' },
        { nombre: 'PUBG', proceso: 'pubg.exe', icono: '🪂' },
        { nombre: 'Overwatch', proceso: 'overwatch.exe', icono: '🛡️' }
    ],

    // ================================================================
    // UNIVERSIDADES PARA VERIFICACIÓN
    // ================================================================
    UNIVERSIDADES: {
        'udlap': 'UDLAP',
        'buap': 'BUAP',
        'tec': 'Tec de Monterrey',
        'ibero': 'Ibero Puebla',
        'upaep': 'UPAEP',
        'uanl': 'UANL',
        'unam': 'UNAM',
        'ipn': 'IPN'
    },

    DOMINIOS_EDU: [
        '.edu', '.edu.mx', '.edu.co', '.edu.ar', '.edu.pe',
        '.udlap.mx', '.buap.mx', '.tec.mx', '.ibero.mx',
        '.upaep.mx', '.uanl.mx', '.unam.mx', '.ipn.mx'
    ],

    // ================================================================
    // FUNCIÓN: Calcular comisión directo
    // ================================================================
    calcularComisionDirecto: (monto, token) => {
        const comision = monto * 0.50;
        return {
            comision: comision,
            streamerMonto: monto - comision,
            token: token
        };
    },

    // ================================================================
    // FUNCIÓN: Obtener activo por ID
    // ================================================================
    obtenerActivo: (id) => {
        return CONFIG.COMMIT.ACTIVOS[id] || null;
    },

    // ================================================================
    // FUNCIÓN: Listar todos los activos
    // ================================================================
    listarActivos: () => {
        return Object.values(CONFIG.COMMIT.ACTIVOS);
    }
};

// Exportar por defecto para compatibilidad
export default CONFIG;

// Exponer globalmente para scripts no-module
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    console.log('📦 Configuración global cargada v' + CONFIG.VERSION);
}