// ================================================================
// 🆘 HelpPage - CSARIEL'S ECOSYSTEM (SISTEMA MODULE)
// ================================================================
// Página de ayuda y soporte con:
// - Preguntas frecuentes
// - Contacto de soporte
// - Términos y condiciones
// - Política de privacidad
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect } from 'react';
import { useMarquinhos } from '../../shared/hooks/useMarquinhos';
import { useNotifications } from '../../shared/hooks/useNotifications';

export function HelpPage() {
  const { setContext } = useMarquinhos();
  const { showNotification } = useNotifications();
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  useEffect(() => {
    setContext('help');
  }, [setContext]);

  const faqs = [
    {
      id: '1',
      question: '¿Cómo creo una cuenta en Csariel\'s?',
      answer: 'Para crear una cuenta, haz clic en "Registrarse" en la página principal. Completa el formulario con tu nombre, correo electrónico y contraseña. Recibirás un correo de confirmación para activar tu cuenta.'
    },
    {
      id: '2',
      question: '¿Cómo activo mi eSIM?',
      answer: 'Ve a la sección eSIM en tu red. Selecciona "Activar eSIM", elige tu plan y sigue las instrucciones. Necesitarás escanear un código QR que te proporcionaremos.'
    },
    {
      id: '3',
      question: '¿Cómo reporto contenido inapropiado?',
      answer: 'Usa el botón de reporte (🚩) en cada publicación o perfil. Nuestro equipo revisará el reporte y tomará las medidas necesarias.'
    },
    {
      id: '4',
      question: '¿Qué hago si olvidé mi contraseña?',
      answer: 'Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión. Ingresa tu correo y recibirás un enlace para restablecer tu contraseña.'
    },
    {
      id: '5',
      question: '¿Cómo cancelo mi suscripción Premium?',
      answer: 'Ve a Configuración > Premium y selecciona "Cancelar suscripción". Tu suscripción seguirá activa hasta el final del período facturado.'
    },
  ];

  const handleContactSupport = () => {
    window.location.href = 'mailto:soporte@csariels.com?subject=Ayuda%20Csariel\'s';
    showNotification('📧 Abriendo cliente de correo', 'info');
  };

  const handleOpenFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-orbitron text-2xl font-bold text-yellow-500 mb-6">
        🆘 Centro de Ayuda
      </h1>

      {/* ===== INTRO ===== */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 text-center mb-6">
        <div className="text-4xl mb-2">🆘</div>
        <h2 className="text-xl font-bold text-white">¿Necesitas ayuda?</h2>
        <p className="text-gray-400 mt-1">
          Encuentra respuestas rápidas en nuestras secciones de ayuda o contacta a nuestro equipo de soporte.
        </p>
      </div>

      {/* ===== SECCIONES RÁPIDAS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {[
          { icon: '❓', label: 'Preguntas Frecuentes', action: () => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' }) },
          { icon: '📜', label: 'Reglas de la Comunidad', action: () => showNotification('📜 Reglas de la comunidad', 'info') },
          { icon: '💡', label: 'Sugerencias', action: () => showNotification('💡 Comparte tus ideas', 'info') },
          { icon: '🔒', label: 'Seguridad y Privacidad', action: () => showNotification('🔒 Seguridad y privacidad', 'info') },
          { icon: '🔌', label: 'API y Desarrollo', action: () => showNotification('🔌 Documentación para desarrolladores', 'info') },
          { icon: '⭐', label: 'Csariel\'s Premium', action: () => showNotification('⭐ Beneficios y suscripción', 'info') },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center hover:border-yellow-500/50 transition"
          >
            <div className="text-2xl">{item.icon}</div>
            <div className="text-sm text-white mt-1">{item.label}</div>
          </button>
        ))}
      </div>

      {/* ===== PREGUNTAS FRECUENTES ===== */}
      <div id="faq-section" className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          <i className="fas fa-question-circle text-yellow-500 mr-2" />
          Preguntas Frecuentes
        </h2>

        <div className="space-y-2">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-700 rounded-xl overflow-hidden">
              <button
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-800/50 transition"
                onClick={() => handleOpenFAQ(faq.id)}
              >
                <span className="text-white font-medium">{faq.question}</span>
                <span className="text-gray-400">
                  <i className={`fas fa-chevron-${openFAQ === faq.id ? 'up' : 'down'}`} />
                </span>
              </button>
              {openFAQ === faq.id && (
                <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/30">
                  <p className="text-gray-300 text-sm">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== CONTACTO ===== */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 mt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-medium">
              <i className="fas fa-envelope text-yellow-500 mr-2" />
              Soporte técnico
            </h3>
            <p className="text-sm text-gray-400">soporte@csariels.com</p>
            <p className="text-xs text-gray-500">Lun - Vie: 9:00 AM - 6:00 PM (UTC-6)</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleContactSupport}
              className="px-4 py-2 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition"
            >
              <i className="fas fa-envelope mr-2" />
              Enviar correo
            </button>
            <button
              onClick={() => showNotification('💬 Chat en vivo abierto', 'info')}
              className="px-4 py-2 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition"
            >
              <i className="fas fa-comment mr-2" />
              Chat en vivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;