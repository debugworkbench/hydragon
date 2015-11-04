// Type definitions for electron-rebuild 1.0.2
// Project: https://github.com/electronjs/electron-rebuild/
// Definitions by: Vadim Macagon <https://github.com/enlight/>

declare namespace ElectronRebuild {
  export function shouldRebuildNativeModules(
    pathToElectronExecutable: string, explicitNodeVersion?: string
  ): Promise<boolean>;

  export function installNodeHeaders(
    nodeVersion: string, nodeDistUrl?: string, headersDir?: string, arch?: string
  ): Promise<void>;

  export function rebuildNativeModules(
    nodeVersion: string, nodeModulesPath: string, whichModule?: string, headersDir?: string, arch?: string
  ): Promise<void>;
}

declare module "electron-rebuild" {
  export = ElectronRebuild;
}
