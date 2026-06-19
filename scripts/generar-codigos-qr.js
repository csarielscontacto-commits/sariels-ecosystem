const fs = typeof require !== 'undefined' ? require('fs') : null;
const path = typeof require !== 'undefined' ? require('path') : null;

const BASE_CLAIM_URL = 'https://csarielscontacto-commits.github.io/sariels-ecosystem/claim.html';

function generarCodigos(cantidad, opciones = {}) {
    const n = Number(cantidad);
    if (!Number.isInteger(n) || n <= 0) {
        throw new Error('La cantidad debe ser un entero positivo');
    }

    const claimPageUrl = opciones.claimPageUrl || BASE_CLAIM_URL;
    const now = new Date().toISOString();

    return Array.from({ length: n }, (_, index) => {
        const id = index + 1;
        const codigo = `SarielTO#${String(id).padStart(3, '0')}`;

        return {
            id,
            codigo,
            url_claim: `${claimPageUrl}?code=${encodeURIComponent(codigo)}`,
            estado: 'disponible',
            fecha_creacion: now,
            fecha_reclamo: null,
            wallet_reclamo: null
        };
    });
}

function guardarCodigosJSON(codigos) {
    if (!fs || !path) {
        throw new Error('Guardar archivo solo está disponible en entorno Node.js');
    }

    const outputPath = path.join(__dirname, '..', 'data', 'codigos-qr.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(codigos, null, 2)}\n`, 'utf8');
    return outputPath;
}

if (typeof module !== 'undefined') {
    module.exports = { generarCodigos };
}

if (typeof window !== 'undefined') {
    window.generarCodigos = generarCodigos;
}

if (typeof require !== 'undefined' && require.main === module) {
    try {
        const cantidad = Number(process.argv[2]);
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new Error('Uso: node scripts/generar-codigos-qr.js <cantidad>');
        }

        const codigos = generarCodigos(cantidad);
        const outputPath = guardarCodigosJSON(codigos);
        console.log(`✅ Generados ${codigos.length} códigos en ${outputPath}`);
    } catch (error) {
        console.error(`❌ ${error.message}`);
        process.exitCode = 1;
    }
}
