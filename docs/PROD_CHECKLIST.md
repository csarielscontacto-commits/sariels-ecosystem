# Production Checklist - Sariels Ecosystem

## Seguridad
- [ ] Service Role Key SOLO en backend (nunca frontend)
- [ ] Rotar secretos cada 90 días
- [ ] Activar 2FA en GitHub, Supabase, proveedor de pagos
- [ ] Revisar CORS de producción (dominios exactos)
- [ ] Configurar WAF / rate limit en reverse proxy

## Base de datos
- [ ] Ejecutar 001_init_schema.sql
- [ ] Ejecutar 002_rls_policies.sql
- [ ] Crear usuario admin inicial en profiles
- [ ] Verificar RLS con cuentas seller/support/admin

## Pagos
- [ ] Definir red única por moneda (USDT->TRC20, USDC->ERC20)
- [ ] Configurar API key de proveedor
- [ ] Configurar webhook URL pública HTTPS:
      /api/payments/webhook/nowpayments
- [ ] Validar firma webhook
- [ ] Prueba de idempotencia (mismo evento 2 veces)

## Monitoreo
- [ ] Alertas por webhook 5xx
- [ ] Alertas por caída de API
- [ ] Dashboard de órdenes pending > X minutos
- [ ] Backup diario y restore test mensual

## Legal/Compliance
- [ ] Términos y aviso de riesgo cripto
- [ ] Política KYC/AML según país
- [ ] Facturación / impuestos con contador local
