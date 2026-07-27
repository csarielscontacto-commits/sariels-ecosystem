// ================================================================
// MODERACIÓN IA AVANZADA - Csariel's Ecosystem
// ================================================================

export class ModeracionIA {
    constructor() {
        // ============================================================
        // LISTAS DE PALABRAS POR CATEGORÍA
        // ============================================================
        
        // SPAM - Bots, enlaces sospechosos, mensajes repetitivos
        this.spam = [
            'click aquí', 'gana dinero', 'inversión segura', 'préstamo fácil',
            'hazte rico', 'trabajo desde casa', 'dinero rápido', 'millonario',
            'código promocional', 'link', 'enlace', 'suscríbete', 'regístrate',
            'bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 'is.gd', 'acortar'
        ];
        
        // SERVICIOS - Palabras que indican búsqueda u oferta de servicios
        this.servicios = {
            // Mecánica
            mecanico: ['mecánico', 'mecanico', 'taller', 'reparación', 'motor', 'frenos', 'suspensión', 'diagnóstico', 'aceite', 'filtro', 'batería', 'alternador', 'transmisión', 'embrague'],
            // Llantas
            talachero: ['talachero', 'llanta', 'ponchada', 'parche', 'balanceo', 'alineación', 'cámara', 'neumático', 'válvula'],
            // Gasolina
            gasolina: ['gasolina', 'gasolinera', 'combustible', 'magnas', 'premium', 'diésel', 'tanque', 'litros'],
            // Grúa
            grua: ['grúa', 'grua', 'remolque', 'arrastre', 'ayuda en carretera', 'carretera', 'autopista'],
            // Construcción
            plomero: ['plomero', 'fontanero', 'tubería', 'fuga', 'cañería', 'lavabo', 'sanitario', 'cisterna', 'bomba de agua'],
            electricista: ['electricista', 'eléctrico', 'cableado', 'instalación', 'luz', 'contacto', 'apagador', 'tablero', 'corto circuito'],
            albañil: ['albañil', 'construcción', 'pared', 'pintura', 'azulejo', 'cemento', 'tabique', 'yeso', 'impermeabilización'],
            // Hogar
            carpintero: ['carpintero', 'madera', 'mueble', 'puerta', 'ventana', 'clóset', 'cocina', 'gabinete'],
            jardinero: ['jardinero', 'jardín', 'poda', 'árbol', 'césped', 'planta', 'riego', 'tierra'],
            limpieza: ['limpieza', 'aseo', 'fumigación', 'desinfección', 'plagas', 'cocina', 'baño'],
            // Tecnología
            técnico: ['técnico', 'tecnico', 'computadora', 'laptop', 'celular', 'teléfono', 'tablet', 'red', 'internet', 'wifi', 'virus', 'software', 'hardware'],
            // Servicios personales
            abogado: ['abogado', 'legal', 'juicio', 'contrato', 'demanda', 'notaría', 'testamento', 'divorcio'],
            contador: ['contador', 'contable', 'impuestos', 'declaración', 'factura', 'IVA', 'ISR', 'nómina'],
            médico: ['médico', 'doctor', 'enfermero', 'clínica', 'consulta', 'emergencia', 'médica', 'salud'],
            // Comida
            chef: ['chef', 'cocinero', 'comida', 'catering', 'evento', 'banquete', 'restaurante', 'domicilio'],
            repartidor: ['repartidor', 'mensajero', 'delivery', 'envío', 'paquete', 'urgente'],
            // Educación
            profesor: ['profesor', 'maestro', 'tutor', 'clase', 'enseñanza', 'educación', 'escolar', 'universidad', 'particular'],
            // Transporte
            chofer: ['chofer', 'conductor', 'transporte', 'viaje', 'camioneta', 'auto', 'uber', 'did', 'taxi'],
            bicicleta: ['bicicleta', 'bici', 'rodada', 'ciclismo', 'bici'],
            // Tiendas
            tienda: ['tienda', 'oxxo', 'súper', 'abarrotes', 'conveniencia', 'mercado', 'abarrote', 'esquincle'],
            farmacia: ['farmacia', 'medicamento', 'receta', 'droguería', 'botiquín'],
            cafe: ['café', 'cafe', 'cafetería', 'espresso', 'capuchino', 'barista'],
            // Generales
            general: ['servicio', 'ayuda', 'auxilio', 'emergencia', 'urgente', 'necesito', 'busco', 'ofrezco']
        };
        
        // MARKETPLACE - Palabras de compra/venta
        this.marketplace = [
            'vendo', 'compro', 'oferta', 'descuento', 'precio', 'remate', 
            'usado', 'nuevo', 'garantía', 'entrega', 'envío', 'negociable',
            'pesos', 'mxn', 'dólar', 'cambio', 'intercambio', 'trueque'
        ];
        
        // OFENSIVO - Palabras prohibidas
        this.ofensivo = [
            'pendejo', 'idiota', 'estúpido', 'imbécil', 'puta', 'zorra',
            'mierda', 'cabrón', 'chinga', 'verga', 'pito', 'pene',
            'puto', 'maricón', 'marica', 'joto', 'culero', 'ojete',
            'hijo de puta', 'hdp', 'come mierda', 'basura'
        ];
        
        // Umbrales
        this.umbralSpam = 3;
        this.maxEmojisConsecutivos = 5;
        this.maxMayusculasConsecutivas = 5;
        this.maxPalabrasRepetidas = 3;
        this.confianzaMinima = 60; // % mínimo para clasificar
        
        console.log('🧠 Moderación IA Avanzada inicializada');
        console.log(`📋 ${Object.keys(this.servicios).length} categorías de servicios`);
    }
    
