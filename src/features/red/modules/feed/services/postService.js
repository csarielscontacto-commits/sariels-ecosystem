// ================================================================
// 📝 postService - CSARIEL'S ECOSYSTEM (FEED MODULE)
// ================================================================
// Servicio para gestionar publicaciones, comentarios y reacciones.
// Extrae y refactoriza la lógica de los archivos HTML/JS originales.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { supabase } from '../../shared/services/supabaseClient';
import { getCurrentUser } from '../../shared/services/authService';

// ================================================================
// 📦 TIPOS
// ================================================================

/**
 * @typedef {Object} Post
 * @property {string} id - ID de la publicación
 * @property {string} usuario_id - ID del autor
 * @property {string} contenido - Texto de la publicación
 * @property {string|null} imagen_url - URL de la imagen
 * @property {string} created_at - Fecha de creación
 * @property {number} likes - Cantidad de likes
 * @property {number} comentarios - Cantidad de comentarios
 * @property {Object} autor - Datos del autor (join)
 * @property {string} autor.nombre - Nombre del autor
 * @property {string} autor.foto_perfil_url - Avatar del autor
 * @property {boolean} liked_by_user - Si el usuario actual dio like
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - ID del comentario
 * @property {string} post_id - ID de la publicación
 * @property {string} usuario_id - ID del autor
 * @property {string} contenido - Texto del comentario
 * @property {string} created_at - Fecha de creación
 * @property {Object} autor - Datos del autor (join)
 * @property {string} autor.nombre - Nombre del autor
 * @property {string} autor.foto_perfil_url - Avatar del autor
 */

// ================================================================
// 📥 OBTENER PUBLICACIONES (FEED)
// ================================================================

/**
 * Obtiene las publicaciones del feed con paginación
 * @param {Object} options
 * @param {number} [options.limit=20] - Límite de publicaciones
 * @param {number} [options.offset=0] - Desplazamiento para paginación
 * @param {string} [options.orderBy='created_at'] - Campo para ordenar
 * @param {boolean} [options.ascending=false] - Orden ascendente
 * @returns {Promise<Post[]>}
 */
export async function getFeedPosts(options = {}) {
    const {
        limit = 20,
        offset = 0,
        orderBy = 'created_at',
        ascending = false,
    } = options;

    try {
        const user = await getCurrentUser();
        if (!user) {
            console.warn('⚠️ Usuario no autenticado, obteniendo posts públicos');
        }

        // Obtener publicaciones
        const { data: posts, error } = await supabase
            .from('posts_muro')
            .select(`
                *,
                autor:perfiles!usuario_id (
                    nombre,
                    foto_perfil_url,
                    verificado
                ),
                comentarios_count:comentarios(count)
            `)
            .order(orderBy, { ascending })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        // Procesar datos para el frontend
        const formattedPosts = await Promise.all(
            (posts || []).map(async (post) => {
                // Verificar si el usuario actual dio like
                let likedByUser = false;
                if (user) {
                    const { count, error: likeError } = await supabase
                        .from('likes')
                        .select('id', { count: 'exact', head: true })
                        .eq('post_id', post.id)
                        .eq('usuario_id', user.id);

                    if (!likeError && count > 0) {
                        likedByUser = true;
                    }
                }

                return {
                    id: post.id,
                    usuario_id: post.usuario_id,
                    contenido: post.contenido,
                    imagen_url: post.imagen_url || null,
                    created_at: post.created_at,
                    likes: post.likes || 0,
                    comentarios: post.comentarios_count || 0,
                    autor: post.autor || {
                        nombre: 'Usuario',
                        foto_perfil_url: null,
                        verificado: false,
                    },
                    liked_by_user: likedByUser,
                };
            })
        );

        return formattedPosts;

    } catch (error) {
        console.error('❌ Error en getFeedPosts:', error);
        throw error;
    }
}

// ================================================================
// 📥 OBTENER UNA PUBLICACIÓN POR ID
// ================================================================

/**
 * Obtiene una publicación por su ID
 * @param {string} postId
 * @returns {Promise<Post>}
 */
export async function getPostById(postId) {
    try {
        const user = await getCurrentUser();

        const { data: post, error } = await supabase
            .from('posts_muro')
            .select(`
                *,
                autor:perfiles!usuario_id (
                    nombre,
                    foto_perfil_url,
                    verificado
                ),
                comentarios_count:comentarios(count)
            `)
            .eq('id', postId)
            .single();

        if (error) throw error;

        let likedByUser = false;
        if (user) {
            const { count, error: likeError } = await supabase
                .from('likes')
                .select('id', { count: 'exact', head: true })
                .eq('post_id', post.id)
                .eq('usuario_id', user.id);

            if (!likeError && count > 0) {
                likedByUser = true;
            }
        }

        return {
            id: post.id,
            usuario_id: post.usuario_id,
            contenido: post.contenido,
            imagen_url: post.imagen_url || null,
            created_at: post.created_at,
            likes: post.likes || 0,
            comentarios: post.comentarios_count || 0,
            autor: post.autor || {
                nombre: 'Usuario',
                foto_perfil_url: null,
                verificado: false,
            },
            liked_by_user: likedByUser,
        };

    } catch (error) {
        console.error('❌ Error en getPostById:', error);
        throw error;
    }
}

// ================================================================
// 📤 CREAR PUBLICACIÓN
// ================================================================

/**
 * Crea una nueva publicación
 * @param {Object} data
 * @param {string} data.contenido - Texto de la publicación
 * @param {string} [data.imagen_url] - URL de la imagen
 * @returns {Promise<Post>}
 */
