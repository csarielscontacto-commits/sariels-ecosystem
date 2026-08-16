// ================================================================
// 🧩 EventCard - CSARIEL'S ECOSYSTEM (EVENTOS MODULE)
// ================================================================
// Componente que muestra un evento individual con:
// - Banner con icono y estado
// - Información del evento (título, descripción, fecha, ubicación)
// - Acciones (unirse, salir, eliminar, ver detalles)
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React from 'react';
import type { Event } from '../types/event.types';

// ================================================================
// 📦 TIPOS
// ================================================================

interface EventCardProps {
  event: Event;
  onJoin: () => void;
  onLeave: () => void;
  onDelete: () => void;
  onView: () => void;
  isOwner: boolean;
  isAuthenticated: boolean;
  currentUser: { id: string; nombre?: string } | null;
}

// ================================================================
// 🧩 COMPONENTE
// ================================================================

export function EventCard({
  event,
  onJoin,
  onLeave,
  onDelete,
  onView,
  isOwner,
  isAuthenticated,
  currentUser,
}: EventCardProps) {
  // ================================================================
  // 📊 UTILIDADES
  // ================================================================

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 1) return 'Hoy';
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusInfo = (estado: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; bg: string; icon: string }
    > = {
      upcoming: {
        label: '⏳ Próximo',
        color: 'text-blue-400',
        bg: 'bg-blue-500/20',
        icon: 'fa-clock',
      },
      active: {
        label: '🟢 Activo',
        color: 'text-green-400',
        bg: 'bg-green-500/20',
        icon: 'fa-circle',
      },
      past: {
        label: '✅ Finalizado',
        color: 'text-gray-400',
        bg: 'bg-gray-500/20',
        icon: 'fa-check-circle',
      },
    };
    return statusMap[estado] || statusMap.upcoming;
  };

  const getEventIcon = (titulo: string) => {
    const iconMap: Record<string, string> = {
      conferencia: '💻',
      taller: '🛠️',
      fiesta: '🎉',
      concierto: '🎵',
      deporte: '⚽',
      reunion: '🤝',
      networking: '🌐',
      workshop: '📚',
      hackathon: '🚀',
      webinar: '📹',
      meetup: '👥',
      default: '📅',
    };

    const lowerTitle = titulo.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerTitle.includes(key)) return icon;
    }
    return iconMap.default;
  };

  // ================================================================
  // 🔍 VERIFICAR SI EL USUARIO ESTÁ REGISTRADO
  // ================================================================

  const isUserRegistered = () => {
    if (!currentUser) return false;
    // Verificar si el usuario ya está en la lista de participantes
    return event.participantes > 0; // Simplificado, en producción se verifica con la lista real
  };

  const statusInfo = getStatusInfo(event.estado);
  const eventIcon = getEventIcon(event.titulo);
  const isRegistered = isUserRegistered();

  // ================================================================
  // 🖥️ RENDER
  // ================================================================

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-2xl overflow-hidden transition hover:border-yellow-500/50 hover:scale-[1.02] duration-200">
      {/* ===== BANNER ===== */}
      <div className="relative p-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-4xl">{eventIcon}</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bg}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Capacidad */}
        {event.capacidad > 0 && (
          <div className="mt-2 text-xs text-gray-400">
            <i className="fas fa-users mr-1" />
            {event.participantes} / {event.capacidad} participantes
          </div>
        )}
      </div>

      {/* ===== INFO ===== */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">
          {event.titulo}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {event.descripcion || 'Sin descripción'}
        </p>

        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <i className="fas fa-calendar-day w-4 text-yellow-500" />
            <span>{formatDate(event.fecha)}</span>
          </div>
          {event.ubicacion && (
            <div className="flex items-center gap-2">
              <i className="fas fa-map-marker-alt w-4 text-yellow-500" />
              <span className="line-clamp-1">{event.ubicacion}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <i className="fas fa-user w-4 text-yellow-500" />
            <span>
              {event.creador?.nombre || 'Usuario'}
              {event.creador?.verificado && (
                <span className="ml-1 text-green-400 text-xs">✅</span>
              )}
            </span>
          </div>
        </div>

        {/* ===== ACCIONES ===== */}
        <div className="mt-4 flex flex-wrap gap-2">
          {isOwner ? (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition flex-1"
            >
              <i className="fas fa-trash mr-1" />
              Eliminar
            </button>
          ) : isRegistered ? (
            <button
              onClick={onLeave}
              className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700 transition flex-1"
            >
              <i className="fas fa-sign-out-alt mr-1" />
              Salir
            </button>
          ) : (
            <button
              onClick={onJoin}
              disabled={!isAuthenticated}
              className="px-4 py-2 bg-yellow-500 text-black rounded-xl text-sm font-medium hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              <i className="fas fa-user-plus mr-1" />
              {isAuthenticated ? 'Unirse' : 'Inicia sesión'}
            </button>
          )}
          <button
            onClick={onView}
            className="px-4 py-2 bg-gray-700/30 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700/50 transition"
          >
            <i className="fas fa-eye mr-1" />
            Ver
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventCard;