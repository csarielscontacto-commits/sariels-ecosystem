// ================================================================
// 📅 eventService - CSARIEL'S ECOSYSTEM (EVENTOS MODULE)
// ================================================================
// Servicio para gestionar eventos comunitarios.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { supabase } from '@/lib/supabase';
import type { Event, EventParticipant, CreateEventData, UpdateEventData } from '../types/event.types';

// ================================================================
// 📥 OBTENER EVENTOS
// ================================================================

/**
 * Obtiene todos los eventos (filtrados por estado)
 * @param options - Opciones de filtrado y paginación
 * @returns Lista de eventos
 */
export async function getEvents(options: {
  status?: 'upcoming' | 'active' | 'past';
  limit?: number;
  offset?: number;
  userId?: string;
} = {}): Promise<Event[]> {
  const { status, limit = 20, offset = 0, userId } = options;

  try {
    let query = supabase
      .from('eventos')
      .select(`
        *,
        creador:perfiles!creador_id (
          nombre,
          foto_perfil_url,
          verificado
        ),
        participantes_count:eventos_participantes(count)
      `)
      .order('fecha', { ascending: true })
      .range(offset, offset + limit - 1);

    if (status === 'upcoming') {
      query = query.gte('fecha', new Date().toISOString());
    } else if (status === 'past') {
      query = query.lt('fecha', new Date().toISOString());
    } else if (status === 'active') {
      const now = new Date().toISOString();
      query = query.lte('fecha_inicio', now).gte('fecha_fin', now);
    }

    if (userId) {
      query = query.eq('creador_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((event) => ({
      id: event.id,
      titulo: event.titulo,
      descripcion: event.descripcion || '',
      fecha: event.fecha,
      fecha_inicio: event.fecha_inicio,
      fecha_fin: event.fecha_fin,
      ubicacion: event.ubicacion || '',
      estado: event.estado || 'upcoming',
      capacidad: event.capacidad || 0,
      participantes: event.participantes_count || 0,
      es_privado: event.es_privado || false,
      creador_id: event.creador_id,
      creador: event.creador || {
        nombre: 'Usuario',
        foto_perfil_url: null,
        verificado: false,
      },
      created_at: event.created_at,
      updated_at: event.updated_at,
    }));
  } catch (error) {
    console.error('❌ Error en getEvents:', error);
    throw error;
  }
}

// ================================================================
// 📥 OBTENER EVENTO POR ID
// ================================================================

