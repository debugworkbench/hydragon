// Type definitions for the Electron 0.25.2 main process
// Project: http://electron.atom.io/
// Definitions by: jedmao <https://github.com/jedmao/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="./github-electron.d.ts" />

declare module GitHubElectron {
	interface ContentTracing  {
		/**
		 * Get a set of category groups. The category groups can change as new code paths are reached.
		 * @param callback Called once all child processes have acked to the getCategories request.
		 */
		getCategories(callback: (categoryGroups: any[]) => void): void;
		/**
		 * Start recording on all processes. Recording begins immediately locally, and asynchronously
		 * on child processes as soon as they receive the EnableRecording request.
		 * @param categoryFilter A filter to control what category groups should be traced.
		 * A filter can have an optional "-" prefix to exclude category groups that contain
		 * a matching category. Having both included and excluded category patterns in the
		 * same list would not be supported.
		 * @param options controls what kind of tracing is enabled, it could be a OR-ed
		 * combination of tracing.DEFAULT_OPTIONS, tracing.ENABLE_SYSTRACE, tracing.ENABLE_SAMPLING
		 * and tracing.RECORD_CONTINUOUSLY.
		 * @param callback Called once all child processes have acked to the startRecording request.
		 */
		startRecording(categoryFilter: string, options: number, callback: Function): void;
		/**
		 * Stop recording on all processes. Child processes typically are caching trace data and
		 * only rarely flush and send trace data back to the main process. That is because it may
		 * be an expensive operation to send the trace data over IPC, and we would like to avoid
		 * much runtime overhead of tracing. So, to end tracing, we must asynchronously ask all
		 * child processes to flush any pending trace data.
		 * @param resultFilePath Trace data will be written into this file if it is not empty,
		 * or into a temporary file.
		 * @param callback Called once all child processes have acked to the stopRecording request.
		 */
		stopRecording(resultFilePath: string, callback:
			/**
			 * @param filePath A file that contains the traced data.
			 */
			(filePath: string) => void
			): void;
		/**
		 * Start monitoring on all processes. Monitoring begins immediately locally, and asynchronously
		 * on child processes as soon as they receive the startMonitoring request.
		 * @param callback Called once all child processes have acked to the startMonitoring request.
		 */
		startMonitoring(categoryFilter: string, options: number, callback: Function): void;
		/**
		 * Stop monitoring on all processes.
		 * @param callback Called once all child processes have acked to the stopMonitoring request.
		 */
		stopMonitoring(callback: Function): void;
		/**
		 * Get the current monitoring traced data. Child processes typically are caching trace data
		 * and only rarely flush and send trace data back to the main process. That is because it may
		 * be an expensive operation to send the trace data over IPC, and we would like to avoid much
		 * runtime overhead of tracing. So, to end tracing, we must asynchronously ask all child
		 * processes to flush any pending trace data.
		 * @param callback Called once all child processes have acked to the captureMonitoringSnapshot request.
		 */
		captureMonitoringSnapshot(resultFilePath: string, callback:
			/**
			 * @param filePath A file that contains the traced data
			 * @returns {}
			 */
			(filePath: string) => void
			): void;
		/**
		 * Get the maximum across processes of trace buffer percent full state.
		 * @param callback Called when the TraceBufferUsage value is determined.
		 */
		getTraceBufferUsage(callback: Function): void;
		/**
		 * @param callback Called every time the given event occurs on any process.
		 */
		setWatchEvent(categoryName: string, eventName: string, callback: Function): void;
		/**
		 * Cancel the watch event. If tracing is enabled, this may race with the watch event callback.
		 */
		cancelWatchEvent(): void;
		DEFAULT_OPTIONS: number;
		ENABLE_SYSTRACE: number;
		ENABLE_SAMPLING: number;
		RECORD_CONTINUOUSLY: number;
	}

