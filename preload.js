const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Config
  loadConfig: () => ipcRenderer.invoke('config:load'),

  // Bot control
  connect: (cfg) => ipcRenderer.invoke('bot:connect', cfg),
  disconnect: () => ipcRenderer.invoke('bot:disconnect'),
  status: () => ipcRenderer.invoke('bot:status'),

  // Auto-updater
  updaterVersion: () => ipcRenderer.invoke('updater:version'),
  updaterCheck:   () => ipcRenderer.invoke('updater:check'),
  updaterInstall: () => ipcRenderer.invoke('updater:install'),
  onUpdaterAvailable:  (cb) => ipcRenderer.on('updater:available',  (_, d) => cb(d)),
  onUpdaterUpToDate:   (cb) => ipcRenderer.on('updater:up-to-date', (_, d) => cb(d)),
  onUpdaterProgress:   (cb) => ipcRenderer.on('updater:progress',   (_, d) => cb(d)),
  onUpdaterDownloaded: (cb) => ipcRenderer.on('updater:downloaded', (_, d) => cb(d)),
  onUpdaterError:      (cb) => ipcRenderer.on('updater:error',      (_, d) => cb(d)),

  // Tray → renderer
  onTrayDisconnected: (cb) => ipcRenderer.on('tray:disconnected', () => cb()),

  // Events: main → renderer
  onOverlayMessage: (cb) => ipcRenderer.on('overlay:message', (_, data) => cb(data)),
  onLogMessage:     (cb) => ipcRenderer.on('log:message',     (_, msg)  => cb(msg))
});
