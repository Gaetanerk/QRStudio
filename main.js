const { app, BrowserWindow, Menu, dialog, shell } = require("electron");

const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

let mainWindow;

// =======================
// LOGGER
// =======================

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// =======================
// CREATE WINDOW
// =======================

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

// =======================
// APP READY
// =======================

app.whenReady().then(() => {
  createWindow();

  // CHECK FOR UPDATES
  autoUpdater.checkForUpdatesAndNotify();
});

// =======================
// AUTO UPDATER EVENTS
// =======================

autoUpdater.on("checking-for-update", () => {
  console.log("🔍 Checking for update...");
});

autoUpdater.on("update-available", (info) => {
  console.log("✅ Update available:", info.version);

  dialog.showMessageBox({
    type: "info",
    title: "Mise à jour disponible",
    message: `Une nouvelle version (${info.version}) est disponible.\n\nTéléchargement en cours...`,
  });
});

autoUpdater.on("update-not-available", () => {
  console.log("❌ No update available");
});

autoUpdater.on("error", (err) => {
  console.log("🔥 Update error:", err);

  dialog.showMessageBox({
    type: "error",
    title: "Erreur mise à jour",
    message: err == null ? "Erreur inconnue" : err.toString(),
  });
});

autoUpdater.on("download-progress", (progressObj) => {
  let percent = Math.round(progressObj.percent);

  console.log(`⬇️ Download progress: ${percent}%`);

  if (mainWindow) {
    mainWindow.setProgressBar(progressObj.percent / 100);
  }
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("🎉 Update downloaded");

  if (process.platform === "darwin") {
    dialog
      .showMessageBox({
        type: "info",
        title: "Nouvelle version disponible",
        message: `La version ${info.version} est disponible.\n\nTélécharger maintenant ?`,
        buttons: ["Télécharger", "Plus tard"],
        defaultId: 0,
        cancelId: 1,
      })
      .then((result) => {
        if (result.response === 0) {
          shell.openExternal(
            "https://github.com/Gaetanerk/QRStudio/releases/latest/download/QR-Studio-By-Gaetan-Setup.dmg",
          );
        }
      });

    return;
  }

  // WINDOWS
  dialog
    .showMessageBox({
      type: "info",
      title: "Installer la mise à jour",
      message:
        "La mise à jour a été téléchargée.\n\nVoulez-vous redémarrer l'application maintenant ?",
      buttons: ["Redémarrer", "Plus tard"],
      defaultId: 0,
      cancelId: 1,
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});

// =======================
// MACOS EVENTS
// =======================

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
