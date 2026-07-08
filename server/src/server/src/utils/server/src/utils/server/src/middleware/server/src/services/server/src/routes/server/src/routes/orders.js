import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../db.js';
import { config } from '../config.js';
import { createNowpaymentsInvoice } from '../services/provider-nowpayments.js';
import { createCoinbaseCharge } from '../services/provider-coinbase.js';

const router = Router();

const CreateOrderSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  currency: z.enum(['USDT', 'USDC']),
  network: z.enum(['TRC20', 'ERC20']),
  amount: z.number().positive(),
  reference: z.string().max(120).optional().nullable(),
  description: z.string().max(500).optional().nullable()
});

router.post('/orders', requireAuth, async (req, res) => {
  try {
    const parsed = CreateOrderSchema.parse(req.body);

    const allowed = config.allowedNetwork[parsed.currency];
    if (parsed.network !== allowed) {
      return res.status(400).json({
        error: `Network not allowed for ${parsed.currency}. Allowed: ${allowed}`
      });
    }

    // 1) crear orden pending
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: parsed.customer_id || null,
        seller_user_id: req.user.id,
        provider: config.paymentProvider,
        currency: parsed.currency,
        network: parsed.network,
        amount: parsed.amount,
        status: 'pending',
        reference: parsed.reference || null,
        description: parsed.description || null
      })
      .select('*')
      .single();

    if (orderErr) return res.status(500).json({ error: orderErr.message });

    let providerResult;

    if (config.paymentProvider === 'nowpayments') {
      providerResult = await createNowpaymentsInvoice({
        amount: parsed.amount,
        currency: parsed.currency,
        network: parsed.network,
        orderId: order.id,
        description: parsed.description || parsed.reference || `Order ${order.id}`
      });
    } else if (config.paymentProvider === 'coinbase') {
      providerResult = await createCoinbaseCharge();
    } else {
      return res.status(500).json({ error: 'Unsupported provider' });
    }

    // 2) actualizar orden con datos de proveedor
    const { data: updated, error: upErr } = await supabaseAdmin
      .from('orders')
      .update({
        external_order_id: providerResult.externalPaymentId,
        checkout_url: providerResult.checkoutUrl,
        payment_address: providerResult.paymentAddress,
        metadata: providerResult.raw || {}
      })
      .eq('id', order.id)
      .select('*')
      .single();

    if (upErr) return res.status(500).json({ error: upErr.message });

    // 3) audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_user_id: req.user.id,
      action: 'order_created',
      entity: 'orders',
      entity_id: order.id,
      ip: req.ip,
      user_agent: req.headers['user-agent'] || null,
      details: { currency: parsed.currency, network: parsed.network, amount: parsed.amount }
    });

    return res.status(201).json({ order: updated });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.get('/orders/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Order not found' });

  // autorización: dueño o admin/support via profiles
  if (order.seller_user_id !== req.user.id) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    const role = profile?.role;
    if (!['admin', 'support'].includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const { data: attempts } = await supabaseAdmin
    .from('payment_attempts')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: false });

  return res.json({ order, attempts: attempts || [] });
});

export default router;
