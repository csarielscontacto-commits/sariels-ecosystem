// ================================================================
// 📋 CONSTANTES - CSARIEL'S ECOSYSTEM
// ================================================================
// Constantes globales para todo el ecosistema.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

// ================================================================
// 🌐 CONFIGURACIÓN DE LA APP
// ================================================================

export const APP_CONFIG = {
    NOMBRE: 'Csariel\'s',
    VERSION: '3.0.0',
    DESCRIPCION: 'Ecosistema Integral · Red Social · eSIM · Web3',
    AUTOR: 'Csariel\'s Ecosystem',
    PAIS: 'México',
    CIUDAD: 'Puebla',
    URL: 'https://csariels.vercel.app',
    EMAIL: 'csarielscontacto@gmail.com',
    TELEFONO: '+52 222 123 4567'
};

// ================================================================
// 🌐 IDIOMAS DISPONIBLES
// ================================================================

export const IDIOMAS = {
    es: { nombre: 'Español', bandera: '🇪🇸', codigo: 'es' },
    en: { nombre: 'English', bandera: '🇬🇧', codigo: 'en' },
    fr: { nombre: 'Français', bandera: '🇫🇷', codigo: 'fr' }
};

export const IDIOMA_DEFAULT = 'es';

// ================================================================
// 🔗 RUTAS PRINCIPALES
// ================================================================

export const RUTAS = {
    INICIO: '/',
    RED: '/features/red/index.html',
    LIVE: '/features/live/index.html',
    FORO: '/features/foro/index.html',
    TRADING: '/features/trading/index.html',
    SERVICIOS: '/features/servicios/index.html',
    INTERNET: '/features/internet/index.html',
    TIENDA: '/features/tienda/index.html',
    WALLET: '/features/wallet/index.html',
    ADMIN: '/features/admin/index.html',
    LEGAL_HUB: '/features/legal-hub/index.html',
    HUB_LEALTAD: '/features/hub-lealtad/index.html',
    TALAVERIN: '/features/talaverin/index.html',
    TERMINOS: '/terminos-completos.html',
    PRIVACIDAD: '/aviso-privacidad.html'
};

// ================================================================
# 🔑 CONFIGURACIÓN DE SUPABASE
// ================================================================

export const SUPABASE_CONFIG = {
    URL: 'https://nvyyxgkladjauolvpzfp.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NDA3NjMsImV4cCI6MjA5ODIxNjc2M30.3O6tea8l1UbGIlwR_2iyIS1M-dgoQC5G4G1S9YSiXL0'
};

// ================================================================
# 📹 CONFIGURACIÓN DE LIVEKIT
// ================================================================

export const LIVEKIT_CONFIG = {
    URL: null, // Se obtiene desde el backend
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 2000,
    MAX_PARTICIPANTS: 50,
    VIDEO_QUALITY: {
        LOW: { width: 180, height: 120, bitrate: 40000 },
        MEDIUM: { width: 360, height: 240, bitrate: 150000 },
        HIGH: { width: 720, height: 480, bitrate: 500000 }
    }
};

// ================================================================
# 📦 CONFIGURACIÓN DE eSIM
// ================================================================

export const ESIM_CONFIG = {
    PLANES: [
        { id: 1, nombre: 'Básico', mb: 100, precio: 1.99, dias: 7 },
        { id: 2, nombre: 'Pro', mb: 500, precio: 4.99, dias: 15 },
        { id: 3, nombre: 'Premium', mb: 2048, precio: 9.99, dias: 30 },
        { id: 4, nombre: 'Ilimitado', mb: 10240, precio: 19.99, dias: 30 }
    ],
    MONEDA: 'USD',
    PAISES_SOPORTADOS: ['MX', 'US', 'CA', 'UK', 'FR', 'DE', 'ES']
};

// ================================================================
# 🪙 CONFIGURACIÓN DE CMT (TOKEN)
// ================================================================

export const CMT_CONFIG = {
    NOMBRE: 'Csariel\'s Token',
    SIMBOLO: 'CMT',
    DECIMALES: 18,
    CONTRATO_OFICIAL: '0x0000000000000000000000000000000000000000', // Reemplazar con dirección real
    COMISION: 0.01, // 1%
    SALDO_INICIAL: 1000,
    PRECIO_MINIMO: 0.01
};

// ================================================================
# 🎁 CONFIGURACIÓN DE RECOMPENSAS
// ================================================================