export async function createPost(data) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const { contenido, imagen_url = null } = data;

        if (!contenido || contenido.trim() === '') {
            throw new Error('El contenido no puede estar vacío');
        }

        const { data: post, error } = await supabase
            .from('posts_muro')
            .insert({
                usuario_id: user.id,
                contenido: contenido.trim(),
                imagen_url: imagen_url,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: post.id,
            usuario_id: post.usuario_id,
            contenido: post.contenido,
            imagen_url: post.imagen_url,
            created_at: post.created_at,
            likes: 0,
            comentarios: 0,
            liked_by_user: false,
        };

    } catch (error) {
        console.error('❌ Error en createPost:', error);
        throw error;
    }
}

// ================================================================
// ❤️ GESTIÓN DE LIKES
// ================================================================

/**
 * Da like a una publicación
 * @param {string} postId
 * @returns {Promise<{ liked: boolean, likes: number }>}
 */
export async function toggleLike(postId) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        // Verificar si ya existe el like
        const { data: existingLike, error: findError } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('usuario_id', user.id)
            .maybeSingle();

        if (findError && findError.code !== 'PGRST116') {
            throw findError;
        }

        let liked = false;
        let likesCount = 0;

        if (existingLike) {
            // Eliminar like
            const { error: deleteError } = await supabase
                .from('likes')
                .delete()
                .eq('id', existingLike.id);

            if (deleteError) throw deleteError;
            liked = false;
        } else {
            // Agregar like
            const { error: insertError } = await supabase
                .from('likes')
                .insert({
                    post_id: postId,
                    usuario_id: user.id,
                    created_at: new Date().toISOString(),
                });

            if (insertError) throw insertError;
            liked = true;
        }

        // Obtener conteo actualizado
        const { count, error: countError } = await supabase
            .from('likes')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (countError) throw countError;
        likesCount = count || 0;

        // Actualizar el campo likes en posts_muro (cache)
        await supabase
            .from('posts_muro')
            .update({ likes: likesCount })
            .eq('id', postId);

        return { liked, likes: likesCount };

    } catch (error) {
        console.error('❌ Error en toggleLike:', error);
        throw error;
    }
}

// ================================================================
// 💬 GESTIÓN DE COMENTARIOS
// ================================================================

/**
 * Obtiene los comentarios de una publicación
 * @param {string} postId
 * @param {Object} options
 * @param {number} [options.limit=10]
 * @param {number} [options.offset=0]
 * @returns {Promise<Comment[]>}
 */
export async function getPostComments(postId, options = {}) {
    const { limit = 10, offset = 0 } = options;

    try {
        const { data: comments, error } = await supabase
            .from('comentarios')
            .select(`
                *,
                autor:perfiles!usuario_id (
                    nombre,
                    foto_perfil_url
                )
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return (comments || []).map((comment) => ({
            id: comment.id,
            post_id: comment.post_id,
            usuario_id: comment.usuario_id,
            contenido: comment.contenido,
            created_at: comment.created_at,
            autor: comment.autor || {
                nombre: 'Usuario',
                foto_perfil_url: null,
            },
        }));

    } catch (error) {
        console.error('❌ Error en getPostComments:', error);
        throw error;
    }
}

/**
 * Agrega un comentario a una publicación
 * @param {string} postId
 * @param {string} contenido
 * @returns {Promise<Comment>}
 */
export async function addComment(postId, contenido) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        if (!contenido || contenido.trim() === '') {
            throw new Error('El comentario no puede estar vacío');
        }

        const { data: comment, error } = await supabase
            .from('comentarios')
            .insert({
                post_id: postId,
                usuario_id: user.id,
                contenido: contenido.trim(),
                created_at: new Date().toISOString(),
            })
            .select(`
                *,
                autor:perfiles!usuario_id (
                    nombre,
                    foto_perfil_url
                )
            `)
            .single();

        if (error) throw error;

        // Actualizar contador de comentarios en posts_muro
        const { count, error: countError } = await supabase
            .from('comentarios')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (!countError) {
            await supabase
                .from('posts_muro')
                .update({ comentarios: count || 0 })
                .eq('id', postId);
        }

        return {
            id: comment.id,
            post_id: comment.post_id,
            usuario_id: comment.usuario_id,
            contenido: comment.contenido,
            created_at: comment.created_at,
            autor: comment.autor || {
                nombre: 'Usuario',
                foto_perfil_url: null,
            },
        };

    } catch (error) {
        console.error('❌ Error en addComment:', error);
        throw error;
    }
}

// ================================================================
// 🗑️ ELIMINAR PUBLICACIÓN
// ================================================================

/**
 * Elimina una publicación (solo el autor)
 * @param {string} postId
 * @returns {Promise<void>}
 */
export async function deletePost(postId) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        // Verificar que el usuario es el autor
        const { data: post, error: findError } = await supabase
            .from('posts_muro')
            .select('usuario_id')
            .eq('id', postId)
            .single();

        if (findError) throw findError;

        if (post.usuario_id !== user.id) {
            throw new Error('No tienes permiso para eliminar esta publicación');
        }

        // Eliminar comentarios asociados
        await supabase
            .from('comentarios')
            .delete()
            .eq('post_id', postId);

        // Eliminar likes asociados
        await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId);

        // Eliminar la publicación
        const { error: deleteError } = await supabase
            .from('posts_muro')
            .delete()
            .eq('id', postId);

        if (deleteError) throw deleteError;

        console.log(`🗑️ Publicación ${postId} eliminada`);

    } catch (error) {
        console.error('❌ Error en deletePost:', error);
        throw error;
    }
}

// ================================================================
// 🚀 EXPORTAR
// ================================================================

export default {
    getFeedPosts,
    getPostById,
    createPost,
    toggleLike,
    getPostComments,
    addComment,
    deletePost,
};

console.log('📝 postService cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');