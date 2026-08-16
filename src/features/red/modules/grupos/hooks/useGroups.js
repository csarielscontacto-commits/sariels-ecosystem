// ================================================================
// 🪝 useGroups - CSARIEL'S ECOSYSTEM (GRUPOS MODULE)
// ================================================================
// Hook para gestionar grupos comunitarios.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getUserGroups,
    getPublicGroups,
    getGroupById,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    getGroupMembers,
} from '../services/groupService';
import { useAuth } from '../../shared/hooks/useAuth';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';

// ================================================================
// 📦 TIPOS
// ================================================================

/**
 * @typedef {Object} GroupsState
 * @property {Group[]} myGroups - Mis grupos
 * @property {Group[]} publicGroups - Grupos públicos
 * @property {Group|null} currentGroup - Grupo actual
 * @property {Object[]} members - Miembros del grupo actual
 * @property {boolean} isLoading - Estado de carga
 * @property {string|null} error - Mensaje de error
 */

// ================================================================
// 🪝 HOOK PRINCIPAL
// ================================================================

/**
 * Hook para gestionar grupos
 * @param {Object} options
 * @param {boolean} [options.autoLoad=true] - Cargar al montar
 * @returns {Object} Estado y acciones de grupos
 */
export function useGroups(options = {}) {
    const { autoLoad = true } = options;

    // ================================================================
    // 📦 ESTADO
    // ================================================================

    const [state, setState] = useState({
        myGroups: [],
        publicGroups: [],
        currentGroup: null,
        members: [],
        isLoading: false,
        error: null,
    });

    // Refs
    const isMounted = useRef(true);
    const loadingRef = useRef(false);

    // Hooks
    const { user, isAuthenticated } = useAuth();
    const { setContext } = useMarquinhos();

    // ================================================================
    // 🧠 CONTEXTO DE MARQUINHOS
    // ================================================================

    useEffect(() => {
        setContext('grupos');
    }, [setContext]);

    // ================================================================
    // 📥 CARGAR MIS GRUPOS
    // ================================================================

    const loadMyGroups = useCallback(async () => {
        if (!isAuthenticated) {
            setState((prev) => ({ ...prev, myGroups: [] }));
            return;
        }

        if (loadingRef.current) return;

        loadingRef.current = true;
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const groups = await getUserGroups();

            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    myGroups: groups,
                    isLoading: false,
                }));
            }
        } catch (error) {
            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'Error al cargar tus grupos',
                }));
            }
            console.error('❌ Error en loadMyGroups:', error);
        } finally {
            loadingRef.current = false;
        }
    }, [isAuthenticated]);

    // ================================================================
    // 📥 CARGAR GRUPOS PÚBLICOS
    // ================================================================

    const loadPublicGroups = useCallback(async () => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const groups = await getPublicGroups();

            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    publicGroups: groups,
                    isLoading: false,
                }));
            }
        } catch (error) {
            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'Error al cargar grupos públicos',
                }));
            }
            console.error('❌ Error en loadPublicGroups:', error);
        } finally {
            loadingRef.current = false;
        }
    }, []);

    // ================================================================
    // 📥 CARGAR GRUPO POR ID
    // ================================================================

    const loadGroupById = useCallback(async (groupId) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const group = await getGroupById(groupId);

            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    currentGroup: group,
                    isLoading: false,
                }));
            }

            // Cargar miembros
            await loadMembers(groupId);

            return group;

        } catch (error) {
            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'Error al cargar el grupo',
                }));
            }
            console.error('❌ Error en loadGroupById:', error);
            throw error;
        }
    }, []);

    // ================================================================
    // 👥 CARGAR MIEMBROS
    // ================================================================

    const loadMembers = useCallback(async (groupId) => {
        try {
            const members = await getGroupMembers(groupId);

            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    members,
                }));
            }
        } catch (error) {
            console.error('❌ Error en loadMembers:', error);
        }
    }, []);

    // ================================================================
    // 📤 CREAR GRUPO
    // ================================================================

    const createNewGroup = useCallback(
        async (data) => {
            if (!isAuthenticated) {
                throw new Error('Debes iniciar sesión para crear un grupo');
            }

            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                const newGroup = await createGroup(data);

                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        myGroups: [newGroup, ...prev.myGroups],
                        currentGroup: newGroup,
                        isLoading: false,
                    }));
                }

                console.log(`👥 Grupo creado: ${newGroup.nombre}`);
                return newGroup;

            } catch (error) {
                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: error.message || 'Error al crear el grupo',
                    }));
                }
                throw error;
            }
        },
        [isAuthenticated]
    );

    // ================================================================
    # 📤 UNIRSE A GRUPO
    // ================================================================

    const joinGroupById = useCallback(
        async (groupId) => {
            if (!isAuthenticated) {
                throw new Error('Debes iniciar sesión para unirte');
            }

            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                await joinGroup(groupId);

                // Recargar grupos
                await Promise.all([loadMyGroups(), loadPublicGroups()]);

                // Recargar grupo actual si es el mismo
                if (state.currentGroup?.id === groupId) {
                    await loadGroupById(groupId);
                }

                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                }

                console.log(`👥 Te uniste al grupo`);

            } catch (error) {
                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: error.message || 'Error al unirte al grupo',
                    }));
                }
                throw error;
            }
        },
        [isAuthenticated, loadMyGroups, loadPublicGroups, loadGroupById, state.currentGroup?.id]
    );

    // ================================================================
    # 🚪 SALIR DE GRUPO
    // ================================================================

    const leaveGroupById = useCallback(
        async (groupId) => {
            if (!isAuthenticated) {
                throw new Error('Debes iniciar sesión');
            }

            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                await leaveGroup(groupId);

                // Recargar grupos
                await Promise.all([loadMyGroups(), loadPublicGroups()]);

                // Limpiar grupo actual si es el mismo
                if (state.currentGroup?.id === groupId) {
                    setState((prev) => ({
                        ...prev,
                        currentGroup: null,
                        members: [],
                    }));
                }

                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                }

                console.log(`👥 Saliste del grupo`);

            } catch (error) {
                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: error.message || 'Error al salir del grupo',
                    }));
                }
                throw error;
            }
        },
        [isAuthenticated, loadMyGroups, loadPublicGroups, state.currentGroup?.id]
    );

    // ================================================================
    # 🗑️ ELIMINAR GRUPO
    // ================================================================

    const deleteGroupById = useCallback(
        async (groupId) => {
            if (!isAuthenticated) {
                throw new Error('Debes iniciar sesión');
            }

            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                await deleteGroup(groupId);

                // Recargar grupos
                await Promise.all([loadMyGroups(), loadPublicGroups()]);

                // Limpiar grupo actual si es el mismo
                if (state.currentGroup?.id === groupId) {
                    setState((prev) => ({
                        ...prev,
                        currentGroup: null,
                        members: [],
                    }));
                }

                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                }

                console.log(`🗑️ Grupo eliminado`);

            } catch (error) {
                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: error.message || 'Error al eliminar el grupo',
                    }));
                }
                throw error;
            }
        },
        [isAuthenticated, loadMyGroups, loadPublicGroups, state.currentGroup?.id]
    );

    // ================================================================
    // 🔄 REFRESCAR
    // ================================================================

    const refresh = useCallback(async () => {
        await Promise.all([loadMyGroups(), loadPublicGroups()]);
    }, [loadMyGroups, loadPublicGroups]);

    // ================================================================
    // 🚀 CARGA INICIAL
    // ================================================================

    useEffect(() => {
        if (autoLoad) {
            loadMyGroups();
            loadPublicGroups();
        }

        return () => {
            isMounted.current = false;
        };
    }, [autoLoad, loadMyGroups, loadPublicGroups]);

    // ================================================================
    // 📤 EXPORTAR
    // ================================================================

    return {
        // Estado
        myGroups: state.myGroups,
        publicGroups: state.publicGroups,
        currentGroup: state.currentGroup,
        members: state.members,
        isLoading: state.isLoading,
        error: state.error,

        // Acciones
        loadMyGroups,
        loadPublicGroups,
        loadGroupById,
        loadMembers,
        createNewGroup,
        joinGroupById,
        leaveGroupById,
        deleteGroupById,
        refresh,

        // Utilidades
        isAuthenticated,
        user,
    };
}

// ================================================================
// 📦 EXPORTAR
// ================================================================

export default {
    useGroups,
};

console.log('🪝 useGroups cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');