export const REWARDS_CONFIG = {
    LIMITE_DIARIO_MB: 500,
    RECOMPENSA_NAVEGADOR: 50, // MB cada 10 min
    RECOMPENSA_APP: 30, // MB por hora
    MINUTOS_POR_RECOMPENSA: 10,
    MEGAS_POR_PUBLICACION: 5,
    MEGAS_POR_COMENTARIO: 2,
    MEGAS_POR_LIKE: 1
};

// ================================================================
# 🎯 CONFIGURACIÓN DE ES.STOKS (LEALTAD)
// ================================================================

export const STOKS_CONFIG = {
    BLOQUE_CANJE: 12,
    PRECIO_REFERENCIA_MXN: 2.45,
    COMISION_P2P: 0.01, // 1%
    MAX_OFERTAS_POR_USUARIO: 10,
    DIAS_VIGENCIA_OFERTA: 7
};

// ================================================================
# 👥 CONFIGURACIÓN DE CONTACTOS
// ================================================================

export const CONTACTOS_CONFIG = {
    MAX_SOLICITUDES_DIARIAS: 20,
    MAX_CONTACTOS: 500,
    SOLICITUD_EXPIRACION: 7 // días
};

// ================================================================
# 🔔 CONFIGURACIÓN DE NOTIFICACIONES
// ================================================================

export const NOTIFICACIONES_CONFIG = {
    TIPOS: ['like', 'comment', 'friend', 'system', 'event', 'group'],
    MAX_HISTORIAL: 100,
    EXPIRACION_DIAS: 30
};

// ================================================================
# 🛡️ CONFIGURACIÓN DE SEGURIDAD
// ================================================================

export const SEGURIDAD_CONFIG = {
    INTENTOS_LOGIN_MAX: 5,
    BLOQUEO_MINUTOS: 15,
    SESION_MINUTOS: 60 * 24, // 24 horas
    TOKEN_EXPIRACION: 3600 // 1 hora
};

// ================================================================
# 📧 CONFIGURACIÓN DE EMAIL
// ================================================================

export const EMAIL_CONFIG = {
    SOPORTE: 'csarielscontacto@gmail.com',
    NO_REPLY: 'noreply@csariels.com',
    ASUNTOS: {
        VERIFICACION: 'Verifica tu cuenta - Csariel\'s',
        RECUPERACION: 'Recuperación de contraseña - Csariel\'s',
        NOTIFICACION: 'Nueva notificación - Csariel\'s'
    }
};

// ================================================================
# 🎨 TEMAS DISPONIBLES
// ================================================================

export const TEMAS = {
    OSCURO: {
        nombre: 'Oscuro',
        fondo: '#05080f',
        primario: '#0F2D1A',
        secundario: '#D4AF37',
        texto: '#e8f0f8',
        borde: 'rgba(212,175,55,0.15)'
    },
    CLARO: {
        nombre: 'Claro',
        fondo: '#f0f4f8',
        primario: '#e8f0f8',
        secundario: '#2d3748',
        texto: '#1a202c',
        borde: 'rgba(45,55,72,0.15)'
    },
    VERDE: {
        nombre: 'Verde',
        fondo: '#0a1f0a',
        primario: '#1a4a2a',
        secundario: '#4CAF50',
        texto: '#e8f0f8',
        borde: 'rgba(76,175,80,0.15)'
    },
    AZUL: {
        nombre: 'Azul',
        fondo: '#0a0a1f',
        primario: '#1a2a4a',
        secundario: '#2196F3',
        texto: '#e8f0f8',
        borde: 'rgba(33,150,243,0.15)'
    }
};

// ================================================================
# 📦 EXPORTAR TODO
// ================================================================

export default {
    APP_CONFIG,
    IDIOMAS,
    IDIOMA_DEFAULT,
    RUTAS,
    SUPABASE_CONFIG,
    LIVEKIT_CONFIG,
    ESIM_CONFIG,
    CMT_CONFIG,
    REWARDS_CONFIG,
    STOKS_CONFIG,
    CONTACTOS_CONFIG,
    NOTIFICACIONES_CONFIG,
    SEGURIDAD_CONFIG,
    EMAIL_CONFIG,
    TEMAS
};

console.log('📋 Constantes cargadas');
console.log(`📦 ${Object.keys(APP_CONFIG).length} configuraciones disponibles`);