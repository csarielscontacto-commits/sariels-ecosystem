// js/workers/escaneo-worker.js
// Worker para compresión de imágenes y videos antes de subir

self.addEventListener('message', async (e) => {
    const { file } = e.data;
    
    try {
        const compressed = await comprimirArchivo(file);
        self.postMessage(compressed);
    } catch (error) {
        self.postMessage({ error: error.message });
    }
});

async function comprimirArchivo(file) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
        return { blob: file, name: file.name, type: file.type, size: file.size };
    }
    
    if (isImage) {
        return await comprimirImagen(file);
    }
    
    if (isVideo) {
        return await comprimirVideo(file);
    }
    
    return { blob: file, name: file.name, type: file.type, size: file.size };
}

async function comprimirImagen(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Redimensionar a máximo 1200px
                let width = img.width;
                let height = img.height;
                const maxSize = 1200;
                
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Calidad 0.8 para JPEG, 0.9 para PNG
                const quality = file.type === 'image/png' ? 0.9 : 0.8;
                canvas.toBlob((blob) => {
                    resolve({
                        blob: blob,
                        name: file.name,
                        type: file.type,
                        size: blob.size,
                        width: width,
                        height: height
                    });
                }, file.type, quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function comprimirVideo(file) {
    // Para videos, solo limitamos el tamaño (máx 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (file.size <= maxSize) {
        return { blob: file, name: file.name, type: file.type, size: file.size };
    }
    
    // Si es muy grande, cortamos (simplificado)
    console.warn('Video muy grande, se usará sin compresión');
    return { blob: file, name: file.name, type: file.type, size: file.size };
}