	interface Dialog {
		/**
		 * @param callback If supplied, the API call will be asynchronous.
		 * @returns On success, returns an array of file paths chosen by the user,
		 * otherwise returns undefined.
		 */
		showOpenDialog: typeof GitHubElectron.Dialog.showOpenDialog;
		/**
		 * @param callback If supplied, the API call will be asynchronous.
		 * @returns On success, returns the path of file chosen by the user, otherwise
		 * returns undefined.
		 */
		showSaveDialog: typeof GitHubElectron.Dialog.showSaveDialog;
		/**
		 * Shows a message box. It will block until the message box is closed. It returns .
		 * @param callback If supplied, the API call will be asynchronous.
		 * @returns The index of the clicked button.
		 */
		showMessageBox: typeof GitHubElectron.Dialog.showMessageBox;

		/**
		 * Runs a modal dialog that shows an error message. This API can be called safely
		 * before the ready event of app module emits, it is usually used to report errors
		 * in early stage of startup.
		 */
		showErrorBox(title: string, content: string): void;
	}

	interface GlobalShortcut {
		/**
		 * Registers a global shortcut of accelerator.
		 * @param accelerator Represents a keyboard shortcut. It can contain modifiers
		 * and key codes, combined by the "+" character.
		 * @param callback Called when the registered shortcut is pressed by the user.
		 * @returns {}
		 */
		register(accelerator: string, callback: Function): void;
		/**
		 * @param accelerator Represents a keyboard shortcut. It can contain modifiers
		 * and key codes, combined by the "+" character.
		 * @returns Whether the accelerator is registered.
		 */
		isRegistered(accelerator: string): boolean;
		/**
		 * Unregisters the global shortcut of keycode.
		 * @param accelerator Represents a keyboard shortcut. It can contain modifiers
		 * and key codes, combined by the "+" character.
		 */
		unregister(accelerator: string): void;
		/**
		 * Unregisters all the global shortcuts.
		 */
		unregisterAll(): void;
	}

  //---- start v0.34.1 ----//

  interface URLRequest {
    /** The request method (`GET`, `POST` etc.) as an uppercase string. */
    method: string;
    url: string;
    /** The referrer URL for the request. */
    referrer: string;
  }

  interface FileProtocolHandlerCallback {
    (): void;
    /** @param path The path of the file to send. */
    (path: string): void;
    /** @param arg.path The path of the file to send. */
    (arg: { path: string }): void;
  }

  interface BufferProtocolHandlerCallback {
    (): void;
    (data: Buffer): void;
    (arg: { mimeType: string; charset: string; data: Buffer }): void;
  }

  interface StringProtocolHandlerCallback {
    (): void;
    (data: string): void;
    (arg: { mimeType: string; charset: string; data: string }): void;
  }

  interface HttpProtocolHandlerCallback {
    (): void;
    /**
     * @param arg.session By default the current session will be reused for the request,
     *                    to force the request to have a different session set this to `null`.
     */
    (arg: { url: string; method: string; referrer: string; session?: any }): void;
  }

