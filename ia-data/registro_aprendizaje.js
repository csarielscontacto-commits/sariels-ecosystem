// Registro de Aprendizaje - Sariel's Bakery
function guardarVenta(producto, cantidad, clima) {
    // Esta función simula cómo tu IA guarda el conocimiento
    const registro = {
        fecha: new Date().toISOString(),
        producto: producto,
        cantidad: cantidad,
        clima: clima
    };
    console.log("IA aprendiendo nueva venta:", registro);
    return registro;
}

