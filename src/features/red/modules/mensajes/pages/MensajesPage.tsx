// ================================================================
// 💬 MensajesPage - CSARIEL'S ECOSYSTEM (MENSAJES MODULE)
// ================================================================
// Página principal de mensajería con:
// - Lista de chats
// - Ventana de chat
// - Envío de mensajes en tiempo real
// - Indicador de tipeo
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMessages } from '../hooks/useMessages';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import { useNotifications } from '../../shared/hooks/useNotifications';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';
import { MessageBubble } from '../components/MessageBubble';
import { Spinner } from '../../shared/components/Spinner';
import { EmptyState } from '../../shared/components/EmptyState';

export function MensajesPage() {
  // ================================================================
  // 📦 ESTADO Y HOOKS
  // ================================================================

  const {
    chats,
    currentChat,
    messages,
    contacts,
    isLoading,
    isSending,
    error,
    hasMore,
    typingUsers,
    selectChat,
    sendNewMessage,
    sendTyping,
    createNewChat,
    loadContacts,
    refresh,
    isAuthenticated,
    user,
  } = useMessages({ autoLoad: true });

  const { showNotification } = useNotifications();
  const { setContext } = useMarquinhos();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ================================================================
  // 🧠 CONTEXTO DE MARQUINHOS
  // ================================================================

  useEffect(() => {
    setContext('mensajes');
  }, [setContext]);

  // ================================================================
  // 📜 SCROLL AL ÚLTIMO MENSAJE
  // ================================================================

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ================================================================
  // 📤 CREAR NUEVO CHAT
  // ================================================================

  const handleCreateChat = useCallback(
    async (contactId: string) => {
      try {
        const chat = await createNewChat([contactId]);
        if (chat) {
          selectChat(chat.id);
          setIsCreatingChat(false);
          setSelectedContact(null);
          showNotification('💬 Chat creado exitosamente', 'success');
        }
      } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Error al crear chat', 'error');
      }
    },
    [createNewChat, selectChat, showNotification]
  );

  // ================================================================
  // 📤 ENVIAR MENSAJE
  // ================================================================

  const handleSendMessage = useCallback(
    async (contenido: string) => {
      if (!contenido.trim()) return;

      try {
        await sendNewMessage(contenido);
        // Detener tipeo después de enviar
        await sendTyping(false);
      } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Error al enviar mensaje', 'error');
      }
    },
    [sendNewMessage, sendTyping, showNotification]
  );

  // ================================================================
  // ⌨️ MANEJAR TIPEO
  // ================================================================

  const handleTyping = useCallback(
    async (isTyping: boolean) => {
      await sendTyping(isTyping);
    },
    [sendTyping]
  );

  // ================================================================
  // 👁️ VER PERFIL DE USUARIO
  // ================================================================

  const handleViewProfile = useCallback(
    (userId: string) => {
      // Navegar al perfil del usuario
      window.location.href = `/features/perfil/index.html?user=${userId}`;
    },
    []
  );

  // ================================================================
  // 🔍 OBTENER NOMBRE DEL CHAT
  // ================================================================

  const getChatName = useCallback(() => {
    if (!currentChat) return '';

    if (currentChat.nombre) return currentChat.nombre;

    // Si es individual, mostrar el nombre del otro participante
    if (currentChat.tipo === 'individual') {
      const other = currentChat.participantes?.find((p) => p.id !== user?.id);
      return other?.nombre || 'Usuario';
    }

    return 'Chat grupal';
  }, [currentChat, user?.id]);

  const getChatAvatar = useCallback(() => {
    if (!currentChat) return null;

    if (currentChat.foto) return currentChat.foto;

    if (currentChat.tipo === 'individual') {
      const other = currentChat.participantes?.find((p) => p.id !== user?.id);
      return other?.foto_perfil_url || null;
    }

    return null;
  }, [currentChat, user?.id]);

  // ================================================================
  // 🖥️ RENDER
  // ================================================================

  // Estado de carga inicial
  if (isLoading && chats.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-yellow-500" />
        <span className="ml-3 text-gray-400">Cargando mensajes...</span>
      </div>
    );
  }

  // Estado de error
  if (error && chats.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          icon="⚠️"
          title="Error al cargar mensajes"
          description={error}
          actionText="Reintentar"
          onAction={refresh}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-orbitron text-2xl font-bold text-yellow-500">
          💬 Mensajes
        </h1>
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={() => setIsCreatingChat(true)}
              className="px-4 py-2 bg-yellow-500 text-black rounded-2xl font-bold hover:bg-yellow-400 transition"
            >
              <i className="fas fa-plus mr-2" />
              Nuevo Chat
            </button>
          )}
          <button
            onClick={refresh}
            className="px-3 py-2 border border-gray-700 rounded-2xl text-gray-400 hover:text-white hover:border-gray-500 transition"
            disabled={isLoading}
          >
            <i className={`fas fa-sync ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ===== CHAT PRINCIPAL ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px] bg-gray-900/30 border border-gray-700 rounded-2xl overflow-hidden">
        {/* ===== LISTA DE CHATS ===== */}
        <div className="md:col-span-1 border-r border-gray-700">
          <ChatList
            chats={chats}
            currentChatId={currentChat?.id || null}
            onSelectChat={selectChat}
            onRefresh={refresh}
            isLoading={isLoading}
            userId={user?.id || ''}
          />
        </div>

        {/* ===== VENTANA DE CHAT ===== */}
        <div className="md:col-span-2">
          {currentChat ? (
            <ChatWindow
              chatName={getChatName()}
              chatAvatar={getChatAvatar()}
              messages={messages}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              onViewProfile={() => handleViewProfile(currentChat.participantes?.[0]?.id || '')}
              isSending={isSending}
              typingUsers={typingUsers}
              currentUserId={user?.id || ''}
              messagesEndRef={messagesEndRef}
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[500px] p-8">
              <div className="text-center text-gray-400">
                <i className="fas fa-comment-dots text-6xl mb-4 opacity-30" />
                <h3 className="text-xl font-medium text-white mb-2">Sin chat seleccionado</h3>
                <p className="text-sm">Selecciona un chat de la lista o crea uno nuevo</p>
                {chats.length === 0 && isAuthenticated && (
                  <button
                    onClick={() => setIsCreatingChat(true)}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-2xl font-bold hover:bg-yellow-400 transition"
                  >
                    <i className="fas fa-plus mr-2" />
                    Iniciar conversación
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL CREAR CHAT ===== */}
      {isCreatingChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-yellow-500">
                <i className="fas fa-user-plus mr-2" />
                Nuevo Chat
              </h2>
              <button
                onClick={() => setIsCreatingChat(false)}
                className="text-gray-400 hover:text-white transition p-1"
              >
                <i className="fas fa-times text-xl" />
              </button>
            </div>

            <div className="p-4">
              {contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <i className="fas fa-users text-4xl mb-3 opacity-30" />
                  <p>No tienes contactos disponibles</p>
                  <a
                    href="/features/red/descubrir/index.html"
                    className="mt-2 inline-block text-yellow-500 hover:underline"
                  >
                    Descubrir personas
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                        selectedContact === contact.id
                          ? 'bg-yellow-500/20 border border-yellow-500/50'
                          : 'hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedContact(contact.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                        {contact.foto_perfil_url ? (
                          <img
                            src={contact.foto_perfil_url}
                            alt={contact.nombre}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          contact.nombre.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-white">
                          {contact.nombre}
                          {contact.verificado && (
                            <span className="ml-1 text-green-400 text-xs">✅</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {contact.online ? '🟢 En línea' : '⚪ Desconectado'}
                        </div>
                      </div>
                      {selectedContact === contact.id && (
                        <i className="fas fa-check-circle text-yellow-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 border-t border-gray-700">
              <button
                onClick={() => setIsCreatingChat(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (selectedContact) {
                    handleCreateChat(selectedContact);
                  }
                }}
                disabled={!selectedContact}
                className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-comment mr-2" />
                Iniciar Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MensajesPage;