import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../utils/prisma';
import { CATALOGO_REGALOS, COMISION_PLATAFORMA, COMISION_STREAMER } from '../types';
import logger from '../utils/logger';

export class RegalosService {
  async enviarRegalo(
    deUserId: string,
    paraUserId: string,
    regaloId: string,
    liveId: string | undefined,
    idempotencyKey: string,
    ip_address: string,
    user_agent: string
  ) {
    // Validar que el regalo existe
    const regaloConfig = CATALOGO_REGALOS[regaloId as keyof typeof CATALOGO_REGALOS];
    if (!regaloConfig) {
      throw new Error('Regalo no encontrado');
    }

    const precioTotal = regaloConfig.precio;
    const comision = precioTotal * COMISION_PLATAFORMA;
    const gananciaStreamer = precioTotal * COMISION_STREAMER;

    // Transacción atómica
    return await prisma.$transaction(async (tx) => {
      // 1. Verificar idempotencia
      const existente = await tx.regaloEnviado.findUnique({
        where: { idempotency_key: idempotencyKey }
      });

      if (existente) {
        logger.warn(`🔄 Regalo duplicado (idempotency: ${idempotencyKey})`);
        return existente;
      }

      // 2. Obtener remitente con bloqueo
      const deUser = await tx.user.findUnique({
        where: { id: deUserId }
      });

      if (!deUser) {
        throw new Error('Usuario remitente no encontrado');
      }

      // 3. Validar saldo suficiente
      if (deUser.saldo_disponible.lessThan(precioTotal)) {
        throw new Error('Saldo insuficiente para enviar este regalo');
      }

      // 4. Obtener destinatario
      const paraUser = await tx.user.findUnique({
        where: { id: paraUserId }
      });

      if (!paraUser) {
        throw new Error('Usuario destinatario no encontrado');
      }

      // 5. Calcular nuevos saldos
      const saldoAnteriorRemitente = deUser.saldo_disponible;
      const saldoNuevoRemitente = saldoAnteriorRemitente.minus(precioTotal);
      const saldoAnteriorDestinatario = paraUser.saldo_disponible;
      const saldoNuevoDestinatario = saldoAnteriorDestinatario.plus(gananciaStreamer);

      // 6. Actualizar saldos
      await tx.user.update({
        where: { id: deUserId },
        data: { saldo_disponible: saldoNuevoRemitente }
      });

      await tx.user.update({
        where: { id: paraUserId },
        data: { saldo_disponible: saldoNuevoDestinatario }
      });

      // 7. Actualizar reserva global (menos el saldo del remitente, más el del destinatario)
      const reserva = await tx.reservaGlobal.findUnique({
        where: { id: 'reserva_unica' }
      });

      if (reserva) {
        await tx.reservaGlobal.update({
          where: { id: 'reserva_unica' },
          data: {
            saldo_reserva_usuarios: reserva.saldo_reserva_usuarios
              .minus(precioTotal)
              .plus(gananciaStreamer),
            saldo_ganancias: reserva.saldo_ganancias.plus(comision)
          }
        });
      }

      // 8. Crear registro de regalo
      const regalo = await tx.regaloEnviado.create({
        data: {
          deUserId,
          paraUserId,
          regaloId,
          precio_total: new Decimal(precioTotal),
          comision_plataforma: new Decimal(comision),
          ganancia_streamer: new Decimal(gananciaStreamer),
          liveId: liveId || null,
          idempotency_key: idempotencyKey
        }
      });

      // 9. Registrar transacción del remitente (REGALO_ENVIADO)
      await tx.transaccion.create({
        data: {
          userId: deUserId,
          tipo: 'REGALO_ENVIADO',
          monto: new Decimal(precioTotal),
          comision: new Decimal(0),
          saldo_anterior: saldoAnteriorRemitente,
          saldo_nuevo: saldoNuevoRemitente,
          idempotency_key: `${idempotencyKey}_sender`,
          ip_address,
          user_agent
        }
      });

      // 10. Registrar transacción del destinatario (REGALO_RECIBIDO)
      await tx.transaccion.create({
        data: {
          userId: paraUserId,
          tipo: 'REGALO_RECIBIDO',
          monto: new Decimal(gananciaStreamer),
          comision: new Decimal(0),
          saldo_anterior: saldoAnteriorDestinatario,
          saldo_nuevo: saldoNuevoDestinatario,
          idempotency_key: `${idempotencyKey}_receiver`,
          ip_address,
          user_agent
        }
      });

      // 11. Registrar comisión de plataforma
      await tx.transaccion.create({
        data: {
          userId: deUserId,
          tipo: 'COMISION_PLATAFORMA',
          monto: new Decimal(comision),
          comision: new Decimal(0),
          saldo_anterior: saldoNuevoRemitente,
          saldo_nuevo: saldoNuevoRemitente,
          idempotency_key: `${idempotencyKey}_commission`,
          ip_address,
          user_agent
        }
      });

      // 12. Verificar reserva después de la operación
      await this.verificarReserva(tx);

      logger.info(`🎁 Regalo enviado: ${regaloConfig.nombre} de ${deUserId} a ${paraUserId}`);

      return {
        regalo: regalo,
        regaloConfig,
        comision,
        gananciaStreamer,
        saldoRestante: saldoNuevoRemitente
      };
    });
  }

  async obtenerCatalogo() {
    return Object.values(CATALOGO_REGALOS);
  }

  async obtenerHistorialRegalos(userId: string, limit: number = 50) {
    const regalos = await prisma.regaloEnviado.findMany({
      where: {
        OR: [
          { deUserId: userId },
          { paraUserId: userId }
        ]
      },
      include: {
        deUser: {
          select: { nombre: true }
        },
        paraUser: {
          select: { nombre: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return regalos.map(r => ({
      ...r,
      deUserNombre: r.deUser.nombre,
      paraUserNombre: r.paraUser.nombre
    }));
  }

  async verificarReserva(tx: any) {
    // Calcular suma de saldos de todos los usuarios
    const result = await tx.user.aggregate({
      _sum: {
        saldo_disponible: true
      }
    });

    const totalSaldos = result._sum.saldo_disponible || new Decimal(0);

    // Obtener reserva global
    const reserva = await tx.reservaGlobal.findUnique({
      where: { id: 'reserva_unica' }
    });

    if (!reserva) {
      // Crear reserva si no existe
      await tx.reservaGlobal.create({
        data: {
          id: 'reserva_unica',
          saldo_reserva_usuarios: totalSaldos
        }
      });
      return { ok: true, totalSaldos, reserva: totalSaldos };
    }

    // Verificar que coincidan
    const diferencia = totalSaldos.minus(reserva.saldo_reserva_usuarios);

    if (!diferencia.eq(0)) {
      logger.error(`🚨 RESERVA DESCUADRA: Diferencia de $${diferencia.toString()}`);
      throw new Error(`La reserva no cuadra. Diferencia: $${diferencia.toString()}`);
    }

    // Actualizar timestamp de verificación
    await tx.reservaGlobal.update({
      where: { id: 'reserva_unica' },
      data: {
        ultima_verificacion: new Date()
      }
    });

    return { ok: true, totalSaldos, reserva: reserva.saldo_reserva_usuarios };
  }
}