import { config } from '../config.js';

const BASE = 'https://api.nowpayments.io/v1';

export async function createNowpaymentsInvoice({ amount, currency, network, orderId, description }) {
  const payCurrency = currency.toLowerCase(); // usdt/usdc
  const payNetwork = network.toLowerCase();   // trc20/erc20

  const body = {
    price_amount: amount,
    price_currency: 'usd',
    pay_currency: `${payCurrency}${payNetwork ? '_' + payNetwork : ''}`,
    order_id: orderId,
    order_description: description || `Order ${orderId}`
  };

  const resp = await fetch(`${BASE}/payment`, {
    method: 'POST',
    headers: {
      'x-api-key': config.nowpayments.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(`NOWPayments error: ${JSON.stringify(data)}`);

  return {
    externalPaymentId: data.payment_id?.toString() || null,
    checkoutUrl: data.pay_address ? null : null,
    paymentAddress: data.pay_address || null,
    raw: data
  };
    }
