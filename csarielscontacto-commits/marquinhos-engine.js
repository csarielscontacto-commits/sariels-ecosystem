// ================================================================
// 🆕 PUBLICIDAD EN MARQUINHOS - ENGINE
// ================================================================

// 1. OBTENER ANUNCIOS ACTIVOS
async function obtenerAnunciosActivos() {
    const client = supabase;
    if (!client) return [];

    try {
        const hoy = new Date().toISOString();
        const { data, error } = await client
            .from('publicidad_marquinhos')
            .select('*')
            .eq('pago_confirmado', true)
            .lte('fecha_inicio', hoy)
            .gte('fecha_fin', hoy)
            .order('nivel', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Error obteniendo anuncios:', error);
        return [];
    }
}

// 2. ALGORITMO DE SELECCIÓN (el que paga más, aparece más)
function seleccionarAnuncio(anuncios) {
    if (!anuncios || anuncios.length === 0) return null;

    const pesos = {
        'basico': 1,
        'estandar': 2,
        'premium': 4,
        'patrocinado': 8
    };

    let totalPeso = 0;
    anuncios.forEach(a => {
        totalPeso += pesos[a.nivel] || 1;
    });

    let random = Math.random() * totalPeso;
    for (let anuncio of anuncios) {
        const peso = pesos[anuncio.nivel] || 1;
        if (random < peso) {
            return anuncio;
        }
        random -= peso;
    }
    return anuncios[0];
}

// 3. OBTENER ANUNCIO PARA LA BURBUJA
async function getAnuncioParaBurbuja() {
    const anuncios = await obtenerAnunciosActivos();
    if (anuncios.length === 0) return null;

    const seleccionado = seleccionarAnuncio(anuncios);
    if (seleccionado) {
        await registrarVisualizacion(seleccionado.id);
    }
    return seleccionado;
}

// 4. REGISTRAR VISUALIZACIÓN
async function registrarVisualizacion(anuncio_id) {
    // Incrementar contador en Supabase
}

// 5. REGISTRAR CLICK
async function registrarClick(anuncio_id) {
    // Incrementar contador de clics
}

// 6. COMPRAR PUBLICIDAD
async function comprarPublicidad(datos) {
    // Guardar en Supabase
}