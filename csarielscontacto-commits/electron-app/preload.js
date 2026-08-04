// ================================================================
// PRELOAD - CSARIEL'S BROWSER
// Conecta el navegador con tu página web
// ================================================================

const { contextBridge, ipcRenderer } = require('electron');

// ================================================================
// EXPONER APIs SEGURAS PARA LA PÁGINA
// ================================================================

contextBridge.exposeInMainWorld('csarielsBrowser', {
  // Obtener información del navegador
  getInfo: () => {
    return {
      name: 'Csariel\'s Browser',
      version: '1.0.0',
      platform: process.platform
    };
  },

  // Escuchar eventos de recompensa
  onReward: (callback) => {
    ipcRenderer.on('csariels:reward', (event, data) => {
      callback(data);
    });
  },

  // Obtener datos del usuario desde el navegador
  getUserData: () => {
    return new Promise((resolve) => {
      ipcRenderer.once('csariels:userData', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('csariels:getUser');
    });
  },

  // Notificar cuando la página está lista
  ready: () => {
    ipcRenderer.send('csariels:pageReady');
  }
});

console.log('🔗 Csariel\'s Browser: Preload cargado');