/**
 * web3-wallet.js
 * Sariel's Ecosystem — Módulo de gestión de wallet Web3
 *
 * Responsabilidades:
 *   • Conexión con MetaMask / proveedor EIP-1193
 *   • Auto-switch obligatorio a Polygon (chainId 137)
 *   • Guardia administrativa: solo la wallet autorizada puede
 *     activar acciones marcadas con data-admin-only="true"
 *   • Pilar Social: hooks para vincular actividades sociales
 *     (lealtad, comunidad, interacciones) con transacciones NFT/TOK
 *   • Sin interferencia con Supabase ni con el sistema P2P
 *     (base-datos-centralizada.js / BroadcastChannel)
 *
 * Uso:
 *   Carga este script DESPUÉS de config.js:
 *   <script src="config.js"></script>
 *   <script src="web3-wallet.js"></script>
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // Constantes
  // ─────────────────────────────────────────────
  const ADMIN_WALLET   = '0x8F742964244AE588dF7C5B2b27Ded374fDdAd69b';
  const POLYGON_CHAIN_ID_HEX = '0x89'; // 137 decimal
  const POLYGON_CHAIN_ID_DEC = 137;

  const POLYGON_PARAMS = {
    chainId: POLYGON_CHAIN_ID_HEX,
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com']
  };

  // ─────────────────────────────────────────────
  // Estado interno
  // ─────────────────────────────────────────────
  let _account  = null;   // dirección conectada en minúsculas
  let _isAdmin  = false;  // true sólo cuando _account === ADMIN_WALLET (case-insensitive)
  let _chainId  = null;   // chainId actual (decimal)
  let _provider = null;   // window.ethereum

  // ─────────────────────────────────────────────
  // Utilidades
  // ─────────────────────────────────────────────
  const log  = (...a) => console.log('[Wallet]', ...a);
  const warn = (...a) => console.warn('[Wallet]', ...a);
  const err  = (...a) => console.error('[Wallet]', ...a);

  function normalizeAddr(addr) {
    return (addr || '').toLowerCase();
  }

  function isAdminAddr(addr) {
    return normalizeAddr(addr) === normalizeAddr(ADMIN_WALLET);
  }

  function hexToInt(hex) {
    return parseInt(hex, 16);
  }

  function emitir(nombre, detail = {}) {
    window.dispatchEvent(new CustomEvent(nombre, { detail }));
  }

  // ─────────────────────────────────────────────
  // Control de botones admin-only
  // ─────────────────────────────────────────────
  function aplicarGuardaAdmin() {
    document.querySelectorAll('[data-admin-only="true"]').forEach(el => {
      if (_isAdmin) {
        el.removeAttribute('disabled');
        el.classList.remove('wallet-admin-locked');
        el.title = '';
      } else {
        el.setAttribute('disabled', 'true');
        el.classList.add('wallet-admin-locked');
        el.title = 'Solo disponible para la wallet administrativa';
      }
    });
  }

  // ─────────────────────────────────────────────
  // Actualización del estado en la UI
  // ─────────────────────────────────────────────
  function actualizarUI() {
    // Dirección conectada
    const elAddr = document.getElementById('wallet-address');
    if (elAddr) {
      elAddr.textContent = _account
        ? `${_account.slice(0, 6)}…${_account.slice(-4)}`
        : '—';
    }

    // Badge de red
    const elRed = document.getElementById('wallet-network');
    if (elRed) {
      const enPolygon = _chainId === POLYGON_CHAIN_ID_DEC;
      elRed.textContent = enPolygon ? 'Polygon ✅' : (_chainId ? `Red: ${_chainId} ⚠️` : '—');
      elRed.style.color  = enPolygon ? '#22c55e' : '#f59e0b';
    }

    // Estado de admin
    const elAdmin = document.getElementById('wallet-admin-badge');
    if (elAdmin) {
      elAdmin.style.display = _isAdmin ? 'inline-flex' : 'none';
    }

    // Botón conectar / desconectar
    const btnConectar = document.getElementById('btn-wallet-connect');
    if (btnConectar) {
      btnConectar.textContent = _account ? 'Desconectar wallet' : 'Conectar wallet';
    }

    // Panel social: métricas disponibles cuando hay account
    const elSocial = document.getElementById('wallet-social-panel');
    if (elSocial) {
      elSocial.style.display = _account ? 'block' : 'none';
    }

    aplicarGuardaAdmin();
    emitir('walletActualizada', { account: _account, isAdmin: _isAdmin, chainId: _chainId });
  }

  // ─────────────────────────────────────────────
  // Auto-switch a Polygon
  // ─────────────────────────────────────────────
  async function switchAPolygon() {
    if (!_provider) return false;

    try {
      await _provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID_HEX }]
      });
      log('Cambiado a Polygon.');
      return true;
    } catch (switchError) {
      // Código 4902 → la red no está añadida aún
      if (switchError.code === 4902) {
        try {
          await _provider.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_PARAMS]
          });
          log('Red Polygon añadida y seleccionada.');
          return true;
        } catch (addError) {
          err('No se pudo agregar Polygon:', addError.message || addError);
          return false;
        }
      }
      // El usuario rechazó el cambio
      warn('Switch rechazado por el usuario:', switchError.message || switchError);
      return false;
    }
  }

  // ─────────────────────────────────────────────
  // Conexión de wallet
  // ─────────────────────────────────────────────
  async function conectarWallet() {
    if (!window.ethereum) {
      warn('MetaMask no detectado. Instala MetaMask para continuar.');
      emitir('walletError', { mensaje: 'MetaMask no detectado' });
      return;
    }

    _provider = window.ethereum;

    try {
      const accounts = await _provider.request({ method: 'eth_requestAccounts' });
      _account = normalizeAddr(accounts[0]);
      _isAdmin = isAdminAddr(_account);

      // Obtener red actual
      const chainHex = await _provider.request({ method: 'eth_chainId' });
      _chainId = hexToInt(chainHex);

      log(`Conectado: ${_account} | Red: ${_chainId}`);

      // Auto-switch obligatorio a Polygon
      if (_chainId !== POLYGON_CHAIN_ID_DEC) {
        log('Red incorrecta. Cambiando a Polygon…');
        const ok = await switchAPolygon();
        if (!ok) {
          warn('No se pudo cambiar a Polygon. Algunas funciones pueden estar deshabilitadas.');
        }
      }

      // Registrar la conexión en el pilar social
      registrarActividadSocial('wallet_conectada', { account: _account, isAdmin: _isAdmin });

      actualizarUI();
    } catch (e) {
      err('Error al conectar wallet:', e.message || e);
      emitir('walletError', { mensaje: e.message || String(e) });
    }
  }

  function desconectarWallet() {
    _account  = null;
    _isAdmin  = false;
    _chainId  = null;
    actualizarUI();
    log('Wallet desconectada (sesión local limpiada).');
  }

  // ─────────────────────────────────────────────
  // Listeners de eventos del proveedor
  // ─────────────────────────────────────────────
  function registrarEventosProveedor() {
    if (!_provider) return;

    _provider.on('accountsChanged', async (accounts) => {
      if (!accounts || accounts.length === 0) {
        desconectarWallet();
        return;
      }
      _account = normalizeAddr(accounts[0]);
      _isAdmin = isAdminAddr(_account);
      log('Cuenta cambiada:', _account);
      registrarActividadSocial('cuenta_cambiada', { account: _account });
      actualizarUI();
    });

    _provider.on('chainChanged', (chainHex) => {
      _chainId = hexToInt(chainHex);
      log('Red cambiada:', _chainId);
      if (_chainId !== POLYGON_CHAIN_ID_DEC) {
        warn('Red diferente a Polygon detectada. Solicitando cambio…');
        switchAPolygon().then(actualizarUI);
      } else {
        actualizarUI();
      }
    });

    _provider.on('disconnect', () => {
      desconectarWallet();
    });
  }

  // ─────────────────────────────────────────────
  // ─── PILAR SOCIAL ────────────────────────────
  // Hooks para vincular actividades sociales con
  // transacciones de NFT/TOK. Se exponen vía
  // window.wallet.social para que otros módulos
  // (IA, fidelización, P2P) puedan llamarlos.
  // ─────────────────────────────────────────────
  const socialLog = [];
  const SOCIAL_LOG_MAX = 500; // límite para evitar crecimiento ilimitado en sesiones largas

  function registrarActividadSocial(tipo, datos = {}) {
    const entrada = {
      tipo,
      cuenta: _account,
      timestamp: new Date().toISOString(),
      ...datos
    };
    if (socialLog.length >= SOCIAL_LOG_MAX) {
      socialLog.shift(); // descartar la entrada más antigua
    }
    socialLog.push(entrada);

    // Emitir evento para que la UI / módulos externos puedan reaccionar
    emitir('socialActividad', entrada);
    log(`[Social] ${tipo}`, entrada);
  }

  /**
   * Vincula una transacción de NFT/TOK con la actividad social del usuario.
   * @param {string} txHash   - Hash de la transacción en Polygon
   * @param {string} tipoNFT  - 'NFT' | 'TOK' | otro
   * @param {object} metaDatos - Información adicional de la operación
   */
  function vincularTransaccionSocial(txHash, tipoNFT, metaDatos = {}) {
    registrarActividadSocial('transaccion_vinculada', {
      txHash,
      tipoNFT,
      ...metaDatos
    });

    // Señal para el sistema de fidelización
    emitir('socialTransaccion', {
      cuenta: _account,
      txHash,
      tipoNFT,
      ...metaDatos
    });
  }

  /**
   * Registra una interacción comunitaria (like, comentario, compartido)
   * para ser contabilizada en el escalafón de lealtad.
   * @param {string} tipoInteraccion - 'like' | 'comentario' | 'compartido' | etc.
   * @param {object} metaDatos
   */
  function registrarInteraccionComunidad(tipoInteraccion, metaDatos = {}) {
    registrarActividadSocial('interaccion_comunidad', {
      tipoInteraccion,
      ...metaDatos
    });

    emitir('socialInteraccion', {
      cuenta: _account,
      tipoInteraccion,
      ...metaDatos
    });
  }

  /**
   * Devuelve todas las actividades sociales registradas en la sesión.
   */
  function obtenerActividadesSociales() {
    return [...socialLog];
  }

  /**
   * Calcula el puntaje de lealtad de la sesión (base para escalafón).
   * Reglas simples que escalan cuando se integren más señales.
   */
  function calcularPuntajeLealtad() {
    const pesos = {
      wallet_conectada:       5,
      transaccion_vinculada: 20,
      interaccion_comunidad:  3,
      cuenta_cambiada:        0
    };
    return socialLog.reduce((total, e) => total + (pesos[e.tipo] || 1), 0);
  }

  // ─────────────────────────────────────────────
  // Manejador del botón principal de conexión
  // ─────────────────────────────────────────────
  function inicializarBoton() {
    const btn = document.getElementById('btn-wallet-connect');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      if (_account) {
        desconectarWallet();
      } else {
        await conectarWallet();
        registrarEventosProveedor();
      }
    });
  }

  // ─────────────────────────────────────────────
  // API pública  →  window.wallet
  // ─────────────────────────────────────────────
  window.wallet = {
    // Estado
    getAccount:  () => _account,
    getIsAdmin:  () => _isAdmin,
    getChainId:  () => _chainId,
    isPolygon:   () => _chainId === POLYGON_CHAIN_ID_DEC,
    ADMIN_WALLET,

    // Acciones
    conectar:    conectarWallet,
    desconectar: desconectarWallet,
    switchAPolygon,

    // Pilar Social
    social: {
      registrarActividad:         registrarActividadSocial,
      vincularTransaccion:        vincularTransaccionSocial,
      registrarInteraccionComunidad,
      obtenerActividades:         obtenerActividadesSociales,
      calcularPuntajeLealtad
    }
  };

  // ─────────────────────────────────────────────
  // Arranque: inicializar UI y botón cuando el DOM esté listo
  // ─────────────────────────────────────────────
  function bootstrap() {
    actualizarUI();   // estado inicial (sin cuenta)
    inicializarBoton();

    // Si el proveedor ya tiene cuentas autorizadas (reconexión automática),
    // reconectamos silenciosamente sin pedir permiso.
    if (window.ethereum) {
      _provider = window.ethereum;
      _provider.request({ method: 'eth_accounts' }).then(async (accounts) => {
        if (accounts && accounts.length > 0) {
          _account = normalizeAddr(accounts[0]);
          _isAdmin = isAdminAddr(_account);
          const chainHex = await _provider.request({ method: 'eth_chainId' });
          _chainId = hexToInt(chainHex);
          log('Reconectado automáticamente:', _account);
          if (_chainId !== POLYGON_CHAIN_ID_DEC) {
            await switchAPolygon();
          }
          registrarEventosProveedor();
          actualizarUI();
        }
      }).catch(() => { /* sin cuentas previas: silencioso */ });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
