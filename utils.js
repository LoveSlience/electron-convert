const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const { Notification } = require('electron');

function convertMedia(fileInfo, outputDirPath, mainWindow) {
  mainWindow.send('start');
  const time = Date.now();
  let p = `${outputDirPath}/${fileInfo.name.split('.')[0]}${time}.${
    fileInfo.type
  }`;
  let options = []
  if (fileInfo.type === 'm3u8') {
    options = [
        '-hls_time 72000'  
    ]   
  }
  ffmpeg(fileInfo.path)
    .output(p).
    outputOptions(options)
    .on('end', () => {
      sendNotification(
        `${fileInfo.name.split('.')[0]}${time}.${fileInfo.type}`,
        p
      );
      mainWindow.webContents.send('end-covert', {
        ...fileInfo,
        p,
        start: 'end',
      });
    })
    .run();
}

function sendNotification(message, p) {
  new Notification({
    title: 'Notification',
    body: message,
  }).show();
}

module.exports = convertMedia;
