// ================================================================
// MODERACIÓN IA AVANZADA - Csariel's Ecosystem v2.0
// ================================================================

export class ModeracionIA {
    constructor() {
        // ============================================================
        // CATEGORÍAS DE SERVICIOS (20+ categorías)
        // ============================================================
        
        this.categoriasServicios = {
            'mecanico': {
                nombre: 'Mecánico',
                icono: '🔧',
                palabras: ['mecánico', 'mecanico', 'taller', 'reparación', 'motor', 'frenos', 'suspensión', 'diagnóstico', 'aceite', 'filtro', 'batería', 'alternador', 'transmisión', 'embrague', 'automotriz', 'afinación', 'escáner', 'inyección', 'electrónica automotriz']
            },
            'llantera': {
                nombre: 'Llantera',
                icono: '🛞',
                palabras: ['llantera', 'llanta', 'ponchada', 'parche', 'balanceo', 'alineación', 'cámara', 'neumático', 'válvula', 'rin', 'llanta nueva', 'llanta usada']
            },
            'grua': {
                nombre: 'Grúa',
                icono: '🚗',
                palabras: ['grúa', 'grua', 'remolque', 'arrastre', 'carretera', 'autopista', 'camión grúa', 'asistencia vial', 'accidente', 'descompuesto']
            },
            'gasolina': {
                nombre: 'Gasolina',
                icono: '⛽',
                palabras: ['gasolina', 'gasolinera', 'combustible', 'magnas', 'premium', 'diésel', 'tanque', 'litros', 'sin gasolina', 'gas']
            },
            'plomero': {
                nombre: 'Plomero',
                icono: '🚰',
                palabras: ['plomero', 'fontanero', 'tubería', 'fuga', 'cañería', 'lavabo', 'sanitario', 'cisterna', 'bomba de agua', 'drenaje', 'desagüe', 'grifo', 'tubería rota']
            },
            'electricista': {
                nombre: 'Electricista',
                icono: '⚡',
                palabras: ['electricista', 'eléctrico', 'cableado', 'instalación', 'luz', 'contacto', 'apagador', 'tablero', 'corto circuito', 'luminarias', 'interruptor', 'electrodoméstico']
            },
            'albañil': {
                nombre: 'Albañil',
                icono: '🧱',
                palabras: ['albañil', 'construcción', 'pared', 'pintura', 'azulejo', 'cemento', 'tabique', 'yeso', 'impermeabilización', 'muro', 'piso', 'fachada', 'remodelación']
            },
            'tecnico': {
                nombre: 'Técnico de computadoras',
                icono: '🖥️',
                palabras: ['técnico', 'tecnico', 'computadora', 'laptop', 'pc', 'escritorio', 'red', 'internet', 'wifi', 'virus', 'software', 'hardware', 'servidor', 'backup', 'formateo']
            },
            'celular': {
                nombre: 'Reparación de celulares',
                icono: '📱',
                palabras: ['celular', 'teléfono', 'smartphone', 'iphone', 'android', 'pantalla', 'batería', 'cargador', 'microfono', 'camara', 'auricular', 'falla', 'reparación', 'desbloqueo']
            },
            'limpieza': {
                nombre: 'Limpieza',
                icono: '🧹',
                palabras: ['limpieza', 'aseo', 'desinfección', 'fumigación', 'plagas', 'cocina', 'baño', 'alfombra', 'cortinas', 'muebles', 'lavado', 'higiene', 'sanitización']
            },
            'mudanza': {
                nombre: 'Mudanza',
                icono: '🚚',
                palabras: ['mudanza', 'mudanzas', 'transporte', 'carga', 'camioneta', 'flete', 'mudar', 'casa', 'oficina', 'empaque', 'embalaje']
            },
            'transporte': {
                nombre: 'Transporte',
                icono: '🚕',
                palabras: ['transporte', 'taxi', 'uber', 'did', 'conductor', 'chofer', 'viaje', 'camioneta', 'auto', 'traslado', 'aeropuerto']
            },
            'comida': {
                nombre: 'Comida/Delivery',
                icono: '🍽️',
                palabras: ['comida', 'catering', 'evento', 'banquete', 'restaurante', 'domicilio', 'delivery', 'repartidor', 'cocinero', 'chef', 'torta', 'pizza', 'hamburguesa']
            },
            'medico': {
                nombre: 'Médico',
                icono: '🩺',
                palabras: ['médico', 'doctor', 'enfermero', 'clínica', 'consulta', 'emergencia', 'salud', 'hospital', 'urgencias', 'especialista', 'medicina general']
            },
            'farmacia': {
                nombre: 'Farmacia',
                icono: '💊',
                palabras: ['farmacia', 'medicamento', 'receta', 'droguería', 'botiquín', 'pastillas', 'jarabe', 'inyección', 'despacho', 'turno']
            },
            'profesor': {
                nombre: 'Profesor/Tutor',
                icono: '📚',
                palabras: ['profesor', 'maestro', 'tutor', 'clase', 'enseñanza', 'educación', 'escolar', 'universidad', 'particular', 'asesoría', 'regularización']
            },
            'veterinario': {
                nombre: 'Veterinario',
                icono: '🐕',
                palabras: ['veterinario', 'veterinaria', 'perro', 'gato', 'mascota', 'animal', 'consulta', 'vacuna', 'desparasitación', 'emergencia', 'peluquería']
            },
            'cerrajero': {
                nombre: 'Cerrajero',
                icono: '🏠',
                palabras: ['cerrajero', 'cerradura', 'llave', 'seguro', 'puerta', 'candado', 'chapista', 'apertura', 'clavijero', 'cerrojo']
            },
            'jardineria': {
                nombre: 'Jardinería',
                icono: '🌳',
                palabras: ['jardinero', 'jardín', 'poda', 'árbol', 'césped', 'planta', 'riego', 'tierra', 'podadora', 'abono', 'jardinería']
            },
            'aire': {
                nombre: 'Aire Acondicionado',
                icono: '❄️',
                palabras: ['aire acondicionado', 'climatización', 'aire', 'refrigeración', 'calefacción', 'minisplit', 'central', 'servicio', 'mantenimiento', 'instalación']
            },
            'diseno': {
                nombre: 'Diseño Gráfico',
                icono: '🎨',
                palabras: ['diseño', 'gráfico', 'ilustración', 'logo', 'imagen', 'publicidad', 'banner', 'flyer', 'branding', 'diseñador', 'creativo', 'photoshop', 'ilustrator']
            }
        };

        // ============================================================
        // LISTAS DE SPAM
        // ============================================================
        
        this.spam = [
            'click aquí', 'gana dinero', 'inversión segura', 'préstamo fácil',
            'hazte rico', 'trabajo desde casa', 'dinero rápido', 'millonario',
            'código promocional', 'link', 'enlace', 'suscríbete', 'regístrate',
            'bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 'is.gd', 'acortar',
            'publicidad', 'promoción', 'marketing', 'redes sociales', 'seguidores'
        ];

        // ============================================================
        // LISTAS DE MARKETPLACE
        // ============================================================
        
        this.marketplace = [
            'vendo', 'compro', 'cambio', 'precio', 'oferta', 'seminuevo',
            'nuevo', 'remato', 'usado', 'garantía', 'entrega', 'envío',
            'negociable', 'pesos', 'mxn', 'dólar', 'intercambio', 'trueque',
            'barato', 'económico', 'liquidación', 'segunda mano'
        ];

        // ============================================================
        // LISTAS DE OFENSIVO
        // ============================================================
        
        this.ofensivo = [
            'pendejo', 'idiota', 'estúpido', 'imbécil', 'puta', 'zorra',
            'mierda', 'cabrón', 'chinga', 'verga', 'pito', 'pene',
            'puto', 'maricón', 'marica', 'joto', 'culero', 'ojete',
            'hijo de puta', 'hdp', 'come mierda', 'basura', 'mierda'
        ];

        // ============================================================
        // UMBRALES
        // ============================================================
        
        this.umbralSpam = 3;
        this.maxEmojisConsecutivos = 5;
        this.maxMayusculasConsecutivas = 5;
        this.maxPalabrasRepetidas = 3;
        this.confianzaMinima = 60;
        this.confianzaServicio = 50;

        // ============================================================
        // FRASES DE EMERGENCIA (para detectar urgencia)
        // ============================================================
        
        this.frasesEmergencia = [
            'emergencia', 'urgente', 'es urgente', 'rápido', 'ya',
            'me quedé varado', 'me descompuse', 'estoy en la carretera',
            'ayuda inmediata', 'necesito ayuda', 'por favor ayuda'
        ];

        console.log('🧠 Moderación IA v2.0 inicializada');
        console.log(`📋 ${Object.keys(this.categoriasServicios).length} categorías de servicios`);
        console.log('🛒 Marketplace detectado');
        console.log('🚨 Detección de emergencias activa');
    }

