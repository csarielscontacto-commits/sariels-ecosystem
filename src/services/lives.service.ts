import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import logger from '../utils/logger';

export class LivesController {
  static async obtenerLivesActivos(req: Request, res: Response) {
    try {
      const lives = await prisma.live.findMany({
        where: {
          estado: 'EN_VIVO'
        },
        include: {
          streamer: {
            select: {
              id: true,
              nombre: true
            }
          },
          regalos: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              deUser: {
                select: { nombre: true }
              },
              paraUser: {
                select: { nombre: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(lives);

    } catch (error) {
      logger.error('Error en obtenerLivesActivos:', error);
      return res.status(500).json({
        error: 'Error al obtener lives activos'
      });
    }
  }

  static async crearLive(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { titulo, plataforma, url_live } = req.body;

      if (!titulo) {
        return res.status(400).json({ error: 'Título requerido' });
      }

      const live = await prisma.live.create({
        data: {
          streamerUserId: userId,
          titulo,
          plataforma,
          url_live,
          estado: 'EN_VIVO'
        }
      });

      logger.info(`📡 Live iniciado por ${userId}: ${titulo}`);

      return res.status(201).json(live);

    } catch (error) {
      logger.error('Error en crearLive:', error);
      return res.status(500).json({
        error: 'Error al crear live'
      });
    }
  }

  static async finalizarLive(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { liveId } = req.params;

      const live = await prisma.live.findUnique({
        where: { id: liveId }
      });

      if (!live) {
        return res.status(404).json({ error: 'Live no encontrado' });
      }

      if (live.streamerUserId !== userId) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const liveFinalizado = await prisma.live.update({
        where: { id: liveId },
        data: {
          estado: 'FINALIZADO',
          finalizado_en: new Date()
        }
      });

      logger.info(`📡 Live finalizado: ${liveId}`);

      return res.json(liveFinalizado);

    } catch (error) {
      logger.error('Error en finalizarLive:', error);
      return res.status(500).json({
        error: 'Error al finalizar live'
      });
    }
  }
}