import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../utils/prisma';
import logger from '../utils/logger';

export class BilleteraService {
  async obtenerSaldo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        saldo_disponible: true,
        saldo_pendiente: true
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      saldo_disponible: user.saldo_disponible,
      saldo_pendiente: user.saldo_pendiente,
      total: user.saldo_disponible.plus(user.saldo_pendiente)
    };
  }

  async solicitarRecarga(userId: string, monto: number, referencia_spei?: string, comprobante_url?: string) {
    if (monto <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    return await prisma.recarga.create({
      data: {
        userId,
        monto: new Decimal(monto),
        referencia_spei,
        comprobante_url,
        estado: 'PENDIENTE'
      }
    });
  }

  async acreditarRecarga(recargaId: string, adminUserId: string) {
    return await prisma.$transaction(async (tx) => {
      const recarga = await tx.recarga.findUnique({
        where: { id: recargaId }
      });

      if (!recarga) {
        throw new Error('Recarga no encontrada');
      }

      if (recarga.estado !== 'PENDIENTE') {
        throw new Error('La recarga ya fue procesada');
      }

      // Obtener usuario
      const user = await tx.user.findUnique({
        where: { id: recarga.userId }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const monto = recarga.monto;
      const saldoAnterior = user.saldo_disponible;
      const saldoNuevo = saldoAnterior.plus(monto);

      // Actualizar saldo del usuario
      await tx.user.update({
        where: { id: recarga.userId },
        data: { saldo_disponible: saldoNuevo }
      });

      // Actualizar reserva global
      const reserva = await tx.reservaGlobal.findUnique({
        where: { id: 'reserva_unica' }
      });

      if (!reserva) {
        await tx.reservaGlobal.create({
          data: {
            id: 'reserva_unica',
            saldo_reserva_usuarios: monto
          }
        });
      } else {
        await tx.reservaGlobal.update({
          where: { id: 'reserva_unica' },
          data: {
            saldo_reserva_usuarios: reserva.saldo_reserva_usuarios.plus(monto)
          }
        });
      }

      // Registrar transacción
      await tx.transaccion.create({
        data: {
          userId: recarga.userId,
          tipo: 'RECARGA',
          monto,
          comision: new Decimal(0),
          saldo_anterior: saldoAnterior,
          saldo_nuevo: saldoNuevo
        }
      });

      // Actualizar recarga
      const recargaActualizada = await tx.recarga.update({
        where: { id: recargaId },
        data: {
          estado: 'ACREDITADA',
          acreditado_por: adminUserId,
          acreditado_en: new Date()
        }
      });

      logger.info(`✅ Recarga ${recargaId} acreditada por admin ${adminUserId}`);

      return recargaActualizada;
    });
  }

  async solicitarRetiro(userId: string, monto: number, clabe: string) {
    if (monto <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.saldo_disponible.lessThan(monto)) {
        throw new Error('Saldo insuficiente');
      }

      const saldoAnterior = user.saldo_disponible;
      const saldoNuevo = saldoAnterior.minus(monto);
      const saldoPendienteNuevo = user.saldo_pendiente.plus(monto);

      // Actualizar usuario
      await tx.user.update({
        where: { id: userId },
        data: {
          saldo_disponible: saldoNuevo,
          saldo_pendiente: saldoPendienteNuevo
        }
      });

      // Registrar transacción
      await tx.transaccion.create({
        data: {
          userId,
          tipo: 'RETIRO',
          monto: new Decimal(monto),
          comision: new Decimal(0),
          saldo_anterior: saldoAnterior,
          saldo_nuevo: saldoNuevo
        }
      });

      logger.info(`💰 Retiro solicitado por ${userId}: $${monto}`);

      return {
        monto,
        estado: 'SOLICITADO',
        mensaje: 'Retiro solicitado. El equipo procesará en 24-48 horas hábiles.'
      };
    });
  }
}