    // ================================================================
    // CLASIFICACIÓN PRINCIPAL
    // ================================================================
    
    clasificar(texto, usuario = null) {
        const resultado = {
            categoria: 'mi_red', // mi_red | servicios | marketplace | spam
            confianza: 0,
            subcategoria: null,
            subcategoriaNombre: null,
            subcategoriaIcono: null,
            razones: [],
            aprobado: true,
            mensaje: '',
            esEmergencia: false,
            datosExtraidos: {
                telefonos: [],
                emails: [],
                precios: [],
                direcciones: [],
                urls: [],
                ubicacion: null
            }
        };

        // 1. Extraer datos estructurados
        resultado.datosExtraidos = this.extraerDatos(texto);

        // 2. Detectar emergencia
        resultado.esEmergencia = this.detectarEmergencia(texto);

        // 3. Verificar spam
        const spamCheck = this.verificarSpam(texto);
        if (spamCheck.esSpam) {
            resultado.categoria = 'spam';
            resultado.confianza = spamCheck.confianza;
            resultado.razones = spamCheck.razones;
            resultado.aprobado = false;
            resultado.mensaje = '⚠️ Contenido detectado como spam.';
            return resultado;
        }

        // 4. Verificar ofensivo
        const ofensivoCheck = this.verificarOfensivo(texto);
        if (ofensivoCheck.tieneOfensivo) {
            resultado.categoria = 'spam';
            resultado.confianza = 90;
            resultado.razones = ofensivoCheck.razones;
            resultado.aprobado = false;
            resultado.mensaje = '⛔ Contenido ofensivo no permitido.';
            return resultado;
        }

        // 5. Clasificar como Servicio
        const servicioCheck = this.clasificarServicio(texto);
        if (servicioCheck.esServicio && servicioCheck.confianza >= this.confianzaServicio) {
            resultado.categoria = 'servicios';
            resultado.confianza = servicioCheck.confianza;
            resultado.subcategoria = servicioCheck.subcategoria;
            resultado.subcategoriaNombre = this.categoriasServicios[servicioCheck.subcategoria]?.nombre || servicioCheck.subcategoria;
            resultado.subcategoriaIcono = this.categoriasServicios[servicioCheck.subcategoria]?.icono || '📌';
            resultado.razones = servicioCheck.razones;
            resultado.aprobado = true;
            resultado.mensaje = `🔧 Servicio detectado (${resultado.subcategoriaNombre}) con ${servicioCheck.confianza}% de confianza.`;
            return resultado;
        }

        // 6. Clasificar como Marketplace
        const marketplaceCheck = this.clasificarMarketplace(texto);
        if (marketplaceCheck.esMarketplace && marketplaceCheck.confianza >= this.confianzaMinima) {
            resultado.categoria = 'marketplace';
            resultado.confianza = marketplaceCheck.confianza;
            resultado.razones = marketplaceCheck.razones;
            resultado.aprobado = true;
            resultado.mensaje = `🛒 Compra/venta detectada con ${marketplaceCheck.confianza}% de confianza.`;
            return resultado;
        }

        // 7. Si no clasifica, va a Mi Red
        resultado.categoria = 'mi_red';
        resultado.confianza = 70;
        resultado.aprobado = true;
        resultado.mensaje = '📱 Publicación para Mi Red';
        
        return resultado;
    }