	interface Protocol {
    registerStandardSchemes(schemes: string[]): void;
    /**
     * @param scheme Name to register the new protocol under, e.g. `file`.
     * @param handler Invoked to handle a request matching the registered protocol.
     * @param handler.callback The handler must call this function with no arguments if the
     *                         request should fail, or a single argument if the request should
     *                         be allowed to proceed.
     * @param completion Invoked when this operation completes (successfully or otherwise).
     * @param completion.error `null` if the protocol was registered successfully, otherwise
     *                          a `string` that describes the error that occured.
     */
    registerFileProtocol(
      scheme: string,
      handler: (request: URLRequest, callback: FileProtocolHandlerCallback) => void,
      completion?: (error: string) => void
    ): void;
    registerBufferProtocol(
      scheme: string,
      handler: (request: URLRequest, callback: BufferProtocolHandlerCallback) => void,
      completion?: (error: string) => void
    ): void;
    registerStringProtocol(
      scheme: string,
      handler: (request: URLRequest, callback: StringProtocolHandlerCallback) => void,
      completion?: (error: string) => void
    ): void;
    /**
     * @param scheme Name to register the new protocol under, e.g. `http`.
     * @param handler Invoked to handle a request matching the registered protocol.
     * @param handler.callback The handler must call this function with no arguments if the
     *                         request should fail, or a single argument if the request should
     *                         be allowed to proceed.
     * @param completion Invoked when this operation completes (successfully or otherwise).
     * @param completion.error `null` if the protocol was registered successfully, otherwise
     *                          a `string` that describes the error that occured.
     */
    registerHttpProtocol(
      scheme: string,
      handler: (request: URLRequest, callback: HttpProtocolHandlerCallback) => void,
      completion?: (error: string) => void
    ): void;
		unregisterProtocol(scheme: string, completion?: (error: string) => void): void;
		isProtocolHandled(scheme: string, callback: (isHandled: boolean) => void): void;
		interceptFileProtocol(
      scheme: string,
      handler: (request: URLRequest, callback: FileProtocolHandlerCallback) => void,
      completion?: (error: string) => void
    ): void;
    interceptStringProtocol(
      scheme: string,
      handler: (request: URLRequest, callback: StringProtocolHandlerCallback) => void,
      completion?: (error: string) => void
    ): void;
    interceptBufferProtocol(
      scheme: string,
      handler: (request: URLRequest, callback: BufferProtocolHandlerCallback) => void,
      completion?: (error: string) => void
    ): void;
    interceptHttpProtocol(
      scheme: string,
      handler: (request: URLRequest, callback: HttpProtocolHandlerCallback) => void,
      completion?: (error: string) => void
    ): void;
		uninterceptProtocol(scheme: string, completion?: (error: string) => void): void;
	}

  //---- end v0.34.1 ----//
}

declare module 'app' {
	var _app: GitHubElectron.App;
	export = _app;
}

declare module 'auto-updater' {
	var _autoUpdater: GitHubElectron.AutoUpdater;
	export = _autoUpdater;
}

declare module 'browser-window' {
	var BrowserWindow: typeof GitHubElectron.BrowserWindow;
	export = BrowserWindow;
}

declare module 'content-tracing' {
	var contentTracing: GitHubElectron.ContentTracing
	export = contentTracing;
}

declare module 'dialog' {
	var dialog: GitHubElectron.Dialog
	export = dialog;
}

declare module 'global-shortcut' {
	var globalShortcut: GitHubElectron.GlobalShortcut;
	export = globalShortcut;
}

declare module 'ipc' {
	var ipc: NodeJS.EventEmitter;
	export = ipc;
}

declare module 'menu' {
	var Menu: typeof GitHubElectron.Menu;
	export = Menu;
}

declare module 'menu-item' {
	var MenuItem: typeof GitHubElectron.MenuItem;
	export = MenuItem;
}

declare module 'power-monitor' {
	var powerMonitor: NodeJS.EventEmitter;
	export = powerMonitor;
}

declare module 'protocol' {
	var protocol: GitHubElectron.Protocol;
	export = protocol;
}

declare module 'tray' {
	var Tray: typeof GitHubElectron.Tray;
	export = Tray;
}

interface NodeRequireFunction {
	(id: 'app'): GitHubElectron.App
	(id: 'auto-updater'): GitHubElectron.AutoUpdater
	(id: 'browser-window'): typeof GitHubElectron.BrowserWindow
	(id: 'content-tracing'): GitHubElectron.ContentTracing
	(id: 'dialog'): GitHubElectron.Dialog
	(id: 'global-shortcut'): GitHubElectron.GlobalShortcut
	(id: 'ipc'): NodeJS.EventEmitter
	(id: 'menu'): typeof GitHubElectron.Menu
	(id: 'menu-item'): typeof GitHubElectron.MenuItem
	(id: 'power-monitor'): NodeJS.EventEmitter
	(id: 'protocol'): GitHubElectron.Protocol
	(id: 'tray'): typeof GitHubElectron.Tray
}
