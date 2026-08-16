// ================================================================
// 🧩 ChatWindow - CSARIEL'S ECOSYSTEM (MENSAJES MODULE)
// ================================================================
// Ventana de chat con:
// - Header con información del contacto
// - Lista de mensajes
// - Input para enviar mensajes
// - Indicador de tipeo
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';

// ================================================================
// 📦 TIPOS
// ================================================================

interface ChatWindowProps {
  chatName: string;
  chatAvatar: string | null;
  messages: any[];
  onSendMessage: (content: string) => Promise<void>;
  onTyping: (isTyping: boolean) => Promise<void>;
  onViewProfile: () => void;
  isSending: boolean;
  typingUsers: Record<string, boolean>;
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

// ================================================================
// 🧩 COMPONENTE
// ================================================================

export function ChatWindow({
  chatName,
  chatAvatar,
  messages,
  onSendMessage,
  onTyping,
  onViewProfile,
  isSending,
  typingUsers,
  currentUserId,
  messagesEndRef,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ================================================================
  // ⌨️ MANEJAR TIPEO
  // ================================================================

  const handleTyping = (value: string) => {
    setInputText(value);

    const isTyping = value.length > 0 && !isSending;

    if (isTyping !== isTypingLocal) {
      setIsTypingLocal(isTyping);
      onTyping(isTyping);
    }

    // Resetear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTypingLocal(false);
        onTyping(false);
      }, 3000);
    }
  };

  // ================================================================
  // 📤 ENVIAR MENSAJE
  // ================================================================

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    await onSendMessage(inputText.trim());
    setInputText('');
    setIsTypingLocal(false);
    await onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // ================================================================
  // ⌨️ ENTER PARA ENVIAR
  // ================================================================

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ================================================================
  // 🔍 VER QUIÉN ESTÁ TIPEANDO
  // ================================================================

  const getTypingText = () => {
    const typingUsersList = Object.keys(typingUsers).filter(
      (id) => typingUsers[id] && id !== currentUserId
    );

    if (typingUsersList.length === 0) return null;

    const names = typingUsersList.map((id) => {
      // Buscar el nombre en los mensajes o en el chat
      const msg = messages.find((m) => m.usuario_id === id);
      return msg?.autor?.nombre || 'Alguien';
    });

    if (names.length === 1) return `${names[0]} está escribiendo...`;
    if (names.length === 2) return `${names[0]} y ${names[1]} están escribiendo...`;
    return 'Varias personas están escribiendo...';
  };

  const typingText = getTypingText();

  // ================================================================
  // 🖥️ RENDER
  // ================================================================

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700">
        <div
          className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-white overflow-hidden cursor-pointer flex-shrink-0"
          onClick={onViewProfile}
        >
          {chatAvatar ? (
            <img
              src={chatAvatar}
              alt={chatName}
              className="w-full h-full object-cover"
            />
          ) : (
            chatName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-medium text-white hover:text-yellow-500 cursor-pointer transition"
            onClick={onViewProfile}
          >
            {chatName}
          </div>
          {typingText ? (
            <span className="text-xs text-yellow-500 animate-pulse">
              {typingText}
            </span>
          ) : (
            <span className="text-xs text-gray-500">En línea</span>
          )}
        </div>
        <button
          onClick={onViewProfile}
          className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-xl text-sm hover:bg-gray-700 transition"
        >
          <i className="fas fa-user mr-1" />
          Perfil
        </button>
      </div>

      {/* ===== MENSAJES ===== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <i className="fas fa-comment text-4xl opacity-30 mb-3" />
              <p>No hay mensajes aún</p>
              <p className="text-sm">Envía un mensaje para comenzar</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.usuario_id === currentUserId;
            const showAvatar =
              index === 0 ||
              messages[index - 1]?.usuario_id !== message.usuario_id;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                currentUserId={currentUserId}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ===== INPUT ===== */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition resize-none"
            disabled={isSending}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isSending ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <i className="fas fa-paper-plane" />
            )}
          </button>
        </div>
        <div className="mt-1 text-xs text-gray-500 text-right">
          {inputText.length > 0 && `${inputText.length} caracteres`}
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;