// ================================================================
// 👤 ProfilePage - CSARIEL'S ECOSYSTEM (SISTEMA MODULE)
// ================================================================
// Página de perfil de usuario con:
// - Avatar y datos personales
// - Estadísticas (amigos, publicaciones, logros)
// - Edición de perfil
// - Verificación
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import { useNotifications } from '../../shared/hooks/useNotifications';
import { supabase } from '@/lib/supabase';

export function ProfilePage() {
  const { user, isAuthenticated, profile } = useAuth();
  const { setContext } = useMarquinhos();
  const { showNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    amigos: 0,
    publicaciones: 0,
    logros: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    bio: '',
    ubicacion: '',
  });

  useEffect(() => {
    setContext('profile');
    loadStats();
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        bio: profile.bio || '',
        ubicacion: profile.ubicacion || '',
      });
    }
  }, [profile]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Contar amigos
      const { count: amigos } = await supabase
        .from('relaciones_contactos')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('tipo', 'contacto');

      // Contar publicaciones
      const { count: publicaciones } = await supabase
        .from('posts_muro')
        .select('id', { count: 'exact' })
        .eq('usuario_id', user.id);

      setStats({
        amigos: amigos || 0,
        publicaciones: publicaciones || 0,
        logros: 0, // TODO: Implementar tabla de logros
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre: formData.nombre,
          bio: formData.bio,
          ubicacion: formData.ubicacion,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      showNotification('✅ Perfil actualizado', 'success');
      setIsEditing(false);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Error al guardar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${formData.nombre || 'Usuario'}`,
        text: `¡Mira mi perfil en Csariel's! 🚀`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification('✅ Enlace copiado al portapapeles', 'success');
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white">Inicia sesión para ver tu perfil</h2>
        <a
          href="/"
          className="mt-4 inline-block px-6 py-2 bg-yellow-500 text-black rounded-2xl font-bold hover:bg-yellow-400 transition"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-orbitron text-2xl font-bold text-yellow-500">
          👤 Mi Perfil
        </h1>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-yellow-500 text-black rounded-2xl font-bold hover:bg-yellow-400 transition"
              >
                <i className="fas fa-pen mr-2" />
                Editar
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-gray-700 text-white rounded-2xl font-bold hover:bg-gray-600 transition"
              >
                <i className="fas fa-share mr-2" />
                Compartir
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-2xl font-bold hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-yellow-500 text-black rounded-2xl font-bold hover:bg-yellow-400 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  <i className="fas fa-save mr-2" />
                )}
                Guardar
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== PERFIL ===== */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
            {profile?.foto_perfil_url ? (
              <img
                src={profile.foto_perfil_url}
                alt={profile.nombre || 'Usuario'}
                className="w-full h-full object-cover"
              />
            ) : (
              (formData.nombre || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">
              {formData.nombre || 'Usuario'}
            </h2>
            {profile?.verificado && (
              <span className="text-green-400 text-sm">✅</span>
            )}
          </div>
          <p className="text-gray-400 text-sm">@{user?.email?.split('@')[0] || 'usuario'}</p>
        </div>

        {/* Información */}
        <div className="space-y-4">
          {isEditing ? (
            // Modo edición
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Biografía</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500 resize-none"
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Ubicación</label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Ej: CDMX, México"
                />
              </div>
            </>
          ) : (
            // Modo vista
            <>
              {profile?.bio && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Biografía</h3>
                  <p className="text-white">{profile.bio}</p>
                </div>
              )}
              {profile?.ubicacion && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Ubicación</h3>
                  <p className="text-white">
                    <i className="fas fa-map-marker-alt text-yellow-500 mr-2" />
                    {profile.ubicacion}
                  </p>
                </div>
              )}
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Miembro desde</h3>
                <p className="text-white">
                  {new Date(user?.created_at || Date.now()).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Estadísticas */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-500">{stats.amigos}</div>
              <div className="text-sm text-gray-400">Amigos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">{stats.publicaciones}</div>
              <div className="text-sm text-gray-400">Publicaciones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">{stats.logros}</div>
              <div className="text-sm text-gray-400">Logros</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;