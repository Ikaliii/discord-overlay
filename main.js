<<<<<<< HEAD
const { app, BrowserWindow, ipcMain, screen, dialog, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const bot = require('./bot');
const { autoUpdater } = require('electron-updater');

let overlayWindow = null;
let configWindow  = null;
let tray          = null;
let connected     = false;
let forceQuit     = false;

// ─── Icône tray : utilise icon.ico si présent, sinon fallback inline ──────────

function getTrayIcon() {
  const icoPath = path.join(__dirname, 'icon.ico');
  if (fs.existsSync(icoPath)) {
    return nativeImage.createFromPath(icoPath);
  }
  // Fallback : PNG 32×32 Discord blurple encodé en base64
  const buf = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB' +
    'hUlEQVRYhe2WvU7DMBCAP4RUKBIDEhJiZmBhZmFhZ2ZmFhYWFhYWFhYWFhYWFhYWFhYW/kKE' +
    'hAQCJBASEhISEhISEhISEhIS/omqquqFqp6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp' +
    '6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqe' +
    'quqpqp6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp6q6qmqnqr' +
    'qqaqequqpqp6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp6q6q' +
    'mnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp' +
    '6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqequqpqp6q6qmqnqrqqaqeAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/AH8AfwB/AH8AfwB/AH8A',
    'base64'
  );
  // Si le buffer n'est pas un PNG valide, créer une icône vide
  try {
    const img = nativeImage.createFromBuffer(buf);
    if (!img.isEmpty()) return img;
  } catch (_) {}
  return nativeImage.createEmpty();
}

// ─── Système tray ─────────────────────────────────────────────────────────────

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Discord Overlay',
      enabled: false
    },
    { type: 'separator' },
    {
      label: connected ? '🟢 Bot connecté' : '🔴 Bot déconnecté',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Ouvrir le panneau',
      click: () => showConfigWindow()
    },
    {
      label: connected ? 'Déconnecter le bot' : 'Connecter le bot',
      click: async () => {
        if (connected) {
          try { await bot.stop(); } catch (_) {}
          connected = false;
          if (configWindow && !configWindow.isDestroyed()) {
            configWindow.webContents.send('tray:disconnected');
          }
        } else {
          showConfigWindow();
        }
        refreshTrayMenu();
      }
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      click: () => {
        forceQuit = true;
        app.quit();
      }
    }
  ]);
}

function refreshTrayMenu() {
  if (tray && !tray.isDestroyed()) {
    tray.setContextMenu(buildTrayMenu());
    tray.setToolTip(
      connected
        ? 'Discord Overlay — Bot actif ✅'
        : 'Discord Overlay — Inactif'
    );
  }
}

function createTray() {
  const icon = getTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('Discord Overlay');
  tray.setContextMenu(buildTrayMenu());
  tray.on('double-click', () => showConfigWindow());
}

// ─── Fenêtre config : show/hide ───────────────────────────────────────────────

function showConfigWindow() {
  if (!configWindow || configWindow.isDestroyed()) {
    createConfigWindow();
  } else {
    configWindow.show();
    configWindow.focus();
  }
}

// ─── Auto-updater setup ───────────────────────────────────────────────────────

function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Vérification silencieuse après 3s
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.log('[Updater] Vérification ignorée:', err.message);
    });
  }, 3000);

  autoUpdater.on('update-available', (info) => {
    if (configWindow && !configWindow.isDestroyed()) {
      configWindow.webContents.send('updater:available', {
        version: info.version,
        releaseDate: info.releaseDate
      });
    }
  });

  autoUpdater.on('update-not-available', () => {
    if (configWindow && !configWindow.isDestroyed()) {
      configWindow.webContents.send('updater:up-to-date', {
        version: app.getVersion()
      });
    }
  });

  autoUpdater.on('download-progress', (progress) => {
    if (configWindow && !configWindow.isDestroyed()) {
      configWindow.webContents.send('updater:progress', {
        percent: Math.round(progress.percent),
        transferred: progress.transferred,
        total: progress.total,
        bytesPerSecond: progress.bytesPerSecond
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (configWindow && !configWindow.isDestroyed()) {
      configWindow.webContents.send('updater:downloaded', {
        version: info.version
      });
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('[Updater] Erreur:', err.message);
    if (configWindow && !configWindow.isDestroyed()) {
      configWindow.webContents.send('updater:error', { message: err.message });
    }
  });
}

ipcMain.handle('updater:install', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('updater:check', async () => {
  try {
    await autoUpdater.checkForUpdates();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('updater:version', () => app.getVersion());

// ─── Config persistence ───────────────────────────────────────────────────────

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch (_) {}
  return {
    token: '',
    channelId: '',
    duration: 6,
    position: 'top-right',
    opacity: 90,
    muteVideos: false
  };
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  } catch (e) {
    console.error('Failed to save config:', e.message);
  }
}

// ─── Overlay window ───────────────────────────────────────────────────────────

function createOverlay() {
  const { bounds } = screen.getPrimaryDisplay();

  overlayWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });

  overlayWindow.loadFile('overlay.html');
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');

  overlayWindow.on('blur', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  });
}

// ─── Config / control window ──────────────────────────────────────────────────

function createConfigWindow() {
  const iconPath = path.join(__dirname, 'icon.ico');

  configWindow = new BrowserWindow({
    width: 540,
    height: 720,
    minWidth: 540,
    minHeight: 720,
    title: 'Discord Overlay',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  configWindow.loadFile('config.html');
  configWindow.setMenuBarVisibility(false);

  // Fermer → minimiser dans le tray, pas quitter
  configWindow.on('close', (e) => {
    if (!forceQuit) {
      e.preventDefault();
      configWindow.hide();
    }
  });
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

function setupIPC() {
  ipcMain.handle('config:load', () => loadConfig());

  ipcMain.handle('bot:connect', async (_event, cfg) => {
    saveConfig(cfg);

    if (connected) {
      try { await bot.stop(); } catch (_) {}
      connected = false;
    }

    try {
      await bot.start(cfg.token, cfg.channelId, (msg) => {
        const payload = {
          message:    msg,
          duration:   cfg.duration * 1000,
          position:   cfg.position,
          opacity:    cfg.opacity / 100,
          muteVideos: cfg.muteVideos
        };

        if (overlayWindow && !overlayWindow.isDestroyed()) {
          overlayWindow.webContents.send('overlay:message', payload);
        }
        if (configWindow && !configWindow.isDestroyed()) {
          configWindow.webContents.send('log:message', msg);
        }
      });

      connected = true;
      refreshTrayMenu();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('bot:disconnect', async () => {
    if (connected) {
      try { await bot.stop(); } catch (_) {}
      connected = false;
      refreshTrayMenu();
    }
    return { ok: true };
  });

  ipcMain.handle('bot:status', () => connected);
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createOverlay();
  createConfigWindow();
  setupIPC();
  setupAutoUpdater();
  createTray();
});

app.on('before-quit', async () => {
  forceQuit = true;
  if (connected) {
    try { await bot.stop(); } catch (_) {}
  }
});

// L'app reste dans le tray même quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  if (forceQuit) {
    app.quit();
  }
  // Sinon on reste dans le tray (Windows/Linux)
});

// macOS : clic sur le dock → rouvrir la fenêtre config
app.on('activate', () => {
  showConfigWindow();
});
=======
const { app, BrowserWindow } = require("electron");

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 600,
        frame: false,
        alwaysOnTop: true
    });

    win.loadURL("https://TON-SERVER.onrender.com/overlay.html");
}

app.whenReady().then(createWindow);
>>>>>>> 6f0691070b20671e996165df04b697ea7761f159
