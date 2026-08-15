// ================================================================
// 🧩 PostCard - CSARIEL'S ECOSYSTEM
// ================================================================
// Componente que muestra una publicación individual con:
// - Header (avatar, nombre, fecha)
// - Contenido (texto + imagen)
// - Acciones (like, comentar, compartir)
// - Sección de comentarios
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState } from 'react';

export function PostCard({
    post,
    onLike,
    onComment,
    onDelete,
    isOwner,
    currentUser,
}) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setIsSubmitting(true);
        try {
            await onComment(post.id, commentText.trim());
            setCommentText('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Ahora';
        if (minutes < 60) return `hace ${minutes} min`;
        if (hours < 24) return `hace ${hours} h`;
        if (days < 7) return `hace ${days} d`;
        return date.toLocaleDateString();
    };

    return (
        <div className="publicacion">
            {/* ===== HEADER ===== */}
            <div className="pub-header">
                <div className="pub-avatar">
                    {post.autor?.foto_perfil_url ? (
                        <img src={post.autor.foto_perfil_url} alt={post.autor.nombre} />
                    ) : (
                        post.autor?.nombre?.charAt(0).toUpperCase() || 'U'
                    )}
                </div>
                <div className="pub-info">
                    <div className="pub-autor">
                        {post.autor?.nombre || 'Usuario'}
                        {post.autor?.verificado && (
                            <span className="ml-1 text-success text-xs">✅</span>
                        )}
                    </div>
                    <div className="pub-fecha">{formatDate(post.created_at)}</div>
                </div>
                {isOwner && (
                    <button className="pub-menu" onClick={() => onDelete(post.id)}>
                        <i className="fas fa-trash text-danger" />
                    </button>
                )}
            </div>

            {/* ===== CONTENIDO ===== */}
            <div className="pub-contenido">
                <p>{post.contenido}</p>
                {post.imagen_url && (
                    <img src={post.imagen_url} alt="Publicación" className="mt-2" />
                )}
            </div>

            {/* ===== ACCIONES ===== */}
            <div className="pub-acciones">
                <button
                    onClick={() => onLike(post.id)}
                    className={post.liked_by_user ? 'liked' : ''}
                >
                    <i className={`fas fa-heart ${post.liked_by_user ? 'text-danger' : ''}`} />
                    <span>{post.likes || 0}</span>
                </button>
                <button onClick={() => setShowComments(!showComments)}>
                    <i className="fas fa-comment" />
                    <span>{post.comentarios || 0}</span>
                </button>
                <button>
                    <i className="fas fa-share" />
                    <span>Compartir</span>
                </button>
            </div>

            {/* ===== COMENTARIOS ===== */}
            {showComments && (
                <div className="pub-comentarios">
                    <div className="space-y-2">
                        {post.comentarios_data?.map((comment) => (
                            <div key={comment.id} className="comentario">
                                <div className="c-avatar">
                                    {comment.autor?.nombre?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="c-texto">
                                    <span className="c-nombre">
                                        {comment.autor?.nombre || 'Usuario'}
                                    </span>
                                    {comment.contenido}
                                    <span className="c-hora">
                                        {formatDate(comment.created_at)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input de comentario */}
                    {currentUser && (
                        <form onSubmit={handleCommentSubmit} className="input-comentario">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Escribe un comentario..."
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                disabled={isSubmitting || !commentText.trim()}
                            >
                                <i className="fas fa-paper-plane" />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

export default PostCard;