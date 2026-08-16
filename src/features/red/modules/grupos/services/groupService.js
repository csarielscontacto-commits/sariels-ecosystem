// ================================================================
// 👥 groupService - CSARIEL'S ECOSYSTEM (GRUPOS MODULE)
// ================================================================
// Servicio para gestionar grupos comunitarios.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { supabase } from '../../shared/services/supabaseClient';
import { getCurrentUser } from '../../shared/services/authService';

// ================================================================
// 📦 TIPOS
// ================================================================

/**
 * @typedef {Object} Group
 * @property {string} id - ID del grupo
 * @property {string} nombre - Nombre del grupo
 * @property {string} descripcion - Descripción del grupo
 * @property {string} icono - Icono del grupo
 * @property {string} created_at - Fecha de creación
 * @property {number} miembros - Cantidad de miembros
 * @property {boolean} es_privado - Si el grupo es privado
 * @property {boolean} es_admin - Si el usuario es administrador
 * @property {Object} creador - Datos del creador (join)
 * @property {string} creador.nombre - Nombre del creador
 * @property {string} creador.foto_perfil_url - Avatar del creador
 */

// ================================================================
// 📥 OBTENER GRUPOS
// ================================================================

/**
 * Obtiene todos los grupos del usuario
 * @param {Object} options
 * @param {number} [options.limit=20] - Límite de grupos
 * @param {number} [options.offset=0] - Desplazamiento
 * @returns {Promise<Group[]>}
 */
export async function getUserGroups(options = {}) {
    const { limit = 20, offset = 0 } = options;

    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        // Obtener IDs de grupos donde el usuario es miembro
        const { data: membership, error: membershipError } = await supabase
            .from('miembros_grupo')
            .select('grupo_id')
            .eq('usuario_id', user.id);

        if (membershipError) throw membershipError;

        const groupIds = membership.map((m) => m.grupo_id);

        if (groupIds.length === 0) {
            return [];
        }

        // Obtener datos de los grupos
        const { data: groups, error } = await supabase
            .from('grupos')
            .select(`
                *,
                creador:perfiles!creador_id (
                    nombre,
                    foto_perfil_url
                ),
                miembros_count:miembros_grupo(count)
            `)
            .in('id', groupIds)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return groups.map((group) => ({
            id: group.id,
            nombre: group.nombre,
            descripcion: group.descripcion || '',
            icono: group.icono || '👥',
            created_at: group.created_at,
            miembros: group.miembros_count || 0,
            es_privado: group.es_privado || false,
            es_admin: group.creador_id === user.id,
            creador: group.creador || {
                nombre: 'Usuario',
                foto_perfil_url: null,
            },
        }));

    } catch (error) {
        console.error('❌ Error en getUserGroups:', error);
        throw error;
    }
}

/**
 * Obtiene todos los grupos públicos
 * @param {Object} options
 * @param {number} [options.limit=20]
 * @param {number} [options.offset=0]
 * @returns {Promise<Group[]>}
 */
export async function getPublicGroups(options = {}) {
    const { limit = 20, offset = 0 } = options;

    try {
        const { data: groups, error } = await supabase
            .from('grupos')
            .select(`
                *,
                creador:perfiles!creador_id (
                    nombre,
                    foto_perfil_url
                ),
                miembros_count:miembros_grupo(count)
            `)
            .eq('es_privado', false)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        const user = await getCurrentUser();

        return groups.map((group) => ({
            id: group.id,
            nombre: group.nombre,
            descripcion: group.descripcion || '',
            icono: group.icono || '👥',
            created_at: group.created_at,
            miembros: group.miembros_count || 0,
            es_privado: group.es_privado || false,
            es_admin: user ? group.creador_id === user.id : false,
            creador: group.creador || {
                nombre: 'Usuario',
                foto_perfil_url: null,
            },
        }));

    } catch (error) {
        console.error('❌ Error en getPublicGroups:', error);
        throw error;
    }
}

// ================================================================
// 📥 OBTENER GRUPO POR ID
// ================================================================

/**
 * Obtiene un grupo por su ID
 * @param {string} groupId
 * @returns {Promise<Group>}
 */
export async function getGroupById(groupId) {
    try {
        const user = await getCurrentUser();

        const { data: group, error } = await supabase
            .from('grupos')
            .select(`
                *,
                creador:perfiles!creador_id (
                    nombre,
                    foto_perfil_url,
                    verificado
                ),
                miembros_count:miembros_grupo(count)
            `)
            .eq('id', groupId)
            .single();

        if (error) throw error;

        // Verificar si el usuario es miembro
        let es_miembro = false;
        if (user) {
            const { data: membership, error: membershipError } = await supabase
                .from('miembros_grupo')
                .select('id')
                .eq('grupo_id', groupId)
                .eq('usuario_id', user.id)
                .maybeSingle();

            if (!membershipError && membership) {
                es_miembro = true;
            }
        }

        return {
            id: group.id,
            nombre: group.nombre,
            descripcion: group.descripcion || '',
            icono: group.icono || '👥',
            created_at: group.created_at,
            miembros: group.miembros_count || 0,
            es_privado: group.es_privado || false,
            es_admin: user ? group.creador_id === user.id : false,
            es_miembro: es_miembro,
            creador: group.creador || {
                nombre: 'Usuario',
                foto_perfil_url: null,
                verificado: false,
            },
        };

    } catch (error) {
        console.error('❌ Error en getGroupById:', error);
        throw error;
    }
}

