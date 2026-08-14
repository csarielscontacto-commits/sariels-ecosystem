// ================================================================
// 🔌 WEBHOOK NOWPAYMENTS - ACTIVACIÓN AUTOMÁTICA eSIM
// ================================================================
// Ruta: api/webhooks/nowpayments.js
// Método: POST (IPN Callback)
// ================================================================

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ================================================================
// 📋 CONFIGURACIÓN
// ================================================================
const NOWPAYMENTS_IPN_KEY = process.env.NOWPAYMENTS_IPN_KEY;
const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!NOWPAYMENTS_IPN_KEY) console.error('❌ NOWPAYMENTS_IPN_KEY no configurada');
if (!TELNYX_API_KEY) console.error('❌ TELNYX_API_KEY no configurada');
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) console.error('❌ Supabase no configurado');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ================================================================
// 🧹 IMPORTANTE: DESACTIVAR EL BODY PARSER DE VERCEL
// Necesitamos el body CRUDO (raw) para que la firma HMAC coincida
// exactamente con lo que NOWPayments firmó. Si dejamos que Vercel
// lo parsee primero, JSON.stringify() nunca reproduce el mismo
// string byte por byte y la firma SIEMPRE fallará.
// ================================================================
export const config = {
    api: {
        bodyParser: false,
    },
};

// ================================================================
// 📦 LEER BODY CRUDO
// ================================================================
function leerRawBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

// ================================================================
// 🛡️ VERIFICAR FIRMA IPN (HMAC-SHA512) SOBRE EL RAW BODY
// ================================================================
function verificarFirmaIPN(rawBody, firmaRecibida) {
    try {
        const hmac = crypto.createHmac('sha512', NOWPAYMENTS_IPN_KEY);
        hmac.update(rawBody);
        const firmaCalculada = hmac.digest('hex');

        const bufCalculada = Buffer.from(firmaCalculada, 'hex');
        const bufRecibida = Buffer.from(firmaRecibida, 'hex');

        if (bufCalculada.length !== bufRecibida.length) {
            console.log('🔐 Firma: ❌ Inválida (longitud distinta)');
            return false;
        }

        const comparar = crypto.timingSafeEqual(bufCalculada, bufRecibida);
        console.log(`🔐 Firma: ${comparar ? '✅ Válida' : '❌ Inválida'}`);
        return comparar;

    } catch (error) {
        console.error('❌ Error verificando firma:', error.message);
        return false;
    }
}

// ================================================================
// 📦 OBTENER PLAN eSIM
// ================================================================
async function obtenerPlanEsim(planId) {
    const { data, error } = await supabase
        .from('planes_esim')
        .select('*')
        .eq('id', planId)
        .single();

    if (error || !data) {
        console.error('❌ Error obteniendo plan:', error?.message);
        throw new Error('Plan no encontrado');
    }

    return data;
}

// ================================================================
// 📦 OBTENER ORDEN
// ================================================================
async function obtenerOrden(paymentId) {
    const { data, error } = await supabase
        .from('ordenes_esim')
        .select('*')
        .eq('nowpayments_payment_id', paymentId)
        .single();

    if (error && error.code === 'PGRST116') {
        return null; // No encontrada
    }
    if (error) {
        console.error('❌ Error obteniendo orden:', error.message);
        throw error;
    }
    return data;
}

// ================================================================
// 📦 ACTUALIZAR ORDEN (pagada) — solo columnas que existen
// ================================================================
async function marcarOrdenPagada(ordenId, suscripcionId) {
    const { error } = await supabase
        .from('ordenes_esim')
        .update({
            estado: 'pagada',
            suscripcion_id: suscripcionId
        })
        .eq('id', ordenId);

    if (error) {
        console.error('❌ Error marcando orden pagada:', error.message);
        throw error;
    }
    console.log(`✅ Orden ${ordenId} marcada como pagada`);
}

