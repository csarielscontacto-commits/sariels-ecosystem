// ================================================================
// RECOMPENSAS - CSARIEL'S REWARDS
// Sistema de recompensas por tiempo de uso
// ================================================================

// ================================================================
// CONFIGURACIÓN
// ================================================================

const CONFIG = {
  // Recompensa por tiempo: 50 MB cada 10 minutos
  megasPorIntervalo: 50,
  intervaloMinutos: 10,
  // Límite diario: 500 MB al día
  limiteDiarioMegas: 500
};

// ================================================================
// CLASE PRINCIPAL
// ================================================================

class CsarielsRewards {
  constructor() {
    this.totalMegas = 0;
    this.minutosAcumulados = 0;
    this.ultimaRecompensa = null;
    this.hoy = new Date().toDateString();

    // Cargar datos guardados
    this.cargarDatos();
  }

  // ================================================================
  // GUARDAR/CARGAR DATOS
  // ================================================================

  cargarDatos() {
    try {
      const data = localStorage.getItem('csariels_rewards');
      if (data) {
        const parsed = JSON.parse(data);
        this.totalMegas = parsed.totalMegas || 0;
        this.minutosAcumulados = parsed.minutosAcumulados || 0;
        this.ultimaRecompensa = parsed.ultimaRecompensa || null;
        this.hoy = parsed.hoy || new Date().toDateString();
      }
    } catch (e) {
      console.warn('Error cargando recompensas:', e);
    }
  }

  guardarDatos() {
    try {
      localStorage.setItem('csariels_rewards', JSON.stringify({
        totalMegas: this.totalMegas,
        minutosAcumulados: this.minutosAcumulados,
        ultimaRecompensa: this.ultimaRecompensa,
        hoy: this.hoy
      }));
    } catch (e) {
      console.warn('Error guardando recompensas:', e);
    }
  }

  // ================================================================
  // VERIFICAR LÍMITE DIARIO
  // ================================================================

  getMegasHoy() {
    const hoyStr = new Date().toDateString();
    if (this.hoy !== hoyStr) {
      this.hoy = hoyStr;
      this.totalMegas = 0;
      this.guardarDatos();
    }
    return this.totalMegas;
  }

  // ================================================================
  // AGREGAR RECOMPENSA
  // ================================================================

  agregarRecompensa(megas) {
    const hoyStr = new Date().toDateString();
    if (this.hoy !== hoyStr) {
      this.hoy = hoyStr;
      this.totalMegas = 0;
    }

    const nuevosMegas = Math.min(megas, CONFIG.limiteDiarioMegas - this.totalMegas);
    
    if (nuevosMegas <= 0) {
      return {
        success: false,
        mensaje: 'Límite diario alcanzado',
        megas: 0,
        total: this.totalMegas
      };
    }

    this.totalMegas += nuevosMegas;
    this.ultimaRecompensa = new Date().toISOString();
    this.guardarDatos();

    return {
      success: true,
      mensaje: `🎁 +${nuevosMegas} MB de recompensa`,
      megas: nuevosMegas,
      total: this.totalMegas
    };
  }

  // ================================================================
  // CONECTAR CON EL NAVEGADOR (Electron)
  // ================================================================

  conectarNavegador() {
    if (typeof window.csarielsBrowser !== 'undefined') {
      // Escuchar recompensas del navegador
      window.csarielsBrowser.onReward((data) => {
        const resultado = this.agregarRecompensa(data.megas);
        
        // Mostrar notificación
        this.mostrarNotificacion(
          resultado.mensaje,
          resultado.success ? 'success' : 'warning'
        );

        // Guardar en localStorage
        this.guardarDatos();
      });

      // Obtener datos del navegador
      window.csarielsBrowser.getUserData().then((data) => {
        console.log('📊 Datos del navegador:', data);
      });

      console.log('✅ Csariel\'s Browser conectado');
    }
  }

  // ================================================================
  // NOTIFICACIONES
  // ================================================================

  mostrarNotificacion(mensaje, tipo = 'info') {
    // Usar el toast existente de Csariel's
    if (typeof mostrarToast === 'function') {
      mostrarToast(mensaje, tipo);
    } else {
      // Fallback
      console.log(`📢 ${mensaje}`);
      
      // Notificación del navegador
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Csariel\'s Rewards', {
          body: mensaje,
          icon: '/favicon.ico'
        });
      }
    }
  }
}

// ================================================================
// EXPORTAR INSTANCIA ÚNICA
// ================================================================

export const rewards = new CsarielsRewards();

// ================================================================
// INICIALIZAR AL CARGAR
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Conectar con el navegador si estamos en Csariel's Browser
  rewards.conectarNavegador();

  // Solicitar permisos para notificaciones
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission();
  }
});