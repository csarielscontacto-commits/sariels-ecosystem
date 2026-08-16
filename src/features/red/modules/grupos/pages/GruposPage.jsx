// ================================================================
// 👥 GruposPage - CSARIEL'S ECOSYSTEM (GRUPOS MODULE)
// ================================================================
// Página principal de grupos con:
// - Lista de mis grupos
// - Lista de grupos públicos
// - Crear grupo
// - Unirse a grupo
// - Ver detalles del grupo
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useGroups } from '../hooks/useGroups';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import { useNotifications } from '../../shared/hooks/useNotifications';
import { Spinner } from '../../shared/components/Spinner';
import { EmptyState } from '../../shared/components/EmptyState';
import { GroupCard } from '../components/GroupCard';
import { CreateGroupModal } from '../components/CreateGroupModal';

export function GruposPage() {
    // ================================================================
    // 📦 ESTADO Y HOOKS
    // ================================================================

    const {
        myGroups,
        publicGroups,
        isLoading,
        error,
        createNewGroup,
        joinGroupById,
        leaveGroupById,
        deleteGroupById,
        refresh,
        isAuthenticated,
        user,
    } = useGroups({ autoLoad: true });

    const { showNotification } = useNotifications();
    const { setContext } = useMarquinhos();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('mis-grupos');

    // ================================================================
    // 🧠 CONTEXTO DE MARQUINHOS
    // ================================================================

    useEffect(() => {
        setContext('grupos');
    }, [setContext]);

    // ================================================================
    // 📤 CREAR GRUPO
    // ================================================================

    const handleCreateGroup = useCallback(
        async (data) => {
            try {
                await createNewGroup(data);
                setShowCreateModal(false);
                showNotification('👥 Grupo creado exitosamente', 'success');
            } catch (error) {
                showNotification(error.message || 'Error al crear grupo', 'error');
            }
        },
        [createNewGroup, showNotification]
    );

    // ================================================================
    # 📤 UNIRSE A GRUPO
    // ================================================================

    const handleJoinGroup = useCallback(
        async (groupId) => {
            try {
                await joinGroupById(groupId);
                showNotification('✅ Te uniste al grupo', 'success');
            } catch (error) {
                showNotification(error.message || 'Error al unirte al grupo', 'error');
            }
        },
        [joinGroupById, showNotification]
    );

    // ================================================================
    # 🚪 SALIR DE GRUPO
    // ================================================================

    const handleLeaveGroup = useCallback(
        async (groupId, groupName) => {
            if (!confirm(`¿Salir del grupo "${groupName}"?`)) return;

            try {
                await leaveGroupById(groupId);
                showNotification('🚪 Saliste del grupo', 'info');
            } catch (error) {
                showNotification(error.message || 'Error al salir del grupo', 'error');
            }
        },
        [leaveGroupById, showNotification]
    );

    // ================================================================
    # 🗑️ ELIMINAR GRUPO
    // ================================================================

    const handleDeleteGroup = useCallback(
        async (groupId, groupName) => {
            if (!confirm(`¿Eliminar el grupo "${groupName}"? Esta acción no se puede deshacer.`)) return;

            try {
                await deleteGroupById(groupId);
                showNotification('🗑️ Grupo eliminado', 'info');
            } catch (error) {
                showNotification(error.message || 'Error al eliminar grupo', 'error');
            }
        },
        [deleteGroupById, showNotification]
    );

    // ================================================================
    // 🖥️ RENDER
    // ================================================================

    // Estado de carga inicial
    if (isLoading && myGroups.length === 0 && publicGroups.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner size="lg" className="text-gold-cosmic" />
                <span className="ml-3 text-muted">Cargando grupos...</span>
            </div>
        );
    }

    // Estado de error
    if (error && myGroups.length === 0 && publicGroups.length === 0) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <EmptyState
                    icon="⚠️"
                    title="Error al cargar grupos"
                    description={error}
                    actionText="Reintentar"
                    onAction={refresh}
                />
            </div>
        );
    }

    const renderGroups = (groups, type) => {
        if (groups.length === 0) {
            const messages = {
                'mis-grupos': {
                    icon: '👥',
                    title: 'No estás en ningún grupo',
                    description: 'Únete a un grupo público o crea el tuyo propio.',
                    actionText: 'Crear grupo',
                    onAction: () => setShowCreateModal(true),
                },
                'publicos': {
                    icon: '🌐',
                    title: 'No hay grupos públicos',
                    description: 'Sé el primero en crear un grupo público.',
                    actionText: 'Crear grupo',
                    onAction: () => setShowCreateModal(true),
                },
            };

            const msg = messages[type] || messages['mis-grupos'];
            return (
                <EmptyState
                    icon={msg.icon}
                    title={msg.title}
                    description={msg.description}
                    actionText={isAuthenticated ? msg.actionText : 'Inicia sesión para crear grupos'}
                    onAction={() => {
                        if (isAuthenticated) {
                            msg.onAction();
                        } else {
                            showNotification('Inicia sesión para crear grupos', 'info');
                        }
                    }}
                />
            );
        }

        return (
            <div className="grupos-grid">
                {groups.map((group) => (
                    <GroupCard
                        key={group.id}
                        group={group}
                        onJoin={() => handleJoinGroup(group.id)}
                        onLeave={() => handleLeaveGroup(group.id, group.nombre)}
                        onDelete={() => handleDeleteGroup(group.id, group.nombre)}
                        isOwner={group.es_admin}
                        isMember={group.es_miembro}
                        currentUser={user}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-orbitron text-2xl font-bold text-gold-cosmic">
                    👥 Grupos
                </h1>
                <div className="flex items-center gap-3">
                    {isAuthenticated && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary"
                        >
                            <i className="fas fa-plus" />
                            Crear Grupo
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

            {/* ===== TABS ===== */}
            <div className="flex gap-2 mb-6 border-b border-gold-dim">
                <button
                    className={`tab-btn ${activeTab === 'mis-grupos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mis-grupos')}
                >
                    <i className="fas fa-users" />
                    Mis Grupos
                    <span className="badge">{myGroups.length}</span>
                </button>
                <button
                    className={`tab-btn ${activeTab === 'publicos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('publicos')}
                >
                    <i className="fas fa-globe" />
                    Públicos
                    <span className="badge">{publicGroups.length}</span>
                </button>
            </div>

            {/* ===== CONTENIDO ===== */}
            <div className="mt-4">
                {activeTab === 'mis-grupos' && renderGroups(myGroups, 'mis-grupos')}
                {activeTab === 'publicos' && renderGroups(publicGroups, 'publicos')}
            </div>

            {/* ===== MODAL CREAR GRUPO ===== */}
            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateGroup}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}

export default GruposPage;