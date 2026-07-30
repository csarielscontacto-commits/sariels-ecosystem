// ============================================================
// ASISTENTE IA - Csariel's
// Configuración Central
// ============================================================

const ASISTENTE_CONFIG = {
    // Personajes disponibles
    personajes: {
        galletita: {
            id: 'galletita',
            nombre: 'Galletita',
            emoji: '🍪',
            rol: 'Social',
            tipo: 'comunidad',
            seccion: 'muro-live', // ← Esta propiedad decide dónde aparece
            saludo: '¡Holi! ¿Listo para conectar con tu comunidad hoy? ✨',
            descripcion: 'Tierna, amigable, siempre al tanto de lo que pasa'
        },
        miel: {
            id: 'miel',
            nombre: 'Miel',
            emoji: '🍯',
            rol: 'Conectar',
            tipo: 'comunidad',
            seccion: 'ayuda-comunitaria',
            saludo: '¡Qué gusto verte! Siempre es un placer compartir contigo 💛',
            descripcion: 'Cálida, sonriente, acogedora como la miel'
        },
        amasu: {
            id: 'amasu',
            nombre: 'AmasU',
            emoji: '🧁',
            rol: 'Negocios',
            tipo: 'business',
            seccion: 'panel-web3',
            saludo: '¡Hola! ¿Listo para que trabajemos juntos hoy? 📊',
            descripcion: 'Chibi repostero, enfocado en tus ventas'
        },
        crumb: {
            id: 'crumb',
            nombre: 'Crumb',
            emoji: '🥐',
            rol: 'Resultados',
            tipo: 'business',
            seccion: 'panel-web3',
            saludo: '¡Vamos a por todas! Hoy vamos a lograr grandes cosas 🚀',
            descripcion: 'Dinámico, enfocado en resultados y métricas'
        }
    },

    // Planes disponibles
    planes: {
        semanal: { precio: 30, periodo: 'Semanal', dias: 7 },
        mensual: { precio: 100, periodo: 'Mensual', dias: 30 }
    },

    // Palabras prohibidas (seguridad Read-Only)
    palabrasProhibidas: [
        'enviar', 'transferir', 'pagar', 'cobrar', 'mandar dinero',
        'usdt', 'usdc', 'polygon', 'cripto', 'wallet', 'billetera',
        'depositar', 'retirar', 'vender', 'comprar crypto',
        'mover fondos', 'transacción', 'pago', 'facturar'
    ],

    respuestaSeguridad: '🔒 Por seguridad, no tengo permisos financieros. Por favor, realiza esa acción desde el panel manual correspondiente. ¡Estoy aquí para ayudarte con información! 😊'
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASISTENTE_CONFIG;
}