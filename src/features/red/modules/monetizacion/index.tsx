// ================================================================
// 💰 Monetizacion - CSARIEL'S ECOSYSTEM
// ================================================================
// Módulo comercial prioritario: eSIM (80 países) + NowPayments.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../shared/hooks/useAuth';

// ================================================================
// 📦 TIPOS ESTRICTOS
// ================================================================

type PlanESIM = {
  id: string;
  nombre: string;
  mb: number;
  precio_usd: number;
  dias: number;
  paises: string[];
};

type OrdenESIM = {
  id: string;
  user_id: string;
  plan_id: string;
  cantidad_mb: number;
  precio_total: number;
  moneda: 'USD' | 'EUR' | 'MXN';
  status: 'pending' | 'paid' | 'failed' | 'active' | 'expired';
  codigo_qr?: string;
  created_at: string;
  expires_at: string;
};

// ================================================================
// 🧩 COMPONENTE PRINCIPAL
// ================================================================

export function MonetizacionPage() {
  const { user, isAuthenticated } = useAuth();
  const [planes, setPlanes] = useState<PlanESIM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanESIM | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ================================================================
  // 📥 CARGAR PLANES eSIM
  // ================================================================

  const loadPlanes = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('planes_esim')
        .select('*')
        .order('precio_usd', { ascending: true });

      if (fetchError) throw fetchError;

      setPlanes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando planes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ================================================================
  // 💳 PROCESAR PAGO CON NOWPAYMENTS
  // ================================================================

  const processPayment = useCallback(
    async (plan: PlanESIM) => {
      if (!isAuthenticated || !user) {
        setError('Debes iniciar sesión para comprar');
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // 1. Crear orden en Supabase
        const { data: order, error: orderError } = await supabase
          .from('ordenes_esim')
          .insert({
            user_id: user.id,
            plan_id: plan.id,
            cantidad_mb: plan.mb,
            precio_total: plan.precio_usd,
            moneda: 'USD',
            status: 'pending',
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // 2. Crear intento de pago con NowPayments (via serverless)
        const response = await fetch('/api/nowpayments/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            amount: plan.precio_usd,
            currency: 'USD',
            planName: plan.nombre,
            userId: user.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error creando pago');
        }

        const paymentData = await response.json();

        // 3. Redirigir a NowPayments
        if (paymentData.paymentUrl) {
          window.location.href = paymentData.paymentUrl;
        } else {
          throw new Error('No se recibió URL de pago');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error procesando pago');
        setIsProcessing(false);
      }
    },
    [isAuthenticated, user]
  );

  // ================================================================
  // 🚀 CARGA INICIAL
  // ================================================================

  useEffect(() => {
    loadPlanes();
  }, [loadPlanes]);

  // ================================================================
  // 🖥️ RENDER
  // ================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin text-4xl text-gold-cosmic">⏳</div>
          <p className="mt-4 text-muted">Cargando planes eSIM...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-danger">{error}</h2>
        <button
          className="mt-4 btn btn-primary"
          onClick={loadPlanes}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-orbitron text-2xl font-bold text-gold-cosmic">
          💰 eSIM Global
        </h1>
        <span className="text-sm text-muted">🌍 80 países soportados</span>
      </div>

      {/* ===== PLANES ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {planes.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${selectedPlan?.id === plan.id ? 'border-gold-cosmic' : ''}`}
            onClick={() => setSelectedPlan(plan)}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <h3 className="font-bold text-lg">{plan.nombre}</h3>
              <div className="text-2xl font-orbitron text-gold-cosmic my-2">
                {plan.mb >= 1024 ? `${plan.mb / 1024} GB` : `${plan.mb} MB`}
              </div>
              <div className="text-sm text-muted">
                {plan.dias} días · {plan.paises.length} países
              </div>
              <div className="text-2xl font-bold text-gold-cosmic mt-2">
                ${plan.precio_usd} USD
              </div>
              <button
                className="mt-4 btn btn-gold w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  processPayment(plan);
                }}
                disabled={isProcessing}
              >
                {isProcessing && selectedPlan?.id === plan.id ? (
                  <>
                    <span className="animate-spin">⏳</span> Procesando...
                  </>
                ) : (
                  'Comprar ahora'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== INFO ADICIONAL ===== */}
      <div className="mt-8 p-4 bg-space-mid/30 border border-gold-dim rounded-lg">
        <h3 className="font-orbitron text-sm text-gold-cosmic mb-2">
          🌐 Cobertura Global
        </h3>
        <p className="text-sm text-muted">
          Conecta en más de 80 países con nuestra red eSIM. Sin roaming, sin contratos.
          Activa tu eSIM en minutos y disfruta de datos rápidos y seguros.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs bg-gold-dim/20 px-3 py-1 rounded-full">📶 5G/4G</span>
          <span className="text-xs bg-gold-dim/20 px-3 py-1 rounded-full">🔒 Seguro</span>
          <span className="text-xs bg-gold-dim/20 px-3 py-1 rounded-full">⚡ Activación instantánea</span>
        </div>
      </div>
    </div>
  );
}

export default MonetizacionPage;