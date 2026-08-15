// ================================================================
// 🪝 useStreams - CSARIEL'S ECOSYSTEM (DIRECTOS MODULE)
// ================================================================
// Hook para gestionar transmisiones en vivo con LiveKit.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getActiveStreams,
    getStreamById,
    startStream,
    endStream,
    joinStream,
    getUserStreamHistory,
} from '../services/streamService';
import { useAuth } from '../../shared/hooks/useAuth';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';

// ================================================================
// 📦 TIPOS
// ================================================================

/**
 * @typedef {Object} StreamsState
 * @property {Stream[]} activeStreams - Transmisiones activas
 * @property {Stream|null} currentStream - Transmisión actual
 * @property {Stream[]} history - Historial de transmisiones
 * @property {boolean} isLoading - Estado de carga
 * @property {boolean} isStreaming - Si el usuario está transmitiendo
 * @property {string|null} error - Mensaje de error
 * @property {string|null} token - Token de LiveKit
 */

// ================================================================
// 🪝 HOOK PRINCIPAL
// ================================================================

/**
 * Hook para gestionar transmisiones en vivo
 * @param {Object} options
 * @param {boolean} [options.autoLoad=true] - Cargar al montar
 * @returns {Object} Estado y acciones de streams
 */
export function useStreams(options = {}) {
    const { autoLoad = true } = options;

    // ================================================================
    // 📦 ESTADO
    // ================================================================

    const [state, setState] = useState({
        activeStreams: [],
        currentStream: null,
        history: [],
        isLoading: false,
        isStreaming: false,
        error: null,
        token: null,
    });

    // Refs
    const isMounted = useRef(true);
    const loadingRef = useRef(false);

    // Hooks
    const { user, isAuthenticated } = useAuth();
    const { setContext, toggleLive, state: marquinhosState } = useMarquinhos();

    // ================================================================
    // 🧠 CONTEXTO DE MARQUINHOS
    // ================================================================

    useEffect(() => {
        setContext('directos');
    }, [setContext]);

    // ================================================================
    // 🔄 CARGAR TRANSMISIONES ACTIVAS
    // ================================================================

    const loadActiveStreams = useCallback(async () => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const streams = await getActiveStreams();

            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    activeStreams: streams,
                    isLoading: false,
                }));
            }
        } catch (error) {
            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'Error al cargar transmisiones',
                }));
            }
            console.error('❌ Error en loadActiveStreams:', error);
        } finally {
            loadingRef.current = false;
        }
    }, []);

    // ================================================================
    // 🚀 INICIAR TRANSMISIÓN
    // ================================================================

    const startNewStream = useCallback(
        async (titulo, descripcion = '') => {
            if (!isAuthenticated) {
                throw new Error('Debes iniciar sesión para transmitir');
            }

            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                const result = await startStream({ titulo, descripcion });

                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        currentStream: result.stream,
                        token: result.token,
                        isStreaming: true,
                        isLoading: false,
                    }));
                }

                // Activar Marquinhos Live
                if (!marquinhosState.controls.live) {
                    toggleLive();
                }

                console.log(`🔴 Transmisión iniciada: ${titulo}`);
                return result;

            } catch (error) {
                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: error.message || 'Error al iniciar transmisión',
                    }));
                }
                throw error;
            }
        },
        [isAuthenticated, toggleLive, marquinhosState.controls.live]
    );

    // ================================================================
    // ⏹️ FINALIZAR TRANSMISIÓN
    // ================================================================

    const endCurrentStream = useCallback(async () => {
        if (!state.currentStream) {
            throw new Error('No hay transmisión activa');
        }

        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            await endStream(state.currentStream.id);

            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    currentStream: null,
                    token: null,
                    isStreaming: false,
                    isLoading: false,
                }));
            }

            // Desactivar Marquinhos Live
            if (marquinhosState.controls.live) {
                toggleLive();
            }

            // Recargar streams activos
            await loadActiveStreams();

            console.log('⏹️ Transmisión finalizada');

        } catch (error) {
            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'Error al finalizar transmisión',
                }));
            }
            throw error;
        }
    }, [state.currentStream, loadActiveStreams, toggleLive, marquinhosState.controls.live]);

    // ================================================================
    // 👥 UNIRSE A TRANSMISIÓN
    // ================================================================

    const joinStreamById = useCallback(
        async (streamId) => {
            if (!isAuthenticated) {
                throw new Error('Debes iniciar sesión para unirte');
            }

            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                const { token, stream } = await joinStream(streamId);

                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        currentStream: stream,
                        token: token,
                        isLoading: false,
                    }));
                }

                return { token, stream };

            } catch (error) {
                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: error.message || 'Error al unirse a la transmisión',
                    }));
                }
                throw error;
            }
        },
        [isAuthenticated]
    );

    // ================================================================
    // 📜 CARGAR HISTORIAL
    // ================================================================

    const loadHistory = useCallback(
        async (userId) => {
            if (!userId) return;

            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                const history = await getUserStreamHistory(userId);

                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        history,
                        isLoading: false,
                    }));
                }
            } catch (error) {
                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: error.message || 'Error al cargar historial',
                    }));
                }
                console.error('❌ Error en loadHistory:', error);
            }
        },
        []
    );

    // ================================================================
    // 🔄 REFRESCAR
    // ================================================================

    const refresh = useCallback(async () => {
        await loadActiveStreams();
        if (user?.id) {
            await loadHistory(user.id);
        }
    }, [loadActiveStreams, loadHistory, user?.id]);

    // ================================================================
    // 🚀 CARGA INICIAL
    // ================================================================

    useEffect(() => {
        if (autoLoad) {
            loadActiveStreams();
            if (user?.id) {
                loadHistory(user.id);
            }
        }

        return () => {
            isMounted.current = false;
        };
    }, [autoLoad, loadActiveStreams, loadHistory, user?.id]);

    // ================================================================
    // 📤 EXPORTAR
    // ================================================================

    return {
        // Estado
        activeStreams: state.activeStreams,
        currentStream: state.currentStream,
        history: state.history,
        isLoading: state.isLoading,
        isStreaming: state.isStreaming,
        error: state.error,
        token: state.token,

        // Acciones
        loadActiveStreams,
        startNewStream,
        endCurrentStream,
        joinStreamById,
        loadHistory,
        refresh,

        // Utilidades
        isAuthenticated,
        user,
    };
}

