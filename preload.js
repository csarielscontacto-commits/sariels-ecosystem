// ================================================================
// PRELOAD - CSARIEL'S BROWSER
// Conecta el navegador con tu página web
// Versión: 1.0.0
// Hecho en Puebla, México
// ================================================================

const { contextBridge, ipcRenderer } = require('electron');

// ================================================================
// EXPONER APIs SEGURAS PARA LA PÁGINA
// ================================================================

contextBridge.exposeInMainWorld('csarielsAPI', {
  // ================================================================
  // 🎁 RECOMPENSAS
  // ================================================================
  
  // Escuchar eventos de recompensa desde el navegador
  onReward: (callback) => {
    ipcRenderer.on('csariels:reward', (event, data) => {
      callback(data);
    });
  },

  // ================================================================
  // 📊 INFORMACIÓN DEL NAVEGADOR
  // ================================================================

  // Obtener información del navegador
  getInfo: () => ({
    name: "Csariel's Browser",
    version: "1.0.0",
    platform: process.platform,
    arch: process.arch
  }),

  // Obtener versión
  getVersion: () => "1.0.0 - Hecho en Puebla",

  // ================================================================
  // 👤 DATOS DEL USUARIO
  // ================================================================

  // Obtener datos del usuario desde el navegador
  getUserData: () => {
    return new Promise((resolve) => {
      ipcRenderer.once('csariels:userData', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('csariels:getUser');
    });
  },

  // ================================================================
  // 💳 WALLET (Privy)
  // ================================================================

  // Obtener wallet del usuario (si está conectada)
  getWallet: () => {
    return new Promise((resolve) => {
      ipcRenderer.once('csariels:wallet', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('csariels:getWallet');
    });
  },

  // ================================================================
  // 🔔 NOTIFICACIONES DEL SISTEMA
  // ================================================================

  // Mostrar notificación del sistema
  showNotification: (titulo, cuerpo) => {
    ipcRenderer.send('csariels:notification', { titulo, cuerpo });
  },

  // ================================================================
  // 🛡️ SEGURIDAD
  // ================================================================

  // Verificar si estamos en Csariel's Browser
  isCsarielsBrowser: () => true
});

// ================================================================
// NOTIFICAR QUE EL PRELOAD ESTÁ LISTO
// ================================================================

console.log('🔗 Csariel\'s Browser: Preload cargado');
console.log('📍 Hecho en Puebla, México');
console.log('🛡️ APIs expuestas correctamente');