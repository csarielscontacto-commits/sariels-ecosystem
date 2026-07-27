// ================================================================
// MODERACIÓN IA - Csariel's Muro Live
// ================================================================

export class ModeracionIA {
    constructor() {
        this.palabrasProhibidas = [
            'spam', 'publicidad', 'compra', 'vendo', 'oferta', 'descuento',
            'préstamo', 'dinero', 'inversión', 'gana', 'fácil', 'rápido',
            'click', 'link', 'sigue', 'like', 'suscríbete', 'regístrate'
        ];
        
        this.palabrasOfensivas = [
            'pendejo', 'idiota', 'estúpido', 'imbécil', 'puta', 'zorra',
            'mierda', 'cabrón', 'chinga', 'verga', 'pito', 'pene',
            'puto', 'maricón', 'marica', 'joto', 'culero'
        ];
        
        this.enlacesSospechosos = [
            'bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 'is.gd',
            'corta', 'acortar', 'acortador', 'short', 'shorturl'
        ];
        
        this.umbralSpam = 3; // Número de coincidencias para considerar spam
        this.maxEmojisConsecutivos = 5;
        this.maxMayusculasConsecutivas = 5;
        this.maxPalabrasRepetidas = 3;
        
        console.log('🧠 Moderación IA inicializada');
    }
    
    // ================================================================
    // MÉTODO PRINCIPAL DE MODERACIÓN
    // ================================================================
    
    moderar(texto, usuario = null) {
        const resultados = {
            esSpam: false,
            razones: [],
            puntaje: 0,
            aprobado: true,
            mensaje: ''
        };
        
        // 1. Detectar enlaces sospechosos
        const enlacesSospechosos = this.detectarEnlacesSospechosos(texto);
        if (enlacesSospechosos.length > 0) {
            resultados.razones.push(`Enlaces sospechosos: ${enlacesSospechosos.join(', ')}`);
            resultados.puntaje += 2;
        }
        
        // 2. Detectar insultos
        const insultos = this.detectarInsultos(texto);
        if (insultos.length > 0) {
            resultados.razones.push(`Contenido ofensivo: ${insultos.join(', ')}`);
            resultados.puntaje += 3;
        }
        
        // 3. Detectar spam (palabras clave)
        const spam = this.detectarSpam(texto);
        if (spam.length > 0) {
            resultados.razones.push(`Palabras de spam: ${spam.join(', ')}`);
            resultados.puntaje += 1;
        }
        
        // 4. Detectar exceso de mayúsculas
        const mayusculas = this.detectarExcesoMayusculas(texto);
        if (mayusculas) {
            resultados.razones.push('Exceso de mayúsculas consecutivas');
            resultados.puntaje += 1;
        }
        
        // 5. Detectar exceso de emojis
        const emojis = this.detectarExcesoEmojis(texto);
        if (emojis) {
            resultados.razones.push('Más de 5 emojis consecutivos');
            resultados.puntaje += 1;
        }
        
        // 6. Detectar palabras repetidas
        const repetidas = this.detectarPalabrasRepetidas(texto);
        if (repetidas.length > 0) {
            resultados.razones.push(`Palabras repetidas: ${repetidas.join(', ')}`);
            resultados.puntaje += 1;
        }
        
        // 7. Detectar publicaciones repetidas (historial)
        if (usuario) {
            const repetidasHistorial = this.detectarPublicacionesRepetidas(texto, usuario);
            if (repetidasHistorial) {
                resultados.razones.push('Publicación repetida detectada');
                resultados.puntaje += 2;
            }
        }
        
        // Evaluar puntaje
        if (resultados.puntaje >= this.umbralSpam) {
            resultados.esSpam = true;
            resultados.aprobado = false;
            resultados.mensaje = '⚠️ Tu publicación necesita revisión antes de publicarse.';
        } else if (resultados.puntaje > 0) {
            resultados.aprobado = true;
            resultados.mensaje = '✅ Publicación aprobada con algunas observaciones.';
        } else {
            resultados.aprobado = true;
            resultados.mensaje = '✅ Publicación aprobada.';
        }
        
        return resultados;
    }
    
    // ================================================================
    // DETECTORES ESPECÍFICOS
    // ================================================================
    
    detectarEnlacesSospechosos(texto) {
        const encontrados = [];
        const textoLower = texto.toLowerCase();
        for (const enlace of this.enlacesSospechosos) {
            if (textoLower.includes(enlace)) {
                encontrados.push(enlace);
            }
        }
        // También detectar enlaces cortos con regex
        const urlRegex = /(https?:\/\/)?(www\.)?[a-z0-9-]+\.(com|mx|org|net|info|biz)\/[a-z0-9]{1,6}/gi;
        const matches = texto.match(urlRegex);
        if (matches) {
            for (const match of matches) {
                if (match.length > 0 && match.length < 20) {
                    encontrados.push(match);
                }
            }
        }
        return encontrados;
    }
    
