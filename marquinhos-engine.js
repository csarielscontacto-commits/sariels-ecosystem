import { M_CONFIG } from './marquinhos-config.js';

export const Engine = {
    // MOTOR: aqui se conectara Supabase Realtime en el futuro
    mensajes: [
        {
            id: 1,
            usuario: 'Marquinhos',
            texto: 'Hola. ¿En qué puedo ayudarte hoy? 👋',
            leido: false
        }
    ],

    conectar() {
        console.log('Engine: Iniciando conexion...');
        // MOTOR: aqui se conecta el cliente de Supabase en el futuro
    },

    enviarMensaje(texto) {
        if (!texto || !texto.trim()) return;

        this.mensajes.push({
            id: Date.now(),
            usuario: 'Tu',
            texto: texto.trim(),
            leido: true
        });

        console.log('MOTOR: Guardando mensaje en Supabase...');
        // MOTOR: aqui va el INSERT real a la tabla 'mensajes_chat'
    },

    recibirMensajes(callback) {
        if (typeof callback === 'function') {
            callback(this.mensajes);
        }
        // MOTOR: aqui va el listener de Supabase Realtime (canal 'mi-red-chat')
    },

    marcarComoLeido() {
        this.mensajes.forEach((m) => {
            m.leido = true;
        });

        console.log('MOTOR: Mensajes marcados como leidos en Supabase.');
        // MOTOR: aqui va el UPDATE real a la tabla 'mensajes_chat' (leido = true)
    },

    obtenerHorario() {
        const h = M_CONFIG.horario;
        return `Abrimos ${h.dias} de ${h.apertura} a ${h.cierre}.`;
    },

    obtenerEstadoPresencia() {
        // MOTOR: aqui se consulta presencia real via Supabase/Twilio en el futuro
        return { conectado: true };
    },

    obtenerConfigVisual() {
        console.log('MOTOR: Consultando campana activa...');
        // MOTOR: aqui se consulta la tabla 'campanas_marquinhos' en Supabase
        // (fila con activa = true); si no hay ninguna, se regresa M_CONFIG por defecto
        return M_CONFIG;
    }
};