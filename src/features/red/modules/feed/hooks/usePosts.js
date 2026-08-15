// ================================================================
// 🪝 usePosts - CSARIEL'S ECOSYSTEM (FEED MODULE)
// ================================================================
// Hook para gestionar el estado del feed, publicaciones,
// likes y comentarios con caché y optimización.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getFeedPosts,
    getPostById,
    createPost,
    toggleLike,
    getPostComments,
    addComment,
    deletePost,
} from '../services/postService';
import { useAuth } from '../../shared/hooks/useAuth';

// ================================================================
// 📦 TIPOS
// ================================================================

/**
 * @typedef {Object} PostsState
 * @property {Post[]} posts - Lista de publicaciones
 * @property {Post|null} selectedPost - Publicación seleccionada
 * @property {Comment[]} comments - Comentarios de la publicación seleccionada
 * @property {boolean} isLoading - Estado de carga
 * @property {boolean} isPosting - Enviando publicación
 * @property {string|null} error - Mensaje de error
 * @property {number} total - Total de publicaciones
 * @property {number} page - Página actual
 * @property {boolean} hasMore - Si hay más publicaciones
 */

// ================================================================
// 🪝 HOOK PRINCIPAL
// ================================================================

/**
 * Hook para gestionar publicaciones del feed
 * @param {Object} options
 * @param {number} [options.limit=10] - Publicaciones por página
 * @param {boolean} [options.autoLoad=true] - Cargar al montar
 * @returns {Object} Estado y acciones del feed
 */
export function usePosts(options = {}) {
    const { limit = 10, autoLoad = true } = options;

    // ================================================================
    // 📦 ESTADO
    // ================================================================

    const [state, setState] = useState({
        posts: [],
        selectedPost: null,
        comments: [],
        isLoading: false,
        isPosting: false,
        isCommenting: false,
        error: null,
        total: 0,
        page: 0,
        hasMore: true,
    });

    // Refs para controlar cargas duplicadas
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);

    // Obtener usuario actual
    const { user, isAuthenticated } = useAuth();

    // ================================================================
    // 🔄 CARGAR PUBLICACIONES
    // ================================================================

    /**
     * Carga las publicaciones del feed
     * @param {boolean} refresh - Si es refresco (reinicia la lista)
     */
    const loadPosts = useCallback(
        async (refresh = false) => {
            // Evitar cargas duplicadas
            if (loadingRef.current) return;
            if (!hasMoreRef.current && !refresh) return;

            loadingRef.current = true;
            setState((prev) => ({
                ...prev,
                isLoading: true,
                error: null,
            }));

            try {
                const currentPage = refresh ? 0 : state.page;
                const offset = currentPage * limit;

                const posts = await getFeedPosts({
                    limit,
                    offset,
                    orderBy: 'created_at',
                    ascending: false,
                });

                const newPosts = refresh ? posts : [...state.posts, ...posts];
                const hasMore = posts.length === limit;

                setState((prev) => ({
                    ...prev,
                    posts: newPosts,
                    isLoading: false,
                    page: refresh ? 1 : prev.page + 1,
                    hasMore,
                    total: newPosts.length + (hasMore ? limit : 0),
                    error: null,
                }));

                hasMoreRef.current = hasMore;

            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'Error al cargar publicaciones',
                }));
                console.error('❌ Error en loadPosts:', error);
            } finally {
                loadingRef.current = false;
            }
        },
        [limit, state.page, state.posts]
    );

    // ================================================================
    // 🔄 REFRESCAR FEED
    // ================================================================

    /**
     * Refresca el feed desde el inicio
     */
    const refreshFeed = useCallback(async () => {
        hasMoreRef.current = true;
        await loadPosts(true);
    }, [loadPosts]);

    // ================================================================
    // 📥 CARGAR MÁS PUBLICACIONES (PAGINACIÓN)
    // ================================================================

    /**
     * Carga más publicaciones (paginación infinita)
     */
    const loadMore = useCallback(async () => {
        if (state.isLoading || !state.hasMore) return;
        await loadPosts(false);
    }, [state.isLoading, state.hasMore, loadPosts]);

    // ================================================================
    // 📤 CREAR PUBLICACIÓN
    // ================================================================

    /**
     * Crea una nueva publicación
     * @param {Object} data
     * @param {string} data.contenido
     * @param {string} [data.imagen_url]
     * @returns {Promise<Post>}
     */
    const createNewPost = useCallback(
        async (data) => {
            if (!isAuthenticated) {
                throw new Error('Debes iniciar sesión para publicar');
            }

            setState((prev) => ({ ...prev, isPosting: true, error: null }));

            try {
                const newPost = await createPost(data);

                setState((prev) => ({
                    ...prev,
                    posts: [newPost, ...prev.posts],
                    isPosting: false,
                    total: prev.total + 1,
                }));

                return newPost;

            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    isPosting: false,
                    error: error.message || 'Error al crear publicación',
                }));
                throw error;
            }
        },
        [isAuthenticated]
    );

    // ================================================================
    // ❤️ DAR LIKE
    // ================================================================

    /**
     * Da o quita like a una publicación
     * @param {string} postId
     */
    const likePost = useCallback(async (postId) => {
        try {
            // Optimistic update
            setState((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              liked_by_user: !post.liked_by_user,
                              likes: post.liked_by_user ? post.likes - 1 : post.likes + 1,
                          }
                        : post
                ),
            }));

            const result = await toggleLike(postId);

            // Actualizar con el resultado real
            setState((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              liked_by_user: result.liked,
                              likes: result.likes,
                          }
                        : post
                ),
            }));

        } catch (error) {
            // Revertir en caso de error
            setState((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              liked_by_user: !post.liked_by_user,
                              likes: post.liked_by_user ? post.likes + 1 : post.likes - 1,
                          }
                        : post
                ),
                error: error.message || 'Error al dar like',
            }));
            console.error('❌ Error en likePost:', error);
        }
    }, []);

    // ================================================================
    // 💬 COMENTARIOS
    // ================================================================

    /**
     * Carga los comentarios de una publicación
     * @param {string} postId
     */
    const loadComments = useCallback(async (postId) => {
        setState((prev) => ({ ...prev, isLoading: true }));

        try {
            const comments = await getPostComments(postId);
            setState((prev) => ({
                ...prev,
                comments,
                isLoading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Error al cargar comentarios',
            }));
            console.error('❌ Error en loadComments:', error);
        }
    }, []);

    /**
     * Agrega un comentario a una publicación
     * @param {string} postId
     * @param {string} contenido
     */
    const addNewComment = useCallback(
        async (postId, contenido) => {
            if (!isAuthenticated) {
                throw new Error('Debes iniciar sesión para comentar');
            }

            setState((prev) => ({ ...prev, isCommenting: true, error: null }));

            try {
                const newComment = await addComment(postId, contenido);

                setState((prev) => ({
                    ...prev,
                    comments: [...prev.comments, newComment],
                    isCommenting: false,
                    posts: prev.posts.map((post) =>
                        post.id === postId
                            ? { ...post, comentarios: post.comentarios + 1 }
                            : post
                    ),
                }));

                return newComment;

            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    isCommenting: false,
                    error: error.message || 'Error al agregar comentario',
                }));
                throw error;
            }
        },
        [isAuthenticated]
    );

    // ================================================================
    // 🗑️ ELIMINAR PUBLICACIÓN
    // ================================================================

    /**
     * Elimina una publicación
     * @param {string} postId
     */
    const removePost = useCallback(async (postId) => {
        try {
            await deletePost(postId);

            setState((prev) => ({
                ...prev,
                posts: prev.posts.filter((post) => post.id !== postId),
                total: prev.total - 1,
            }));

        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: error.message || 'Error al eliminar publicación',
            }));
            throw error;
        }
    }, []);

    // ================================================================
    // 🚀 CARGA INICIAL
    // ================================================================

    useEffect(() => {
        if (autoLoad) {
            hasMoreRef.current = true;
            loadPosts(true);
        }
    }, [autoLoad, loadPosts]);

    // ================================================================
    // 📤 EXPORTAR
    // ================================================================

    return {
        // Estado
        posts: state.posts,
        selectedPost: state.selectedPost,
        comments: state.comments,
        isLoading: state.isLoading,
        isPosting: state.isPosting,
        isCommenting: state.isCommenting,
        error: state.error,
        total: state.total,
        hasMore: state.hasMore,

        // Acciones
        loadPosts,
        loadMore,
        refreshFeed,
        createNewPost,
        likePost,
        loadComments,
        addNewComment,
        removePost,

        // Utilidades
        isAuthenticated,
        user,
    };
}

