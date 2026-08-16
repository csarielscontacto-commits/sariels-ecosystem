// ================================================================
// 💬 messageService - CSARIEL'S ECOSYSTEM (MENSAJES MODULE)
// ================================================================
// Servicio para gestionar mensajería en tiempo real con Supabase Realtime.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  Chat,
  Message,
  Contact,
  CreateChatData,
  SendMessageData,
} from '../types/message.types';

// ================================================================
// 📥 OBTENER CHATS DEL USUARIO
// ================================================================

export async function getUserChats(userId: string): Promise<Chat[]> {
  try {
    // Obtener chats donde el usuario es participante
    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        *,
        participantes:chat_participantes(
          usuario_id,
          perfiles!chat_participantes_usuario_id(
            nombre,
            foto_perfil_url,
            verificado,
            online
          )
        ),
        ultimo_mensaje:mensajes(
          id,
          contenido,
          created_at,
          usuario_id,
          perfiles!mensajes_usuario_id(
            nombre
          )
        )
      `)
      .eq('participantes.usuario_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (chats || []).map((chat) => ({
      id: chat.id,
      tipo: chat.tipo || 'individual',
      nombre: chat.nombre || '',
      foto: chat.foto || null,
      participantes: chat.participantes?.map((p: any) => ({
        id: p.usuario_id,
        nombre: p.perfiles?.nombre || 'Usuario',
        foto_perfil_url: p.perfiles?.foto_perfil_url || null,
        verificado: p.perfiles?.verificado || false,
        online: p.perfiles?.online || false,
      })) || [],
      ultimo_mensaje: chat.ultimo_mensaje?.[0] ? {
        id: chat.ultimo_mensaje[0].id,
        contenido: chat.ultimo_mensaje[0].contenido,
        created_at: chat.ultimo_mensaje[0].created_at,
        usuario_id: chat.ultimo_mensaje[0].usuario_id,
        autor: chat.ultimo_mensaje[0].perfiles?.nombre || 'Usuario',
      } : null,
      no_leidos: 0,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
    }));
  } catch (error) {
    console.error('❌ Error en getUserChats:', error);
    throw error;
  }
}

// ================================================================
// 📥 OBTENER MENSAJES DE UN CHAT
// ================================================================

export async function getChatMessages(
  chatId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<Message[]> {
  const { limit = 50, offset = 0 } = options;

  try {
    const { data: messages, error } = await supabase
      .from('mensajes')
      .select(`
        *,
        perfiles!mensajes_usuario_id(
          nombre,
          foto_perfil_url,
          verificado
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (messages || []).map((msg) => ({
      id: msg.id,
      chat_id: msg.chat_id,
      usuario_id: msg.usuario_id,
      contenido: msg.contenido,
      tipo: msg.tipo || 'texto',
      created_at: msg.created_at,
      leido: msg.leido || false,
      autor: msg.perfiles || {
        nombre: 'Usuario',
        foto_perfil_url: null,
        verificado: false,
      },
    }));
  } catch (error) {
    console.error('❌ Error en getChatMessages:', error);
    throw error;
  }
}

// ================================================================
// 📤 ENVIAR MENSAJE
// ================================================================

export async function sendMessage(data: SendMessageData): Promise<Message> {
  try {
    const { chat_id, usuario_id, contenido, tipo = 'texto' } = data;

    if (!contenido.trim()) {
      throw new Error('El mensaje no puede estar vacío');
    }

    const { data: message, error } = await supabase
      .from('mensajes')
      .insert({
        chat_id,
        usuario_id,
        contenido: contenido.trim(),
        tipo,
        created_at: new Date().toISOString(),
        leido: false,
      })
      .select(`
        *,
        perfiles!mensajes_usuario_id(
          nombre,
          foto_perfil_url,
          verificado
        )
      `)
      .single();

    if (error) throw error;

    // Actualizar el chat (updated_at)
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chat_id);

    return {
      id: message.id,
      chat_id: message.chat_id,
      usuario_id: message.usuario_id,
      contenido: message.contenido,
      tipo: message.tipo || 'texto',
      created_at: message.created_at,
      leido: message.leido || false,
      autor: message.perfiles || {
        nombre: 'Usuario',
        foto_perfil_url: null,
        verificado: false,
      },
    };
  } catch (error) {
    console.error('❌ Error en sendMessage:', error);
    throw error;
  }
}

