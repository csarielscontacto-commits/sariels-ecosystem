// ================================================================
// 🪝 useMessages - CSARIEL'S ECOSYSTEM (MENSAJES MODULE)
// ================================================================
// Hook para gestionar mensajería en tiempo real con Supabase Realtime.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getUserChats,
  getChatMessages,
  sendMessage,
  createChat,
  subscribeToChat,
  subscribeToTyping,
  sendTypingStatus,
  markMessagesAsRead,
  getContacts,
} from '../services/messageService';
import { useAuth } from '../../shared/hooks/useAuth';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Chat, Message, Contact } from '../types/message.types';

// ================================================================
// 📦 TIPOS
// ================================================================

type MessagesState = {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  contacts: Contact[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  typingUsers: Record<string, boolean>;
};

// ================================================================
// 🪝 HOOK PRINCIPAL
// ================================================================

export function useMessages(options: { autoLoad?: boolean } = {}) {
  const { autoLoad = true } = options;

  // ================================================================
  // 📦 ESTADO
  // ================================================================

  const [state, setState] = useState<MessagesState>({
    chats: [],
    currentChat: null,
    messages: [],
    contacts: [],
    isLoading: false,
    isSending: false,
    error: null,
    hasMore: true,
    page: 0,
    typingUsers: {},
  });

  const { user, isAuthenticated } = useAuth();
  const { setContext } = useMarquinhos();
  const isMounted = useRef(true);
  const chatSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const typingSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ================================================================
  // 🧠 CONTEXTO DE MARQUINHOS
  // ================================================================

  useEffect(() => {
    setContext('mensajes');
  }, [setContext]);

  // ================================================================
  // 📥 CARGAR CHATS
  // ================================================================

  const loadChats = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const chats = await getUserChats(user.id);

      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          chats,
          isLoading: false,
        }));
      }
    } catch (error) {
      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error al cargar chats',
        }));
      }
    }
  }, [isAuthenticated, user]);

  // ================================================================
  // 📥 CARGAR MENSAJES DE UN CHAT
  // ================================================================

  const loadMessages = useCallback(
    async (chatId: string, refresh = false) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const currentPage = refresh ? 0 : state.page;
        const limit = 50;

        const messages = await getChatMessages(chatId, {
          limit,
          offset: currentPage * limit,
        });

        const newMessages = refresh ? messages : [...messages, ...state.messages];
        const hasMore = messages.length === limit;

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            messages: newMessages,
            isLoading: false,
            page: refresh ? 1 : prev.page + 1,
            hasMore,
          }));
        }

        // Marcar mensajes como leídos
        if (user) {
          await markMessagesAsRead(chatId, user.id);
        }

        return messages;
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al cargar mensajes',
          }));
        }
        return [];
      }
    },
    [state.page, state.messages, user]
  );

  // ================================================================
  // 📤 SELECCIONAR CHAT
  // ================================================================

  const selectChat = useCallback(
    async (chatId: string) => {
      const chat = state.chats.find((c) => c.id === chatId);
      if (!chat) return;

      setState((prev) => ({
        ...prev,
        currentChat: chat,
        messages: [],
        page: 0,
        hasMore: true,
      }));

      // Cargar mensajes
      await loadMessages(chatId, true);

      // Suscribirse al chat
      subscribeToChatRoom(chatId);

      // Marcar como leídos
      if (user) {
        await markMessagesAsRead(chatId, user.id);
        // Actualizar contador de no leídos en la lista de chats
        setState((prev) => ({
          ...prev,
          chats: prev.chats.map((c) =>
            c.id === chatId ? { ...c, no_leidos: 0 } : c
          ),
        }));
      }
    },
    [state.chats, loadMessages, user]
  );

  // ================================================================
  // 📡 SUSCRIBIRSE A CHAT EN TIEMPO REAL
  // ================================================================

  const subscribeToChatRoom = useCallback(
    (chatId: string) => {
      // Limpiar suscripciones anteriores
      if (chatSubscriptionRef.current) {
        chatSubscriptionRef.current.unsubscribe();
        chatSubscriptionRef.current = null;
      }
      if (typingSubscriptionRef.current) {
        typingSubscriptionRef.current.unsubscribe();
        typingSubscriptionRef.current = null;
      }

      if (!user) return;

      // Suscribirse a mensajes
      const chatChannel = subscribeToChat(
        chatId,
        (newMessage) => {
          if (!isMounted.current) return;

          // Agregar mensaje al estado
          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, newMessage],
          }));

          // Actualizar último mensaje en la lista de chats
          setState((prev) => ({
            ...prev,
            chats: prev.chats.map((c) =>
              c.id === chatId
                ? {
                    ...c,
                    ultimo_mensaje: {
                      id: newMessage.id,
                      contenido: newMessage.contenido,
                      created_at: newMessage.created_at,
                      usuario_id: newMessage.usuario_id,
                      autor: newMessage.autor?.nombre || 'Usuario',
                    },
                    updated_at: newMessage.created_at,
                  }
                : c
            ),
          }));

          // Marcar como leído si es el chat actual
          if (state.currentChat?.id === chatId && newMessage.usuario_id !== user.id) {
            markMessagesAsRead(chatId, user.id);
          }
        },
        (userId, isTyping) => {
          if (!isMounted.current) return;
          setState((prev) => ({
            ...prev,
            typingUsers: {
              ...prev.typingUsers,
              [userId]: isTyping,
            },
          }));
        }
      );

      chatSubscriptionRef.current = chatChannel;

      // Suscribirse a tipeo
      const typingChannel = subscribeToTyping(chatId, user.id, (userId, isTyping) => {
        if (!isMounted.current) return;
        setState((prev) => ({
          ...prev,
          typingUsers: {
            ...prev.typingUsers,
            [userId]: isTyping,
          },
        }));
      });

      typingSubscriptionRef.current = typingChannel;
    },
    [user, state.currentChat?.id]
  );

  // ================================================================
  // 📤 ENVIAR MENSAJE
  // ================================================================

  const sendNewMessage = useCallback(
    async (contenido: string, tipo: 'texto' | 'imagen' | 'archivo' = 'texto') => {
      if (!isAuthenticated || !user) {
        throw new Error('Debes iniciar sesión para enviar mensajes');
      }
      if (!state.currentChat) {
        throw new Error('No hay un chat seleccionado');
      }
      if (!contenido.trim()) {
        throw new Error('El mensaje no puede estar vacío');
      }

      setState((prev) => ({ ...prev, isSending: true, error: null }));

      try {
        const message = await sendMessage({
          chat_id: state.currentChat.id,
          usuario_id: user.id,
          contenido: contenido.trim(),
          tipo,
        });

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, message],
            isSending: false,
            chats: prev.chats.map((c) =>
              c.id === state.currentChat?.id
                ? {
                    ...c,
                    ultimo_mensaje: {
                      id: message.id,
                      contenido: message.contenido,
                      created_at: message.created_at,
                      usuario_id: message.usuario_id,
                      autor: message.autor?.nombre || 'Usuario',
                    },
                    updated_at: message.created_at,
                  }
                : c
            ),
          }));
        }

        return message;
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isSending: false,
            error: error instanceof Error ? error.message : 'Error al enviar mensaje',
          }));
        }
        throw error;
      }
    },
    [isAuthenticated, user, state.currentChat]
  );

  // ================================================================
  // 📤 ENVIAR ESTADO DE TIPEO
  // ================================================================

  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      if (!state.currentChat || !user) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      await sendTypingStatus(state.currentChat.id, user.id, isTyping);

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingStatus(state.currentChat.id, user.id, false);
        }, 3000);
      }
    },
    [state.currentChat, user]
  );

  // ================================================================
  // 📤 CREAR NUEVO CHAT
  // ================================================================

  const createNewChat = useCallback(
    async (participantes: string[], nombre?: string, foto?: string) => {
      if (!isAuthenticated || !user) {
        throw new Error('Debes iniciar sesión');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const chat = await createChat({
          participantes: [...participantes, user.id],
          tipo: participantes.length > 1 ? 'grupo' : 'individual',
          nombre,
          foto,
        });

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            chats: [chat, ...prev.chats],
            isLoading: false,
          }));
        }

        return chat;
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al crear chat',
          }));
        }
        throw error;
      }
    },
    [isAuthenticated, user]
  );

  // ================================================================
  // 👥 CARGAR CONTACTOS
  // ================================================================

  const loadContacts = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const contacts = await getContacts(user.id);

      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          contacts,
        }));
      }
    } catch (error) {
      console.error('❌ Error cargando contactos:', error);
    }
  }, [isAuthenticated, user]);

  // ================================================================
  // 🔄 REFRESCAR
  // ================================================================

  const refresh = useCallback(async () => {
    await loadChats();
    if (state.currentChat) {
      await loadMessages(state.currentChat.id, true);
    }
  }, [loadChats, loadMessages, state.currentChat]);

  // ================================================================
  // 🚀 CARGA INICIAL
  // ================================================================

  useEffect(() => {
    if (autoLoad && isAuthenticated) {
      loadChats();
      loadContacts();
    }

    return () => {
      isMounted.current = false;
      if (chatSubscriptionRef.current) {
        chatSubscriptionRef.current.unsubscribe();
      }
      if (typingSubscriptionRef.current) {
        typingSubscriptionRef.current.unsubscribe();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [autoLoad, isAuthenticated, loadChats, loadContacts]);

  // ================================================================
  // 📤 EXPORTAR
  // ================================================================

  return {
    // Estado
    chats: state.chats,
    currentChat: state.currentChat,
    messages: state.messages,
    contacts: state.contacts,
    isLoading: state.isLoading,
    isSending: state.isSending,
    error: state.error,
    hasMore: state.hasMore,
    typingUsers: state.typingUsers,

    // Acciones
    loadChats,
    loadMessages,
    selectChat,
    sendNewMessage,
    sendTyping,
    createNewChat,
    loadContacts,
    refresh,

    // Utilidades
    isAuthenticated,
    user,
  };
}

export default useMessages;