import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, nombre, negocio } = req.body;

      if (!email || !password || !nombre) {
        return res.status(400).json({
          error: 'Email, password y nombre son requeridos'
        });
      }

      const result = await authService.register({ email, password, nombre, negocio });

      logger.info(`📝 Nuevo usuario registrado: ${email}`);

      return res.status(201).json(result);

    } catch (error) {
      logger.error('Error en register:', error);
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error al registrar usuario'
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email y password son requeridos'
        });
      }

      const result = await authService.login({ email, password });

      logger.info(`🔐 Usuario logueado: ${email}`);

      return res.json(result);

    } catch (error) {
      logger.error('Error en login:', error);
      return res.status(401).json({
        error: error instanceof Error ? error.message : 'Credenciales inválidas'
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.userId;

      const user = await (await import('../utils/prisma')).default.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          negocio: true,
          saldo_disponible: true,
          saldo_pendiente: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      return res.json(user);

    } catch (error) {
      logger.error('Error en me:', error);
      return res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }
}