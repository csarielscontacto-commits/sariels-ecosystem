// ================================================================
// ⚙️ SettingsPage - CSARIEL'S ECOSYSTEM (SISTEMA MODULE)
// ================================================================
// Página de configuración general con:
// - Perfil
// - Seguridad
// - Notificaciones
// - Privacidad
// - Apariencia
// - Idioma
// - Datos y almacenamiento
// - Ayuda y soporte
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import { useNotifications } from '../../shared/hooks/useNotifications';
import { supabase } from '@/lib/supabase';

type SettingsSection =
  | 'perfil'
  | 'seguridad'
  | 'notificaciones'
  | 'privacidad'
  | 'apariencia'
  | 'idioma'
  | 'datos'
  | 'ayuda';

export function SettingsPage() {
  const { user, isAuthenticated, profile } = useAuth();
  const { setContext } = useMarquinhos();
  const { showNotification } = useNotifications();
  const [activeSection, setActiveSection] = useState<SettingsSection>('perfil');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setContext('settings');
  }, [setContext]);

  // ================================================================
  // 🎨 MANEJAR CAMBIOS
  // ================================================================

  const handleSave = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('perfiles')
        .update(data)
        .eq('user_id', user?.id);

      if (error) throw error;
      showNotification('✅ Configuración guardada', 'success');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Error al guardar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================================
  // 📋 SECCIONES
  // ================================================================

  const sections: { id: SettingsSection; label: string; icon: string }[] = [
    { id: 'perfil', label: 'Perfil', icon: 'fa-user' },
    { id: 'seguridad', label: 'Seguridad', icon: 'fa-shield-alt' },
    { id: 'notificaciones', label: 'Notificaciones', icon: 'fa-bell' },
    { id: 'privacidad', label: 'Privacidad', icon: 'fa-lock' },
    { id: 'apariencia', label: 'Apariencia', icon: 'fa-palette' },
    { id: 'idioma', label: 'Idioma', icon: 'fa-language' },
    { id: 'datos', label: 'Datos y Almacenamiento', icon: 'fa-database' },
    { id: 'ayuda', label: 'Ayuda y Soporte', icon: 'fa-question-circle' },
  ];

  // ================================================================
  // 🖥️ RENDER
  // ================================================================

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-orbitron text-2xl font-bold text-yellow-500 mb-6">
        ⚙️ Configuración
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ===== SIDEBAR ===== */}
        <div className="md:col-span-1">
          <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  activeSection === section.id
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <i className={`fas ${section.icon} w-5`} />
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== CONTENIDO ===== */}
        <div className="md:col-span-3">
          <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
            {/* Perfil */}
            {activeSection === 'perfil' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  <i className="fas fa-user text-yellow-500 mr-2" />
                  Perfil
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                    <input
                      type="text"
                      defaultValue={profile?.nombre || ''}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Biografía</label>
                    <textarea
                      defaultValue={profile?.bio || ''}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={() => handleSave({ nombre: 'Nuevo nombre' })}
                    disabled={isLoading}
                    className="px-6 py-2 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            )}

            {/* Seguridad */}
            {activeSection === 'seguridad' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  <i className="fas fa-shield-alt text-yellow-500 mr-2" />
                  Seguridad
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                    <button className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white hover:border-yellow-500 transition">
                      Cambiar contraseña
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Verificación en 2 pasos</span>
                      <button className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white hover:border-yellow-500 transition">
                        Activar
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Sesiones activas</span>
                      <span className="text-sm text-gray-500">2 dispositivos</span>
                    </div>
                    <button className="mt-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition">
                      Cerrar todas las sesiones
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notificaciones */}
            {activeSection === 'notificaciones' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  <i className="fas fa-bell text-yellow-500 mr-2" />
                  Notificaciones
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Notificaciones push</span>
                    <button className="w-12 h-7 bg-yellow-500 rounded-full relative">
                      <span className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Likes y reacciones</span>
                    <button className="w-12 h-7 bg-yellow-500 rounded-full relative">
                      <span className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Comentarios</span>
                    <button className="w-12 h-7 bg-gray-600 rounded-full relative">
                      <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacidad */}
            {activeSection === 'privacidad' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  <i className="fas fa-lock text-yellow-500 mr-2" />
                  Privacidad
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Perfil público</span>
                    <button className="w-12 h-7 bg-yellow-500 rounded-full relative">
                      <span className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Mostrar estado en línea</span>
                    <button className="w-12 h-7 bg-yellow-500 rounded-full relative">
                      <span className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Quién puede enviarte solicitudes
                    </label>
                    <select className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500">
                      <option>Todos</option>
                      <option>Amigos de amigos</option>
                      <option>Nadie</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Apariencia */}
            {activeSection === 'apariencia' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  <i className="fas fa-palette text-yellow-500 mr-2" />
                  Apariencia
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tema</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Oscuro', 'Claro', 'Sistema'].map((tema) => (
                        <button
                          key={tema}
                          className={`px-4 py-2 rounded-xl border ${
                            tema === 'Oscuro'
                              ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          {tema}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Tamaño de texto
                    </label>
                    <select className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500">
                      <option>Pequeño</option>
                      <option selected>Mediano</option>
                      <option>Grande</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Idioma */}
            {activeSection === 'idioma' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  <i className="fas fa-language text-yellow-500 mr-2" />
                  Idioma
                </h2>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-yellow-500/20 border border-yellow-500 rounded-xl text-yellow-500">
                    <span>🇪🇸 Español</span>
                    <i className="fas fa-check" />
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-gray-400 hover:border-gray-500 transition">
                    <span>🇬🇧 English</span>
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-gray-400 hover:border-gray-500 transition">
                    <span>🇫🇷 Français</span>
                  </button>
                </div>
              </div>
            )}

            {/* Datos */}
            {activeSection === 'datos' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  <i className="fas fa-database text-yellow-500 mr-2" />
                  Datos y Almacenamiento
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                    <span className="text-gray-400">Almacenamiento usado</span>
                    <span className="text-white">156 MB</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                    <span className="text-gray-400">Cache</span>
                    <span className="text-white">42 MB</span>
                  </div>
                  <button className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white hover:border-yellow-500 transition">
                    Limpiar cache
                  </button>
                  <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition">
                    Exportar datos
                  </button>
                </div>
              </div>
            )}

            {/* Ayuda */}
            {activeSection === 'ayuda' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  <i className="fas fa-question-circle text-yellow-500 mr-2" />
                  Ayuda y Soporte
                </h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-xl text-gray-300 hover:bg-gray-700 transition">
                    <span>❓ Preguntas Frecuentes</span>
                    <i className="fas fa-chevron-right text-gray-500" />
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-xl text-gray-300 hover:bg-gray-700 transition">
                    <span>📧 Contactar Soporte</span>
                    <i className="fas fa-chevron-right text-gray-500" />
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-xl text-gray-300 hover:bg-gray-700 transition">
                    <span>📋 Términos y condiciones</span>
                    <i className="fas fa-chevron-right text-gray-500" />
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-xl text-gray-300 hover:bg-gray-700 transition">
                    <span>🔒 Política de privacidad</span>
                    <i className="fas fa-chevron-right text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;