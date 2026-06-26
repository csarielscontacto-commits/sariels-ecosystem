// Sistema Nervioso Central - Sariel's Bakery
// Conecta: IA Neurosimbólica + Báscula IoT + WhatsApp

function ejecutarCicloAutonomo() {
    const motor = require('./ia-neurosimbolica/motor_decisiones.js');
    const bascula = require('./ia-backend/monitor_bascula.js');
    const comprador = require('./panaderia/comprador_autonomo.js');
    
    // 1. Predicción y Producción
    const decision = motor.tomarDecisionProduccion();
    
    // 2. Monitoreo en tiempo real (Báscula)
    const estadoProduccion = bascula.registrarPeso(19.5, "sevillanos");
    
    // 3. Acción Autónoma (WhatsApp si hay problema)
    if (estadoProduccion.estado === "Merma") {
        return comprador.ejecutarCompra("Harina", 50); 
    }
    
    return "Sistema operando en autonomía total: Todo en orden.";
}