export async function getEventById(eventId: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select(`
        *,
        creador:perfiles!creador_id (
          nombre,
          foto_perfil_url,
          verificado
        ),
        participantes:eventos_participantes(
          usuario_id,
          perfiles!eventos_participantes_usuario_id (
            nombre,
            foto_perfil_url
          )
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      titulo: data.titulo,
      descripcion: data.descripcion || '',
      fecha: data.fecha,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      ubicacion: data.ubicacion || '',
      estado: data.estado || 'upcoming',
      capacidad: data.capacidad || 0,
      participantes: data.participantes?.length || 0,
      es_privado: data.es_privado || false,
      creador_id: data.creador_id,
      creador: data.creador || {
        nombre: 'Usuario',
        foto_perfil_url: null,
        verificado: false,
      },
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('❌ Error en getEventById:', error);
    throw error;
  }
}

// ================================================================
// 📤 CREAR EVENTO
// ================================================================

export async function createEvent(data: CreateEventData): Promise<Event> {
  try {
    const { data: event, error } = await supabase
      .from('eventos')
      .insert({
        titulo: data.titulo,
        descripcion: data.descripcion || '',
        fecha: data.fecha,
        fecha_inicio: data.fecha_inicio || data.fecha,
        fecha_fin: data.fecha_fin || data.fecha,
        ubicacion: data.ubicacion || '',
        capacidad: data.capacidad || 0,
        es_privado: data.es_privado || false,
        creador_id: data.creador_id,
        estado: 'upcoming',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: event.id,
      titulo: event.titulo,
      descripcion: event.descripcion || '',
      fecha: event.fecha,
      fecha_inicio: event.fecha_inicio,
      fecha_fin: event.fecha_fin,
      ubicacion: event.ubicacion || '',
      estado: event.estado || 'upcoming',
      capacidad: event.capacidad || 0,
      participantes: 0,
      es_privado: event.es_privado || false,
      creador_id: event.creador_id,
      creador: {
        nombre: 'Usuario',
        foto_perfil_url: null,
        verificado: false,
      },
      created_at: event.created_at,
      updated_at: event.updated_at,
    };
  } catch (error) {
    console.error('❌ Error en createEvent:', error);
    throw error;
  }
}

// ================================================================
// 📝 ACTUALIZAR EVENTO
// ================================================================

export async function updateEvent(eventId: string, data: UpdateEventData): Promise<Event> {
  try {
    const { data: event, error } = await supabase
      .from('eventos')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: event.id,
      titulo: event.titulo,
      descripcion: event.descripcion || '',
      fecha: event.fecha,
      fecha_inicio: event.fecha_inicio,
      fecha_fin: event.fecha_fin,
      ubicacion: event.ubicacion || '',
      estado: event.estado || 'upcoming',
      capacidad: event.capacidad || 0,
      participantes: event.participantes || 0,
      es_privado: event.es_privado || false,
      creador_id: event.creador_id,
      creador: {
        nombre: 'Usuario',
        foto_perfil_url: null,
        verificado: false,
      },
      created_at: event.created_at,
      updated_at: event.updated_at,
    };
  } catch (error) {
    console.error('❌ Error en updateEvent:', error);
    throw error;
  }
}

// ================================================================
# 📤 UNIRSE A EVENTO
// ================================================================

export async function joinEvent(eventId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('eventos_participantes')
      .insert({
        evento_id: eventId,
        usuario_id: userId,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Incrementar contador de participantes
    await supabase.rpc('incrementar_participantes_evento', { evento_id: eventId });
  } catch (error) {
    console.error('❌ Error en joinEvent:', error);
    throw error;
  }
}

// ================================================================
# 🚪 SALIR DE EVENTO
// ================================================================

export async function leaveEvent(eventId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('eventos_participantes')
      .delete()
      .eq('evento_id', eventId)
      .eq('usuario_id', userId);

    if (error) throw error;

    // Decrementar contador de participantes
    await supabase.rpc('decrementar_participantes_evento', { evento_id: eventId });
  } catch (error) {
    console.error('❌ Error en leaveEvent:', error);
    throw error;
  }
}

// ================================================================
# 🗑️ ELIMINAR EVENTO
// ================================================================

export async function deleteEvent(eventId: string, userId: string): Promise<void> {
  try {
    // Verificar que el usuario es el creador
    const { data: event, error: checkError } = await supabase
      .from('eventos')
      .select('creador_id')
      .eq('id', eventId)
      .single();

    if (checkError) throw checkError;

    if (event.creador_id !== userId) {
      throw new Error('No tienes permiso para eliminar este evento');
    }

    // Eliminar participantes
    await supabase
      .from('eventos_participantes')
      .delete()
      .eq('evento_id', eventId);

    // Eliminar evento
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  } catch (error) {
    console.error('❌ Error en deleteEvent:', error);
    throw error;
  }
}

// ================================================================
// 👥 OBTENER PARTICIPANTES
// ================================================================

export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  try {
    const { data, error } = await supabase
      .from('eventos_participantes')
      .select(`
        usuario_id,
        created_at,
        perfiles!eventos_participantes_usuario_id (
          nombre,
          foto_perfil_url,
          verificado
        )
      `)
      .eq('evento_id', eventId);

    if (error) throw error;

    return (data || []).map((p) => ({
      usuario_id: p.usuario_id,
      nombre: p.perfiles?.nombre || 'Usuario',
      foto_perfil_url: p.perfiles?.foto_perfil_url || null,
      verificado: p.perfiles?.verificado || false,
      joined_at: p.created_at,
    }));
  } catch (error) {
    console.error('❌ Error en getEventParticipants:', error);
    throw error;
  }
}