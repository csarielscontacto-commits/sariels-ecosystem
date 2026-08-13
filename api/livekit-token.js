// api/livekit-token.js
// Endpoint serverless para generar tokens de acceso a LiveKit

import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método no permitido. Usa POST.' 
    });
  }

  // Obtener datos del cuerpo de la solicitud
  const { roomName, participantName, participantIdentity } = req.body;

  // Validar campos obligatorios
  if (!roomName || !participantIdentity) {
    return res.status(400).json({ 
      error: 'Faltan campos obligatorios: roomName y participantIdentity' 
    });
  }

  // Validar variables de entorno
  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
    console.error('❌ Variables de entorno LiveKit no configuradas');
    return res.status(500).json({ 
      error: 'Configuración del servidor incompleta' 
    });
  }

  try {
    // Crear token de acceso
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantIdentity,
        name: participantName || participantIdentity,
        // TTL: 6 horas (en segundos)
        ttl: '6h',
      }
    );

    // Agregar permisos para la sala
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,      // Permitir publicar (transmitir)
      canSubscribe: true,    // Permitir suscribirse (ver)
      canPublishData: true,  // Permitir enviar mensajes
    });

    // Generar el token JWT
    const token = await at.toJwt();

    // Responder con el token y la URL de LiveKit
    return res.status(200).json({ 
      token, 
      url: process.env.LIVEKIT_URL,
      roomName: roomName,
      participantIdentity: participantIdentity
    });

  } catch (error) {
    console.error('❌ Error generando token LiveKit:', error);
    return res.status(500).json({ 
      error: 'Error generando el token de acceso', 
      details: error.message 
    });
  }
}