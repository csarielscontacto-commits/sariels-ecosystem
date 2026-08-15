// ================================================================
// 📹 streamService - CSARIEL'S ECOSYSTEM (DIRECTOS MODULE)
// ================================================================
// Servicio para gestionar transmisiones en vivo con LiveKit.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { supabase } from '../../shared/services/supabaseClient';
import { getCurrentUser } from '../../shared/services/authService';

// ================================================================
// 📦 TIPOS
// ================================================================

/**
 * @typedef {Object} Stream
 * @property {string} id - ID de la transmisión
 * @property {string} usuario_id - ID del creador
 * @property {string} titulo - Título de la transmisión
 * @property {string} descripcion - Descripción
 * @property {string} room_name - Nombre de la sala LiveKit
 * @property {string} status - 'live' | 'ended' | 'scheduled'
 * @property {number} viewers - Cantidad de espectadores
 * @property {string} created_at - Fecha de creación
 * @property {string} started_at - Fecha de inicio
 * @property {string} ended_at - Fecha de fin
 * @property {Object} creador - Datos del creador (join)
 * @property {string} creador.nombre - Nombre del creador
 * @property {string} creador.foto_perfil_url - Avatar del creador
 */

// ================================================================
// 📥 OBTENER TRANSMISIONES ACTIVAS
// ================================================================

/**
 * Obtiene todas las transmisiones en vivo
 * @returns {Promise<Stream[]>}
 */
export async function getActiveStreams() {
    try {
        const { data: streams, error } = await supabase
            .from('transmisiones')
            .select(`
                *,
                creador:perfiles!usuario_id (
                    nombre,
                    foto_perfil_url,
                    verificado
                )
            `)
            .eq('status', 'live')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (streams || []).map((stream) => ({
            id: stream.id,
            usuario_id: stream.usuario_id,
            titulo: stream.titulo,
            descripcion: stream.descripcion || '',
            room_name: stream.room_name,
            status: stream.status,
            viewers: stream.viewers || 0,
            created_at: stream.created_at,
            started_at: stream.started_at,
            ended_at: stream.ended_at,
            creador: stream.creador || {
                nombre: 'Usuario',
                foto_perfil_url: null,
                verificado: false,
            },
        }));

    } catch (error) {
        console.error('❌ Error en getActiveStreams:', error);
        throw error;
    }
}

// ================================================================
// 📥 OBTENER TRANSMISIÓN POR ID
// ================================================================

/**
 * Obtiene una transmisión por su ID
 * @param {string} streamId
 * @returns {Promise<Stream>}
 */
export async function getStreamById(streamId) {
    try {
        const { data: stream, error } = await supabase
            .from('transmisiones')
            .select(`
                *,
                creador:perfiles!usuario_id (
                    nombre,
                    foto_perfil_url,
                    verificado
                )
            `)
            .eq('id', streamId)
            .single();

        if (error) throw error;

        return {
            id: stream.id,
            usuario_id: stream.usuario_id,
            titulo: stream.titulo,
            descripcion: stream.descripcion || '',
            room_name: stream.room_name,
            status: stream.status,
            viewers: stream.viewers || 0,
            created_at: stream.created_at,
            started_at: stream.started_at,
            ended_at: stream.ended_at,
            creador: stream.creador || {
                nombre: 'Usuario',
                foto_perfil_url: null,
                verificado: false,
            },
        };

    } catch (error) {
        console.error('❌ Error en getStreamById:', error);
        throw error;
    }
}

// ================================================================
// 📤 INICIAR TRANSMISIÓN
// ================================================================

/**
 * Inicia una nueva transmisión en vivo
 * @param {Object} data
 * @param {string} data.titulo - Título de la transmisión
 * @param {string} [data.descripcion] - Descripción
 * @returns {Promise<{ stream: Stream, token: string }>}
 */
export async function startStream(data) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const { titulo, descripcion = '' } = data;

        if (!titulo || titulo.trim() === '') {
            throw new Error('El título es requerido');
        }

        // Generar nombre de sala único
        const roomName = `stream_${user.id}_${Date.now()}`;

        // Crear la transmisión en Supabase
        const { data: stream, error } = await supabase
            .from('transmisiones')
            .insert({
                usuario_id: user.id,
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
                room_name: roomName,
                status: 'live',
                started_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        // Generar token para LiveKit
        const token = await generateLiveKitToken(user.id, roomName);

        // Actualizar el contador de streams activos del usuario
        await updateUserStreamStatus(user.id, true);

        console.log(`📹 Transmisión iniciada: ${titulo} (${roomName})`);

        return {
            stream: {
                id: stream.id,
                usuario_id: stream.usuario_id,
                titulo: stream.titulo,
                descripcion: stream.descripcion || '',
                room_name: stream.room_name,
                status: stream.status,
                viewers: 0,
                created_at: stream.created_at,
                started_at: stream.started_at,
                ended_at: stream.ended_at,
            },
            token,
        };

    } catch (error) {
        console.error('❌ Error en startStream:', error);
        throw error;
    }
}

