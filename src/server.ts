import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import logger from './utils/logger';
import prisma from './utils/prisma';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ================================================================
// MIDDLEWARES
// ================================================================
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://csariels.com'] 
    : ['http://localhost:3000', 'http://localhost:5500']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// ================================================================
// RUTAS
// ================================================================
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ================================================================
// MANEJO DE ERRORES GLOBAL
// ================================================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ================================================================
// INICIAR SERVIDOR
// ================================================================
app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📡 Health check: http://localhost:${PORT}/health`);
  logger.info(`📋 API: http://localhost:${PORT}/api`);
});

// ================================================================
// CIERRE GRACEFUL
// ================================================================
process.on('SIGTERM', async () => {
  logger.info('🛑 Recibido SIGTERM, cerrando conexiones...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 Recibido SIGINT, cerrando conexiones...');
  await prisma.$disconnect();
  process.exit(0);
});