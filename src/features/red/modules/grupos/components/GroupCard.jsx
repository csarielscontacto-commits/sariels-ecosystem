// ================================================================
// 🧩 GroupCard - CSARIEL'S ECOSYSTEM
// ================================================================

import React from 'react';

export function GroupCard({ group, onJoin, onLeave, onDelete, isOwner, isMember, currentUser }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / 86400000);

        if (days < 1) return 'Hoy';
        if (days < 7) return `Hace ${days} días`;
        return date.toLocaleDateString();
    };

    return (
        <div className="grupo-card">
            <div className="grupo-header">
                <div className="grupo-icono">{group.icono || '👥'}</div>
                <div className="grupo-info">
                    <div className="grupo-nombre">{group.nombre}</div>
                    <div className="grupo-descripcion">{group.descripcion || 'Sin descripción'}</div>
                </div>
            </div>

            <div className="grupo-meta">
                <span>
                    <i className="fas fa-users" />
                    {group.miembros || 0} miembros
                </span>
                <span>
                    <i className={`fas ${group.es_privado ? 'fa-lock' : 'fa-globe'}`} />
                    {group.es_privado ? 'Privado' : 'Público'}
                </span>
                <span>
                    <i className="fas fa-clock" />
                    {formatDate(group.created_at)}
                </span>
            </div>

            {group.creador && (
                <div className="grupo-creador">
                    <span className="avatar">
                        {group.creador.nombre?.charAt(0) || 'U'}
                    </span>
                    <span className="creador-nombre">
                        {group.creador.nombre || 'Usuario'}
                        {isOwner && (
                            <span className="admin-badge">👑 Admin</span>
                        )}
                    </span>
                </div>
            )}

            <div className="grupo-acciones">
                {isOwner ? (
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={onDelete}
                    >
                        <i className="fas fa-trash" />
                        Eliminar
                    </button>
                ) : isMember ? (
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={onLeave}
                    >
                        <i className="fas fa-sign-out-alt" />
                        Salir
                    </button>
                ) : (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={onJoin}
                    >
                        <i className="fas fa-user-plus" />
                        Unirse
                    </button>
                )}
                <button className="btn btn-outline btn-sm">
                    <i className="fas fa-comment" />
                    Chat
                </button>
            </div>
        </div>
    );
}