// ================================================================
// ⏹️ FINALIZAR TRANSMISIÓN
// ================================================================

/**
 * Finaliza una transmisión en vivo
 * @param {string} streamId
 * @returns {Promise<void>}
 */
export async function endStream(streamId) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        // Verificar que el usuario es el creador
        const { data: stream, error: findError } = await supabase
            .from('transmisiones')
            .select('usuario_id')
            .eq('id', streamId)
            .single();

        if (findError) throw findError;

        if (stream.usuario_id !== user.id) {
            throw new Error('No tienes permiso para finalizar esta transmisión');
        }

        // Actualizar estado
        const { error: updateError } = await supabase
            .from('transmisiones')
            .update({
                status: 'ended',
                ended_at: new Date().toISOString(),
            })
            .eq('id', streamId);

        if (updateError) throw updateError;

        // Actualizar el contador de streams activos del usuario
        await updateUserStreamStatus(user.id, false);

        console.log(`⏹️ Transmisión ${streamId} finalizada`);

    } catch (error) {
        console.error('❌ Error en endStream:', error);
        throw error;
    }
}

// ================================================================
// 👥 UNIRSE A TRANSMISIÓN
// ================================================================

/**
 * Obtiene el token para unirse a una transmisión
 * @param {string} streamId
 * @returns {Promise<{ token: string, stream: Stream }>}
 */
export async function joinStream(streamId) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        // Obtener la transmisión
        const stream = await getStreamById(streamId);

        if (stream.status !== 'live') {
            throw new Error('Esta transmisión no está activa');
        }

        // Generar token para LiveKit
        const token = await generateLiveKitToken(user.id, stream.room_name);

        // Incrementar contador de espectadores
        await supabase
            .from('transmisiones')
            .update({ viewers: (stream.viewers || 0) + 1 })
            .eq('id', streamId);

        return { token, stream };

    } catch (error) {
        console.error('❌ Error en joinStream:', error);
        throw error;
    }
}

// ================================================================
// 🔑 GENERAR TOKEN DE LIVEKIT
// ================================================================

/**
 * Genera un token para LiveKit
 * @param {string} userId - ID del usuario
 * @param {string} roomName - Nombre de la sala
 * @returns {Promise<string>}
 */
async function generateLiveKitToken(userId, roomName) {
    try {
        // Obtener el perfil del usuario
        const { data: profile, error } = await supabase
            .from('perfiles')
            .select('nombre')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.warn('⚠️ Error obteniendo perfil para token:', error);
        }

        const userName = profile?.nombre || 'Usuario';

        // Llamar al endpoint de Vercel para generar el token
        const response = await fetch('/api/livekit-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                roomName,
                userName,
            }),
        });

        if (!response.ok) {
            throw new Error('Error generando token de LiveKit');
        }

        const { token } = await response.json();
        return token;

    } catch (error) {
        console.error('❌ Error generando token LiveKit:', error);
        throw error;
    }
}

// ================================================================
// 📊 ACTUALIZAR ESTADO DE STREAM DEL USUARIO
// ================================================================

/**
 * Actualiza el estado de transmisión de un usuario
 * @param {string} userId
 * @param {boolean} isLive
 * @returns {Promise<void>}
 */
async function updateUserStreamStatus(userId, isLive) {
    try {
        await supabase
            .from('perfiles')
            .update({
                is_live: isLive,
                last_stream_at: isLive ? new Date().toISOString() : null,
            })
            .eq('user_id', userId);

    } catch (error) {
        console.warn('⚠️ Error actualizando estado de stream:', error);
    }
}

// ================================================================
// 📤 OBTENER HISTORIAL DE TRANSMISIONES
// ================================================================

/**
 * Obtiene el historial de transmisiones de un usuario
 * @param {string} userId
 * @param {Object} options
 * @param {number} [options.limit=10]
 * @returns {Promise<Stream[]>}
 */
export async function getUserStreamHistory(userId, options = {}) {
    const { limit = 10 } = options;

    try {
        const { data: streams, error } = await supabase
            .from('transmisiones')
            .select(`
                *,
                creador:perfiles!usuario_id (
                    nombre,
                    foto_perfil_url
                )
            `)
            .eq('usuario_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (streams || []).map((stream) => ({
            id: stream.id,
            usuario_id: stream.usuario_id,
            titulo: stream.titulo,
            descripcion: stream.descripcion || '',
            room_name: stream.room_name,
            status: stream.status,
            viewers: stream.viewers || 0,
            created_at: stream.created_at,
            started_at: stream.started_at,
            ended_at: stream.ended_at,
            creador: stream.creador || {
                nombre: 'Usuario',
                foto_perfil_url: null,
            },
        }));

    } catch (error) {
        console.error('❌ Error en getUserStreamHistory:', error);
        throw error;
    }
}

// ================================================================
// 🚀 EXPORTAR
// ================================================================

export default {
    getActiveStreams,
    getStreamById,
    startStream,
    endStream,
    joinStream,
    getUserStreamHistory,
};

console.log('📹 streamService cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');