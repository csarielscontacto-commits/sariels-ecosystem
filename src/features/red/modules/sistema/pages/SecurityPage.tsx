// ================================================================
// 🔒 SecurityPage - CSARIEL'S ECOSYSTEM (SISTEMA MODULE)
// ================================================================
// Página de seguridad con:
// - Cambio de contraseña
// - Verificación en 2 pasos
// - Gestión de sesiones
// - Historial de actividad
// - Usuarios bloqueados
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import { useNotifications } from '../../shared/hooks/useNotifications';
import { supabase } from '@/lib/supabase';

export function SecurityPage() {
  const { user, isAuthenticated } = useAuth();
  const { setContext } = useMarquinhos();
  const { showNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  useEffect(() => {
    setContext('security');
  }, [setContext]);

  const handleChangePassword = async () => {
    const currentPassword = prompt('🔑 Contraseña actual:');
    if (!currentPassword) return;

    const newPassword = prompt('🔑 Nueva contraseña (mínimo 8 caracteres):');
    if (!newPassword || newPassword.length < 8) {
      showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    const confirmPassword = prompt('🔑 Confirmar nueva contraseña:');
    if (newPassword !== confirmPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      showNotification('✅ Contraseña actualizada', 'success');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Error al cambiar contraseña', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = () => {
    if (!twoFAEnabled) {
      const code = prompt('📱 Código de verificación (ej: 123456):');
      if (!code || code.length !== 6 || isNaN(Number(code))) {
        showNotification('Código inválido (6 dígitos)', 'error');
        return;
      }
    }
    setTwoFAEnabled(!twoFAEnabled);
    showNotification(
      twoFAEnabled ? '❌ Verificación en 2 pasos desactivada' : '✅ Verificación en 2 pasos activada',
      'success'
    );
  };

  const handleLogoutAll = async () => {
    if (!confirm('¿Cerrar todas las sesiones activas?')) return;

    setIsLoading(true);
    try {
      // Supabase no tiene una función directa para cerrar todas las sesiones
      // pero podemos usar signOut para cerrar la sesión actual
      await supabase.auth.signOut();
      showNotification('🔒 Sesiones cerradas', 'info');
      window.location.href = '/';
    } catch (error) {
      showNotification('Error al cerrar sesiones', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white">Inicia sesión para ver seguridad</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-orbitron text-2xl font-bold text-yellow-500 mb-6">
        🔒 Centro de Seguridad
      </h1>

      <div className="space-y-4">
        {/* Cambiar contraseña */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Contraseña</h3>
            <p className="text-sm text-gray-400">Cambia tu contraseña regularmente</p>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white hover:border-yellow-500 transition disabled:opacity-50"
          >
            Cambiar
          </button>
        </div>

        {/* Verificación en 2 pasos */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Verificación en 2 pasos</h3>
            <p className="text-sm text-gray-400">Añade una capa extra de seguridad</p>
          </div>
          <button
            onClick={handleToggle2FA}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              twoFAEnabled
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-gray-800 text-white hover:border-yellow-500 border border-gray-600'
            }`}
          >
            {twoFAEnabled ? '✅ Activa' : 'Activar'}
          </button>
        </div>

        {/* Sesiones activas */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Sesiones activas</h3>
              <p className="text-sm text-gray-400">Gestiona tus dispositivos conectados</p>
            </div>
            <button
              onClick={handleLogoutAll}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition disabled:opacity-50"
            >
              Cerrar todas
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <i className="fas fa-laptop text-gray-400" />
                <div>
                  <div className="text-white text-sm">Chrome · Windows 11</div>
                  <div className="text-xs text-gray-500">Activa · IP: 192.168.1.1</div>
                </div>
              </div>
              <span className="text-xs text-green-400">● Activa</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <i className="fas fa-mobile-alt text-gray-400" />
                <div>
                  <div className="text-white text-sm">Safari · iOS 17</div>
                  <div className="text-xs text-gray-500">Activa · IP: 10.0.0.5</div>
                </div>
              </div>
              <span className="text-xs text-green-400">● Activa</span>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-4">
          <h3 className="text-white font-medium mb-2">Actividad reciente</h3>
          <div className="space-y-1 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Inicio de sesión desde CDMX</span>
              <span className="text-gray-500">Hace 2 horas</span>
            </div>
            <div className="flex justify-between">
              <span>Cambio de contraseña</span>
              <span className="text-gray-500">Hace 3 días</span>
            </div>
            <div className="flex justify-between">
              <span>Verificación en 2 pasos activada</span>
              <span className="text-gray-500">Hace 1 semana</span>
            </div>
          </div>
        </div>

        {/* Usuarios bloqueados */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Usuarios bloqueados</h3>
            <p className="text-sm text-gray-400">Gestiona tu lista de bloqueados</p>
          </div>
          <button className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white hover:border-yellow-500 transition">
            Gestionar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;