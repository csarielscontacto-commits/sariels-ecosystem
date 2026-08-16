// ================================================================
// 💰 Monetizacion - CSARIEL'S ECOSYSTEM
// ================================================================
// Módulo comercial: eSIM (80 países) + NowPayments.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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

type User = {
  id: string;
  email?: string;
};

// ================================================================
// 🧩 COMPONENTE PRINCIPAL
// ================================================================

export function MonetizacionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [planes, setPlanes] = useState<PlanESIM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanESIM | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ================================================================
  // 🔐 OBTENER USUARIO
  // ================================================================

  const getUser = useCallback(async () => {
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email || undefined });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('❌ Error obteniendo usuario:', err);
    }
  }, []);

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
      setError(null);
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

        // 2. Crear intento de pago con NowPayments
        const response = await fetch('/api/payments/nowpayments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: plan.id,
            userId: user.id,
            orderId: order.id,
            amount: plan.precio_usd,
            currency: 'USD',
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
    getUser();
    loadPlanes();
  }, [getUser, loadPlanes]);

  // ================================================================
  // 🖥️ RENDER
  // ================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin text-4xl text-yellow-500">⏳</div>
          <p className="mt-4 text-gray-400">Cargando planes eSIM...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-500">{error}</h2>
        <button
          className="mt-4 px-6 py-2 bg-yellow-500 text-black rounded-2xl font-bold hover:bg-yellow-400 transition"
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
        <h1 className="font-orbitron text-2xl font-bold text-yellow-500">
          💰 eSIM Global
        </h1>
        <span className="text-sm text-gray-400">🌍 80 países soportados</span>
      </div>

      {/* ===== PLANES ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {planes.map((plan) => (
          <div
            key={plan.id}
            className={`bg-gray-900/50 border rounded-2xl p-6 transition hover:scale-105 cursor-pointer ${
              selectedPlan?.id === plan.id ? 'border-yellow-500' : 'border-gray-700'
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <h3 className="font-bold text-lg text-white">{plan.nombre}</h3>
              <div className="text-2xl font-orbitron text-yellow-500 my-2">
                {plan.mb >= 1024 ? `${plan.mb / 1024} GB` : `${plan.mb} MB`}
              </div>
              <div className="text-sm text-gray-400">
                {plan.dias} días · {plan.paises.length} países
              </div>
              <div className="text-2xl font-bold text-yellow-500 mt-2">
                ${plan.precio_usd} USD
              </div>
              <button
                className="mt-4 w-full px-4 py-2 bg-yellow-500 text-black rounded-2xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation();
                  processPayment(plan);
                }}
                disabled={isProcessing}
              >
                {isProcessing && selectedPlan?.id === plan.id ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Procesando...
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
      <div className="mt-8 p-4 bg-gray-900/30 border border-gray-700 rounded-2xl">
        <h3 className="font-orbitron text-sm text-yellow-500 mb-2">
          🌐 Cobertura Global
        </h3>
        <p className="text-sm text-gray-300">
          Conecta en más de 80 países con nuestra red eSIM. Sin roaming, sin contratos.
          Activa tu eSIM en minutos y disfruta de datos rápidos y seguros.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">📶 5G/4G</span>
          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">🔒 Seguro</span>
          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">⚡ Activación instantánea</span>
        </div>
      </div>
    </div>
  );
}

export default MonetizacionPage;