// ================================================================
// 🔌 ACTIVAR SIM EN TELNYX
// ================================================================
async function activarSimTelnyx(plan) {
    const response = await fetch('https://api.telnyx.com/v2/sim_cards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TELNYX_API_KEY}`
        },
        body: JSON.stringify({
            data: {
                type: 'sim_card',
                attributes: {
                    status: 'enabled',
                    data_limit: plan.datos_mb || 0,
                    tags: ['esim', 'csariels', `plan_${plan.id}`],
                    name: `eSIM-${plan.nombre}-${Date.now()}`
                }
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Telnyx error:', errorData);
        throw new Error(`Telnyx API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
}

// ================================================================
// 📦 CREAR SUSCRIPCIÓN — columnas alineadas al schema real
// ================================================================
async function crearSuscripcion(orden, telnyxSimId, plan) {
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + (plan.dias_vigencia || 30));

    const { data, error } = await supabase
        .from('suscripciones_esim')
        .insert({
            user_id: orden.user_id,
            plan_id: orden.plan_id,
            telnyx_sim_id: telnyxSimId,
            datos_mb_limite: plan.datos_mb || 0,
            datos_mb_usados: 0,
            estado: 'activa',
            fecha_compra: new Date().toISOString(),
            fecha_expiracion: fechaExpiracion.toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Error creando suscripción:', error.message);
        throw error;
    }
    console.log(`✅ Suscripción creada: ${data.id}`);
    return data;
}

// ================================================================
// 🚀 HANDLER PRINCIPAL
// ================================================================
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    console.log('📨 Webhook NOWPayments recibido');

    let rawBody;
    let body;

    try {
        rawBody = await leerRawBody(req);
        body = JSON.parse(rawBody);
    } catch (error) {
        console.error('❌ Error leyendo/parseando body:', error.message);
        return res.status(400).json({ error: 'Body inválido' });
    }

    try {
        // 1. Verificar firma IPN sobre el RAW body
        const firma = req.headers['x-nowpayments-sig'];
        if (!firma) {
            console.error('❌ Firma IPN faltante');
            return res.status(401).json({ error: 'Firma IPN faltante' });
        }

        const firmaValida = verificarFirmaIPN(rawBody, firma);
        if (!firmaValida) {
            console.error('❌ Firma IPN inválida');
            return res.status(401).json({ error: 'Firma IPN inválida' });
        }

        // 2. Extraer datos
        const { payment_id, payment_status, price_amount, actually_paid } = body;
        console.log(`📦 Payment ID: ${payment_id} | Status: ${payment_status}`);

        // 3. Solo procesar pagos confirmados/finalizados
        if (payment_status !== 'finished' && payment_status !== 'confirmed') {
            console.log(`⏳ Estado ${payment_status} ignorado`);
            return res.status(200).json({ received: true, message: 'Estado ignorado' });
        }

        // 4. Buscar orden
        const orden = await obtenerOrden(payment_id);
        if (!orden) {
            console.error(`❌ Orden ${payment_id} no encontrada`);
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        // 5. Evitar duplicados (replay)
        if (orden.estado === 'pagada') {
            console.log(`⏳ Orden ${payment_id} ya procesada`);
            return res.status(200).json({ received: true, message: 'Ya procesada' });
        }

        // 6. Obtener plan
        const plan = await obtenerPlanEsim(orden.plan_id);
        console.log(`📦 Plan: ${plan.nombre} (${plan.datos_mb} MB)`);

        // 7. Activar SIM en Telnyx
        console.log('🔌 Activando SIM en Telnyx...');
        const telnyxSim = await activarSimTelnyx(plan);
        console.log(`✅ SIM activada: ${telnyxSim.id}`);

        // 8. Crear suscripción
        const suscripcion = await crearSuscripcion(orden, telnyxSim.id, plan);

        // 9. Marcar orden como pagada
        await marcarOrdenPagada(orden.id, suscripcion.id);

        console.log(`✅ Proceso completado para ${payment_id}`);
        return res.status(200).json({
            received: true,
            message: 'Pago procesado y SIM activada'
        });

    } catch (error) {
        console.error('❌ Error en webhook:', error.message);
        return res.status(500).json({
            error: 'Error procesando el webhook',
            message: 'Error interno del servidor'
        });
    }
}