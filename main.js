const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 700,
    minHeight: 500,
    title: 'MX Simulator Tools',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ── IPC Handlers ──────────────────────────────────────────────────────────

// Open a folder picker and return the selected path
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Track Folder'
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// Open a file picker (for images, etc.)
ipcMain.handle('select-file', async (event, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters || [],
    title: 'Select File'
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// Scan a folder and return filenames grouped by extension
ipcMain.handle('scan-folder', async (event, folderPath) => {
  try {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const files = entries
      .filter(e => e.isFile())
      .map(e => e.name);
    return { ok: true, files };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// Scan a folder recursively and return all files with relative paths
ipcMain.handle('scan-folder-recursive', async (event, folderPath) => {
  try {
    const results = [];
    function walk(dir, rel) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const relPath = rel ? rel + '/' + e.name : e.name;
        if (e.isDirectory()) {
          walk(path.join(dir, e.name), relPath);
        } else {
          results.push(relPath);
        }
      }
    }
    walk(folderPath, '');
    return { ok: true, files: results };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// Read a text file
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { ok: true, content };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// Write a text file
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// Append text to a file
ipcMain.handle('append-file', async (event, filePath, content) => {
  try {
    fs.appendFileSync(filePath, content, 'utf-8');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// Save dialog — let user pick where to save a new file
ipcMain.handle('save-dialog', async (event, defaultName, filters) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: filters || [{ name: 'All Files', extensions: ['*'] }],
    title: 'Save File'
  });
  if (result.canceled) return null;
  return result.filePath;
});

// Get file image as data URL (for map image preview)
ipcMain.handle('read-image', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    const b64 = buffer.toString('base64');
    return { ok: true, dataUrl: `data:${mime};base64,${b64}` };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});
