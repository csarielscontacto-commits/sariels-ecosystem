// ================================================================
// 🧠 useMarquinhos - CSARIEL'S ECOSYSTEM (ASSISTANTE REAL)
// ================================================================
// Hook para el asistente Marquinhos con IA, voz, lip sync,
// detección infantil y conexión con Supabase.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ================================================================
// 📦 TIPOS ESTRICTOS
// ================================================================

export type MarquinhosEmotion =
  | 'idle'
  | 'happy'
  | 'loving'
  | 'sad'
  | 'surprised'
  | 'talking'
  | 'waving'
  | 'wink'
  | 'excited'
  | 'thinking'
  | 'caring'
  | 'grateful'
  | 'embarrassed'
  | 'curious'
  | 'tired'
  | 'thrilled'
  | 'ora';

export type MarquinhosState = {
  emotion: MarquinhosEmotion;
  isListening: boolean;
  isSpeaking: boolean;
  isChild: boolean;
  isOnCall: boolean;
  isBluetoothConnected: boolean;
  selectedColor: string;
  caption: string;
  audioLevel: number;
  confidence: number;
};

export type MarquinhosPreferences = {
  user_id: string;
  color_preference: string;
  historial: Array<{ text: string; timestamp: number; profile: string; isChild: boolean }>;
  is_child_mode: boolean;
  updated_at: string;
};

// ================================================================
// 🪝 HOOK PRINCIPAL
// ================================================================