    detectarInsultos(texto) {
        const encontrados = [];
        const textoLower = texto.toLowerCase();
        for (const insulto of this.palabrasOfensivas) {
            if (textoLower.includes(insulto)) {
                encontrados.push(insulto);
            }
        }
        return encontrados;
    }
    
    detectarSpam(texto) {
        const encontrados = [];
        const textoLower = texto.toLowerCase();
        for (const palabra of this.palabrasProhibidas) {
            if (textoLower.includes(palabra)) {
                encontrados.push(palabra);
            }
        }
        return encontrados;
    }
    
    detectarExcesoMayusculas(texto) {
        // Detectar 5 o más mayúsculas consecutivas
        const mayusculasRegex = /[A-Z]{5,}/;
        return mayusculasRegex.test(texto);
    }
    
    detectarExcesoEmojis(texto) {
        // Detectar 5 o más emojis consecutivos
        const emojiRegex = /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F201}-\u{1F202}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F23A}\u{1F250}-\u{1F251}]){5,}/u;
        return emojiRegex.test(texto);
    }
    
    detectarPalabrasRepetidas(texto) {
        const palabras = texto.toLowerCase().split(/\s+/);
        const conteo = {};
        const repetidas = [];
        
        for (const palabra of palabras) {
            if (palabra.length < 3) continue;
            conteo[palabra] = (conteo[palabra] || 0) + 1;
            if (conteo[palabra] >= this.maxPalabrasRepetidas + 1) {
                if (!repetidas.includes(palabra)) {
                    repetidas.push(palabra);
                }
            }
        }
        
        return repetidas;
    }
    
    detectarPublicacionesRepetidas(texto, usuario) {
        try {
            const posts = JSON.parse(localStorage.getItem('muro_live_posts') || '[]');
            const textoLower = texto.toLowerCase();
            const palabrasClave = textoLower.split(/\s+/).filter(p => p.length > 3);
            
            if (palabrasClave.length < 3) return false;
            
            const postsUsuario = posts.filter(p => p.author === usuario);
            
            for (const post of postsUsuario) {
                const postLower = post.content.toLowerCase();
                let coincidencias = 0;
                for (const palabra of palabrasClave) {
                    if (postLower.includes(palabra)) coincidencias++;
                }
                // Si más del 60% de las palabras coinciden, es repetida
                if (coincidencias / palabrasClave.length > 0.6) {
                    return true;
                }
            }
        } catch (e) {
            console.warn('Error detectando publicaciones repetidas:', e);
        }
        return false;
    }
    
    // ================================================================
    // DETECTOR DE SERVICIOS
    // ================================================================
    
    detectarServicio(texto) {
        const palabrasServicio = [
            'mecánico', 'talachero', 'llanta', 'ponchada', 'gasolina', 'grúa',
            'bicicleta', 'reparación', 'taller', 'servicio', 'ayuda', 'auxilio',
            'emergencia', 'farmacia', 'oxxo', 'tienda', 'café', 'restaurante',
            'domicilio', 'entrega', 'envío', 'urgente', 'problema', 'avería'
        ];
        
        const textoLower = texto.toLowerCase();
        let coincidencias = 0;
        const encontrados = [];
        
        for (const palabra of palabrasServicio) {
            if (textoLower.includes(palabra)) {
                coincidencias++;
                encontrados.push(palabra);
            }
        }
        
        // Detectar frases de emergencia
        const frasesEmergencia = [
            'me quedé sin gasolina',
            'se ponchó mi llanta',
            'necesito una grúa',
            'ayuda mecánica',
            'emergencia en carretera'
        ];
        
        for (const frase of frasesEmergencia) {
            if (textoLower.includes(frase)) {
                coincidencias += 2;
                encontrados.push(frase);
            }
        }
        
        // Si hay 2 o más coincidencias, es un servicio
        if (coincidencias >= 2) {
            return {
                esServicio: true,
                coincidencias: encontrados,
                mensaje: '🔧 Detectamos que buscas un servicio. ¿Quieres usar el Módulo de Servicios Comunitarios?'
            };
        }
        
        return {
            esServicio: false,
            coincidencias: [],
            mensaje: null
        };
    }
}

// ================================================================
// EXPORTAR INSTANCIA ÚNICA
// ================================================================

export const moderador = new ModeracionIA();