const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  dialog,
} = require('electron');
const path = require('path');
const downloadPath = require('downloads-folder');
const fs = require('fs');
let filename = '';
const convert = require('./utils');
const os = require('os');
let outputDirPath = downloadPath();
if (os.platform === 'win32') {
  outputDirPath = downloadPath.windows();
}
if (os.platform === 'unix') {
  outputDirPath = downloadPath.unix();
}
// Check development environment
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  });
}

ipcMain.on('notify', (_, message) => {
  new Notification({ title: 'Notification', body: message }).show();
});

ipcMain.on('file-path', (_, item) => {
  convert(item, outputDirPath, mainWindow);
});

ipcMain.on('get-download-directory', (_, item) => {
  mainWindow.webContents.send('download-directory', outputDirPath);
});

ipcMain.on('select-directory', (e, format) => {
  changeDirectory(format);
});

ipcMain.on('dir-path', (_, dir) => {
  const files = fs
    .readdirSync(dir)
    .map((p) => ({ name: p, path: `${dir}/${p}`, start: false }));
  mainWindow.webContents.send('dir-files-path', files);
});

ipcMain.handle('get-directory', async (event, argument) => {
  return outputDirPath;
});

function readDirectory(url) {
  let dirFiles = [];
  fs.readdirSync(url).forEach((file) => {
    dirFiles.push(file);
  });
  return dirFiles;
}

function changeDirectory(format) {
  const directoryDialog = dialog
    .showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })
    .then((result) => {
      if (!result.filePaths[0]) {
        mainWindow.webContents.send('download-directory', outputDirPath);
        return;
      }
      let directoryPath = result.filePaths[0];
      const outputDir = `${directoryPath}`;
      outputDirPath = outputDir;

      mainWindow.webContents.send('download-directory', outputDirPath);
    })
    .catch((error) => {
      console.log('File Error', error);
    });
}

function openFile() {
  const file = dialog
    .showOpenDialog(mainWindow, {
      properties: ['openFile', 'openDirectory'],
    })
    .then(async (result) => {
      if (result.canceled) {
        return;
      }
      filename = result.filePaths[0];
      mainWindow.webContents.send('send-choose-file-path', filename);
      console.log('Selected File', filename);
    })
    .catch((error) => {
      console.log('File Error', error);
    });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
