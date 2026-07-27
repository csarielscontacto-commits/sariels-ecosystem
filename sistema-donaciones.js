/**
 * ================================================================
 * SISTEMA DE DONACIONES EN DIRECTO - Csariel's
 * ================================================================
 * Permite enviar USDT, USDC y TOK en tiempo real durante transmisiones.
 * Comisión del 50% para Csariel's, 50% para el streamer.
 * 
 * @module SistemaDonaciones
 */

/**
 * Clase principal del Sistema de Donaciones
 */
export class SistemaDonaciones {
  /**
   * Constructor
   * @param {Object} opciones - Opciones de configuración
   */
  constructor(opciones = {}) {
    this.opciones = {
      tokenDefault: 'USDT',
      red: 'Polygon',
      ...opciones
    };

    this.provider = null;
    this.walletConectada = null;
    this.transacciones = [];
    this.eventos = new EventTarget();

    console.log('💰 Sistema de Donaciones en Directo inicializado');
  }

  /**
   * Conecta la wallet del espectador
   * @returns {Promise<string>} Dirección de la wallet
   */
  async conectarWallet() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('⚠️ MetaMask no detectado. Instálalo para donar.');
    }

    try {
      const cuentas = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Cambiar a Polygon si es necesario
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }] // Polygon Amoy
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13882',
              chainName: 'Polygon Amoy',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.polygon.technology'],
              blockExplorerUrls: ['https://amoy.polygonscan.com']
            }]
          });
        }
      }

      this.walletConectada = cuentas[0];
      this.provider = new ethers.providers.Web3Provider(window.ethereum);

      this._emitir('walletConectada', { wallet: this.walletConectada });
      return this.walletConectada;
    } catch (error) {
      console.error('❌ Error conectando wallet:', error);
      throw error;
    }
  }

  /**
   * Envía una donación al streamer
   * @param {Object} datos - Datos de la donación
   * @param {string} datos.streamerWallet - Wallet del streamer
   * @param {number} datos.monto - Monto a enviar
   * @param {string} datos.token - Token a usar (USDT, USDC, TOK)
   * @param {string} datos.mensaje - Mensaje del espectador
   * @param {string} datos.espectador - Nombre del espectador
   * @returns {Object} Resultado de la donación
   */
  async enviarDonacion(datos) {
    const {
      streamerWallet,
      monto,
      token = 'USDT',
      mensaje = '',
      espectador = 'Anónimo'
    } = datos;

    // Validaciones
    if (!this.walletConectada) {
      throw new Error('⚠️ Conecta tu wallet primero');
    }

    if (!streamerWallet || !streamerWallet.startsWith('0x')) {
      throw new Error('⚠️ Wallet del streamer inválida');
    }

    if (!monto || monto <= 0) {
      throw new Error('⚠️ Monto inválido. Mínimo 1 USDT');
    }

    if (monto < 0.50) {
      throw new Error('⚠️ Monto mínimo: 0.50 USDT');
    }

    // Calcular comisiones
    const comision = CONFIG.calcularComisionDirecto(monto, token);
    const walletCsariels = CONFIG.WALLET_PAGOS.direccion;

    try {
      // 1. Enviar comisión a Csariel's (50%)
      const txComision = await this._enviarPago(
        walletCsariels,
        comision.comision,
        token,
        'Comisión Csariel\'s - Directo'
      );

      // 2. Enviar resto al streamer (50%)
      const txStreamer = await this._enviarPago(
        streamerWallet,
        comision.streamerMonto,
        token,
        `Donación de ${espectador} en directo`
      );

      // 3. Registrar transacción
      const transaccion = {
        id: CONFIG.generarId(),
        espectador,
        streamer: streamerWallet,
        montoTotal: monto,
        comision: comision.comision,
        streamerMonto: comision.streamerMonto,
        token,
        mensaje,
        walletCsariels,
        txComision,
        txStreamer,
        timestamp: Date.now(),
        estado: 'completado'
      };

      this.transacciones.push(transaccion);
      this._guardarHistorial(transaccion);

      this._emitir('donacionCompletada', transaccion);

      return transaccion;
    } catch (error) {
      console.error('❌ Error en donación:', error);
      throw error;
    }
  }

  /**
   * Envía un pago en la blockchain
   * @param {string} destino - Wallet destino
   * @param {number} monto - Monto a enviar
   * @param {string} token - Token a usar
   * @param {string} memo - Descripción
   * @returns {Object} Transacción
   * @private
   */
  async _enviarPago(destino, monto, token, memo) {
    if (!this.provider) {
      throw new Error('⚠️ Proveedor no inicializado');
    }

    // Simulación de transacción (por ahora, en producción sería real)
    // En producción, aquí iría la lógica real de transacción con ethers.js
    
    const txHash = '0x' + Date.now().toString(16) + Math.random().toString(16).substring(2, 10);
    
    // Simular retraso de blockchain
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      hash: txHash,
      de: this.walletConectada,
      para: destino,
      monto,
      token,
      memo,
      timestamp: Date.now(),
      estado: 'confirmado'
    };
  }

  /**
   * Guarda el historial de donaciones
   * @param {Object} transaccion - Transacción a guardar
   * @private
   */
  _guardarHistorial(transaccion) {
    try {
      const historial = JSON.parse(localStorage.getItem('donaciones_historial') || '[]');
      historial.unshift(transaccion);
      localStorage.setItem('donaciones_historial', JSON.stringify(historial));
    } catch (error) {
      console.warn('Error guardando historial:', error);
    }
  }

  /**
   * Obtiene el historial de donaciones
   * @param {string} wallet - Wallet para filtrar (opcional)
   * @returns {Array} Historial de donaciones
   */
  getHistorial(wallet = null) {
    try {
      const historial = JSON.parse(localStorage.getItem('donaciones_historial') || '[]');
      if (wallet) {
        return historial.filter(tx => 
          tx.streamer === wallet || tx.walletCsariels === wallet
        );
      }
      return historial;
    } catch (error) {
      console.warn('Error obteniendo historial:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas de donaciones para un streamer
   * @param {string} streamerWallet - Wallet del streamer
   * @returns {Object} Estadísticas
   */
  getEstadisticasStreamer(streamerWallet) {
    const historial = this.getHistorial(streamerWallet);
    
    const totalRecibido = historial.reduce((sum, tx) => sum + tx.streamerMonto, 0);
    const totalDonaciones = historial.length;
    const totalComision = historial.reduce((sum, tx) => sum + tx.comision, 0);

    return {
      streamer: streamerWallet,
      totalRecibido: parseFloat(totalRecibido.toFixed(2)),
      totalDonaciones,
      totalComision: parseFloat(totalComision.toFixed(2)),
      promedioDonacion: totalDonaciones > 0 
        ? parseFloat((totalRecibido / totalDonaciones).toFixed(2))
        : 0,
      tokens: this._contarTokens(historial)
    };
  }

  /**
   * Cuenta tokens usados en donaciones
   * @param {Array} historial - Historial de donaciones
   * @returns {Object} Conteo de tokens
   * @private
   */
  _contarTokens(historial) {
    const conteo = {};
    for (const tx of historial) {
      const token = tx.token || 'USDT';
      conteo[token] = (conteo[token] || 0) + 1;
    }
    return conteo;
  }

  /**
   * Escucha eventos del sistema
   * @param {string} evento - Nombre del evento
   * @param {Function} callback - Función a ejecutar
   */
  on(evento, callback) {
    this.eventos.addEventListener(evento, callback);
  }

  /**
   * Emite un evento
   * @param {string} evento - Nombre del evento
   * @param {*} datos - Datos del evento
   * @private
   */
  _emitir(evento, datos) {
    this.eventos.dispatchEvent(new CustomEvent(evento, { detail: datos }));
  }
}

/**
 * ================================================================
 * SISTEMA DE NOTIFICACIONES EN DIRECTO
 * ================================================================
 */

export class NotificacionesDirecto {
  constructor() {
    this.container = null;
    this.notificaciones = [];
    this.timeout = null;
  }

  /**
   * Inicializa el sistema de notificaciones
   */
  init() {
    this.container = document.createElement('div');
    this.container.id = 'notificaciones-directo';
    this.container.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 350px;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Muestra una notificación de donación
   * @param {Object} datos - Datos de la donación
   */
  mostrarNotificacion(datos) {
    const {
      espectador = 'Anónimo',
      monto,
      token = 'USDT',
      mensaje = ''
    } = datos;

    // Crear elemento de notificación
    const notif = document.createElement('div');
    notif.style.cssText = `
      background: linear-gradient(135deg, #0B3D2E, #1a5a44);
      border: 1px solid rgba(247, 212, 74, 0.15);
      border-radius: 12px;
      padding: 14px 18px;
      color: white;
      font-family: 'Space Grotesk', sans-serif;
      animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      pointer-events: auto;
      transform: translateX(calc(100% + 20px));
      opacity: 0;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
      min-width: 250px;
    `;

    // Contenido
    notif.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold-cosmic), #b8923a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
          color: #0a0c10;
          flex-shrink: 0;
        ">
          ${espectador.charAt(0).toUpperCase()}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:0.85rem;color:var(--gold-cosmic);">
            ${espectador} <span style="color:var(--text-secondary);font-weight:400;font-size:0.7rem;">donó</span>
          </div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary);">
            ${monto} ${token}
          </div>
          ${mensaje ? `<div style="font-size:0.7rem;color:var(--text-secondary);font-style:italic;margin-top:2px;">"${mensaje}"</div>` : ''}
        </div>
        <div style="
          background: rgba(0,184,148,0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.55rem;
          color: var(--success);
          font-family: 'Orbitron', monospace;
        ">
          ● LIVE
        </div>
      </div>
    `;

    this.container.appendChild(notif);

    // Animar entrada
    requestAnimationFrame(() => {
      notif.style.transform = 'translateX(0)';
      notif.style.opacity = '1';
    });

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      notif.style.transform = 'translateX(calc(100% + 20px))';
      notif.style.opacity = '0';
      setTimeout(() => {
        if (notif.parentNode) {
          notif.parentNode.removeChild(notif);
        }
      }, 500);
    }, 5000);

    // Limitar notificaciones visibles
    const notifs = this.container.children;
    while (notifs.length > 5) {
      const primero = notifs[0];
      primero.style.transform = 'translateX(calc(100% + 20px))';
      primero.style.opacity = '0';
      setTimeout(() => {
        if (primero.parentNode) {
          primero.parentNode.removeChild(primero);
        }
      }, 500);
    }
  }
}

// ================================================================
// EXPORTAR INSTANCIAS
// ================================================================

export const sistemaDonaciones = new SistemaDonaciones();
export const notificacionesDirecto = new NotificacionesDirecto();

// ================================================================
// ESTILOS DE ANIMACIÓN (agregar al CSS global)
// ================================================================

// Agregar estilos de animación si no existen
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(calc(100% + 20px));
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// ================================================================
// INICIALIZAR NOTIFICACIONES
// ================================================================

notificacionesDirecto.init();

console.log('💰 Sistema de Donaciones en Directo listo');
console.log(`📊 Comisión Csariel's: 50%`);
console.log(`🪙 Tokens soportados: USDT, USDC, TOK (1:1 con USDT)`);