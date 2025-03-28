const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // For simplicity, allow 'require' in the renderer
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Show open-file dialog
ipcMain.handle("dialog:openFile", async (event, filters) => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, "utf8");
    return { filePath, content };
  }
  return null;
});

// Show save-file dialog
ipcMain.handle("dialog:saveFile", async (event, { defaultPath, data }) => {
  const result = await dialog.showSaveDialog({
    defaultPath,
    filters: [{ name: "TeX/Proj", extensions: ["tex", "proj", "txt"] }]
  });
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, data, "utf8");
    return result.filePath;
  }
  return null;
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