    // ================================================================
    // VERIFICADORES
    // ================================================================
    
    verificarSpam(texto) {
        const textoLower = texto.toLowerCase();
        let coincidencias = [];
        let confianza = 0;

        for (const palabra of this.spam) {
            if (textoLower.includes(palabra)) {
                coincidencias.push(palabra);
                confianza += 15;
            }
        }

        const urlRegex = /(https?:\/\/)?(www\.)?[a-z0-9-]+\.(com|mx|org|net|info|biz|xyz|top)\/[a-z0-9]{1,6}/gi;
        const urls = texto.match(urlRegex) || [];
        if (urls.length > 0) {
            coincidencias.push(`URL sospechosa: ${urls[0]}`);
            confianza += 20;
        }

        if (this.detectarExcesoEmojis(texto)) {
            coincidencias.push('Exceso de emojis');
            confianza += 10;
        }

        if (this.detectarExcesoMayusculas(texto)) {
            coincidencias.push('Exceso de mayúsculas');
            confianza += 10;
        }

        const repetidas = this.detectarPalabrasRepetidas(texto);
        if (repetidas.length > 0) {
            coincidencias.push(`Palabras repetidas: ${repetidas.join(', ')}`);
            confianza += 10 * Math.min(repetidas.length, 3);
        }

        return {
            esSpam: confianza >= 50,
            confianza: Math.min(confianza, 100),
            razones: coincidencias
        };
    }

