// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/**
 * Reporter/Runner window configuration passed from the main process to renderer processes.
 */
export interface IWindowConfig {
  /**
   * `true` if the window will be used for displaying the results of Mocha tests,
   * `false` if the window will be used for running Mocha tests.
   */
  isReporter: boolean;
}

export function encodeToUriComponent(config: IWindowConfig): string {
  return encodeURIComponent(JSON.stringify(config));
}

export function decodeFromUriComponent(uriComponent: string): IWindowConfig {
  return JSON.parse(decodeURIComponent(uriComponent));
}
