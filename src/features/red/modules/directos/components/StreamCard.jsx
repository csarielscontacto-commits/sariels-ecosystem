// ================================================================
// 🧩 StreamCard - CSARIEL'S ECOSYSTEM
// ================================================================

import React from 'react';

export function StreamCard({ stream, onJoin, isJoining, isCurrent }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`directo-card ${stream.status === 'live' ? 'live' : ''}`}>
            <div className="directo-thumbnail">
                <span className="icono">{stream.status === 'live' ? '🔴' : '📹'}</span>
                {stream.status === 'live' && (
                    <>
                        <div className="badge-live">
                            <span className="dot" />
                            LIVE
                        </div>
                        <div className="badge-viewers">
                            <i className="fas fa-eye" />
                            {stream.viewers || 0}
                        </div>
                    </>
                )}
            </div>
            <div className="directo-info">
                <div className="titulo">{stream.titulo}</div>
                <div className="creador">
                    <span className="avatar">
                        {stream.creador?.nombre?.charAt(0) || 'U'}
                    </span>
                    {stream.creador?.nombre || 'Usuario'}
                    {stream.creador?.verificado && (
                        <span className="ml-1 text-success text-xs">✅</span>
                    )}
                </div>
                <div className="meta">
                    <span>
                        <i className="fas fa-eye" />
                        {stream.viewers || 0} viendo
                    </span>
                    <span>
                        <i className="fas fa-clock" />
                        {formatDate(stream.started_at || stream.created_at)}
                    </span>
                </div>
            </div>
            <div className="directo-acciones">
                {isCurrent ? (
                    <button className="btn btn-success btn-sm" disabled>
                        <i className="fas fa-check" /> Viendo
                    </button>
                ) : (
                    <button
                        className={`btn ${stream.status === 'live' ? 'btn-danger' : 'btn-outline'} btn-sm`}
                        onClick={onJoin}
                        disabled={isJoining || stream.status !== 'live'}
                    >
                        {isJoining ? (
                            <>
                                <span className="animate-spin">⏳</span> Uniendo...
                            </>
                        ) : (
                            <>
                                <i className={`fas ${stream.status === 'live' ? 'fa-broadcast' : 'fa-play'}`} />
                                {stream.status === 'live' ? 'Ver Directo' : 'Ver grabación'}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}