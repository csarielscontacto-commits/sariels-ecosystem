import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { LoginDTO, RegisterDTO, TokenPayload } from '../types';
import logger from '../utils/logger';

export class AuthService {
  private jwtSecret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no configurado');
    }
    this.jwtSecret = secret;
  }

  async register(data: RegisterDTO) {
    const { email, password, nombre, negocio } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        nombre,
        negocio
      }
    });

    const token = this.generateToken(user.id, user.email, user.nombre);

    return {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        negocio: user.negocio,
        saldo_disponible: user.saldo_disponible
      },
      token
    };
  }

  async login(data: LoginDTO) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = this.generateToken(user.id, user.email, user.nombre);

    return {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        negocio: user.negocio,
        saldo_disponible: user.saldo_disponible,
        saldo_pendiente: user.saldo_pendiente
      },
      token
    };
  }

  private generateToken(userId: string, email: string, nombre: string): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      userId,
      email,
      nombre
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }
}