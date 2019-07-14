const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');
const { TASKS_SAVE, TASKS_LOAD, TASKS } = require('./constants');
const Store = require('electron-store');
const store = new Store();
const { ipcMain } = electron;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 500,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  mainWindow.on('closed', () => (mainWindow = null));
}
app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on(TASKS_SAVE, (event, arg) => {
  store.set(TASKS, arg);
  event.reply(TASKS_SAVE, 'success');
});

ipcMain.on(TASKS_LOAD, (event, arg) => {
  const tasks = store.get(TASKS);
  event.reply(TASKS_LOAD, tasks);
});
