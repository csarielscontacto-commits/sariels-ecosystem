// ================================================================
// 📝 FeedPage - CSARIEL'S ECOSYSTEM (FEED MODULE)
// ================================================================
// Página principal del feed con publicaciones, creación de posts,
// likes, comentarios y carga infinita.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import { useNotifications } from '../../shared/hooks/useNotifications';
import { PostCard } from '../components/PostCard';
import { CreatePost } from '../components/CreatePost';
import { Spinner } from '../../shared/components/Spinner';
import { EmptyState } from '../../shared/components/EmptyState';

// ================================================================
// 🧩 COMPONENTE PRINCIPAL
// ================================================================

export function FeedPage() {
    // ================================================================
    // 📦 ESTADO Y HOOKS
    // ================================================================

    const {
        posts,
        isLoading,
        isPosting,
        error,
        hasMore,
        loadMore,
        refreshFeed,
        createNewPost,
        likePost,
        addNewComment,
        removePost,
        isAuthenticated,
        user,
    } = usePosts({ limit: 10 });

    const { showNotification } = useNotifications();
    const { setContext, toggleLive } = useMarquinhos();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const observerRef = useRef(null);
    const lastPostRef = useRef(null);

    // ================================================================
    // 🧠 CONTEXTO DE MARQUINHOS
    // ================================================================

    useEffect(() => {
        setContext('feed');
    }, [setContext]);

    // ================================================================
    // 🔄 REFRESCAR CON PULL-TO-REFRESH
    // ================================================================

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refreshFeed();
        setIsRefreshing(false);
    }, [refreshFeed]);

    // ================================================================
    // 📤 CREAR PUBLICACIÓN
    // ================================================================

    const handleCreatePost = useCallback(
        async (contenido, imagen = null) => {
            try {
                const newPost = await createNewPost({ contenido, imagen_url: imagen });
                showNotification('✅ Publicación creada exitosamente', 'success');
                return newPost;
            } catch (error) {
                showNotification(error.message || 'Error al publicar', 'error');
                throw error;
            }
        },
        [createNewPost, showNotification]
    );

    // ================================================================
    // ❤️ DAR LIKE
    // ================================================================

    const handleLike = useCallback(
        async (postId) => {
            try {
                await likePost(postId);
            } catch (error) {
                showNotification(error.message || 'Error al dar like', 'error');
            }
        },
        [likePost, showNotification]
    );

    // ================================================================
    // 💬 AGREGAR COMENTARIO
    // ================================================================

    const handleAddComment = useCallback(
        async (postId, contenido) => {
            try {
                await addNewComment(postId, contenido);
                showNotification('💬 Comentario agregado', 'success');
            } catch (error) {
                showNotification(error.message || 'Error al comentar', 'error');
            }
        },
        [addNewComment, showNotification]
    );

    // ================================================================
    // 🗑️ ELIMINAR PUBLICACIÓN
    // ================================================================

    const handleDeletePost = useCallback(
        async (postId) => {
            if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;
            try {
                await removePost(postId);
                showNotification('🗑️ Publicación eliminada', 'info');
            } catch (error) {
                showNotification(error.message || 'Error al eliminar', 'error');
            }
        },
        [removePost, showNotification]
    );

    // ================================================================
    // ♾️ INFINITE SCROLL (Intersection Observer)
    // ================================================================

    useEffect(() => {
        if (!hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (lastPostRef.current) {
            observer.observe(lastPostRef.current);
        }

        return () => {
            if (lastPostRef.current) {
                observer.unobserve(lastPostRef.current);
            }
        };
    }, [hasMore, isLoading, loadMore, posts]);

    // ================================================================
    // 📤 ESCUCHAR EVENTO DE MARQUINHOS (Live)
    // ================================================================

    useEffect(() => {
        const handleLiveStart = () => {
            showNotification('🔴 Marquinhos: Iniciando transmisión en vivo', 'info');
        };

        window.addEventListener('marquinhos:live:start', handleLiveStart);
        return () => {
            window.removeEventListener('marquinhos:live:start', handleLiveStart);
        };
    }, [showNotification]);

    // ================================================================
    // 🖥️ RENDER
    // ================================================================

    // Estado de carga inicial
    if (isLoading && posts.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner size="lg" className="text-gold-cosmic" />
                <span className="ml-3 text-muted">Cargando publicaciones...</span>
            </div>
        );
    }

    // Estado de error
    if (error && posts.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <EmptyState
                    icon="⚠️"
                    title="Error al cargar el feed"
                    description={error}
                    actionText="Reintentar"
                    onAction={refreshFeed}
                />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-orbitron text-2xl font-bold text-gold-cosmic">
                    📝 Feed
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="btn btn-outline btn-sm"
                    >
                        <i className={`fas fa-sync ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                    </button>
                    {isAuthenticated && user && (
                        <button
                            onClick={toggleLive}
                            className="btn btn-live btn-sm"
                        >
                            <span className="live-dot" />
                            Live
                        </button>
                    )}
                </div>
            </div>

            {/* ===== CREAR PUBLICACIÓN ===== */}
            {isAuthenticated && (
                <CreatePost
                    onSubmit={handleCreatePost}
                    isSubmitting={isPosting}
                    userAvatar={user?.avatar || user?.email?.charAt(0).toUpperCase() || 'U'}
                    userName={user?.nombre || 'Usuario'}
                />
            )}

            {/* ===== PUBLICACIONES ===== */}
            <div className="space-y-4 mt-4">
                {posts.length === 0 ? (
                    <EmptyState
                        icon="📭"
                        title="Sin publicaciones"
                        description="Sé el primero en compartir algo con la comunidad."
                        actionText="Crear publicación"
                        onAction={() => document.getElementById('create-post-input')?.focus()}
                    />
                ) : (
                    posts.map((post, index) => {
                        const isLast = index === posts.length - 1;
                        return (
                            <div
                                key={post.id}
                                ref={isLast ? lastPostRef : null}
                            >
                                <PostCard
                                    post={post}
                                    onLike={handleLike}
                                    onComment={handleAddComment}
                                    onDelete={handleDeletePost}
                                    isOwner={post.usuario_id === user?.id}
                                    currentUser={user}
                                />
                            </div>
                        );
                    })
                )}

                {/* ===== LOADING MORE ===== */}
                {isLoading && posts.length > 0 && (
                    <div className="flex justify-center py-4">
                        <Spinner size="sm" className="text-muted" />
                        <span className="ml-2 text-sm text-muted">Cargando más...</span>
                    </div>
                )}

                {/* ===== SIN MÁS PUBLICACIONES ===== */}
                {!hasMore && posts.length > 0 && (
                    <div className="text-center py-6 text-muted text-sm">
                        <p>📌 Has llegado al final del feed</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FeedPage;