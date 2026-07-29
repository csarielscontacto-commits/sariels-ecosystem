import { Request, Response } from 'express';
import { BilleteraService } from '../services/billetera.service';
import logger from '../utils/logger';

const billeteraService = new BilleteraService();

export class BilleteraController {
  static async obtenerSaldo(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const saldo = await billeteraService.obtenerSaldo(userId);

      return res.json(saldo);

    } catch (error) {
      logger.error('Error en obtenerSaldo:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Error al obtener saldo'
      });
    }
  }

  static async solicitarRecarga(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { monto, referencia_spei, comprobante_url } = req.body;

      if (!monto || monto <= 0) {
        return res.status(400).json({ error: 'Monto inválido' });
      }

      const recarga = await billeteraService.solicitarRecarga(
        userId,
        monto,
        referencia_spei,
        comprobante_url
      );

      logger.info(`📥 Recarga solicitada por ${userId}: $${monto}`);

      return res.status(201).json({
        recarga,
        mensaje: 'Solicitud de recarga creada. Espera la acreditación manual.'
      });

    } catch (error) {
      logger.error('Error en solicitarRecarga:', error);
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error al solicitar recarga'
      });
    }
  }

  static async solicitarRetiro(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { monto, clabe } = req.body;

      if (!monto || monto <= 0) {
        return res.status(400).json({ error: 'Monto inválido' });
      }

      if (!clabe) {
        return res.status(400).json({ error: 'CLABE es requerida' });
      }

      const result = await billeteraService.solicitarRetiro(userId, monto, clabe);

      logger.info(`💸 Retiro solicitado por ${userId}: $${monto}`);

      return res.json(result);

    } catch (error) {
      logger.error('Error en solicitarRetiro:', error);
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error al solicitar retiro'
      });
    }
  }
}