// ================================================================
// 🔑 PASSKEY WALLET - Conexión Automática con WebAuthn
// ================================================================

(function() {
    'use strict';

    let walletConectada = false;
    let cuentaWallet = '';

    // ================================================================
    // 🦊 TOGGLE BOTÓN (Checkbox)
    // ================================================================
    function toggleWalletButton() {
        const checkbox = document.getElementById('acceptTermsWallet');
        const btn = document.getElementById('btnWallet');
        if (checkbox && btn) {
            btn.disabled = !checkbox.checked;
        }
    }

    // ================================================================
    // 🔑 CONEXIÓN AUTOMÁTICA (Passkeys / WebAuthn)
    // ================================================================
    async function conectarWalletPasskey() {
        const checkbox = document.getElementById('acceptTermsWallet');
        if (!checkbox || !checkbox.checked) {
            mostrarToast('⚠️ Debes aceptar los Términos y Condiciones para continuar', 'error');
            return;
        }

        try {
            // Verificar soporte de WebAuthn
            if (!window.PublicKeyCredential) {
                mostrarToast('⚠️ Tu navegador no soporta Passkeys. Usa Chrome o Edge.', 'error');
                return;
            }

            // Intentar obtener credenciales existentes
            let walletAddress = null;
            let credential = null;

            try {
                const availableCredentials = await navigator.credentials.get({
                    publicKey: {
                        challenge: new Uint8Array(32),
                        rpId: window.location.hostname,
                        allowCredentials: [],
                        userVerification: 'required',
                        timeout: 60000,
                    }
                });
                if (availableCredentials) {
                    credential = availableCredentials;
                }
            } catch (e) {
                // No hay credenciales existentes, continuar con creación
                console.log('No se encontraron credenciales existentes, creando nueva...');
            }

            if (credential) {
                // Conectar wallet existente
                walletAddress = `0x${Array.from(new Uint8Array(credential.rawId))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('')}`;
                mostrarToast('✅ Wallet reconectada automáticamente');
            } else {
                // Crear nueva wallet (registro)
                const challenge = new Uint8Array(32);
                window.crypto.getRandomValues(challenge);

                const publicKeyCredentialCreationOptions = {
                    challenge: challenge,
                    rp: {
                        name: 'Csariel\'s Ecosystem',
                        id: window.location.hostname,
                    },
                    user: {
                        id: new TextEncoder().encode('csariels-user-' + Date.now()),
                        name: 'csariels-user@ecosystem',
                        displayName: 'Csariel\'s User',
                    },
                    pubKeyCredParams: [
                        { type: 'public-key', alg: -7 },
                        { type: 'public-key', alg: -257 },
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                        residentKey: 'required',
                    },
                    timeout: 60000,
                    attestation: 'none',
                };

                const newCredential = await navigator.credentials.create({
                    publicKey: publicKeyCredentialCreationOptions
                });

                walletAddress = `0x${Array.from(new Uint8Array(newCredential.rawId))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('')}`;
                mostrarToast('✅ Wallet creada automáticamente con Passkeys');
            }

            // Guardar wallet
            walletConectada = true;
            cuentaWallet = walletAddress;

            localStorage.setItem('csariels_wallet_address', walletAddress);

            // Intentar guardar en Supabase
            try {
                const user = await obtenerUsuario();
                if (user) {
                    const client = await esperarSupabase();
                    await client
                        .from('perfiles')
                        .update({ wallet_address: walletAddress })
                        .eq('id', user.id);
                }
            } catch (e) {
                console.warn('⚠️ No se pudo guardar wallet en Supabase:', e);
            }

            // Actualizar UI
            const statusText = document.getElementById('walletStatusText');
            const statusIcon = document.querySelector('.wallet-status .disconnected');
            const btn = document.getElementById('btnWallet');

            if (statusText) {
                statusText.textContent = `Conectado: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
            }
            if (statusIcon) {
                statusIcon.className = 'fas fa-circle connected';
            }
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Wallet conectada';
                btn.className = 'btn btn-success';
                btn.disabled = true;
            }

            mostrarToast(`✅ Wallet conectada: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);

        } catch (error) {
            console.error('Error conectando wallet:', error);
            if (error.name === 'NotAllowedError') {
                mostrarToast('❌ Operación cancelada por el usuario', 'error');
            } else if (error.name === 'NotSupportedError') {
                mostrarToast('⚠️ Passkeys no soportados en este dispositivo', 'error');
            } else {
                mostrarToast('❌ Error al conectar wallet: ' + error.message, 'error');
            }
        }
    }

    // ================================================================
    // 📦 EXPORTAR
    // ================================================================
    window.PasskeyWallet = {
        toggleWalletButton,
        conectarWalletPasskey,
        walletConectada: () => walletConectada,
        cuentaWallet: () => cuentaWallet
    };

    // Exponer funciones globales
    window.toggleWalletButton = toggleWalletButton;
    window.conectarWalletPasskey = conectarWalletPasskey;

    console.log('🔑 Passkey Wallet cargado');

})();