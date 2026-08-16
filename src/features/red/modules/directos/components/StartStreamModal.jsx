// ================================================================
// 🧩 StartStreamModal - CSARIEL'S ECOSYSTEM
// ================================================================
// Modal para iniciar una nueva transmisión en vivo.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState, useEffect, useRef } from 'react';

export function StartStreamModal({ onClose, onStart, isLoading }) {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalRef = useRef(null);
    const inputRef = useRef(null);

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
        const handleKeyDown = (e) => {
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

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // ================================================================
    // 📤 ENVIAR FORMULARIO
    // ================================================================

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titulo.trim()) return;

        setIsSubmitting(true);
        try {
            await onStart(titulo.trim(), descripcion.trim());
        } catch (error) {
            console.error('Error al iniciar transmisión:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ================================================================
    // 🖥️ RENDER
    // ================================================================

    return (
        <div
            className="modal-overlay active"
            onClick={handleOverlayClick}
        >
            <div className="modal-content" ref={modalRef}>
                {/* ===== HEADER ===== */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        <i className="fas fa-broadcast text-live-red" />
                        Iniciar Transmisión en Vivo
                    </h2>
                    <button
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <i className="fas fa-times" />
                    </button>
                </div>

                {/* ===== BODY ===== */}
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="stream-title" className="form-label">
                                Título de la transmisión <span className="text-danger">*</span>
                            </label>
                            <input
                                id="stream-title"
                                ref={inputRef}
                                type="text"
                                className="form-input"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ej: Charla sobre tecnología 🚀"
                                disabled={isSubmitting || isLoading}
                                maxLength={100}
                                required
                            />
                            <div className="form-hint">
                                {titulo.length}/100 caracteres
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="stream-description" className="form-label">
                                Descripción (opcional)
                            </label>
                            <textarea
                                id="stream-description"
                                className="form-textarea"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Cuéntale a tu audiencia de qué tratará la transmisión..."
                                disabled={isSubmitting || isLoading}
                                rows="3"
                                maxLength={500}
                            />
                            <div className="form-hint">
                                {descripcion.length}/500 caracteres
                            </div>
                        </div>

                        {/* ===== CONSEJOS ===== */}
                        <div className="stream-tips">
                            <p className="tips-title">
                                <i className="fas fa-lightbulb text-gold-cosmic" />
                                Consejos para una transmisión exitosa
                            </p>
                            <ul className="tips-list">
                                <li>
                                    <i className="fas fa-check-circle text-success" />
                                    Usa un título llamativo y claro
                                </li>
                                <li>
                                    <i className="fas fa-check-circle text-success" />
                                    Verifica tu conexión a internet
                                </li>
                                <li>
                                    <i className="fas fa-check-circle text-success" />
                                    Interactúa con tu audiencia en el chat
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* ===== FOOTER ===== */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={onClose}
                            disabled={isSubmitting || isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-live"
                            disabled={isSubmitting || isLoading || !titulo.trim()}
                        >
                            {isSubmitting || isLoading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Iniciando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-broadcast" />
                                    Iniciar Directo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StartStreamModal;