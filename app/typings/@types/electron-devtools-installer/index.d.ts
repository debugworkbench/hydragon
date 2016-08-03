// Type definitions for electron-devtools-installer
// Project: https://github.com/GPMDP/electron-devtools-installer
// Definitions by: Vadim Macagon <https://github.com/enlight>

export interface IExtensionID {
  /** Chrome Store ID */
  id: string;
  /** Compatible Electron version (in semver format) */
  electron?: string;
}

export const EMBER_INSPECTOR: IExtensionID;
export const REACT_DEVELOPER_TOOLS: IExtensionID;
export const BACKBONE_DEBUGGER: IExtensionID;
export const JQUERY_DEBUGGER: IExtensionID;
export const ANGULARJS_BATARANG: IExtensionID;
export const VUEJS_DEVTOOLS: IExtensionID;
export const REDUX_DEVTOOLS: IExtensionID;
export const REACT_PERF: IExtensionID;

/**
 * Install an extension from the Chrome Store.
 *
 * The extension will only be downloaded and installed if it isn't already installed.
 *
 * @param id Chrome Store ID for the extension.
 */
export default function installExtension(id: string | IExtensionID): Promise<string>;