// ================================================================
// 🪝 HOOK PARA DETALLE DE PUBLICACIÓN
// ================================================================

/**
 * Hook para manejar una publicación individual con sus comentarios
 * @param {string} postId
 * @returns {Object}
 */
export function usePostDetail(postId) {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { likePost, addNewComment } = usePosts({ autoLoad: false });

    /**
     * Carga la publicación y sus comentarios
     */
    const loadPost = useCallback(async () => {
        if (!postId) return;

        setIsLoading(true);
        setError(null);

        try {
            const [postData, commentsData] = await Promise.all([
                getPostById(postId),
                getPostComments(postId),
            ]);

            setPost(postData);
            setComments(commentsData);

        } catch (error) {
            setError(error.message || 'Error al cargar la publicación');
            console.error('❌ Error en loadPost:', error);
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    /**
     * Like a la publicación
     */
    const handleLike = useCallback(async () => {
        if (!post) return;

        // Optimistic update
        setPost((prev) => ({
            ...prev,
            liked_by_user: !prev.liked_by_user,
            likes: prev.liked_by_user ? prev.likes - 1 : prev.likes + 1,
        }));

        try {
            const result = await toggleLike(post.id);
            setPost((prev) => ({
                ...prev,
                liked_by_user: result.liked,
                likes: result.likes,
            }));
        } catch (error) {
            // Revertir
            setPost((prev) => ({
                ...prev,
                liked_by_user: !prev.liked_by_user,
                likes: prev.liked_by_user ? prev.likes + 1 : prev.likes - 1,
            }));
            console.error('❌ Error en handleLike:', error);
        }
    }, [post]);

    /**
     * Agrega un comentario
     */
    const handleAddComment = useCallback(
        async (contenido) => {
            try {
                const newComment = await addComment(postId, contenido);
                setComments((prev) => [...prev, newComment]);
                setPost((prev) => ({
                    ...prev,
                    comentarios: prev.comentarios + 1,
                }));
                return newComment;
            } catch (error) {
                console.error('❌ Error en handleAddComment:', error);
                throw error;
            }
        },
        [postId]
    );

    // Cargar al montar
    useEffect(() => {
        loadPost();
    }, [loadPost]);

    return {
        post,
        comments,
        isLoading,
        error,
        loadPost,
        handleLike,
        handleAddComment,
    };
}

// ================================================================
// 📦 EXPORTAR
// ================================================================

export default {
    usePosts,
    usePostDetail,
};

console.log('🪝 usePosts cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');