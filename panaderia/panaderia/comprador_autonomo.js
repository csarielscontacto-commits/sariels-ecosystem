// Comprador Autónomo - Sariel's Bakery
function ejecutarCompra(insumo, cantidad) {
    const proveedores = require('./proveedores.json');
    const contacto = proveedores.proveedores.find(p => p.insumo === insumo);
    
    if (contacto) {
        console.log(`Enviando mensaje a ${contacto.nombre} al ${contacto.telefono}...`);
        return `Hola, soy el sistema de Sariel's. Necesito ${cantidad}kg de ${insumo}. Favor de cotizar.`;
    } else {
        return "Proveedor no encontrado en la base de datos.";
    }
}

