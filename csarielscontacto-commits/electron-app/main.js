const { app, BrowserWindow, ipcMain, Tray, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// ================================================================
// CSARIEL'S BROWSER - Hecho en Puebla
// Versión: 1.0.0
// Electron + Chromium
// ================================================================

let mainWindow = null;
let tray = null;
let rewardsInterval = null;
let minutosAcumulados = 0;

// ================================================================
// CREAR VENTANA PRINCIPAL
// ================================================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: "Csariel's Browser - Hecho en Puebla",
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#05080f',
    show: false,
    frame: true,
    titleBarStyle: 'default'
  });

  // CARGAR TU PLATAFORMA
  const url = process.env.CSARIELS_URL || 'https://csariels.vercel.app';
  mainWindow.loadURL(url);

  // Mostrar cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    iniciarRecompensas();
  });

  // Abrir enlaces externos en navegador del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Manejar cuando se cierra
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (rewardsInterval) {
      clearInterval(rewardsInterval);
      rewardsInterval = null;
    }
  });

  // DevTools en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  console.log('◈ Csariel\'s Browser iniciado');
  console.log(`🌐 Cargando: ${url}`);
}

// ================================================================
// RECOMPENSAS - CSARIELS REWARDS
// ================================================================

function iniciarRecompensas() {
  // Cada 10 minutos, sumar 50MB de recompensa
  rewardsInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      clearInterval(rewardsInterval);
      return;
    }

    minutosAcumulados += 10;
    const megas = 50;
    
    // Enviar evento a la página para que sume megas
    mainWindow.webContents.send('csariels:reward', {
      megas: megas,
      minutos: minutosAcumulados,
      mensaje: `🎁 ¡${megas} MB de recompensa por usar Csariel's Browser!`
    });

    console.log(`🎁 Recompensa: +${megas} MB (${minutosAcumulados} min acumulados)`);

  }, 600000); // 10 minutos = 600,000 ms
}

// ================================================================
// BANDEJA DEL SISTEMA (TRAY)
// ================================================================

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Abrir Csariel\'s', 
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    { 
      label: 'Recargar', 
      click: () => {
        if (mainWindow) {
          mainWindow.reload();
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Salir', 
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Csariel\'s Browser');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });
}

// ================================================================
// IPC - COMUNICACIÓN CON LA PÁGINA
// ================================================================

ipcMain.on('csariels:getUser', (event) => {
  event.reply('csariels:userData', {
    browser: 'Csariel\'s Browser',
    version: '1.0.0',
    rewards: {
      totalMinutos: minutosAcumulados,
      megasG