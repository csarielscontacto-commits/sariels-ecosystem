import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { BilleteraController } from '../controllers/billetera.controller';
import { RegalosController } from '../controllers/regalos.controller';
import { LivesController } from '../controllers/lives.controller';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { regaloRateLimit, retiroRateLimit } from '../middleware/rate-limit.middleware';

const router = Router();

// ================================================================
// AUTH (público)
// ================================================================
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// ================================================================
// BILLETERA (protegido)
// ================================================================
router.get('/billetera/saldo', authMiddleware, BilleteraController.obtenerSaldo);
router.post('/billetera/recargar', authMiddleware, BilleteraController.solicitarRecarga);
router.post('/billetera/retirar', authMiddleware, retiroRateLimit, BilleteraController.solicitarRetiro);

// ================================================================
// REGALOS (protegido)
// ================================================================
router.get('/regalos/catalogo', authMiddleware, RegalosController.obtenerCatalogo);
router.post('/regalos/enviar', authMiddleware, regaloRateLimit, RegalosController.enviarRegalo);
router.get('/regalos/historial', authMiddleware, RegalosController.obtenerHistorial);

// ================================================================
// LIVES (protegido)
// ================================================================
router.get('/lives/en-vivo', LivesController.obtenerLivesActivos);
router.post('/lives/crear', authMiddleware, LivesController.crearLive);
router.post('/lives/:liveId/finalizar', authMiddleware, LivesController.finalizarLive);

// ================================================================
// ADMIN (protegido - solo admins)
// ================================================================
router.get('/admin/verificar-reserva', authMiddleware, AdminController.verificarReserva);
router.get('/admin/auditoria', authMiddleware, AdminController.obtenerAuditoria);
router.get('/admin/ganancias', authMiddleware, AdminController.obtenerGanancias);
router.get('/admin/recargas-pendientes', authMiddleware, AdminController.recargasPendientes);
router.post('/admin/acreditar-recarga/:recargaId', authMiddleware, AdminController.acreditarRecarga);

// ================================================================
// WEBHOOKS (público para SPEI/STP)
// ================================================================
router.post('/webhooks/spei', (req, res) => {
  // Placeholder para webhook de SPEI
  // En producción, aquí se recibiría la notificación de STP/SPEI
  res.json({ mensaje: 'Webhook SPEI recibido (pendiente de implementación)' });
});

export default router;