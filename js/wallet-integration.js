// ================================================================
// 💳 CSARIEL'S WALLET INTEGRATION
// Botón de compra con wallet invisible
// Para usar en mi-internet.html y otros módulos
// Hecho en Puebla, México
// Versión: 1.0.0
// ================================================================

// ================================================================
// 📦 IMPORTAR DEPENDENCIAS
// ================================================================

import { useCsarielsWallet, useCsarielsWalletSimple } from './wallet-provider.js';

// ================================================================
// 🛒 COMPONENTE BOTÓN DE COMPRA
// ================================================================

export function BotonComprarInternet({ 
  plan, 
  precio, 
  onCompra, 
  className = '', 
  children = null 
}) {
  const { authenticated, walletAddress, login, ready } = useCsarielsWallet();

  const handleClick = async () => {
    if (!ready) {
      console.log('⏳ Privy no está listo aún...');
      return;
    }

    if (!authenticated) {
      login(); // El usuario inicia sesión con correo
      return;
    }

    console.log('💳 Cliente va a pagar con:', walletAddress);
    console.log(`📦 Plan: ${plan} - $${precio} MXN`);

    if (typeof onCompra === 'function') {
      await onCompra(walletAddress, plan, precio);
    }
  };

  const textoBoton = authenticated 
    ? (children || `Comprar $${precio} MXN`) 
    : 'Iniciar sesión para comprar';

  return (
    <button 
      className={`btn btn-internet btn-comprar-plan ${className}`}
      onClick={handleClick}
      disabled={!ready}
    >
      <i className="fas fa-shopping-cart"></i> 
      {textoBoton}
    </button>
  );
}

// ================================================================
// 🪝 HOOK PARA USAR EN CUALQUIER COMPONENTE
// ================================================================

export function useCsarielsWalletSimple() {
  const { authenticated, walletAddress, login, ready } = useCsarielsWallet();

  const pagarConWallet = async (monto, concepto, datos = {}) => {
    if (!ready) {
      console.log('⏳ Privy no está listo aún...');
      return { 
        success: false, 
        error: 'Privy no está listo aún',
        codigo: 'PRIVY_NOT_READY'
      };
    }

    if (!authenticated) {
      login();
      return { 
        success: false, 
        error: 'Usuario no autenticado',
        codigo: 'USER_NOT_AUTHENTICATED',
        requiereLogin: true
      };
    }

    console.log(`💳 Pagando ${monto} desde wallet ${walletAddress}`);
    console.log(`📝 Concepto: ${concepto}`);
    console.log('📋 Datos adicionales:', datos);

    try {
      // ================================================================
      // 🚀 AQUÍ VA LA LÓGICA REAL DE PAGO
      // ================================================================
      
      // Ejemplo: Guardar en Supabase
      // const { data, error } = await supabase
      //   .from('transacciones')
      //   .insert({
      //     wallet: walletAddress,
      //     monto: monto,
      //     concepto: concepto,
      //     datos: datos,
      //     fecha: new Date().toISOString()
      //   });

      // Simular éxito
      const resultado = {
        success: true,
        wallet: walletAddress,
        monto: monto,
        concepto: concepto,
        datos: datos,
        transaccionId: 'tx_' + Date.now(),
        fecha: new Date().toISOString()
      };

      // Disparar evento de pago completado
      document.dispatchEvent(new CustomEvent('csariels:pago', {
        detail: resultado
      }));

      return resultado;

    } catch (error) {
      console.error('❌ Error al procesar el pago:', error);
      return {
        success: false,
        error: error.message,
        codigo: 'PAYMENT_ERROR'
      };
    }
  };

  return {
    authenticated,
    walletAddress,
    login,
    ready,
    pagarConWallet
  };
}

// ================================================================
// 🏷️ COMPONENTE DE ESTADO DE WALLET
// ================================================================

export function WalletStatus() {
  const { authenticated, walletAddress, ready } = useCsarielsWallet();

  if (!ready) {
    return (
      <div className="wallet-status loading">
        <span className="wallet-dot loading"></span>
        <span className="wallet-text">Cargando wallet...</span>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="wallet-status disconnected">
        <span className="wallet-dot offline"></span>
        <span className="wallet-text">Wallet desconectada</span>
        <button className="btn btn-sm btn-primary" onClick={() => useCsarielsWallet().login()}>
          Conectar
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-status connected">
      <span className="wallet-dot online"></span>
      <span className="wallet-text" title={walletAddress}>
        {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
      </span>
      <span className="wallet-badge">✅ Conectada</span>
    </div>
  );
}

// ================================================================
// 🛒 EJEMPLO DE USO EN MI-INTERNET.HTML
// ================================================================

/*

// En tu archivo mi-internet.html, agrega esto:

import { BotonComprarInternet, useCsarielsWalletSimple } from './js/wallet-integration.js';

// Para cada plan:
<BotonComprarInternet 
  plan="basico"
  precio={99}
  onCompra={async (wallet, plan, precio) => {
    console.log('🛒 Comprando plan:', plan, 'con wallet:', wallet);
    // Aquí guardas la compra en tu base de datos
    // Ejemplo: await supabase.from('compras').insert({ wallet, plan, precio });
  }}
/>

// O usando el hook directamente:
function MiComponente() {
  const { pagarConWallet } = useCsarielsWalletSimple();

  const handleCompra = async () => {
    const resultado = await pagarConWallet(99, 'Plan Básico', { plan: 'basico' });
    if (resultado.success) {
      alert('✅ Compra exitosa!');
    }
  };

  return <button onClick={handleCompra}>Comprar</button>;
}

*/

// ================================================================
// 📦 EXPORTAR POR DEFECTO
// ================================================================

export default {
  BotonComprarInternet,
  useCsarielsWalletSimple,
  WalletStatus
};

// ================================================================
// 🏁 LOG DE INICIALIZACIÓN
// ================================================================

console.log('◈ Csariel\'s Wallet Integration v1.0.0');
console.log('📍 Hecho en Puebla, México');
console.log('💳 Integración de wallet invisible lista');