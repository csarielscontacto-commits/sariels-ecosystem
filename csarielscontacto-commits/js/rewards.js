// ================================================================
// 🎁 CSARIEL'S REWARDS - Sistema de Recompensas
// Para usar en mi-internet.html y toda la plataforma
// Hecho en Puebla, México
// Versión: 1.0.0
// ================================================================

// ================================================================
// 📦 CONFIGURACIÓN
// ================================================================

const CONFIG = {
  megasPorRecompensa: 50,
  intervaloMinutos: 10,
  limiteDiarioMegas: 500,
  limiteDiarioMinutos: 60
};

// ================================================================
// 🧠 CLASE PRINCIPAL
// ================================================================

class CsarielsRewards {
  constructor() {
    this.totalMegas = 0;
    this.minutosAcumulados = 0;
    this.ultimaRecompensa = null;
    this.hoy = new Date().toDateString();
    this.historial = [];
    this.maxHistorial = 20;
    this.cargarDatos();
  }

  // ================================================================
  // 💾 GUARDAR/CARGAR DATOS
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
        this.historial = parsed.historial || [];
      }
    } catch (e) {
      console.warn('⚠️ Error cargando recompensas:', e);
    }
  }

  guardarDatos() {
    try {
      localStorage.setItem('csariels_rewards', JSON.stringify({
        totalMegas: this.totalMegas,
        minutosAcumulados: this.minutosAcumulados,
        ultimaRecompensa: this.ultimaRecompensa,
        hoy: this.hoy,
        historial: this.historial.slice(-this.maxHistorial)
      }));
    } catch (e) {
      console.warn('⚠️ Error guardando recompensas:', e);
    }
  }

  // ================================================================
  // 📊 VERIFICAR LÍMITE DIARIO
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
  // 📈 OBTENER ESTADÍSTICAS
  // ================================================================

  getEstadisticas() {
    const hoyStr = new Date().toDateString();
    if (this.hoy !== hoyStr) {
      this.hoy = hoyStr;
      this.totalMegas = 0;
      this.guardarDatos();
    }

    return {
      totalMegas: this.totalMegas,
      minutosAcumulados: this.minutosAcumulados,
      limiteDiario: CONFIG.limiteDiarioMegas,
      megasRestantes: Math.max(0, CONFIG.limiteDiarioMegas - this.totalMegas),
      ultimaRecompensa: this.ultimaRecompensa,
      historial: this.historial.slice(-5),
      porcentaje: Math.min(100, (this.totalMegas / CONFIG.limiteDiarioMegas) * 100)
    };
  }

  // ================================================================
  // ➕ AGREGAR RECOMPENSA
  // ================================================================

  agregarRecompensa(megas, fuente = 'browser') {
    const hoyStr = new Date().toDateString();
    if (this.hoy !== hoyStr) {
      this.hoy = hoyStr;
      this.totalMegas = 0;
    }

    const nuevosMegas = Math.min(megas, CONFIG.limiteDiarioMegas - this.totalMegas);
    
    if (nuevosMegas <= 0) {
      return {
        success: false,
        mensaje: '⛔ Límite diario alcanzado (500 MB)',
        megas: 0,
        total: this.totalMegas,
        porcentaje: 100
      };
    }

    this.totalMegas += nuevosMegas;
    this.ultimaRecompensa = new Date().toISOString();
    
    // Guardar en historial
    this.historial.push({
      fecha: this.ultimaRecompensa,
      megas: nuevosMegas,
      fuente: fuente,
      total: this.totalMegas
    });

    this.guardarDatos();

    return {
      success: true,
      mensaje: `🎁 +${nuevosMegas} MB de recompensa`,
      megas: nuevosMegas,
      total: this.totalMegas,
      porcentaje: Math.min(100, (this.totalMegas / CONFIG.limiteDiarioMegas) * 100)
    };
  }

  // ================================================================
  // 🔗 CONECTAR CON EL NAVEGADOR (Electron)
  // ================================================================

  conectarNavegador() {
    if (typeof window.csarielsAPI !== 'undefined') {
      // Escuchar recompensas del navegador
      window.csarielsAPI.onReward((data) => {
        const resultado = this.agregarRecompensa(data.megas, 'browser');
        this.mostrarNotificacion(resultado);
        this.guardarDatos();
        
        // Emitir evento para actualizar UI
        document.dispatchEvent(new CustomEvent('csariels:reward', {
          detail: resultado
        }));
      });

      // Mostrar información del navegador
      const info = window.csarielsAPI.getInfo();
      console.log('◈ Csariel\'s Browser:', info);
      console.log('✅ Csariel\'s Browser conectado');
      
      // Enviar estado inicial a la página
      setTimeout(() => {
        const stats = this.getEstadisticas();
        document.dispatchEvent(new CustomEvent('csariels:rewards:update', {
          detail: stats
        }));
      }, 500);

      return true;
    }
    console.log('ℹ️ Ejecutándose en navegador web estándar');
    return false;
  }

  // ================================================================
  // 📢 NOTIFICACIONES
  // ================================================================

  mostrarNotificacion(resultado) {
    if (!resultado) return;

    // Usar el toast existente de Csariel's
    if (typeof mostrarToast === 'function') {
      if (resultado.success) {
        mostrarToast(resultado.mensaje, 'success');
      } else {
        mostrarToast(resultado.mensaje, 'warning');
      }
    } else {
      // Fallback: console
      console.log(`📢 ${resultado.mensaje}`);
    }
  }

  // ================================================================
  // 🎯 RESETEAR RECOMPENSAS (para pruebas)
  // ================================================================

  resetear() {
    this.totalMegas = 0;
    this.minutosAcumulados = 0;
    this.ultimaRecompensa = null;
    this.historial = [];
    this.guardarDatos();
    console.log('🔄 Recompensas reseteadas');
  }
}

// ================================================================
// 🚀 EXPORTAR INSTANCIA ÚNICA
// ================================================================

export const rewards = new CsarielsRewards();

// ================================================================
// 🏁 INICIALIZAR AL CARGAR
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  const conectado = rewards.conectarNavegador();
  console.log(`🎁 Csariel's Rewards: ${conectado ? 'Browser' : 'Web'} modo`);
  console.log(`📊 Megas hoy: ${rewards.getMegasHoy()} MB`);
});

// ================================================================
// 📦 EXPORTAR POR DEFECTO
// ================================================================

export default rewards;

console.log('◈ Csariel\'s Rewards v1.0.0');
console.log('📍 Hecho en Puebla, México');
console.log('🎁 Recompensas: 50 MB cada 10 min');
console.log('📊 Límite diario: 500 MB');