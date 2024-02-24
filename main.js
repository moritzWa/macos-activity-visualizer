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

async function initializeApp() {
  const hasPermission = await systemPreferences.isTrustedAccessibilityClient(
    false
  );
  console.log("Initial Permission Status:", hasPermission);
  permissionsGranted = hasPermission;

  if (!hasPermission) {
    const didRequestPermission =
      await systemPreferences.isTrustedAccessibilityClient(true);
    console.log("Did Request Permission:", didRequestPermission);

    if (!didRequestPermission) {
      mainWindow.webContents.send("permissions-needed");
    } else {
      mainWindow.webContents.send("permissions-requested");
    }
  } else {
    startActiveWindowTracking();
    mainWindow.webContents.send("permissions-granted");
  }
}

function startActiveWindowTracking() {
  if (!permissionsGranted) return;

  setInterval(async () => {
    try {
      const windowData = await activeWin();
      mainWindow.webContents.send("frontmost-app-changed", {
        app: windowData.owner.name,
        isChrome: windowData.owner.name === "Google Chrome",
        websiteTitle: windowData.title,
        websiteUrl: windowData.url,
      });
    } catch (error) {
      console.error("Error getting active window:", error);
    }
  }, 2000);
}

ipcMain.handle("recheck-permissions", async () => {
  const hasPermission = await systemPreferences.isTrustedAccessibilityClient(
    false
  );
  permissionsGranted = hasPermission;

  if (hasPermission) {
    startActiveWindowTracking();
    mainWindow.webContents.send("permissions-granted");
  }
});

app.whenReady().then(() => {
  createWindow();
  initializeApp();

  // Logging
  log.transports.file.level = "debug";
  log.transports.file.resolvePathFn = () => {
    const logPath = path.join(app.getPath("userData"), "logs/main.log");
    console.log("Trying to create log file at:", logPath);
    return logPath;
  };
  log.warn("Application started. Forcing a log entry.");
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
