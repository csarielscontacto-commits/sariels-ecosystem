import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Decimal } from '@prisma/client/runtime/library';
import { RegalosService } from '../services/regalos.service';
import prisma from '../utils/prisma';

// Mock de prisma
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn()
    },
    regaloEnviado: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    transaccion: {
      create: jest.fn()
    },
    reservaGlobal: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    }
  }
}));

const regalosService = new RegalosService();

describe('RegalosService', () => {
  const mockDeUser = {
    id: 'user_1',
    saldo_disponible: new Decimal(1000)
  };

  const mockParaUser = {
    id: 'user_2',
    saldo_disponible: new Decimal(0)
  };

  const mockReserva = {
    id: 'reserva_unica',
    saldo_reserva_usuarios: new Decimal(1000),
    saldo_ganancias: new Decimal(0)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe fallar si el saldo es insuficiente', async () => {
    const deUserSinSaldo = {
      ...mockDeUser,
      saldo_disponible: new Decimal(5)
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(deUserSinSaldo);

    await expect(
      regalosService.enviarRegalo(
        'user_1',
        'user_2',
        'llave_10',
        undefined,
        'key_123',
        '127.0.0.1',
        'test-agent'
      )
    ).rejects.toThrow('Saldo insuficiente para enviar este regalo');
  });

  it('debe calcular correctamente la comisión del 30%', async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(mockDeUser)
      .mockResolvedValueOnce(mockParaUser);

    (prisma.reservaGlobal.findUnique as jest.Mock).mockResolvedValue(mockReserva);

    (prisma.regaloEnviado.findUnique as jest.Mock).mockResolvedValue(null);

    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      const tx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockDeUser),
          update: jest.fn().mockResolvedValue({})
        },
        regaloEnviado: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({
            id: 'regalo_123',
            deUserId: 'user_1',
            paraUserId: 'user_2',
            regaloId: 'llave_10',
            precio_total: new Decimal(10),
            comision_plataforma: new Decimal(3),
            ganancia_streamer: new Decimal(7)
          })
        },
        transaccion: {
          create: jest.fn().mockResolvedValue({})
        },
        reservaGlobal: {
          findUnique: jest.fn().mockResolvedValue(mockReserva),
          update: jest.fn().mockResolvedValue({})
        },
        aggregate: jest.fn().mockResolvedValue({
          _sum: { saldo_disponible: new Decimal(1000) }
        })
      };
      return await callback(tx);
    });

    const result = await regalosService.enviarRegalo(
      'user_1',
      'user_2',
      'llave_10',
      undefined,
      'key_123',
      '127.0.0.1',
      'test-agent'
    );

    expect(result.comision).toBe(3);
    expect(result.gananciaStreamer).toBe(7);
    expect(result.regalo.regaloId).toBe('llave_10');
  });

  it('debe ser idempotente', async () => {
    const regaloExistente = {
      id: 'regalo_existente',
      deUserId: 'user_1',
      paraUserId: 'user_2',
      regaloId: 'llave_10',
      precio_total: new Decimal(10),
      comision_plataforma: new Decimal(3),
      ganancia_streamer: new Decimal(7),
      idempotency_key: 'key_123'
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      const tx = {
        regaloEnviado: {
          findUnique: jest.fn().mockResolvedValue(regaloExistente)
        }
      };
      return await callback(tx);
    });

    const result = await regalosService.enviarRegalo(
      'user_1',
      'user_2',
      'llave_10',
      undefined,
      'key_123',
      '127.0.0.1',
      'test-agent'
    );

    expect(result.id).toBe('regalo_existente');
  });
});