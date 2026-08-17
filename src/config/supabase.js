// ================================================================
// 🗄️ CONFIGURACIÓN DE SUPABASE - CSARIEL'S ECOSYSTEM
// Ruta: src/config/supabase.js
// Versión: 3.0.1
// ================================================================

const FALLBACK_URL = 'https://nvyyxgkladjauolvpzfp.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eXl4Z2tsYWRqYXVvbHZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NDA3NjMsImV4cCI6MjA5ODIxNjc2M30.3O6tea8l1UbGIlwR_2iyIS1M-dgoQC5G4G1S9YSiXL0';

// 📦 TABLAS DEL ECOSISTEMA
export const TABLAS = {
    PERFILES: 'perfiles',
    POSTS: 'posts_muro',
    COMENTARIOS_MURO: 'comentarios_muro',
    LIKES_MURO: 'likes_muro',
    MENSAJES: 'mensajes',
    MENSAJES_CHAT: 'mensajes_chat',
    CONVERSACIONES: 'conversaciones',
    SERVICIOS_COMUNITARIOS: 'servicios_comunitarios',
    ORDENES_ESIM: 'ordenes_esim',
    PLANES_ESIM: 'planes_esim',
    SUSCRIPCIONES_ESIM: 'suscripciones_esim',
    PEDIDOS_DELIVERY: 'pedidos_delivery',
    PUBLICIDAD_MARQUINHOS: 'publicidad_marquinhos',
    RELACIONES_CONTACTOS: 'relaciones_contactos',
    PRESENCIAS: 'presencias',
    TRANSMISIONES: 'transmisiones',
    USER_BALANCES: 'user_balances',
    TOKEN_TRANSACTIONS: 'token_transactions'
};

// 🌐 Config exportada — solo datos, sin lógica ni ejecución inmediata
export const SUPABASE_CONFIG = {
    url: FALLBACK_URL,
    anonKey: FALLBACK_ANON_KEY,
    tablas: TABLAS
};

console.log('🗄️ Configuración de Supabase cargada');
console.log(`📋 ${Object.keys(TABLAS).length} tablas registradas`);