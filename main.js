const { app, BrowserWindow, systemPreferences, ipcMain } = require("electron");
// const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const moment = require("moment");

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

  // mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
  mainWindow.loadURL("http://localhost:8080");
}

app.whenReady().then(() => {
  createWindow();
});

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
ipcMain.handle("query-ethi-db", async (event, selectedDate) => {
  if (!ethiDb) {
    connectToEthiDb();
  }

  const today = moment().startOf("day"); // Get today's date at midnight
  const queryDate = moment(selectedDate || today);

  // TODO: try something like
  // const utcOffset = moment().utcOffset() / 60; // Get the UTC offset in hours
  // const endDate = queryDate.endOf('day').add(utcOffset, 'hours').utc().format('YYYY-MM-DD HH:mm:ss');
  const startDate = queryDate
    .startOf("day")
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");
  const endDate = queryDate
    .endOf("day")
    .add(12, "hours")
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");

  // Build the parameterized SQL query for filtering by date range
  const query = `SELECT * FROM Activities WHERE start >= ? AND end <= ?`;

  return new Promise((resolve, reject) => {
    ethiDb.all(query, [startDate, endDate], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});
