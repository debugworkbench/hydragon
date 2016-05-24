// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// IPC channels used by dev tools

/**
 * [[RendererDevTools]] will use this channel to establish a connection with [[DevTools]], which in
 * turn will respond on this channel with an [[IConnectResponse]].
 */
export const IPC_CONNECT = 'dev-tools:connect';
/**
 * [[DevTools]] will use this channel to signal [[RendererDevTools]] whenever the Electron DevTools
 * window is opened.
 */
export const IPC_DID_OPEN = 'dev-tools:did-open';
/**
 * [[DevTools]] will use this channel to signal [[RendererDevTools]] whenever the Electron DevTools
 * window is closed.
 */
export const IPC_DID_CLOSE = 'dev-tools:did-close';
/**
 * [[RendererDevTools]] will use this channel to signal to [[DevTools]] that the Electron DevTools
 * window should be opened.
 */
export const IPC_OPEN = 'dev-tools:open';
/**
 * [[RendererDevTools]] will use this channel to signal to [[DevTools]] that the Electron DevTools
 * window should be closed.
 */
export const IPC_CLOSE = 'dev-tools:close';
/**
 * [[RendererDevTools]] will use this channel to send an [[IInspectElementRequest]] to [[DevTools]].
 */
export const IPC_INSPECT_ELEMENT = 'dev-tools:inspect-element';
/**
 * [[RendererDevTools]] will use this channel to signal to [[DevTools]] that the current renderer
 * window should be reloaded.
 */
export const IPC_RELOAD_PAGE = 'dev-tools:reload-page';

/** Sent from a renderer process to the main process on the [[IPC_INSPECT_ELEMENT]] channel. */
export interface IInspectElementRequest {
  x: number;
  y: number;
}

/** Sent from the main process to a renderer process on the [[IPC_CONNECT]] channel. */
export interface IConnectResponse {
  /** Indicates whether the DevTools window is currently open. */
  isWindowOpen: boolean;
}
