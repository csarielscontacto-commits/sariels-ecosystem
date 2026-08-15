// ================================================================
// 🧩 StreamPlayer - CSARIEL'S ECOSYSTEM
// ================================================================
// Reproductor de video en vivo usando LiveKit.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useEffect, useRef, useState } from 'react';

export function StreamPlayer({ stream, token, isOwner, onEnd }) {
    const videoRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [room, setRoom] = useState(null);

    // ================================================================
    // 🚀 INICIALIZAR LIVEKIT
    // ================================================================

    useEffect(() => {
        if (!token || !stream) return;

        let mounted = true;
        let roomInstance = null;

        const initLiveKit = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Verificar que LiveKit está disponible
                if (typeof LivekitClient === 'undefined') {
                    throw new Error('LiveKit no está disponible');
                }

                // Crear room
                const { Room, RoomEvent } = LivekitClient;
                roomInstance = new Room();

                // Configurar eventos del room
                roomInstance.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    if (track.kind === 'video' || track.kind === 'audio') {
                        const element = track.kind === 'video' 
                            ? videoRef.current 
                            : document.createElement('audio');
                        
                        if (element) {
                            track.attach(element);
                            if (track.kind === 'video') {
                                element.autoplay = true;
                                element.muted = isMuted;
                            }
                        }
                    }
                });

                roomInstance.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
                    track.detach();
                });

                roomInstance.on(RoomEvent.Disconnected, () => {
                    if (mounted) {
                        setIsLoading(false);
                        console.log('🔌 Desconectado de LiveKit');
                    }
                });

                // Conectar a la sala
                await roomInstance.connect(
                    process.env.REACT_APP_LIVEKIT_URL || 'wss://csariels-livekit.vercel.app',
                    token
                );

                if (mounted) {
                    setRoom(roomInstance);
                    setIsLoading(false);
                    console.log(`📹 Conectado a la sala: ${stream.room_name}`);
                }

            } catch (err) {
                console.error('❌ Error en LiveKit:', err);
                if (mounted) {
                    setError(err.message || 'Error al conectar con LiveKit');
                    setIsLoading(false);
                }
            }
        };

        initLiveKit();

        return () => {
            mounted = false;
            if (roomInstance) {
                roomInstance.disconnect();
            }
        };
    }, [token, stream, isMuted]);

    // ================================================================
    // 🎯 CONTROLES
    // ================================================================

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // ================================================================
    // 🖥️ RENDER
    // ================================================================

    const formatViewers = (count) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count;
    };

    return (
        <div className="stream-player-container">
            {/* ===== REPRODUCTOR ===== */}
            <div className="stream-player">
                {isLoading ? (
                    <div className="stream-loading">
                        <div className="spinner" />
                        <span className="text-muted">Cargando transmisión...</span>
                    </div>
                ) : error ? (
                    <div className="stream-error">
                        <i className="fas fa-exclamation-triangle text-danger text-3xl" />
                        <p className="text-danger">{error}</p>
                        <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            className="stream-video"
                            autoPlay
                            playsInline
                            muted={isMuted}
                        />
                        
                        {/* Overlay de información */}
                        <div className="stream-overlay">
                            <div className="stream-info-top">
                                <div className="stream-badge-live">
                                    <span className="dot" />
                                    EN VIVO
                                </div>
                                <div className="stream-viewers">
                                    <i className="fas fa-eye" />
                                    {formatViewers(stream.viewers || 0)}
                                </div>
                            </div>
                            <div className="stream-info-bottom">
                                <div className="stream-title">{stream.titulo}</div>
                                <div className="stream-creator">
                                    <span className="avatar">
                                        {stream.creador?.nombre?.charAt(0) || 'U'}
                                    </span>
                                    {stream.creador?.nombre || 'Usuario'}
                                </div>
                            </div>
                        </div>

                        {/* Controles */}
                        <div className="stream-controls">
                            <button
                                className="control-btn"
                                onClick={toggleMute}
                                title={isMuted ? 'Activar sonido' : 'Silenciar'}
                            >
                                <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`} />
                            </button>
                            <button
                                className="control-btn"
                                onClick={toggleFullscreen}
                                title="Pantalla completa"
                            >
                                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`} />
                            </button>
                            {isOwner && (
                                <button
                                    className="control-btn control-btn-danger"
                                    onClick={onEnd}
                                    title="Finalizar transmisión"
                                >
                                    <i className="fas fa-stop" />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ===== INFO DE LA TRANSMISIÓN ===== */}
            <div className="stream-info">
                <div className="stream-title-large">{stream.titulo}</div>
                <div className="stream-meta">
                    <span className="stream-creator-detail">
                        <span className="avatar">
                            {stream.creador?.nombre?.charAt(0) || 'U'}
                        </span>
                        {stream.creador?.nombre || 'Usuario'}
                        {stream.creador?.verificado && (
                            <span className="ml-1 text-success text-xs">✅</span>
                        )}
                    </span>
                    <span className="stream-stats">
                        <i className="fas fa-eye" />
                        {formatViewers(stream.viewers || 0)} viendo
                    </span>
                    <span className="stream-stats">
                        <i className="fas fa-clock" />
                        {new Date(stream.started_at || stream.created_at).toLocaleString()}
                    </span>
                </div>
                {stream.descripcion && (
                    <p className="stream-description">{stream.descripcion}</p>
                )}
            </div>
        </div>
    );
}

export default StreamPlayer;