import { Router } from 'express';
const router = Router();

router.get('/health', async (_req, res) => {
  res.json({ ok: true, service: 'sariels-ecosystem-api', ts: new Date().toISOString() });
});

export default router;
