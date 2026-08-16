// ================================================================
// 🧠 useMarquinhosRig - CSARIEL'S ECOSYSTEM (RIG 3D REAL)
// ================================================================
// Hook para controlar el rig facial y corporal del avatar 3D.
// 6 controles: brows, eyes, mouth, cheeks, jaw, body.
// Conectado a Supabase con Realtime.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ================================================================
// 📦 TIPOS ESTRICTOS
// ================================================================

export type MarquinhosControl =
  | 'brows'
  | 'eyes'
  | 'mouth'
  | 'cheeks'
  | 'jaw'
  | 'body';

export type MarquinhosRigState = {
  brows: number;
  eyes: number;
  mouth: number;
  cheeks: number;
  jaw: number;
  body: number;
};

export type MarquinhosRigConfig = {
  userId: string;
  state: MarquinhosRigState;
  lastUpdated: string;
  isActive: boolean;
};

// ================================================================
// 🪝 HOOK PRINCIPAL
// ================================================================

export function useMarquinhosRig() {
  const [state, setState] = useState<MarquinhosRigState>({
    brows: 50,
    eyes: 50,
    mouth: 50,
    cheeks: 50,
    jaw: 50,
    body: 50,
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMounted = useRef<boolean>(true);

  // ================================================================
  // 🔐 OBTENER USUARIO
  // ================================================================

  const getCurrentUser = useCallback(async (): Promise<string> => {
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!data?.user) throw new Error('Usuario no autenticado');
      return data.user.id;
    } catch (err) {
      console.error('❌ Error obteniendo usuario:', err);
      throw err;
    }
  }, []);

  // ================================================================
  // 📥 CARGAR ESTADO DEL RIG
  // ================================================================

  const loadRigState = useCallback(async (uid: string): Promise<void> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('marquinhos_rig_state')
        .select('state, is_active')
        .eq('user_id', uid)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        const rigState = data.state as MarquinhosRigState;
        setState({
          brows: rigState?.brows ?? 50,
          eyes: rigState?.eyes ?? 50,
          mouth: rigState?.mouth ?? 50,
          cheeks: rigState?.cheeks ?? 50,
          jaw: rigState?.jaw ?? 50,
          body: rigState?.body ?? 50,
        });
        setIsActive(data.is_active ?? true);
      } else {
        const defaultState: MarquinhosRigState = {
          brows: 50,
          eyes: 50,
          mouth: 50,
          cheeks: 50,
          jaw: 50,
          body: 50,
        };

        const { error: insertError } = await supabase
          .from('marquinhos_rig_state')
          .insert({
            user_id: uid,
            state: defaultState,
            is_active: true,
            last_updated: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        setState(defaultState);
        setIsActive(true);
      }
    } catch (err) {
      console.error('❌ Error cargando rig:', err);
      throw err;
    }
  }, []);

  // ================================================================
  // 📡 SUSCRIPCIÓN REALTIME
  // ================================================================

  const subscribeToRigChanges = useCallback((uid: string): void => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`marquinhos_rig:${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'marquinhos_rig_state',
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          if (!isMounted.current) return;

          const newState = payload.new as { state: MarquinhosRigState; is_active: boolean };
          if (newState?.state) {
            setState({
              brows: newState.state.brows ?? 50,
              eyes: newState.state.eyes ?? 50,
              mouth: newState.state.mouth ?? 50,
              cheeks: newState.state.cheeks ?? 50,
              jaw: newState.state.jaw ?? 50,
              body: newState.state.body ?? 50,
            });
          }
          if (typeof newState?.is_active === 'boolean') {
            setIsActive(newState.is_active);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🧠 Marquinhos Rig: Suscrito a Realtime');
        }
      });

    channelRef.current = channel;
  }, []);

  // ================================================================
  // 📤 ACTUALIZAR CONTROL
  // ================================================================

  const updateControl = useCallback(
    async (control: MarquinhosControl, value: number): Promise<void> => {
      if (!userId) return;

      const clampedValue = Math.max(0, Math.min(100, value));

      setState((prev) => ({
        ...prev,
        [control]: clampedValue,
      }));

      try {
        const newState = { ...state, [control]: clampedValue };
        const { error: updateError } = await supabase
          .from('marquinhos_rig_state')
          .update({
            state: newState,
            last_updated: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } catch (err) {
        console.error('❌ Error actualizando control:', err);
        // Revertir en caso de error
        setState((prev) => ({
          ...prev,
          [control]: state[control],
        }));
        throw err;
      }
    },
    [userId, state]
  );

  // ================================================================
  // 🔄 RESETEAR RIG
  // ================================================================

  const resetRig = useCallback(async (): Promise<void> => {
    if (!userId) return;

    const defaultState: MarquinhosRigState = {
      brows: 50,
      eyes: 50,
      mouth: 50,
      cheeks: 50,
      jaw: 50,
      body: 50,
    };

    setState(defaultState);

    try {
      const { error: updateError } = await supabase
        .from('marquinhos_rig_state')
        .update({
          state: defaultState,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('❌ Error resetando rig:', err);
      throw err;
    }
  }, [userId]);

  // ================================================================
  // 🚀 INICIALIZAR
  // ================================================================

  useEffect(() => {
    let mounted = true;
    isMounted.current = true;

    const init = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const uid = await getCurrentUser();
        if (!mounted) return;

        setUserId(uid);
        await loadRigState(uid);
        subscribeToRigChanges(uid);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error inicializando rig');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      isMounted.current = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [getCurrentUser, loadRigState, subscribeToRigChanges]);

  // ================================================================
  // 📤 EXPORTAR
  // ================================================================

  return {
    // Estado
    state,
    isActive,
    isLoading,
    error,
    userId,

    // Controles individuales
    brows: state.brows,
    eyes: state.eyes,
    mouth: state.mouth,
    cheeks: state.cheeks,
    jaw: state.jaw,
    body: state.body,

    // Acciones
    updateControl,
    resetRig,

    // Utilidades
    isAuthenticated: !!userId,
  };
}

export default useMarquinhosRig;