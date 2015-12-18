// Type definitions for the Electron 0.35.4 renderer process (web page)
// Project: http://electron.atom.io/
// Definitions by: jedmao <https://github.com/jedmao/>, Vadim Macagon <https://github.com/enlight/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="./github-electron.d.ts" />

declare module GitHubElectron {
  interface Electron {
    ipcRenderer: RendererIPC;
    remote: Remote;
    webFrame: WebFrame;
  }
}
