const { app, BrowserWindow, systemPreferences, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

// app setup
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
ipcMain.handle("get-darkmode", () => {
  return systemPreferences.getEffectiveAppearance();
});

// db connection
const ethiDbPath = "/Users/m/Library/Application Support/Ethi/database.sqlite";
let ethiDb;

function connectToEthiDb() {
  ethiDb = new sqlite3.Database(ethiDbPath, (err) => {
    if (err) {
      console.error("Error connecting to Ethi database:", err);
    } else {
      console.log("Connected to Ethi database");
    }
  });
}

// IPC Handler for database queries
ipcMain.handle("query-ethi-db", async (event, query) => {
  if (!ethiDb) {
    connectToEthiDb();
  }

  return new Promise((resolve, reject) => {
    ethiDb.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});