export function useMarquinhos() {
  // ================================================================
  // 📦 ESTADO
  // ================================================================

  const [state, setState] = useState<MarquinhosState>({
    emotion: 'caring',
    isListening: false,
    isSpeaking: false,
    isChild: false,
    isOnCall: false,
    isBluetoothConnected: false,
    selectedColor: '#6C3CE0',
    caption: 'Hola 👋 estoy listo para tu ecosistema.',
    audioLevel: 0,
    confidence: 0,
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<MarquinhosPreferences | null>(null);
  const [history, setHistory] = useState<MarquinhosPreferences['historial']>([]);

  // Refs para el reconocimiento de voz
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isMounted = useRef(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // ================================================================
  // 🔐 OBTENER USUARIO
  // ================================================================

  const getCurrentUser = useCallback(async () => {
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!data?.user) throw new Error('Usuario no autenticado');
      return data.user.id;
    } catch (err) {
      console.error('❌ Error obteniendo usuario:', err);
      return null;
    }
  }, []);

  // ================================================================
  // 📥 CARGAR PREFERENCIAS
  // ================================================================

  const loadPreferences = useCallback(async (uid: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('marquinhos_preferences')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setPreferences(data);
        setHistory(data.historial || []);
        setState((prev) => ({
          ...prev,
          selectedColor: data.color_preference || '#6C3CE0',
          isChild: data.is_child_mode || false,
        }));
        return data;
      } else {
        // Crear preferencias iniciales
        const defaultPrefs = {
          user_id: uid,
          color_preference: '#6C3CE0',
          historial: [],
          is_child_mode: false,
          updated_at: new Date().toISOString(),
        };

        const { data: newData, error: insertError } = await supabase
          .from('marquinhos_preferences')
          .insert(defaultPrefs)
          .select()
          .single();

        if (insertError) throw insertError;

        setPreferences(newData);
        setHistory([]);
        return newData;
      }
    } catch (err) {
      console.error('❌ Error cargando preferencias:', err);
      throw err;
    }
  }, []);

  // ================================================================
  // 📡 SUSCRIPCIÓN REALTIME
  // ================================================================

  const subscribeToPreferences = useCallback((uid: string) => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`marquinhos_preferences:${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'marquinhos_preferences',
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          if (!isMounted.current) return;
          const newData = payload.new as MarquinhosPreferences;
          setPreferences(newData);
          setHistory(newData.historial || []);
          setState((prev) => ({
            ...prev,
            selectedColor: newData.color_preference || prev.selectedColor,
            isChild: newData.is_child_mode || false,
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🧠 Marquinhos: Suscrito a preferencias en Realtime');
        }
      });

    channelRef.current = channel;
  }, []);

  // ================================================================
  // 💾 GUARDAR PREFERENCIAS
  // ================================================================

  const savePreferences = useCallback(async () => {
    if (!userId) return;

    try {
      const payload = {
        user_id: userId,
        color_preference: state.selectedColor,
        historial: history.slice(-50),
        is_child_mode: state.isChild,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('marquinhos_preferences')
        .upsert(payload, { onConflict: 'user_id' });

      if (updateError) throw updateError;
    } catch (err) {
      console.error('❌ Error guardando preferencias:', err);
    }
  }, [userId, state.selectedColor, state.isChild, history]);

  // ================================================================
  // 🎨 CAMBIAR COLOR
  // ================================================================

  const setColor = useCallback(
    (color: string) => {
      setState((prev) => ({ ...prev, selectedColor: color }));
      const root = document.documentElement;
      root.style.setProperty('--color-activo', color);
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      root.style.setProperty('--color-activo-rgb', `${r}, ${g}, ${b}`);
    },
    []
  );

  // ================================================================
  // 👶 DETECCIÓN INFANTIL
  // ================================================================

  const detectChildVoice = useCallback((text: string): boolean => {
    const offensivePatterns = [
      /\b(pendejo|pendeja|wey|güey|chinga|chingar|mamón|mamona|verga|puto|puta|culero|culera|pito|v*rga)\b/i,
    ];

    const childPatterns = [
      /\b(mami|papi|abuelo|abuela|tío|tía|hermano|hermana)\b/i,
      /\b(cole|escuela|maestro|maestra|profesor|clase|amigo|amiga)\b/i,
      /\b(jugar|juego|juguete|diversión|risa|pelota|carro|muñeca)\b/i,
      /\b(me gusta|no me gusta|quiero|tengo miedo|estoy feliz|estoy triste)\b/i,
      /\b(por qué|porqué|cómo|cual|quien|cuando|donde)\b/i,
      /\b(ay|oh|wow|guao|epa|uy|ah)\b/i,
      /\b(ta|pa|ma|na|da)\b/i,
      /[😊😄😁😅😂🤣😍🥰😘😗😙😚]/,
      /\b(mucho|muchísimo|super|re|requete)\b/i,
      /\b(animal|perro|gato|pájaro|pez|conejo|tortuga)\b/i,
      /\b(princesa|príncipe|rey|reina|castillo|dragón|hada)\b/i,
      /\b(robot|avión|nave|espacio|astronauta)\b/i,
      /\b(años|edad|chico|chica|niño|niña|pequeño|pequeña)\b/i,
    ];

    const lower = text.toLowerCase();
    const hasOffensive = offensivePatterns.some((p) => p.test(lower));
    if (hasOffensive) {
      setState((prev) => ({ ...prev, isChild: false }));
      return false;
    }

    let score = 0;
    for (const pattern of childPatterns) {
      const matches = (lower.match(new RegExp(pattern.source, 'gi')) || []).length;
      if (matches > 0) {
        score += matches * 0.15;
      }
    }

    const wordCount = text.split(/\s+/).length;
    if (wordCount < 3) score *= 0.5;

    const questionCount = (text.match(/\?/g) || []).length;
    if (questionCount >= 2) score += 0.2;

    const emotionCount = (text.match(/[😊😄😁😅😂🤣😍🥰😘😗😙😚❤️💕💖]/g) || []).length;
    if (emotionCount > 0) score += 0.15 * emotionCount;

    const isChild = score > 0.4;
    setState((prev) => ({
      ...prev,
      isChild: isChild,
      confidence: Math.min(1, (prev.confidence || 0) + (isChild ? 0.15 : -0.1)),
    }));

    return isChild;
  }, []);

  // ================================================================
  // 🧠 EVALUAR ENTRADA
  // ================================================================

  const evaluateInput = useCallback(
    (text: string) => {
      const isChild = detectChildVoice(text);

      // Guardar en historial
      const entry = {
        text,
        timestamp: Date.now(),
        profile: isChild ? 'infantil' : 'general',
        isChild,
      };

      setHistory((prev) => [...prev.slice(-49), entry]);

      return { isChild, entry };
    },
    [detectChildVoice]
  );

  // ================================================================
  // 🎤 RECONOCIMIENTO DE VOZ
  // ================================================================

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('⚠️ Speech Recognition no soportado');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true }));
      retryCountRef.current = 0;
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const lower = transcript.toLowerCase();
          if (lower.includes('hola marquinhos') || lower.includes('marquinhos')) {
            setState((prev) => ({ ...prev, emotion: 'waving' }));
          }
          evaluateInput(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn('⚠️ Error de reconocimiento:', event.error);
      if (event.error === 'not-allowed') {
        retryCountRef.current = maxRetries;
        setState((prev) => ({ ...prev, isListening: false }));
        return;
      }

      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = [1000, 3000, 6000][retryCountRef.current - 1] || 3000;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          if (state.isListening) {
            try {
              recognition.start();
            } catch (e) {}
          }
        }, delay);
      } else {
        setState((prev) => ({ ...prev, isListening: false }));
      }
    };

    recognition.onend = () => {
      if (retryCountRef.current < maxRetries && state.isListening) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setState((prev) => ({ ...prev, isListening: true }));
    } catch (e) {
      console.warn('⚠️ No se pudo iniciar reconocimiento:', e);
    }
  }, [evaluateInput, state.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  // ================================================================
  // 📞 CONTROL DE LLAMADAS
  // ================================================================

  const handleCallStart = useCallback(() => {
    setState((prev) => ({ ...prev, isOnCall: true }));
  }, []);

  const handleCallEnd = useCallback(() => {
    setState((prev) => ({ ...prev, isOnCall: false }));
  }, []);

  // ================================================================
  // 🚀 INICIALIZAR
  // ================================================================

  useEffect(() => {
    let mounted = true;
    isMounted.current = true;

    const init = async () => {
      try {
        setIsLoading(true);
        const uid = await getCurrentUser();
        if (!mounted) return;

        if (uid) {
          setUserId(uid);
          await loadPreferences(uid);
          subscribeToPreferences(uid);
          startListening();
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error inicializando Marquinhos');
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [getCurrentUser, loadPreferences, subscribeToPreferences, startListening]);

  // ================================================================
  // 💾 GUARDAR AL CAMBIAR
  // ================================================================

  useEffect(() => {
    if (userId) {
      savePreferences();
    }
  }, [userId, state.selectedColor, state.isChild, history, savePreferences]);

  // ================================================================
  // 📤 EXPORTAR
  // ================================================================

  return {
    // Estado
    state,
    userId,
    isLoading,
    error,
    preferences,
    history,

    // Acciones principales
    startListening,
    stopListening,
    evaluateInput,
    detectChildVoice,

    // Controles
    setColor,
    handleCallStart,
    handleCallEnd,

    // Utilidades
    isAuthenticated: !!userId,
    savePreferences,
  };
}

export default useMarquinhos;