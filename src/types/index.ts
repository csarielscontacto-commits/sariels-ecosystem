import { Decimal } from '@prisma/client/runtime/library';

export interface TokenPayload {
  userId: string;
  email: string;
  nombre: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  userId: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    saldo_disponible: Decimal;
  };
}

export interface EnviarRegaloDTO {
  paraUserId: string;
  regaloId: string;
  liveId?: string;
  idempotencyKey: string;
}

export interface RecargarDTO {
  monto: number;
  referencia_spei?: string;
}

export interface RetirarDTO {
  monto: number;
  clabe: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  nombre: string;
  negocio?: string;
}

export const CATALOGO_REGALOS = {
  llave_10: { id: 'llave_10', nombre: '🔧 Mecánico Express', precio: 10 },
  llanta_50: { id: 'llanta_50', nombre: '🛞 Llanta de Oro', precio: 50 },
  motor_100: { id: 'motor_100', nombre: '🏎️ Motor Turbo', precio: 100 },
  taller_1000: { id: 'taller_1000', nombre: '👑 Taller del Año', precio: 1000 }
};

export const COMISION_PLATAFORMA = 0.30; // 30%
export const COMISION_STREAMER = 0.70; // 70%