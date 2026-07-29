import rateLimit from 'express-rate-limit';

// 10 regalos por minuto por usuario
export const regaloRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Demasiados regalos. Espera un momento para continuar.',
      retryAfter: 60
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5 solicitudes de retiro por día por usuario
export const retiroRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 5,
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Límite de retiros diarios alcanzado (5 por día)'
    });
  }
});