    verificarOfensivo(texto) {
        const textoLower = texto.toLowerCase();
        const encontrados = [];

        for (const palabra of this.ofensivo) {
            if (textoLower.includes(palabra)) {
                encontrados.push(palabra);
            }
        }

        return {
            tieneOfensivo: encontrados.length > 0,
            razones: encontrados
        };
    }

    // ================================================================
    // CLASIFICACIÓN DE SERVICIOS (MEJORADA)
    // ================================================================
    
    clasificarServicio(texto) {
        const textoLower = texto.toLowerCase();
        const resultados = {};
        let totalCoincidencias = 0;
        let mejorCategoria = null;
        let mayorConfianza = 0;

        for (const [categoria, data] of Object.entries(this.categoriasServicios)) {
            let coincidencias = 0;
            const encontradas = [];

            for (const palabra of data.palabras) {
                if (textoLower.includes(palabra)) {
                    coincidencias++;
                    encontradas.push(palabra);
                }
            }

            if (coincidencias > 0) {
                resultados[categoria] = {
                    coincidencias,
                    encontradas,
                    confianza: Math.min(coincidencias * 12 + 10, 100)
                };
                totalCoincidencias += coincidencias;

                if (resultados[categoria].confianza > mayorConfianza) {
                    mayorConfianza = resultados[categoria].confianza;
                    mejorCategoria = categoria;
                }
            }
        }

        // Si no hay coincidencias exactas
        if (totalCoincidencias === 0) {
            return {
                esServicio: false,
                confianza: 0,
                subcategoria: null,
                razones: []
            };
        }

        // Si hay una categoría clara
        if (mejorCategoria && mayorConfianza >= 40) {
            return {
                esServicio: true,
                confianza: mayorConfianza,
                subcategoria: mejorCategoria,
                razones: resultados[mejorCategoria].encontradas
            };
        }

        // Si hay múltiples categorías
        if (totalCoincidencias >= 3) {
            const sorted = Object.entries(resultados).sort((a, b) => b[1].coincidencias - a[1].coincidencias);
            return {
                esServicio: true,
                confianza: Math.min(sorted[0][1].confianza, 70),
                subcategoria: sorted[0][0],
                razones: sorted[0][1].encontradas
            };
        }

        return {
            esServicio: false,
            confianza: 0,
            subcategoria: null,
            razones: []
        };
    }

    // ================================================================
    // CLASIFICACIÓN DE MARKETPLACE
    // ================================================================
    
    clasificarMarketplace(texto) {
        const textoLower = texto.toLowerCase();
        const encontrados = [];
        let confianza = 0;

        for (const palabra of this.marketplace) {
            if (textoLower.includes(palabra)) {
                encontrados.push(palabra);
                confianza += 15;
            }
        }

        const precioRegex = /\$?\s*\d{1,6}\s*(pesos|mxn|dólares|dolar|usd)?/gi;
        const precios = texto.match(precioRegex) || [];
        if (precios.length > 0) {
            encontrados.push(`Precio: ${precios[0]}`);
            confianza += 20;
        }

        return {
            esMarketplace: confianza >= 40,
            confianza: Math.min(confianza, 100),
            razones: encontrados
        };
    }

    // ================================================================
    // DETECCIÓN DE EMERGENCIA
    // ================================================================
    
    detectarEmergencia(texto) {
        const textoLower = texto.toLowerCase();
        let coincidencias = 0;

        for (const frase of this.frasesEmergencia) {
            if (textoLower.includes(frase)) {
                coincidencias++;
            }
        }

        // Detectar palabras de ubicación + ayuda
        const ubicacion = this.extraerUbicacion(texto);
        if (ubicacion && (textoLower.includes('ayuda') || textoLower.includes('emergencia'))) {
            coincidencias += 2;
        }

        return coincidencias >= 2;
    }

    // ================================================================
    // EXTRACCIÓN DE DATOS ESTRUCTURADOS
    // ================================================================
    
