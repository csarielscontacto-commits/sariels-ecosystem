// Monitor de Báscula IoT - Sariel's Bakery
function registrarPeso(pesoActual, tipoProducto) {
    const pesoObjetivo = 20; // Peso por unidad (gramos)
    
    if (pesoActual > pesoObjetivo) {
        return { estado: "Excedente", diferencia: pesoActual - pesoObjetivo };
    } else if (pesoActual < pesoObjetivo) {
        return { estado: "Merma", diferencia: pesoObjetivo - pesoActual };
    } else {
        return { estado: "Óptimo", diferencia: 0 };
    }
}

