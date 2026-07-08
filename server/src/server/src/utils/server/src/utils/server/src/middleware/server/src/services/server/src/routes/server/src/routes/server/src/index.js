import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import healthRoutes from './routes/health.js';
import ordersRoutes from './routes/orders.js';
import paymentsRoutes from './routes/payments.js';

const app = express();

// seguridad base
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('combined'));

// IMPORTANTE: JSON para rutas normales (NO webhook raw)
app.use('/api', express.json({ limit: '1mb' }));

// rutas
app.use('/api', healthRoutes);
app.use('/api', ordersRoutes);
app.use('/api', paymentsRoutes);

app.get('/', (_req, res) => res.send('Sariels Ecosystem API running'));

app.listen(config.port, () => {
  console.log(`API listening on :${config.port}`);
});
