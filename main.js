const { app, BrowserWindow, Menu, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

let mainWindow;

// 🔥 LOGS (indispensable)
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// 🔥 CONFIG GITHUB (IMPORTANT)
autoUpdater.setFeedURL({
  provider: "github",
  owner: "Gaetanerk",
  repo: "QRStudio",
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1100,
    icon: "ico.ico",
    title: `QR STUDIO by Gaëtan v${app.getVersion()}`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  Menu.setApplicationMenu(null);
  mainWindow.maximize();
  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  // 🔥 CHECK UPDATE
  autoUpdater.checkForUpdatesAndNotify();
});

// =======================
// EVENTS DEBUG + UI
// =======================

autoUpdater.on("checking-for-update", () => {
  console.log("🔍 Checking for update...");
});

autoUpdater.on("update-available", () => {
  console.log("✅ Update available");

  dialog.showMessageBox({
    type: "info",
    title: "Mise à jour disponible",
    message: "Une nouvelle version est disponible. Téléchargement...",
  });
});

autoUpdater.on("update-not-available", () => {
  console.log("❌ No update available");
});

autoUpdater.on("error", (err) => {
  console.log("🔥 Error:", err);
});

autoUpdater.on("download-progress", (progressObj) => {
  console.log(`⬇️ Download: ${Math.round(progressObj.percent)}%`);
});

autoUpdater.on("update-downloaded", () => {
  console.log("🎉 Update ready");

  dialog
    .showMessageBox({
      type: "info",
      title: "Installer la mise à jour",
      message: "La mise à jour est prête. Redémarrer maintenant ?",
      buttons: ["Oui", "Plus tard"],
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});
