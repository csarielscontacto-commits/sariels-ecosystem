// ================================================================
// 🧩 ChatList - CSARIEL'S ECOSYSTEM (MENSAJES MODULE)
// ================================================================
// Lista de chats del usuario con:
// - Avatar y nombre del contacto
// - Último mensaje
// - Indicador de no leídos
// - Estado en línea
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React from 'react';
import type { Chat } from '../types/message.types';

// ================================================================
// 📦 TIPOS
// ================================================================

interface ChatListProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  userId: string;
}

// ================================================================
// 🧩 COMPONENTE
// ================================================================

export function ChatList({
  chats,
  currentChatId,
  onSelectChat,
  onRefresh,
  isLoading,
  userId,
}: ChatListProps) {
  // ================================================================
  // 📊 UTILIDADES
  // ================================================================

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Ahora';
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getChatName = (chat: Chat) => {
    if (chat.nombre) return chat.nombre;

    if (chat.tipo === 'individual') {
      const other = chat.participantes?.find((p) => p.id !== userId);
      return other?.nombre || 'Usuario';
    }

    return 'Chat grupal';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.foto) return chat.foto;

    if (chat.tipo === 'individual') {
      const other = chat.participantes?.find((p) => p.id !== userId);
      return other?.foto_perfil_url || null;
    }

    return null;
  };

  const getOnlineStatus = (chat: Chat) => {
    if (chat.tipo === 'individual') {
      const other = chat.participantes?.find((p) => p.id !== userId);
      return other?.online || false;
    }
    return false;
  };

  // ================================================================
  // 🖥️ RENDER
  // ================================================================

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <i className="fas fa-inbox text-4xl text-gray-600 mb-4" />
        <p className="text-gray-400 text-sm">No tienes conversaciones</p>
        <p className="text-gray-500 text-xs mt-1">Inicia una nueva conversación</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.map((chat) => {
        const name = getChatName(chat);
        const avatar = getChatAvatar(chat);
        const isOnline = getOnlineStatus(chat);
        const isActive = currentChatId === chat.id;
        const lastMessage = chat.ultimo_mensaje;
        const unreadCount = chat.no_leidos || 0;

        return (
          <button
            key={chat.id}
            className={`w-full flex items-center gap-3 p-4 border-b border-gray-700/50 transition ${
              isActive
                ? 'bg-yellow-500/10 border-l-4 border-l-yellow-500'
                : 'hover:bg-gray-800/50'
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-white overflow-hidden">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
              {chat.tipo === 'individual' && (
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                    isOnline ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white truncate">{name}</span>
                {lastMessage && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatTime(lastMessage.created_at)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-sm text-gray-400 truncate">
                  {lastMessage ? (
                    <>
                      {lastMessage.usuario_id === userId ? 'Tú: ' : ''}
                      {lastMessage.contenido}
                    </>
                  ) : (
                    'Sin mensajes'
                  )}
                </span>
                {unreadCount > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ChatList;