    // ================================================================
    // MÉTODO PRINCIPAL - CLASIFICACIÓN INTELIGENTE
    // ================================================================
    
    clasificar(texto, usuario = null) {
        const resultado = {
            categoria: 'mi_red', // mi_red | servicios | marketplace | spam
            confianza: 0,
            subcategoria: null,
            razones: [],
            aprobado: true,
            mensaje: '',
            datosExtraidos: {
                telefonos: [],
                emails: [],
                precios: [],
                direcciones: [],
                urls: []
            }
        };
        
        // 1. Extraer datos estructurados
        resultado.datosExtraidos = this.extraerDatos(texto);
        
        // 2. Verificar spam
        const spamCheck = this.verificarSpam(texto);
        if (spamCheck.esSpam) {
            resultado.categoria = 'spam';
            resultado.confianza = spamCheck.confianza;
            resultado.razones = spamCheck.razones;
            resultado.aprobado = false;
            resultado.mensaje = '⚠️ Contenido detectado como spam.';
            return resultado;
        }
        
        // 3. Verificar ofensivo
        const ofensivoCheck = this.verificarOfensivo(texto);
        if (ofensivoCheck.tieneOfensivo) {
            resultado.categoria = 'spam';
            resultado.confianza = 90;
            resultado.razones = ofensivoCheck.razones;
            resultado.aprobado = false;
            resultado.mensaje = '⛔ Contenido ofensivo no permitido.';
            return resultado;
        }
        
        // 4. Clasificar como Servicio
        const servicioCheck = this.clasificarServicio(texto);
        if (servicioCheck.esServicio && servicioCheck.confianza >= this.confianzaMinima) {
            resultado.categoria = 'servicios';
            resultado.confianza = servicioCheck.confianza;
            resultado.subcategoria = servicioCheck.subcategoria;
            resultado.razones = servicioCheck.razones;
            resultado.aprobado = true;
            resultado.mensaje = `🔧 Servicio detectado (${servicioCheck.subcategoria}) con ${servicioCheck.confianza}% de confianza.`;
            return resultado;
        }
        
        // 5. Clasificar como Marketplace
        const marketplaceCheck = this.clasificarMarketplace(texto);
        if (marketplaceCheck.esMarketplace && marketplaceCheck.confianza >= this.confianzaMinima) {
            resultado.categoria = 'marketplace';
            resultado.confianza = marketplaceCheck.confianza;
            resultado.razones = marketplaceCheck.razones;
            resultado.aprobado = true;
            resultado.mensaje = `🛒 Compra/venta detectada con ${marketplaceCheck.confianza}% de confianza.`;
            return resultado;
        }
        
        // 6. Si no clasifica, va a Mi Red
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
        
        // Detectar URLs sospechosas
        const urlRegex = /(https?:\/\/)?(www\.)?[a-z0-9-]+\.(com|mx|org|net|info|biz|xyz|top)\/[a-z0-9]{1,6}/gi;
        const urls = texto.match(urlRegex) || [];
        if (urls.length > 0) {
            coincidencias.push(`URL sospechosa: ${urls[0]}`);
            confianza += 20;
        }
        
        // Detectar exceso de emojis
        if (this.detectarExcesoEmojis(texto)) {
            coincidencias.push('Exceso de emojis consecutivos');
            confianza += 10;
        }
        
        // Detectar exceso de mayúsculas
        if (this.detectarExcesoMayusculas(texto)) {
            coincidencias.push('Exceso de mayúsculas consecutivas');
            confianza += 10;
        }
        
        // Detectar palabras repetidas
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
        
        // Verificar cada categoría
        for (const [categoria, palabras] of Object.entries(this.servicios)) {
            let coincidencias = 0;
            const encontradas = [];
            
            for (const palabra of palabras) {
                if (textoLower.includes(palabra)) {
                    coincidencias++;
                    encontradas.push(palabra);
                }
            }
            
            if (coincidencias > 0) {
                resultados[categoria] = {
                    coincidencias,
                    encontradas,
                    confianza: Math.min(coincidencias * 15, 100)
                };
                totalCoincidencias += coincidencias;
                
                if (resultados[categoria].confianza > mayorConfianza) {
                    mayorConfianza = resultados[categoria].confianza;
                    mejorCategoria = categoria;
                }
            }
        }
        
        // Si no hay coincidencias, verificar palabras generales
        if (totalCoincidencias === 0) {
            const generales = this.servicios.general;
            let genCoincidencias = 0;
            const genEncontradas = [];
            
            for (const palabra of generales) {
                if (textoLower.includes(palabra)) {
                    genCoincidencias++;
                    genEncontradas.push(palabra);
                }
            }
            
            if (genCoincidencias >= 2) {
                return {
                    esServicio: true,
                    confianza: Math.min(genCoincidencias * 20, 60),
                    subcategoria: 'general',
                    razones: genEncontradas
                };
            }
            
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
        
        // Si hay múltiples categorías pero ninguna domina
        if (totalCoincidencias >= 3) {
            // Tomar la que tenga más coincidencias
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
        
        // Detectar precios ($100, 100 pesos, 100 MXN)
        const precioRegex = /\$?\s*\d{1,6}\s*(pesos|mxn|dólares|dolar|usd)?/gi;
        const precios = texto.match(precioRegex) || [];
        if (precios.length > 0) {
            encontrados.push(`Precio detectado: ${precios[0]}`);
            confianza += 20;
        }
        
        return {
            esMarketplace: confianza >= 40,
            confianza: Math.min(confianza, 100),
            razones: encontrados
        };
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
            urls: []
        };
        
        // Teléfonos (México)
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
        
        // Direcciones (calle, avenida, colonia, etc.)
        const dirRegex = /(?:calle|avenida|colonia|fraccionamiento|privada|cerrada|calzada|blvd|boulevard|carretera)\s+[a-zA-Z0-9\s.,#-]+/gi;
        datos.direcciones = texto.match(dirRegex) || [];
        
        // URLs
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi;
        datos.urls = texto.match(urlRegex) || [];
        
        return datos;
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
    // DETECTOR DE SERVICIOS (Para usar desde Muro Live)
    // ================================================================
    
    detectarServicio(texto) {
        const resultado = this.clasificarServicio(texto);
        const datos = this.extraerDatos(texto);
        
        return {
            esServicio: resultado.esServicio,
            confianza: resultado.confianza,
            categoria: resultado.subcategoria,
            razones: resultado.razones,
            datos: datos,
            mensaje: resultado.esServicio 
                ? `🔧 Servicio detectado (${resultado.subcategoria}) con ${resultado.confianza}% de confianza.`
                : null
        };
    }
}

// ================================================================
// EXPORTAR INSTANCIA ÚNICA
// ================================================================

export const moderador = new ModeracionIA();