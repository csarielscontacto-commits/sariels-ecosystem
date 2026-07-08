import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 8787),
  env: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,
  paymentProvider: process.env.PAYMENT_PROVIDER || 'nowpayments',

  nowpayments: {
    apiKey: process.env.NOWPAYMENTS_API_KEY,
    ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET
  },

  coinbase: {
    apiKey: process.env.COINBASE_COMMERCE_API_KEY,
    webhookSecret: process.env.COINBASE_WEBHOOK_SECRET
  },

  allowedNetwork: {
    USDT: process.env.USDT_ALLOWED_NETWORK || 'TRC20',
    USDC: process.env.USDC_ALLOWED_NETWORK || 'ERC20'
  }
};