// ================================================================
// 📤 CREAR CHAT
// ================================================================

export async function createChat(data: CreateChatData): Promise<Chat> {
  try {
    const { participantes, tipo = 'individual', nombre, foto } = data;

    if (!participantes || participantes.length === 0) {
      throw new Error('Se requiere al menos un participante');
    }

    // Crear el chat
    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        tipo,
        nombre: nombre || null,
        foto: foto || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Agregar participantes
    const participantesData = participantes.map((usuario_id) => ({
      chat_id: chat.id,
      usuario_id,
      created_at: new Date().toISOString(),
    }));

    const { error: participantError } = await supabase
      .from('chat_participantes')
      .insert(participantesData);

    if (participantError) throw participantError;

    return {
      id: chat.id,
      tipo: chat.tipo || 'individual',
      nombre: chat.nombre || '',
      foto: chat.foto || null,
      participantes: [],
      ultimo_mensaje: null,
      no_leidos: 0,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
    };
  } catch (error) {
    console.error('❌ Error en createChat:', error);
    throw error;
  }
}

// ================================================================
// 📡 SUSCRIBIRSE A MENSAJES EN TIEMPO REAL
// ================================================================

export function subscribeToChat(
  chatId: string,
  onNewMessage: (message: Message) => void,
  onTyping?: (userId: string, isTyping: boolean) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`chat:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `chat_id=eq.${chatId}`,
      },
      async (payload) => {
        const newMessage = payload.new as Message;
        // Obtener datos del autor
        const { data: profile } = await supabase
          .from('perfiles')
          .select('nombre, foto_perfil_url, verificado')
          .eq('user_id', newMessage.usuario_id)
          .single();

        onNewMessage({
          ...newMessage,
          autor: profile || {
            nombre: 'Usuario',
            foto_perfil_url: null,
            verificado: false,
          },
        });
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`📡 Suscrito al chat: ${chatId}`);
      }
    });

  return channel;
}

// ================================================================
// 📡 SUSCRIBIRSE A ESTADO DE TIPEO
// ================================================================

export function subscribeToTyping(
  chatId: string,
  userId: string,
  onTyping: (userId: string, isTyping: boolean) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`typing:${chatId}`)
    .on('broadcast', { event: 'typing' }, (payload) => {
      const { user_id, is_typing } = payload.payload;
      if (user_id !== userId) {
        onTyping(user_id, is_typing);
      }
    })
    .subscribe();

  return channel;
}

// ================================================================
// 📤 ENVIAR ESTADO DE TIPEO
// ================================================================

export async function sendTypingStatus(
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  try {
    await supabase.channel(`typing:${chatId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: userId,
        is_typing: isTyping,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('❌ Error enviando estado de tipeo:', error);
  }
}

// ================================================================
// ✅ MARCAR MENSAJES COMO LEÍDOS
// ================================================================

export async function markMessagesAsRead(chatId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('mensajes')
      .update({ leido: true })
      .eq('chat_id', chatId)
      .neq('usuario_id', userId)
      .eq('leido', false);

    if (error) throw error;
  } catch (error) {
    console.error('❌ Error marcando mensajes como leídos:', error);
    throw error;
  }
}

// ================================================================
// 👥 OBTENER CONTACTOS (PARA NUEVO CHAT)
// ================================================================

export async function getContacts(userId: string): Promise<Contact[]> {
  try {
    const { data: contacts, error } = await supabase
      .from('relaciones_contactos')
      .select(`
        contacto_id,
        perfiles!relaciones_contactos_contacto_id(
          nombre,
          foto_perfil_url,
          verificado,
          online
        )
      `)
      .eq('user_id', userId)
      .eq('tipo', 'contacto');

    if (error) throw error;

    return (contacts || []).map((c) => ({
      id: c.contacto_id,
      nombre: c.perfiles?.nombre || 'Usuario',
      foto_perfil_url: c.perfiles?.foto_perfil_url || null,
      verificado: c.perfiles?.verificado || false,
      online: c.perfiles?.online || false,
    }));
  } catch (error) {
    console.error('❌ Error en getContacts:', error);
    throw error;
  }
}