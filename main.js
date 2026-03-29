const { app, BrowserWindow, Menu } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 450,
    height: 1000,
    icon: "ico.ico",
    title: "QR STUDIO by Gaëtan v1.0",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  Menu.setApplicationMenu(null);

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);