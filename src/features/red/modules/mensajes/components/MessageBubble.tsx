// ================================================================
// 🧩 MessageBubble - CSARIEL'S ECOSYSTEM (MENSAJES MODULE)
// ================================================================
// Burbuja de mensaje individual con:
// - Avatar del autor (si es necesario)
// - Contenido del mensaje
// - Hora de envío
// - Estado de leído (para mensajes propios)
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React from 'react';
import type { Message } from '../types/message.types';

// ================================================================
// 📦 TIPOS
// ================================================================

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  currentUserId: string;
}

// ================================================================
// 🧩 COMPONENTE
// ================================================================

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  currentUserId,
}: MessageBubbleProps) {
  // ================================================================
  // 📊 UTILIDADES
  // ================================================================

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // ================================================================
  // 🖥️ RENDER
  // ================================================================

  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar del autor (solo si es necesario) */}
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden">
          {message.autor?.foto_perfil_url ? (
            <img
              src={message.autor.foto_perfil_url}
              alt={message.autor.nombre || 'Usuario'}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(message.autor?.nombre || 'U')
          )}
        </div>
      )}

      {/* Espacio para alinear cuando no hay avatar */}
      {!isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}

      {/* Burbuja del mensaje */}
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-yellow-500 text-black rounded-br-none'
            : 'bg-gray-800 text-white rounded-bl-none'
        }`}
      >
        {/* Nombre del autor (solo en mensajes grupales) */}
        {!isOwn && showAvatar && message.autor?.nombre && (
          <div className="text-xs font-medium text-yellow-400 mb-0.5">
            {message.autor.nombre}
            {message.autor.verificado && (
              <span className="ml-1 text-green-400 text-[10px]">✅</span>
            )}
          </div>
        )}

        {/* Contenido del mensaje */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.contenido}
        </div>

        {/* Hora y estado */}
        <div
          className={`text-[10px] mt-0.5 flex items-center gap-1 ${
            isOwn ? 'text-black/60' : 'text-gray-400'
          }`}
        >
          <span>{formatTime(message.created_at)}</span>
          {isOwn && (
            <span>
              {message.leido ? (
                <i className="fas fa-check-double text-blue-400" />
              ) : (
                <i className="fas fa-check" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;