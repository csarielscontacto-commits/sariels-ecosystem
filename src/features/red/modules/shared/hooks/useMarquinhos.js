// ================================================================
// 🧠 MARQUINHOS - ASISTENTE GLOBAL (6 CONTROLES)
// ================================================================

import { useEffect, useState } from 'react';
import { useAuth } from '../shared/hooks/useAuth';
import { useNotifications } from '../shared/hooks/useNotifications';

// ================================================================
// 📦 TIPOS
// ================================================================

type MarquinhosState = {
  isActive: boolean;
  mode: 'idle' | 'listening' | 'processing' | 'speaking';
  context: string;
  controls: {
    voice: boolean;
    camera: boolean;
    screenShare: boolean;
    mic: boolean;
    live: boolean;
    assist: boolean;
  };
  lastCommand: string | null;
};

// ================================================================
// 🔌 CORE DE MARQUINHOS
// ================================================================

class MarquinhosEngine {
  private static instance: MarquinhosEngine;
  private state: MarquinhosState;
  private listeners: ((state: MarquinhosState) => void)[] = [];

  private constructor() {
    this.state = {
      isActive: true,
      mode: 'idle',
      context: '',
      controls: {
        voice: true,
        camera: false,
        screenShare: false,
        mic: false,
        live: false,
        assist: false,
      },
      lastCommand: null,
    };
  }

  static getInstance(): MarquinhosEngine {
    if (!this.instance) {
      this.instance = new MarquinhosEngine();
    }
    return this.instance;
  }

  // ================================================================
  // 🎯 COMANDOS (6 CONTROLES)
  // ================================================================

  // 1. Voice Control (Control por voz)
  enableVoice(): void {
    this.setState({ ...this.state, controls: { ...this.state.controls, voice: true } });
    console.log('🎤 Marquinhos: Modo voz activado');
  }

  disableVoice(): void {
    this.setState({ ...this.state, controls: { ...this.state.controls, voice: false } });
    console.log('🎤 Marquinhos: Modo voz desactivado');
  }

  // 2. Camera (Cámara)
  toggleCamera(): void {
    const current = this.state.controls.camera;
    this.setState({
      ...this.state,
      controls: { ...this.state.controls, camera: !current },
      mode: !current ? 'processing' : 'idle',
    });
    console.log(`📹 Marquinhos: Cámara ${!current ? 'activada' : 'desactivada'}`);
  }

  // 3. Screen Share (Compartir pantalla)
  toggleScreenShare(): void {
    const current = this.state.controls.screenShare;
    this.setState({
      ...this.state,
      controls: { ...this.state.controls, screenShare: !current },
    });
    console.log(`🖥️ Marquinhos: Pantalla ${!current ? 'compartida' : 'dejada de compartir'}`);
  }

  // 4. Mic (Micrófono)
  toggleMic(): void {
    const current = this.state.controls.mic;
    this.setState({
      ...this.state,
      controls: { ...this.state.controls, mic: !current },
      mode: !current ? 'processing' : 'idle',
    });
    console.log(`🎙️ Marquinhos: Micrófono ${!current ? 'activado' : 'desactivado'}`);
  }

  // 5. Live (Transmisión en vivo)
  toggleLive(): void {
    const current = this.state.controls.live;
    this.setState({
      ...this.state,
      controls: { ...this.state.controls, live: !current },
      mode: !current ? 'processing' : 'idle',
    });
    console.log(`🔴 Marquinhos: Transmisión ${!current ? 'iniciada' : 'finalizada'}`);
    // Disparar evento para LiveKit
    if (!current) {
      this.emitEvent('live:start', { userId: this.getUserId() });
    } else {
      this.emitEvent('live:stop', { userId: this.getUserId() });
    }
  }

  // 6. Assist (Asistente inteligente)
  toggleAssist(): void {
    const current = this.state.controls.assist;
    this.setState({
      ...this.state,
      controls: { ...this.state.controls, assist: !current },
      mode: !current ? 'listening' : 'idle',
    });
    console.log(`🧠 Marquinhos: Asistente ${!current ? 'activado' : 'desactivado'}`);
  }

  // ================================================================
  // 📡 EVENTOS Y CONTEXTO
  // ================================================================

  setContext(context: string): void {
    this.setState({ ...this.state, context });
  }

  getState(): MarquinhosState {
    return { ...this.state };
  }

  subscribe(listener: (state: MarquinhosState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private setState(newState: MarquinhosState): void {
    this.state = newState;
    this.listeners.forEach((listener) => listener(this.state));
  }

  private emitEvent(event: string, data: any): void {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  private getUserId(): string | null {
    // Obtener usuario desde el store global
    return localStorage.getItem('csariels_user_id') || null;
  }
}

// ================================================================
// 🪝 HOOK PARA USAR MARQUINHOS
// ================================================================

export function useMarquinhos() {
  const engine = MarquinhosEngine.getInstance();
  const [state, setState] = useState(engine.getState());

  useEffect(() => {
    return engine.subscribe((newState) => {
      setState(newState);
    });
  }, [engine]);

  return {
    state,
    enableVoice: () => engine.enableVoice(),
    disableVoice: () => engine.disableVoice(),
    toggleCamera: () => engine.toggleCamera(),
    toggleScreenShare: () => engine.toggleScreenShare(),
    toggleMic: () => engine.toggleMic(),
    toggleLive: () => engine.toggleLive(),
    toggleAssist: () => engine.toggleAssist(),
    setContext: (context: string) => engine.setContext(context),
  };
}

// ================================================================
// 🧩 COMPONENTE DE INTEGRACIÓN CON MÓDULOS
// ================================================================

export function MarquinhosProvider({ children }: { children: React.ReactNode }) {
  const { state } = useMarquinhos();

  // Escuchar eventos de navegación
  useEffect(() => {
    const handleRouteChange = (e: CustomEvent) => {
      const path = e.detail?.path || window.location.pathname;
      const context = path.split('/')[1] || 'feed';
      const engine = MarquinhosEngine.getInstance();
      engine.setContext(context);
      console.log(`🧠 Marquinhos: Contexto actualizado a "${context}"`);
    };

    window.addEventListener('marquinhos:route', handleRouteChange as EventListener);
    return () => {
      window.removeEventListener('marquinhos:route', handleRouteChange as EventListener);
    };
  }, []);

  return (
    <>
      {children}
      {/* Barra de estado de Marquinhos */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-space-mid/80 backdrop-blur-sm border border-gold-dim rounded-full px-4 py-2 text-xs">
        <span className={`w-2 h-2 rounded-full ${state.isActive ? 'bg-success' : 'bg-danger'}`} />
        <span className="text-gold-cosmic font-mono">Marquinhos</span>
        <span className="text-muted">{state.mode}</span>
      </div>
    </>
  );
}