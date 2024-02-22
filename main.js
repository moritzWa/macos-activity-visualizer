const { app, BrowserWindow, systemPreferences, ipcMain } = require("electron");
const { exec } = require("child_process");

const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Enable for added security if possible
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

// tracking
function getFrontmostApp() {
  const applescript = `
    tell application "System Events"
      set frontApp to name of first process whose frontmost is true
    end tell
  `;

  exec(`osascript -e '${applescript}'`, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error("Error getting frontmost app:", error || stderr);
    } else {
      console.log("Frontmost App:", stdout.trim());
      mainWindow.webContents.send("frontmost-app-changed", stdout.trim());
    }
  });
}
// Initial State
getFrontmostApp();
// Continuous Polling
setInterval(getFrontmostApp, 2000); // Check every 2 seconds (adjust interval)

// theme
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
