const { app, BrowserWindow, systemPreferences, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

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
