import * as app from 'app';
import * as BrowserWindow from 'browser-window';
import * as path from 'path';

//require('crash-reporter').start();

let mainWindow: GitHubElectron.BrowserWindow = null;

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar  to stay active until the user quits
  // explicitly with Cmd + Q.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  const documentFilename = path.resolve(__dirname, '..', '..', 'static', 'index.html');
  mainWindow.loadUrl('file://' + documentFilename);

  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
