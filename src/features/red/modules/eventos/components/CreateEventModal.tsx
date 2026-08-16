// ================================================================
// 🧩 CreateEventModal - CSARIEL'S ECOSYSTEM (EVENTOS MODULE)
// ================================================================
// Modal para crear nuevos eventos comunitarios.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect, useRef } from 'react';

// ================================================================
// 📦 TIPOS
// ================================================================

interface CreateEventModalProps {
  onClose: () => void;
  onCreate: (data: {
    titulo: string;
    descripcion: string;
    fecha: string;
    ubicacion: string;
    capacidad: number;
  }) => Promise<void>;
  isLoading: boolean;
  userId: string;
}

// ================================================================
// 🧩 COMPONENTE
// ================================================================

export function CreateEventModal({
  onClose,
  onCreate,
  isLoading,
  userId,
}: CreateEventModalProps) {
  // ================================================================
  // 📦 ESTADO
  // ================================================================

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [capacidad, setCapacidad] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ================================================================
  // 🎯 FOCUS AL ABRIR
  // ================================================================

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // ================================================================
  // ⌨️ ESC PARA CERRAR
  // ================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ================================================================
  // 🖱️ CLICK FUERA DEL MODAL
  // ================================================================

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ================================================================
  // ✅ VALIDAR FORMULARIO
  // ================================================================

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }
    if (titulo.length > 100) {
      newErrors.titulo = 'El título no puede tener más de 100 caracteres';
    }
    if (!fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    if (!ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }
    if (capacidad < 0) {
      newErrors.capacidad = 'La capacidad no puede ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================================================================
  // 📤 ENVIAR FORMULARIO
  // ================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onCreate({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fecha,
        ubicacion: ubicacion.trim(),
        capacidad,
      });
    } catch (error) {
      console.error('Error creando evento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================================================================
  // 🖥️ RENDER
  // ================================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-yellow-500">
            <i className="fas fa-calendar-plus mr-2" />
            Crear Evento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1"
            aria-label="Cerrar"
          >
            <i className="fas fa-times text-xl" />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-gray-300 mb-1">
              Título del evento <span className="text-red-400">*</span>
            </label>
            <input
              id="event-title"
              ref={inputRef}
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Tech Meetup 2026"
              className={`w-full px-4 py-2 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition ${
                errors.titulo ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={isSubmitting || isLoading}
              maxLength={100}
            />
            {errors.titulo && (
              <p className="mt-1 text-sm text-red-400">{errors.titulo}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {titulo.length}/100 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              id="event-description"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe tu evento..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition resize-none"
              disabled={isSubmitting || isLoading}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              {descripcion.length}/500 caracteres
            </p>
          </div>

          {/* Fecha */}
          <div>
            <label htmlFor="event-date" className="block text-sm font-medium text-gray-300 mb-1">
              Fecha y hora <span className="text-red-400">*</span>
            </label>
            <input
              id="event-date"
              type="datetime-local"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition ${
                errors.fecha ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={isSubmitting || isLoading}
            />
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-400">{errors.fecha}</p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="event-location" className="block text-sm font-medium text-gray-300 mb-1">
              Ubicación <span className="text-red-400">*</span>
            </label>
            <input
              id="event-location"
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Centro de Convenciones, CDMX"
              className={`w-full px-4 py-2 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition ${
                errors.ubicacion ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={isSubmitting || isLoading}
            />
            {errors.ubicacion && (
              <p className="mt-1 text-sm text-red-400">{errors.ubicacion}</p>
            )}
          </div>

          {/* Capacidad */}
          <div>
            <label htmlFor="event-capacity" className="block text-sm font-medium text-gray-300 mb-1">
              Capacidad (máximo de participantes)
            </label>
            <input
              id="event-capacity"
              type="number"
              value={capacidad || ''}
              onChange={(e) => setCapacidad(Number(e.target.value))}
              placeholder="Ej: 50"
              min={0}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition ${
                errors.capacidad ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={isSubmitting || isLoading}
            />
            {errors.capacidad && (
              <p className="mt-1 text-sm text-red-400">{errors.capacidad}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Deja en 0 para capacidad ilimitada
            </p>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition"
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Creando...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2" />
                  Crear Evento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEventModal;