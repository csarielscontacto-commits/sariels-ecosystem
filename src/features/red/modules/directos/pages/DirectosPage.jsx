// ================================================================
// 📹 DirectosPage - CSARIEL'S ECOSYSTEM (DIRECTOS MODULE)
// ================================================================
// Página principal de transmisiones en vivo con:
// - Lista de streams activos
// - Reproductor de stream
// - Iniciar transmisión
// - Unirse a transmisión
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useStreams } from '../hooks/useStreams';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import { useNotifications } from '../../shared/hooks/useNotifications';
import { Spinner } from '../../shared/components/Spinner';
import { EmptyState } from '../../shared/components/EmptyState';
import { StreamCard } from '../components/StreamCard';
import { StreamPlayer } from '../components/StreamPlayer';
import { StartStreamModal } from '../components/StartStreamModal';

// ================================================================
// 🧩 COMPONENTE PRINCIPAL
// ================================================================

export function DirectosPage() {
    // ================================================================
    // 📦 ESTADO Y HOOKS
    // ================================================================

    const {
        activeStreams,
        currentStream,
        isStreaming,
        isLoading,
        error,
        token,
        startNewStream,
        endCurrentStream,
        joinStreamById,
        refresh,
        isAuthenticated,
        user,
    } = useStreams({ autoLoad: true });

    const { showNotification } = useNotifications();
    const { setContext, toggleLive, state: marquinhosState } = useMarquinhos();
    const [showStartModal, setShowStartModal] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [selectedStream, setSelectedStream] = useState(null);

    // ================================================================
    // 🧠 CONTEXTO DE MARQUINHOS
    // ================================================================

    useEffect(() => {
        setContext('directos');
    }, [setContext]);

    // ================================================================
    // 🚀 INICIAR TRANSMISIÓN
    // ================================================================

    const handleStartStream = useCallback(
        async (titulo, descripcion) => {
            try {
                await startNewStream(titulo, descripcion);
                setShowStartModal(false);
                showNotification('🔴 Transmisión iniciada exitosamente', 'success');
            } catch (error) {
                showNotification(error.message || 'Error al iniciar transmisión', 'error');
            }
        },
        [startNewStream, showNotification]
    );

    // ================================================================
    // ⏹️ FINALIZAR TRANSMISIÓN
    // ================================================================

    const handleEndStream = useCallback(async () => {
        if (!confirm('¿Estás seguro de finalizar la transmisión?')) return;

        try {
            await endCurrentStream();
            showNotification('⏹️ Transmisión finalizada', 'info');
        } catch (error) {
            showNotification(error.message || 'Error al finalizar transmisión', 'error');
        }
    }, [endCurrentStream, showNotification]);

    // ================================================================
    // 👥 UNIRSE A TRANSMISIÓN
    // ================================================================

    const handleJoinStream = useCallback(
        async (streamId) => {
            setIsJoining(true);
            try {
                const result = await joinStreamById(streamId);
                setSelectedStream(result.stream);
                showNotification(`👋 Te uniste a "${result.stream.titulo}"`, 'success');
            } catch (error) {
                showNotification(error.message || 'Error al unirse a la transmisión', 'error');
            } finally {
                setIsJoining(false);
            }
        },
        [joinStreamById, showNotification]
    );

    // ================================================================
    // 🖥️ RENDER
    // ================================================================

    // Estado de carga inicial
    if (isLoading && activeStreams.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner size="lg" className="text-gold-cosmic" />
                <span className="ml-3 text-muted">Cargando transmisiones...</span>
            </div>
        );
    }

    // Estado de error
    if (error && activeStreams.length === 0) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <EmptyState
                    icon="⚠️"
                    title="Error al cargar transmisiones"
                    description={error}
                    actionText="Reintentar"
                    onAction={refresh}
                />
            </div>
        );
    }

    const liveStreams = activeStreams.filter((s) => s.status === 'live');

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-orbitron text-2xl font-bold text-gold-cosmic">
                    📹 Transmisiones en Vivo
                </h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted">
                        {liveStreams.length} {liveStreams.length === 1 ? 'transmisión activa' : 'transmisiones activas'}
                    </span>
                    {isAuthenticated && !isStreaming && (
                        <button
                            onClick={() => setShowStartModal(true)}
                            className="btn btn-live"
                        >
                            <span className="live-dot" />
                            Iniciar Directo
                        </button>
                    )}
                    {isStreaming && (
                        <button
                            onClick={handleEndStream}
                            className="btn btn-danger"
                        >
                            <i className="fas fa-stop" />
                            Finalizar
                        </button>
                    )}
                    <button
                        onClick={refresh}
                        className="btn btn-outline btn-sm"
                        disabled={isLoading}
                    >
                        <i className={`fas fa-sync ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ===== STREAM ACTIVO (REPRODUCTOR) ===== */}
            {currentStream && token && (
                <div className="mb-6">
                    <StreamPlayer
                        stream={currentStream}
                        token={token}
                        isOwner={currentStream.usuario_id === user?.id}
                        onEnd={handleEndStream}
                    />
                </div>
            )}

            {/* ===== LISTA DE TRANSMISIONES ===== */}
            {liveStreams.length === 0 ? (
                <EmptyState
                    icon="📡"
                    title="Sin transmisiones activas"
                    description="No hay transmisiones en vivo en este momento. ¡Inicia una!"
                    actionText={isAuthenticated ? 'Iniciar Directo' : 'Iniciar sesión para transmitir'}
                    onAction={() => {
                        if (isAuthenticated) {
                            setShowStartModal(true);
                        } else {
                            showNotification('Inicia sesión para transmitir', 'info');
                        }
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveStreams.map((stream) => (
                        <StreamCard
                            key={stream.id}
                            stream={stream}
                            onJoin={() => handleJoinStream(stream.id)}
                            isJoining={isJoining}
                            isCurrent={currentStream?.id === stream.id}
                        />
                    ))}
                </div>
            )}

            {/* ===== MODAL PARA INICIAR TRANSMISIÓN ===== */}
            {showStartModal && (
                <StartStreamModal
                    onClose={() => setShowStartModal(false)}
                    onStart={handleStartStream}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}

export default DirectosPage;