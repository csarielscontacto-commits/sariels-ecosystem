// ================================================================
// 📅 EventosPage - CSARIEL'S ECOSYSTEM (EVENTOS MODULE)
// ================================================================
// Página principal de eventos con:
// - Lista de eventos (próximos, activos, pasados)
// - Crear evento
// - Unirse a evento
// - Ver detalles del evento
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import { useNotifications } from '../../shared/hooks/useNotifications';
import { EventCard } from '../components/EventCard';
import { CreateEventModal } from '../components/CreateEventModal';
import { Spinner } from '../../shared/components/Spinner';
import { EmptyState } from '../../shared/components/EmptyState';

type EventFilter = 'upcoming' | 'active' | 'past' | 'all';

export function EventosPage() {
  // ================================================================
  // 📦 ESTADO Y HOOKS
  // ================================================================

  const {
    events,
    isLoading,
    isSubmitting,
    error,
    hasMore,
    loadMore,
    refreshEvents,
    createNewEvent,
    joinEventById,
    leaveEventById,
    deleteEventById,
    loadEventById,
    isAuthenticated,
    user,
  } = useEvents({ autoLoad: true });

  const { showNotification } = useNotifications();
  const { setContext } = useMarquinhos();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<EventFilter>('upcoming');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // ================================================================
  // 🧠 CONTEXTO DE MARQUINHOS
  // ================================================================

  useEffect(() => {
    setContext('eventos');
  }, [setContext]);

  // ================================================================
  // 📊 FILTRAR EVENTOS
  // ================================================================

  const filteredEvents = React.useMemo(() => {
    if (filter === 'all') return events;

    const now = new Date();
    return events.filter((event) => {
      const eventDate = new Date(event.fecha);
      if (filter === 'upcoming') return eventDate >= now && event.estado !== 'past';
      if (filter === 'past') return eventDate < now || event.estado === 'past';
      if (filter === 'active') return event.estado === 'active';
      return true;
    });
  }, [events, filter]);

  // ================================================================
  // 📤 CREAR EVENTO
  // ================================================================

  const handleCreateEvent = useCallback(
    async (data: { titulo: string; descripcion: string; fecha: string; ubicacion: string; capacidad: number }) => {
      try {
        await createNewEvent({
          ...data,
          creador_id: user?.id || '',
        });
        setShowCreateModal(false);
        showNotification('✅ Evento creado exitosamente', 'success');
      } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Error al crear evento', 'error');
      }
    },
    [createNewEvent, user?.id, showNotification]
  );

  // ================================================================
  # 📤 UNIRSE A EVENTO
  // ================================================================

  const handleJoinEvent = useCallback(
    async (eventId: string) => {
      try {
        await joinEventById(eventId);
        showNotification('✅ Te uniste al evento', 'success');
      } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Error al unirte', 'error');
      }
    },
    [joinEventById, showNotification]
  );

  // ================================================================
  # 🚪 SALIR DE EVENTO
  // ================================================================

  const handleLeaveEvent = useCallback(
    async (eventId: string, eventName: string) => {
      if (!confirm(`¿Salir del evento "${eventName}"?`)) return;

      try {
        await leaveEventById(eventId);
        showNotification('🚪 Saliste del evento', 'info');
      } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Error al salir', 'error');
      }
    },
    [leaveEventById, showNotification]
  );

  // ================================================================
  # 🗑️ ELIMINAR EVENTO
  // ================================================================

  const handleDeleteEvent = useCallback(
    async (eventId: string, eventName: string) => {
      if (!confirm(`¿Eliminar el evento "${eventName}"? Esta acción no se puede deshacer.`)) return;

      try {
        await deleteEventById(eventId);
        showNotification('🗑️ Evento eliminado', 'info');
      } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Error al eliminar', 'error');
      }
    },
    [deleteEventById, showNotification]
  );

  // ================================================================
  // 👁️ VER DETALLE
  // ================================================================

  const handleViewEvent = useCallback(
    async (eventId: string) => {
      setSelectedEventId(eventId);
      await loadEventById(eventId);
    },
    [loadEventById]
  );

  // ================================================================
  // 🖥️ RENDER
  // ================================================================

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-yellow-500" />
        <span className="ml-3 text-gray-400">Cargando eventos...</span>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          icon="⚠️"
          title="Error al cargar eventos"
          description={error}
          actionText="Reintentar"
          onAction={refreshEvents}
        />
      </div>
    );
  }

  const filterLabels: Record<EventFilter, string> = {
    upcoming: '⏳ Próximos',
    active: '🟢 Activos',
    past: '✅ Pasados',
    all: '🌟 Todos',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-orbitron text-2xl font-bold text-yellow-500">
          📅 Eventos
        </h1>
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-yellow-500 text-black rounded-2xl font-bold hover:bg-yellow-400 transition"
            >
              <i className="fas fa-plus mr-2" />
              Crear Evento
            </button>
          )}
          <button
            onClick={refreshEvents}
            className="px-3 py-2 border border-gray-700 rounded-2xl text-gray-400 hover:text-white hover:border-gray-500 transition"
            disabled={isLoading}
          >
            <i className={`fas fa-sync ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ===== FILTROS ===== */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(filterLabels) as EventFilter[]).map((key) => (
          <button
            key={key}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${
              filter === key
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => setFilter(key)}
          >
            {filterLabels[key]}
          </button>
        ))}
      </div>

      {/* ===== LISTA DE EVENTOS ===== */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon="📭"
          title="Sin eventos"
          description={filter === 'upcoming' ? 'No hay eventos próximos.' : 'No hay eventos en esta categoría.'}
          actionText={isAuthenticated ? 'Crear evento' : 'Inicia sesión para crear eventos'}
          onAction={() => {
            if (isAuthenticated) {
              setShowCreateModal(true);
            } else {
              showNotification('Inicia sesión para crear eventos', 'info');
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onJoin={() => handleJoinEvent(event.id)}
              onLeave={() => handleLeaveEvent(event.id, event.titulo)}
              onDelete={() => handleDeleteEvent(event.id, event.titulo)}
              onView={() => handleViewEvent(event.id)}
              isOwner={event.creador_id === user?.id}
              isAuthenticated={isAuthenticated}
              currentUser={user}
            />
          ))}
        </div>
      )}

      {/* ===== LOAD MORE ===== */}
      {hasMore && filteredEvents.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-700 rounded-2xl text-gray-400 hover:text-white hover:border-gray-500 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Cargando...
              </>
            ) : (
              'Cargar más eventos'
            )}
          </button>
        </div>
      )}

      {/* ===== MODAL CREAR EVENTO ===== */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateEvent}
          isLoading={isSubmitting}
          userId={user?.id || ''}
        />
      )}
    </div>
  );
}

export default EventosPage;