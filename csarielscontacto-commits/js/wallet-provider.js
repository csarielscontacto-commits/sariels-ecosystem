// ================================================================
// 💳 CSARIEL'S WALLET PROVIDER - Billetera Invisible
// Con Privy.io - Hecho en Puebla, México
// Versión: 1.0.0
// ================================================================

// 📦 Instalar: npm install @privy-io/react-auth

import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';

// ================================================================
// 🔑 CONFIGURACIÓN
// ================================================================

// 👇 OBTÉN TU APP ID EN dashboard.privy.io (GRATIS)
// VE A: https://dashboard.privy.io -> Create App -> Copia el App ID
const PRIVY_APP_ID = 'cl_xxxxxxxxxxx';

// ================================================================
// 📦 PROVIDER - Envuelve tu plataforma
// ================================================================

export function CsarielsWalletProvider({ children }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'google', 'sms'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets' // 🎯 ¡LA MAGIA!
        },
        appearance: {
          theme: 'dark',
          accentColor: '#D4AF37', // 🟡 Dorado Csariel's
          logo: '◈' // Logo de Csariel's
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}

// ================================================================
// 🪝 HOOKS - Para usar en tus componentes
// ================================================================

export function useCsarielsWallet() {
  const { user, login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = wallets?.[0]?.address || null;
  const walletChain = wallets?.[0]?.chainId || null;

  return {
    user,
    authenticated,
    ready,
    walletAddress,
    walletChain,
    login,
    logout,
    isReady: ready,
    isLoggedIn: authenticated
  };
}

// ================================================================
// 🛠️ UTILIDADES
// ================================================================

export function useCsarielsWalletSimple() {
  const { authenticated, walletAddress, login, ready } = useCsarielsWallet();

  const pagarConWallet = async (monto, concepto) => {
    if (!ready) {
      console.log('⏳ Privy no está listo aún...');
      return { success: false, error: 'Privy no listo' };
    }

    if (!authenticated) {
      login();
      return { success: false, error: 'Usuario no autenticado' };
    }

    console.log(`💳 Pagando ${monto} desde wallet ${walletAddress}`);
    console.log(`📝 Concepto: ${concepto}`);

    // Aquí va la lógica real de pago
    return {
      success: true,
      wallet: walletAddress,
      monto,
      concepto
    };
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
// 📦 EXPORTAR POR DEFECTO
// ================================================================

export default {
  CsarielsWalletProvider,
  useCsarielsWallet,
  useCsarielsWalletSimple
};

// ================================================================
// 🏁 LOG DE INICIALIZACIÓN
// ================================================================

console.log('◈ Csariel\'s Wallet Provider v1.0.0');
console.log('📍 Hecho en Puebla, México');
console.log('💳 Billetera invisible activada');
console.log('🔑 App ID:', PRIVY_APP_ID);