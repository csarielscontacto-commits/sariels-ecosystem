// ================================================================
// 🪝 useEvents - CSARIEL'S ECOSYSTEM (EVENTOS MODULE)
// ================================================================
// Hook para gestionar eventos comunitarios.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventParticipants,
} from '../services/eventService';
import { useAuth } from '../../shared/hooks/useAuth';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import type { Event, CreateEventData, UpdateEventData } from '../types/event.types';

// ================================================================
// 📦 TIPOS
// ================================================================

type EventsState = {
  events: Event[];
  currentEvent: Event | null;
  participants: Array<{
    usuario_id: string;
    nombre: string;
    foto_perfil_url: string | null;
    verificado: boolean;
    joined_at: string;
  }>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  page: number;
};

// ================================================================
// 🪝 HOOK PRINCIPAL
// ================================================================

export function useEvents(options: { autoLoad?: boolean; limit?: number } = {}) {
  const { autoLoad = true, limit = 10 } = options;

  // ================================================================
  // 📦 ESTADO
  // ================================================================

  const [state, setState] = useState<EventsState>({
    events: [],
    currentEvent: null,
    participants: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    hasMore: true,
    total: 0,
    page: 0,
  });

  const { user, isAuthenticated } = useAuth();
  const { setContext } = useMarquinhos();
  const loadingRef = useRef(false);
  const isMounted = useRef(true);

  // ================================================================
  // 🧠 CONTEXTO DE MARQUINHOS
  // ================================================================

  useEffect(() => {
    setContext('eventos');
  }, [setContext]);

  // ================================================================
  // 📥 CARGAR EVENTOS
  // ================================================================

  const loadEvents = useCallback(
    async (refresh = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const currentPage = refresh ? 0 : state.page;
        const offset = currentPage * limit;

        const events = await getEvents({
          limit,
          offset,
          userId: isAuthenticated ? user?.id : undefined,
        });

        const newEvents = refresh ? events : [...state.events, ...events];
        const hasMore = events.length === limit;

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            events: newEvents,
            isLoading: false,
            page: refresh ? 1 : prev.page + 1,
            hasMore,
            total: newEvents.length + (hasMore ? limit : 0),
            error: null,
          }));
        }
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al cargar eventos',
          }));
        }
      } finally {
        loadingRef.current = false;
      }
    },
    [limit, state.page, state.events, isAuthenticated, user?.id]
  );

  // ================================================================
  // 🔄 REFRESCAR
  // ================================================================

  const refreshEvents = useCallback(async () => {
    await loadEvents(true);
  }, [loadEvents]);

  // ================================================================
  // 📥 CARGAR MÁS (PAGINACIÓN)
  // ================================================================

  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore) return;
    await loadEvents(false);
  }, [state.isLoading, state.hasMore, loadEvents]);

  // ================================================================
  // 📥 CARGAR EVENTO POR ID
  // ================================================================

  const loadEventById = useCallback(async (eventId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const event = await getEventById(eventId);

      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          currentEvent: event,
          isLoading: false,
        }));
      }

      if (event) {
        await loadParticipants(eventId);
      }

      return event;
    } catch (error) {
      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error al cargar evento',
        }));
      }
      return null;
    }
  }, []);

  // ================================================================
  // 👥 CARGAR PARTICIPANTES
  // ================================================================

  const loadParticipants = useCallback(async (eventId: string) => {
    try {
      const participants = await getEventParticipants(eventId);

      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          participants,
        }));
      }
    } catch (error) {
      console.error('❌ Error cargando participantes:', error);
    }
  }, []);

  // ================================================================
  // 📤 CREAR EVENTO
  // ================================================================

  const createNewEvent = useCallback(
    async (data: CreateEventData) => {
      if (!isAuthenticated || !user) {
        throw new Error('Debes iniciar sesión para crear un evento');
      }

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        const newEvent = await createEvent({
          ...data,
          creador_id: user.id,
        });

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            events: [newEvent, ...prev.events],
            currentEvent: newEvent,
            isSubmitting: false,
          }));
        }

        return newEvent;
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            error: error instanceof Error ? error.message : 'Error al crear evento',
          }));
        }
        throw error;
      }
    },
    [isAuthenticated, user]
  );

  // ================================================================
  // 📝 ACTUALIZAR EVENTO
  // ================================================================

  const updateExistingEvent = useCallback(
    async (eventId: string, data: UpdateEventData) => {
      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        const updated = await updateEvent(eventId, data);

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            events: prev.events.map((e) => (e.id === eventId ? updated : e)),
            currentEvent: updated,
            isSubmitting: false,
          }));
        }

        return updated;
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            error: error instanceof Error ? error.message : 'Error al actualizar evento',
          }));
        }
        throw error;
      }
    },
    []
  );

  // ================================================================
  # 📤 UNIRSE A EVENTO
  // ================================================================

  const joinEventById = useCallback(
    async (eventId: string) => {
      if (!isAuthenticated || !user) {
        throw new Error('Debes iniciar sesión para unirte');
      }

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        await joinEvent(eventId, user.id);

        if (isMounted.current) {
          // Actualizar evento actual
          if (state.currentEvent?.id === eventId) {
            await loadEventById(eventId);
          }

          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            events: prev.events.map((e) =>
              e.id === eventId
                ? { ...e, participantes: e.participantes + 1 }
                : e
            ),
          }));
        }
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            error: error instanceof Error ? error.message : 'Error al unirte al evento',
          }));
        }
        throw error;
      }
    },
    [isAuthenticated, user, state.currentEvent?.id, loadEventById]
  );

  // ================================================================
  # 🚪 SALIR DE EVENTO
  // ================================================================

  const leaveEventById = useCallback(
    async (eventId: string) => {
      if (!isAuthenticated || !user) {
        throw new Error('Debes iniciar sesión');
      }

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        await leaveEvent(eventId, user.id);

        if (isMounted.current) {
          if (state.currentEvent?.id === eventId) {
            await loadEventById(eventId);
          }

          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            events: prev.events.map((e) =>
              e.id === eventId
                ? { ...e, participantes: Math.max(0, e.participantes - 1) }
                : e
            ),
          }));
        }
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            error: error instanceof Error ? error.message : 'Error al salir del evento',
          }));
        }
        throw error;
      }
    },
    [isAuthenticated, user, state.currentEvent?.id, loadEventById]
  );

  // ================================================================
  # 🗑️ ELIMINAR EVENTO
  // ================================================================

  const deleteEventById = useCallback(
    async (eventId: string) => {
      if (!isAuthenticated || !user) {
        throw new Error('Debes iniciar sesión');
      }

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        await deleteEvent(eventId, user.id);

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            events: prev.events.filter((e) => e.id !== eventId),
            currentEvent: prev.currentEvent?.id === eventId ? null : prev.currentEvent,
            isSubmitting: false,
          }));
        }
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            error: error instanceof Error ? error.message : 'Error al eliminar evento',
          }));
        }
        throw error;
      }
    },
    [isAuthenticated, user]
  );

  // ================================================================
  // 🚀 CARGA INICIAL
  // ================================================================

  useEffect(() => {
    if (autoLoad) {
      loadEvents(true);
    }

    return () => {
      isMounted.current = false;
    };
  }, [autoLoad, loadEvents]);

  // ================================================================
  // 📤 EXPORTAR
  // ================================================================

  return {
    // Estado
    events: state.events,
    currentEvent: state.currentEvent,
    participants: state.participants,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    error: state.error,
    hasMore: state.hasMore,
    total: state.total,

    // Acciones
    loadEvents,
    loadMore,
    refreshEvents,
    loadEventById,
    loadParticipants,
    createNewEvent,
    updateExistingEvent,
    joinEventById,
    leaveEventById,
    deleteEventById,

    // Utilidades
    isAuthenticated,
    user,
  };
}

export default useEvents;