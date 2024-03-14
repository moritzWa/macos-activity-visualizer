const { app, BrowserWindow, systemPreferences, ipcMain } = require("electron");
const activeWin = require("active-win");
const path = require("path");
const log = require("electron-log");

let mainWindow;
let permissionsGranted = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

// Theme
systemPreferences.subscribeNotification(
  "AppleInterfaceThemeChangedNotification",
  () => {
    const mode = systemPreferences.getEffectiveAppearance();
    mainWindow.webContents.send("dark-mode-changed", mode);
  }
);

// IPC Listener for Dark Mode Update
ipcMain.handle("get-darkmode", () => {
  return systemPreferences.getEffectiveAppearance();
});
