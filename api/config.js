// api/config.js
// Endpoint serverless que devuelve SOLO configuración pública al frontend.
// NO incluir service_role, JWT secret ni claves privadas.

export default function handler(req, res) {
  const config = {
    VERSION: process.env.APP_VERSION || '2.1.0',
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'PUBLIC_ANON_KEY_PLACEHOLDER',
    WALLET_PAGOS: {
      direccion: process.env.WALLET_PAGOS_DIRECCION || '',
      red: process.env.WALLET_PAGOS_RED || 'Polygon'
    }
  };

  // Caché corta: ajustar según necesidades
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  // Si necesitas permitir CORS solo para tu frontend:
  // res.setHeader('Access-Control-Allow-Origin', 'https://tu-dominio.com');

  res.status(200).json(config);
}