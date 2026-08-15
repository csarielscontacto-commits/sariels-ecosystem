// ================================================================
// 🧩 CreatePost - CSARIEL'S ECOSYSTEM
// ================================================================
// Componente para crear nuevas publicaciones en el feed.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import React, { useState } from 'react';

export function CreatePost({ onSubmit, isSubmitting, userAvatar, userName }) {
    const [contenido, setContenido] = useState('');
    const [imagen, setImagen] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contenido.trim()) return;

        try {
            await onSubmit(contenido, imagen);
            setContenido('');
            setImagen(null);
        } catch (error) {
            // Error manejado por el padre
        }
    };

    return (
        <div className="crear-publicacion">
            <form onSubmit={handleSubmit}>
                <div className="input-area">
                    <div className="avatar">{userAvatar}</div>
                    <textarea
                        id="create-post-input"
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        placeholder="¿Qué estás pensando? Comparte con la comunidad..."
                        rows="2"
                        disabled={isSubmitting}
                    />
                </div>
                <div className="acciones">
                    <div className="botones-adjuntos">
                        <button type="button" className="btn btn-outline btn-sm">
                            <i className="fas fa-image" /> Imagen
                        </button>
                        <button type="button" className="btn btn-outline btn-sm">
                            <i className="fas fa-link" /> Enlace
                        </button>
                        <button type="button" className="btn btn-outline btn-sm">
                            <i className="fas fa-smile" /> Emoji
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={isSubmitting || !contenido.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin">⏳</span> Publicando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane" /> Publicar
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreatePost;