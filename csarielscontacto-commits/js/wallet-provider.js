// ================================================================
// WALLET PROVIDER - CSARIEL'S
// Billetera invisible con Privy
// ================================================================

// Instalar: npm install @privy-io/react-auth

import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';

// ================================================================
// CONFIGURACIÓN
// ================================================================

const PRIVY_APP_ID = 'TU_APP_ID_DE_PRIVY'; // <-- Obténlo en dashboard.privy.io

// ================================================================
// PROVIDER - Envuelve tu plataforma
// ================================================================

export function CsarielsWalletProvider({ children }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'google', 'sms'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets' // <-- ¡LA MAGIA!
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}

// ================================================================
// HOOKS - Para usar en tus componentes
// ================================================================

export function useCsarielsWallet() {
  const { user, login, logout, authenticated } = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = wallets?.[0]?.address || null;

  return {
    user,
    authenticated,
    walletAddress,
    login,
    logout
  };
}

// ================================================================
// EJEMPLO DE USO EN TU PLATAFORMA
// ================================================================

/*

// En tu componente de Comprar Internet (mi-internet.html):
import { useCsarielsWallet } from './js/wallet-provider.js';

function ComprarInternet() {
  const { authenticated, walletAddress, login } = useCsarielsWallet();

  const handleComprar = (plan) => {
    if (!authenticated) {
      login(); // El usuario inicia sesión con correo
      return;
    }

    // Aquí ya tienes walletAddress (la billetera invisible)
    console.log('Comprando plan con wallet:', walletAddress);
    
    // Hacer la transacción on-chain sin que el usuario sepa
    // ... tu lógica de pago
  };

  return (
    <div>
      {authenticated ? (
        <button onClick={() => handleComprar('basico')}>
          Comprar Plan Básico - $99 MXN
        </button>
      ) : (
        <button onClick={login}>
          Iniciar sesión para comprar
        </button>
      )}
    </div>
  );
}

*/