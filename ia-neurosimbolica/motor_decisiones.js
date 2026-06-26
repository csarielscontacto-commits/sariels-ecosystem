// Motor Neurosimbólico Sariel's
function tomarDecisionProduccion(receta, tendenciaMercado, inventario) {
    // Parte Simbólica: Reglas de oro (no negociables)
    const margenSeguridad = 1.10; 
    
    // Parte Neuronal: Predicción de demanda (IA)
    const demandaEsperada = tendenciaMercado.predecir();
    
    // Resultado: La IA decide, la Lógica Simbólica audita
    const produccionFinal = (demandaEsperada * margenSeguridad) - inventario;
    
    return {
        accion: "Producir",
        cantidad: produccionFinal,
        razonamiento: "IA predijo demanda, lógica simbólica aplicó margen de seguridad."
    };
}