// ================================================================
// 📤 CREAR GRUPO
// ================================================================

/**
 * Crea un nuevo grupo
 * @param {Object} data
 * @param {string} data.nombre - Nombre del grupo
 * @param {string} [data.descripcion] - Descripción
 * @param {string} [data.icono] - Icono del grupo
 * @param {boolean} [data.es_privado=false] - Si es privado
 * @returns {Promise<Group>}
 */
export async function createGroup(data) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const { nombre, descripcion = '', icono = '👥', es_privado = false } = data;

        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre es requerido');
        }

        // Crear el grupo
        const { data: group, error } = await supabase
            .from('grupos')
            .insert({
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                icono: icono,
                es_privado: es_privado,
                creador_id: user.id,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        // Agregar al creador como miembro
        await supabase
            .from('miembros_grupo')
            .insert({
                grupo_id: group.id,
                usuario_id: user.id,
                es_admin: true,
                created_at: new Date().toISOString(),
            });

        console.log(`👥 Grupo creado: ${nombre}`);

        return {
            id: group.id,
            nombre: group.nombre,
            descripcion: group.descripcion || '',
            icono: group.icono || '👥',
            created_at: group.created_at,
            miembros: 1,
            es_privado: group.es_privado || false,
            es_admin: true,
            es_miembro: true,
        };

    } catch (error) {
        console.error('❌ Error en createGroup:', error);
        throw error;
    }
}

// ================================================================
# 📤 UNIRSE A GRUPO
// ================================================================

/**
 * Une a un usuario a un grupo
 * @param {string} groupId
 * @returns {Promise<void>}
 */
export async function joinGroup(groupId) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        // Verificar si ya es miembro
        const { data: existing, error: checkError } = await supabase
            .from('miembros_grupo')
            .select('id')
            .eq('grupo_id', groupId)
            .eq('usuario_id', user.id)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existing) {
            throw new Error('Ya eres miembro de este grupo');
        }

        // Agregar miembro
        const { error } = await supabase
            .from('miembros_grupo')
            .insert({
                grupo_id: groupId,
                usuario_id: user.id,
                created_at: new Date().toISOString(),
            });

        if (error) throw error;

        console.log(`👥 Usuario ${user.id} se unió al grupo ${groupId}`);

    } catch (error) {
        console.error('❌ Error en joinGroup:', error);
        throw error;
    }
}

// ================================================================
# 🚪 SALIR DE GRUPO
// ================================================================

/**
 * Remueve a un usuario de un grupo
 * @param {string} groupId
 * @returns {Promise<void>}
 */
export async function leaveGroup(groupId) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const { error } = await supabase
            .from('miembros_grupo')
            .delete()
            .eq('grupo_id', groupId)
            .eq('usuario_id', user.id);

        if (error) throw error;

        console.log(`👥 Usuario ${user.id} salió del grupo ${groupId}`);

    } catch (error) {
        console.error('❌ Error en leaveGroup:', error);
        throw error;
    }
}

// ================================================================
// 🗑️ ELIMINAR GRUPO
// ================================================================

/**
 * Elimina un grupo (solo administradores)
 * @param {string} groupId
 * @returns {Promise<void>}
 */
export async function deleteGroup(groupId) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        // Verificar que el usuario es administrador
        const { data: group, error: findError } = await supabase
            .from('grupos')
            .select('creador_id')
            .eq('id', groupId)
            .single();

        if (findError) throw findError;

        if (group.creador_id !== user.id) {
            throw new Error('No tienes permiso para eliminar este grupo');
        }

        // Eliminar miembros
        await supabase
            .from('miembros_grupo')
            .delete()
            .eq('grupo_id', groupId);

        // Eliminar el grupo
        const { error } = await supabase
            .from('grupos')
            .delete()
            .eq('id', groupId);

        if (error) throw error;

        console.log(`🗑️ Grupo ${groupId} eliminado`);

    } catch (error) {
        console.error('❌ Error en deleteGroup:', error);
        throw error;
    }
}

// ================================================================
// 📤 OBTENER MIEMBROS DEL GRUPO
// ================================================================

/**
 * Obtiene los miembros de un grupo
 * @param {string} groupId
 * @param {Object} options
 * @param {number} [options.limit=20]
 * @returns {Promise<Object[]>}
 */
export async function getGroupMembers(groupId, options = {}) {
    const { limit = 20 } = options;

    try {
        const { data: members, error } = await supabase
            .from('miembros_grupo')
            .select(`
                usuario_id,
                es_admin,
                created_at,
                usuario:perfiles!usuario_id (
                    nombre,
                    foto_perfil_url,
                    verificado
                )
            `)
            .eq('grupo_id', groupId)
            .limit(limit);

        if (error) throw error;

        return members.map((member) => ({
            id: member.usuario_id,
            nombre: member.usuario?.nombre || 'Usuario',
            foto_perfil_url: member.usuario?.foto_perfil_url || null,
            verificado: member.usuario?.verificado || false,
            es_admin: member.es_admin || false,
            joined_at: member.created_at,
        }));

    } catch (error) {
        console.error('❌ Error en getGroupMembers:', error);
        throw error;
    }
}

// ================================================================
// 🚀 EXPORTAR
// ================================================================

export default {
    getUserGroups,
    getPublicGroups,
    getGroupById,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    getGroupMembers,
};

console.log('👥 groupService cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');