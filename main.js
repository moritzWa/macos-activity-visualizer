const { app, BrowserWindow, systemPreferences, ipcMain } = require("electron");
const activeWin = require("active-win");
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

app.whenReady().then(createWindow);

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
  console.log("Permission Status:", hasPermission);

  if (!hasPermission) {
    const didRequestPermission =
      await systemPreferences.isTrustedAccessibilityClient(true);
    if (!didRequestPermission) {
      console.log("Please grant Accessibility permissions in System Settings");
      mainWindow.webContents.send("permissions-needed");
    } else {
      // Key Change: Add a state variable or flag to track if you've already requested permissions
      mainWindow.webContents.send("permissions-requested"); // Inform the frontend the request is pending
    }
  } else {
    console.log("Starting active window tracking");
    startActiveWindowTracking();
    mainWindow.webContents.send("permissions-granted"); // Send this only if permissions are initially granted
  }
}

function startActiveWindowTracking() {
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
  if (hasPermission) {
    startActiveWindowTracking();
    mainWindow.webContents.send("permissions-granted");
  }
});

app.whenReady().then(() => {
  createWindow();
  initializeApp();

  // logging
  log.transports.file.level = "info"; // Set log level ('debug', 'info', 'warn', 'error')
  log.transports.file.resolvePath = () =>
    path.join(app.getPath("userData"), "logs/main.log");

  // Logging Configuration
  log.transports.file.level = "debug";
  log.transports.file.resolvePath = () => {
    const logPath = path.join(app.getPath("userData"), "logs/main.log");
    console.log("Trying to create log file at:", logPath);
    return logPath;
  };

  // Force a log message to help troubleshoot
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
