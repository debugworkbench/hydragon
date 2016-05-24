// Type definitions for the Electron 0.35.4 main process
// Project: http://electron.atom.io/
// Definitions by: jedmao <https://github.com/jedmao/>, Vadim Macagon <https://github.com/enlight/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="./github-electron.d.ts" />

declare module GitHubElectron {
    interface Electron {
    app: App;
    autoUpdater: AutoUpdater;
    BrowserWindow: typeof BrowserWindow;
    contentTracing: ContentTracing;
    dialog: Dialog;
    globalShortcut: GlobalShortcut;
    ipcMain: MainIPC;
    Menu: typeof Menu;
    MenuItem: typeof MenuItem;
    powerMonitor: NodeJS.EventEmitter;
    powerSaveBlocker: any;
    protocol: Protocol;
    session: any;
    webContents: WebContents;
    Tray: typeof Tray;
  }
}
