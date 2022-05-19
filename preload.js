const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  statusApi: {
    start(cb) {
      ipcRenderer.on('start', (e) => {
        cb();
      });
    },
    end(cb) {
      // ipcRenderer.removeListener('end-covert');
      ipcRenderer.on('end-covert', (e, fileInfo) => {
        cb(fileInfo);
      });
    },
  },

  removerAllApi: {
    remove() {
      ipcRenderer.removeAllListeners();
    },
  },

  notificationApi: {
    sendNotification(message) {
      ipcRenderer.send('notify', message);
    },
  },

  filesApi: {
    sendFilePath(item) {
      ipcRenderer.send('file-path', item);
    },
  },

  changeDirectory: {
    selectDirectory(format) {
      ipcRenderer.send('select-directory', format);
    },
  },

  directoryApi: {
    sendDirPath(dir) {
      ipcRenderer.send('dir-path', dir);
    },
    getDirFilesPath(cb) {
      ipcRenderer.on('dir-files-path', (e, filesList) => {
        cb(filesList);
      });
    },
    getDownLoadFilePath() {
      ipcRenderer.send('get-download-directory');
    },
    receiveDownloadDirectory(cb) {
      ipcRenderer.on('download-directory', (e, p) => {
        cb(p);
      });
    },
  },
});