    extraerDatos(texto) {
        const datos = {
            telefonos: [],
            emails: [],
            precios: [],
            direcciones: [],
            urls: [],
            ubicacion: null,
            categoria: null,
            urgencia: 'normal'
        };

        // Teléfonos México
        const telefonoRegex = /(?:55|56|57|58|59|33|81|22|44|65|71|83|84|87|91|99|77|76|75|74|73|72|66|55|56|57|58|59)\d{8}|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        const telefonos = texto.match(telefonoRegex) || [];
        datos.telefonos = telefonos.filter(t => t.length >= 10);

        // Emails
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        datos.emails = texto.match(emailRegex) || [];

        // Precios
        const precioRegex = /\$?\s*\d{1,6}\s*(?:pesos|mxn|dólares|dolar|usd)?/gi;
        const precios = texto.match(precioRegex) || [];
        datos.precios = precios.filter(p => p.length > 0);

        // Direcciones
        const dirRegex = /(?:calle|avenida|colonia|fraccionamiento|privada|cerrada|calzada|blvd|boulevard|carretera)\s+[a-zA-Z0-9\s.,#-]+/gi;
        datos.direcciones = texto.match(dirRegex) || [];

        // URLs
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi;
        datos.urls = texto.match(urlRegex) || [];

        // Ubicación (ciudad/estado)
        datos.ubicacion = this.extraerUbicacion(texto);

        // Urgencia
        datos.urgencia = this.detectarEmergencia(texto) ? 'urgente' : 'normal';

        return datos;
    }

    extraerUbicacion(texto) {
        const ubicaciones = [
            'puebla', 'cdmx', 'ciudad de méxico', 'guadalajara', 'monterrey',
            'toluca', 'querétaro', 'san luis potosí', 'mexicali', 'tijuana',
            'chihuahua', 'hermosillo', 'sinaloa', 'veracruz', 'cancún',
            'morelia', 'oaxaca', 'cholula', 'atlixco', 'tehuacán',
            'izúcar', 'san andrés', 'cuautlancingo', 'san pedro'
        ];
        
        const textoLower = texto.toLowerCase();
        for (const ubicacion of ubicaciones) {
            if (textoLower.includes(ubicacion)) {
                return ubicacion;
            }
        }
        return null;
    }

    // ================================================================
    // DETECTORES AUXILIARES
    // ================================================================
    
    detectarExcesoEmojis(texto) {
        const emojiRegex = /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F201}-\u{1F202}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F23A}\u{1F250}-\u{1F251}]){5,}/u;
        return emojiRegex.test(texto);
    }

    detectarExcesoMayusculas(texto) {
        const mayusculasRegex = /[A-Z]{5,}/;
        return mayusculasRegex.test(texto);
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

    // ================================================================
    // MÉTODO PARA BUSCADOR INTELIGENTE
    // ================================================================
    
    buscarServicios(texto, servicios = []) {
        const clasificacion = this.clasificarServicio(texto);
        const datos = this.extraerDatos(texto);
        
        // Si no es servicio, devolver vacío
        if (!clasificacion.esServicio) {
            return { 
                encontrado: false, 
                categoria: null,
                servicios: [],
                datos: datos,
                mensaje: 'No se detectó un servicio en tu búsqueda.'
            };
        }

        // Filtrar servicios por categoría
        const categoria = clasificacion.subcategoria;
        const categoriaNombre = this.categoriasServicios[categoria]?.nombre || categoria;
        const categoriaIcono = this.categoriasServicios[categoria]?.icono || '📌';

        let filtrados = servicios.filter(s => s.categoria === categoria);

        // Si hay ubicación, priorizar cercanos
        if (datos.ubicacion) {
            filtrados = filtrados.sort((a, b) => {
                // Si tienen ubicación, comparar distancia
                if (a.ubicacion && b.ubicacion) {
                    return a.ubicacion.toLowerCase().includes(datos.ubicacion.toLowerCase()) ? -1 : 1;
                }
                return 0;
            });
        }

        // Si hay emergencia, priorizar
        if (datos.urgencia === 'urgente') {
            filtrados = filtrados.sort((a, b) => {
                if (a.urgencia === 'urgente' && b.urgencia !== 'urgente') return -1;
                if (a.urgencia !== 'urgente' && b.urgencia === 'urgente') return 1;
                return 0;
            });
        }

        // Ordenar por calificación
        filtrados = filtrados.sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0));

        return {
            encontrado: true,
            categoria: categoria,
            categoriaNombre: categoriaNombre,
            categoriaIcono: categoriaIcono,
            servicios: filtrados.slice(0, 10),
            datos: datos,
            confianza: clasificacion.confianza,
            mensaje: `🔍 Encontrados ${filtrados.length} ${categoriaNombre}${filtrados.length > 0 ? ' para ti' : ''}`
        };
    }
}

// ================================================================
// EXPORTAR INSTANCIA ÚNICA
// ================================================================

export const moderador = new ModeracionIA();