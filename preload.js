const { contextBridge, ipcRenderer } = require('electron');

// Expose safe file-system APIs to the renderer (index.html)
contextBridge.exposeInMainWorld('mxTools', {

  // Open native folder picker, returns path string or null
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // Open native file picker, returns path string or null
  selectFile: (filters) => ipcRenderer.invoke('select-file', filters),

  // Scan a folder, returns { ok, files: string[] } or { ok, error }
  scanFolder: (folderPath) => ipcRenderer.invoke('scan-folder', folderPath),

  // Scan a folder recursively, returns { ok, files: string[] } with relative paths
  scanFolderRecursive: (folderPath) => ipcRenderer.invoke('scan-folder-recursive', folderPath),

  // Read a text file, returns { ok, content } or { ok, error }
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),

  // Write content to a text file, returns { ok } or { ok, error }
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),

  // Append content to a text file, returns { ok } or { ok, error }
  appendFile: (filePath, content) => ipcRenderer.invoke('append-file', filePath, content),

  // Open a save dialog, returns file path or null
  saveDialog: (defaultName, filters) => ipcRenderer.invoke('save-dialog', defaultName, filters),

  // Read an image file as data URL for display
  readImage: (filePath) => ipcRenderer.invoke('read-image', filePath)
});