// ================================================================
// 🪝 HOOK PARA DETALLE DE TRANSMISIÓN
// ================================================================

/**
 * Hook para manejar una transmisión individual
 * @param {string} streamId
 * @returns {Object}
 */
export function useStreamDetail(streamId) {
    const [stream, setStream] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { joinStreamById } = useStreams({ autoLoad: false });

    /**
     * Carga los detalles de la transmisión
     */
    const loadStream = useCallback(async () => {
        if (!streamId) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await getStreamById(streamId);
            setStream(data);
        } catch (error) {
            setError(error.message || 'Error al cargar la transmisión');
            console.error('❌ Error en loadStream:', error);
        } finally {
            setIsLoading(false);
        }
    }, [streamId]);

    /**
     * Unirse a la transmisión
     */
    const handleJoin = useCallback(async () => {
        try {
            const result = await joinStreamById(streamId);
            return result;
        } catch (error) {
            console.error('❌ Error en handleJoin:', error);
            throw error;
        }
    }, [streamId, joinStreamById]);

    // Cargar al montar
    useEffect(() => {
        loadStream();
    }, [loadStream]);

    return {
        stream,
        isLoading,
        error,
        loadStream,
        joinStream: handleJoin,
    };
}

// ================================================================
// 📦 EXPORTAR
// ================================================================

export default {
    useStreams,
    useStreamDetail,
};

console.log('🪝 useStreams cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');