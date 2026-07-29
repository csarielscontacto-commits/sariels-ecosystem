import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { RegalosService } from '../services/regalos.service';
import { BilleteraService } from '../services/billetera.service';
import logger from '../utils/logger';

const regalosService = new RegalosService();
const billeteraService = new BilleteraService();

export class AdminController {
  static async verificarReserva(req: Request, res: Response) {
    try {
      // Usar una transacción para verificar
      const result = await prisma.$transaction(async (tx) => {
        // Calcular suma de saldos
        const aggregate = await tx.user.aggregate({
          _sum: {
            saldo_disponible: true
          }
        });

        const totalSaldos = aggregate._sum.saldo_disponible || 0;

        const reserva = await tx.reservaGlobal.findUnique({
          where: { id: 'reserva_unica' }
        });

        if (!reserva) {
          return {
            ok: false,
            totalSaldos,
            reserva: 0,
            diferencia: totalSaldos,
            mensaje: 'No hay registro de reserva global'
          };
        }

        const diferencia = totalSaldos - reserva.saldo_reserva_usuarios;
        const cuadra = diferencia === 0;

        // Actualizar timestamp
        await tx.reservaGlobal.update({
          where: { id: 'reserva_unica' },
          data: {
            ultima_verificacion: new Date()
          }
        });

        return {
          ok: cuadra,
          totalSaldos,
          reserva: reserva.saldo_reserva_usuarios,
          ganancias: reserva.saldo_ganancias,
          diferencia,
          ultima_verificacion: reserva.ultima_verificacion,
          mensaje: cuadra ? '✅ Reserva verificada correctamente' : '🚨 LA RESERVA NO CUADRA'
        };
      });

      return res.json(result);

    } catch (error) {
      logger.error('Error en verificarReserva:', error);
      return res.status(500).json({
        error: 'Error al verificar reserva'
      });
    }
  }

  static async obtenerAuditoria(req: Request, res: Response) {
    try {
      const { userId, fechaInicio, fechaFin, limit = 100, offset = 0 } = req.query;

      const where: any = {};

      if (userId) {
        where.userId = userId as string;
      }

      if (fechaInicio) {
        where.createdAt = {
          ...where.createdAt,
          gte: new Date(fechaInicio as string)
        };
      }

      if (fechaFin) {
        where.createdAt = {
          ...where.createdAt,
          lte: new Date(fechaFin as string)
        };
      }

      const transacciones = await prisma.transaccion.findMany({
        where,
        include: {
          user: {
            select: {
              nombre: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      const total = await prisma.transaccion.count({ where });

      return res.json({
        data: transacciones,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });

    } catch (error) {
      logger.error('Error en obtenerAuditoria:', error);
      return res.status(500).json({
        error: 'Error al obtener auditoría'
      });
    }
  }

  static async acreditarRecarga(req: Request, res: Response) {
    try {
      const adminUserId = req.userId;
      const { recargaId } = req.params;

      const result = await billeteraService.acreditarRecarga(recargaId, adminUserId);

      logger.info(`✅ Recarga ${recargaId} acreditada por admin ${adminUserId}`);

      return res.json({
        result,
        mensaje: 'Recarga acreditada correctamente'
      });

    } catch (error) {
      logger.error('Error en acreditarRecarga:', error);
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error al acreditar recarga'
      });
    }
  }

  static async obtenerGanancias(req: Request, res: Response) {
    try {
      const reserva = await prisma.reservaGlobal.findUnique({
        where: { id: 'reserva_unica' }
      });

      // Calcular total de comisiones de la plataforma
      const comisiones = await prisma.transaccion.aggregate({
        where: {
          tipo: 'COMISION_PLATAFORMA'
        },
        _sum: {
          monto: true
        }
      });

      // Calcular total de regalos enviados
      const totalRegalos = await prisma.regaloEnviado.count();

      return res.json({
        ganancias_plataforma: reserva?.saldo_ganancias || 0,
        total_comisiones: comisiones._sum.monto || 0,
        total_regalos_enviados: totalRegalos,
        reserva_usuarios: reserva?.saldo_reserva_usuarios || 0
      });

    } catch (error) {
      logger.error('Error en obtenerGanancias:', error);
      return res.status(500).json({
        error: 'Error al obtener ganancias'
      });
    }
  }

  static async recargasPendientes(req: Request, res: Response) {
    try {
      const recargas = await prisma.recarga.findMany({
        where: {
          estado: 'PENDIENTE'
        },
        include: {
          user: {
            select: {
              nombre: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      return res.json(recargas);

    } catch (error) {
      logger.error('Error en recargasPendientes:', error);
      return res.status(500).json({
        error: 'Error al obtener recargas pendientes'
      });
    }
  }
}