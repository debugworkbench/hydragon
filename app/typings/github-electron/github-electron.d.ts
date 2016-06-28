// Type definitions for Electron 0.34.5 (shared between main and rederer processes)
// Project: http://electron.atom.io/
// Definitions by: jedmao <https://github.com/jedmao/>, Vadim Macagon <https://github.com/enlight/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node/node.d.ts" />

// NOTE: Some parts have been updated for Electron v0.35.4, and have been marked as such,
//       others may be somewhat outdated. The API docs for v0.35.4 can be found at
//       https://github.com/atom/electron/tree/v0.35.4/docs

declare module GitHubElectron {
	// current as at v0.35.4
	/**
	 * This class is used to represent an image.
	 */
	class NativeImage {
		/**
		 * Creates an empty NativeImage instance.
		 */
		static createEmpty(): NativeImage;
		/**
		 * Creates a new NativeImage instance from file located at path.
		 */
		static createFromPath(path: string): NativeImage;
		/**
		 * Creates a new NativeImage instance from buffer.
		 * @param scaleFactor 1.0 by default.
		 */
		static createFromBuffer(buffer: Buffer, scaleFactor?: number): NativeImage;
		/**
		 * Creates a new NativeImage instance from dataUrl
		 */
		static createFromDataUrl(dataUrl: string): NativeImage;
		/**
		 * @returns Buffer Contains the image's PNG encoded data.
		 */
		toPng(): Buffer;
		/**
		 * @returns Buffer Contains the image's JPEG encoded data.
		 */
		toJpeg(quality: number): Buffer;
		/**
		 * @returns string The data URL of the image.
		 */
		toDataUrl(): string;
		/**
		 * @returns boolean Whether the image is empty.
		 */
		isEmpty(): boolean;
		/**
		 * @returns {} The size of the image.
		 */
		getSize(): any;
		/**
		 * Marks the image as template image.
		 */
		setTemplateImage(option: boolean): void;
		/** @return `true` if this is a template image. */
		isTemplateImage(): boolean;
	}

	interface IPoint {
		x: number;
		y: number;
	}

	interface Display {
		id: number;
		bounds: Rectangle;
		rotation: number;
		scaleFactor: number;
		size: { width: number, height: number };
		touchSupport: string;
		workArea: Rectangle;
		workAreaSize: { width: number, height: number };
	}

	// current as at v0.35.4
	/** Provides information about the screen size, displays, cursor position, etc. */
	interface Screen extends NodeJS.EventEmitter {
		/**
		 * @returns The current absolute position of the mouse pointer.
		 */
		getCursorScreenPoint(): IPoint;
		/**
		 * @returns The primary display.
		 */
		getPrimaryDisplay(): Display;
		/**
		 * @returns An array of displays that are currently available.
		 */
		getAllDisplays(): Display[];
		/**
		 * @returns The display nearest the specified point.
		 */
		getDisplayNearestPoint(point: IPoint): Display;
		/**
		 * @returns The display that most closely intersects the provided bounds.
		 */
		getDisplayMatching(rect: Rectangle): Display;
	}

	/**
	 * The BrowserWindow class gives you ability to create a browser window.
	 * You can also create a window without chrome by using Frameless Window API.
	 */
	class BrowserWindow implements NodeJS.EventEmitter {
		addListener(event: string, listener: Function): WebContents;
		on(event: string, listener: Function): WebContents;
		once(event: string, listener: Function): WebContents;
		removeListener(event: string, listener: Function): WebContents;
		removeAllListeners(event?: string): WebContents;
		setMaxListeners(n: number): void;
		listeners(event: string): Function[];
		emit(event: string, ...args: any[]): boolean;

		constructor(options?: BrowserWindowOptions);
		/**
		 * @returns All opened browser windows.
		 */
		static getAllWindows(): BrowserWindow[];
		/**
		 * @returns The window that is focused in this application.
		 */
		static getFocusedWindow(): BrowserWindow;
		/**
		 * Find a window according to the webContents it owns.
		 */
		static fromWebContents(webContents: WebContents): BrowserWindow;
		/**
		 * Find a window according to its ID.
		 */
		static fromId(id: number): BrowserWindow;
		/**
		 * Adds devtools extension located at path. The extension will be remembered
		 * so you only need to call this API once, this API is not for programming use.
		 * @returns The extension's name.
		 */
		static addDevToolsExtension(path: string): string;
		/**
		 * Remove a devtools extension.
		 * @param name The name of the devtools extension to remove.
		 */
		static removeDevToolsExtension(name: string): void;
		/**
		 * The WebContents object this window owns, all web page related events and
		 * operations would be done via it.
		 * Note: Users should never store this object because it may become null when
		 * the renderer process (web page) has crashed.
		 */
		webContents: WebContents;
		/**
		 * Get the WebContents of devtools of this window.
		 * Note: Users should never store this object because it may become null when
		 * the devtools has been closed.
		 */
		devToolsWebContents: WebContents;
		/**
		 * Get the unique ID of this window.
		 */
		id: number;
		/**
		 * Force closing the window, the unload and beforeunload event won't be emitted
		 * for the web page, and close event would also not be emitted for this window,
		 * but it would guarantee the closed event to be emitted.
		 * You should only use this method when the renderer process (web page) has crashed.
		 */
		destroy(): void;
		/**
		 * Try to close the window, this has the same effect with user manually clicking
		 * the close button of the window. The web page may cancel the close though,
		 * see the close event.
		 */
		close(): void;
		/**
		 * Focus on the window.
		 */
		focus(): void;
		/**
		 * @returns Whether the window is focused.
		 */
		isFocused(): boolean;
		/**
		 * Shows and gives focus to the window.
		 */
		show(): void;
		/**
		 * Shows the window but doesn't focus on it.
		 */
		showInactive(): void;
		/**
		 * Hides the window.
		 */
		hide(): void;
		/**
		 * @returns Whether the window is visible to the user.
		 */
		isVisible(): boolean;
		/**
		 * Maximizes the window.
		 */
		maximize(): void;
		/**
		 * Unmaximizes the window.
		 */
		unmaximize(): void;
		/**
		 * @returns Whether the window is maximized.
		 */
		isMaximized(): boolean;
		/**
		 * Minimizes the window. On some platforms the minimized window will be
		 * shown in the Dock.
		 */
		minimize(): void;
		/**
		 * Restores the window from minimized state to its previous state.
		 */
		restore(): void;
		/**
		 * @returns Whether the window is minimized.
		 */
		isMinimized(): boolean;
		/**
		 * Sets whether the window should be in fullscreen mode.
		 */
		setFullScreen(flag: boolean): void;
		/**
		 * @returns Whether the window is in fullscreen mode.
		 */
		isFullScreen(): boolean;
		/**
		 * Resizes and moves the window to width, height, x, y.
		 */
		setBounds(options: Rectangle): void;
		/**
		 * @returns The window's width, height, x and y values.
		 */
		getBounds(): Rectangle;
		/**
		 * Resizes the window to width and height.
		 */
		setSize(width: number, height: number): void;
		/**
		 * @returns The window's width and height.
		 */
		getSize(): number[];
		/**
		 * Resizes the window's client area (e.g. the web page) to width and height.
		 */
		setContentSize(width: number, height: number): void;
		/**
		 * @returns The window's client area's width and height.
		 */
		getContentSize(): number[];
		/**
		 * Sets the minimum size of window to width and height.
		 */
		setMinimumSize(width: number, height: number): void;
		/**
		 * @returns The window's minimum width and height.
		 */
		getMinimumSize(): number[];
		/**
		 * Sets the maximum size of window to width and height.
		 */
		setMaximumSize(width: number, height: number): void;
		/**
		 * @returns The window's maximum width and height.
		 */
		getMaximumSize(): number[];
		/**
		 * Sets whether the window can be manually resized by user.
		 */
		setResizable(resizable: boolean): void;
		/**
		 * @returns Whether the window can be manually resized by user.
		 */
		isResizable(): boolean;
		/**
		 * Sets whether the window should show always on top of other windows. After
		 * setting this, the window is still a normal window, not a toolbox window
		 * which can not be focused on.
		 */
		setAlwaysOnTop(flag: boolean): void;
		/**
		 * @returns Whether the window is always on top of other windows.
		 */
		isAlwaysOnTop(): boolean;
		/**
		 * Moves window to the center of the screen.
		 */
		center(): void;
		/**
		 * Moves window to x and y.
		 */
		setPosition(x: number, y: number): void;
		/**
		 * @returns The window's current position.
		 */
		getPosition(): number[];
		/**
		 * Changes the title of native window to title.
		 */
		setTitle(title: string): void;
		/**
		 * Note: The title of web page can be different from the title of the native window.
		 * @returns The title of the native window.
		 */
		getTitle(): string;
		/**
		 * Starts or stops flashing the window to attract user's attention.
		 */
		flashFrame(flag: boolean): void;
		/**
		 * Makes the window do not show in Taskbar.
		 */
		setSkipTaskbar(skip: boolean): void;
		/**
		 * Enters or leaves the kiosk mode.
		 */
		setKiosk(flag: boolean): void;
		/**
		 * @returns Whether the window is in kiosk mode.
		 */
		isKiosk(): boolean;
		/**
		 * Sets the pathname of the file the window represents, and the icon of the
		 * file will show in window's title bar.
		 * Note: This API is available only on OS X.
		 */
		setRepresentedFilename(filename: string): void;
		/**
		 * Note: This API is available only on OS X.
		 * @returns The pathname of the file the window represents.
		 */
		getRepresentedFilename(): string;
		/**
		 * Specifies whether the window’s document has been edited, and the icon in
		 * title bar will become grey when set to true.
		 * Note: This API is available only on OS X.
		 */
		setDocumentEdited(edited: boolean): void;
		/**
		 * Note: This API is available only on OS X.
		 * @returns Whether the window's document has been edited.
		 */
		isDocumentEdited(): boolean;

		reloadIgnoringCache(): void;
		/**
		 * Starts inspecting element at position (x, y).
		 */
		inspectElement(x: number, y: number): void;
		focusOnWebView(): void;
		blurWebView(): void;
		/**
		 * Captures the snapshot of page within rect, upon completion the callback
		 * will be called. Omitting the rect would capture the whole visible page.
		 * Note: Be sure to read documents on remote buffer in remote if you are going
		 * to use this API in renderer process.
		 * @param callback Supplies the image that stores data of the snapshot.
		 */
		capturePage(rect: Rectangle, callback: (image: NativeImage) => void): void;
		capturePage(callback: (image: NativeImage) => void): void;
		/**
		 * Same with webContents.print([options])
		 */
		print(options?: {
			silent?: boolean;
			printBackground?: boolean;
		}): void;
		/**
		 * Same with webContents.printToPDF([options])
		 */
		printToPDF(options: {
			marginsType?: number;
			pageSize?: string;
			printBackground?: boolean;
			printSelectionOnly?: boolean;
			landscape?: boolean;
		}, callback: (error: Error, data: Buffer) => void): void;
		/**
		 * Convenience method that calls webContents.loadURL(), see [[WebContents.loadURL]].
		 */
		loadURL(url: string, options?: {
			httpReferrer?: string;
			userAgent?: string;
			extraHeaders?: string;
		}): void;
		/**
		 * Same with webContents.reload.
		 */
		reload(): void;
		/**
		 * Sets the menu as the window top menu.
		 * Note: This API is not available on OS X.
		 */
		setMenu(menu: Menu): void;
		/**
		 * Sets the progress value in the progress bar.
		 * On Linux platform, only supports Unity desktop environment, you need to
		 * specify the *.desktop file name to desktopName field in package.json.
		 * By default, it will assume app.getName().desktop.
		 * @param progress Valid range is [0, 1.0]. If < 0, the progress bar is removed.
		 * If greater than 0, it becomes indeterminate.
		 */
		setProgressBar(progress: number): void;
		/**
		 * Sets a 16px overlay onto the current Taskbar icon, usually used to convey
		 * some sort of application status or to passively notify the user.
		 * Note: This API is only available on Windows 7 or above.
		 * @param overlay The icon to display on the bottom right corner of the Taskbar
		 * icon. If this parameter is null, the overlay is cleared
		 * @param description Provided to Accessibility screen readers.
		 */
		setOverlayIcon(overlay: NativeImage, description: string): void;
		/**
		 * Shows pop-up dictionary that searches the selected word on the page.
		 * Note: This API is available only on OS X.
		 */
		showDefinitionForSelection(): void;
		/**
		 * Sets whether the window menu bar should hide itself automatically. Once set
		 * the menu bar will only show when users press the single Alt key.
		 * If the menu bar is already visible, calling setAutoHideMenuBar(true) won't
		 * hide it immediately.
		 */
		setAutoHideMenuBar(hide: boolean): void;
		/**
		 * @returns Whether menu bar automatically hides itself.
		 */
		isMenuBarAutoHide(): boolean;
		/**
		 * Sets whether the menu bar should be visible. If the menu bar is auto-hide,
		 * users can still bring up the menu bar by pressing the single Alt key.
		 */
		setMenuBarVisibility(visibile: boolean): void;
		/**
		 * @returns Whether the menu bar is visible.
		 */
		isMenuBarVisible(): boolean;
		/**
		 * Sets whether the window should be visible on all workspaces.
		 * Note: This API does nothing on Windows.
		 */
		setVisibleOnAllWorkspaces(visible: boolean): void;
		/**
		 * Note: This API always returns false on Windows.
		 * @returns Whether the window is visible on all workspaces.
		 */
		isVisibleOnAllWorkspaces(): boolean;
	}

	// current as at v0.35.4
	/** Various features that can be enabled for web pages. */
	interface WebPreferences {
		/** Defaults to `true`. */
		nodeIntegration?: boolean;
		/**
		 * Absolute path to script file that will be loaded before other scripts run in the page.
		 * This script will always have access to node APIs no matter whether node integration is
		 * turned on for the page.
		 */
		preload?: string;
		/**
		 * The session used by the page.
		 * If partition starts with `persist:`, the page will use a persistent session available to
		 * all pages in the app with the same partition. If there is no `persist:` prefix, the page
		 * will use an in-memory session. By assigning the same partition, multiple pages can share
		 * the same session. If the partition is unset then the default session of the app will be
		 * used.
		 */
		partition?: string;
		/** Default zoom factor of the page, e.g. 3.0 represents 300% */
		zoomFactor?: number;
		/** Enables support for JavaScript, defaults to `true`. */
		javascript?: boolean;
		/**
		 * When set to `false` the same-origin policy is disabled,
		 * and [[allow_displaying_insecure_content]] and [[allow_running_insecure_content]] are set
		 * to `true` if those two options are not set by user.
		 */
		webSecurity?: boolean;
		/** Enables an HTTPS page to display content like images from HTTP URLs. */
		allowDisplayingInsecureContent?: boolean;
		/** Enables an HTTPS page to run JavaScript, CSS or plugins from HTTP URLs. */
		allowRunningInsecureContent?: boolean;
		/** Enables support for images, defaults to `true`. */
		images?: boolean;
		/** Enables support for Java, defaults to `false`. */
		java?: boolean;
		/** Enables resizing of `TextArea` elements, defaults to `true`. */
		textAreasAreResizable?: boolean;
		/** Enables support for WebGL, defaults to `true`. */
		webgl?: boolean;
		/** Enables support for WebAudio, defaults to `true`. */
		webaudio?: boolean;
		/** Defaults to `false`. */
		plugins?: boolean;
		/** Enables Chromium's experimental features, defaults to `false`. */
		experimentalFeatures?: boolean;
		/** Enables Chromium's experimental Canvas features, defaults to `false`. */
		experimentalCanvasFeatures?: boolean;
		/** Defaults to `false`. */
		overlayScrollbars?: boolean;
		/** Defaults to `false`. */
		overlayFullscreenVideo?: boolean;
		/** Enables support for Shared Workers, defaults to `false`. */
		sharedWorker?: boolean;
		/** Enables DirectWrite font rendering on Windows, defaults to `false`. */
		directWrite?: boolean;
		/**
		 * If set the page would be forced to be always in visible or hidden state instead of
		 * reflecting current window's visibility. Users can set this option to `true` to prevent
		 * throttling of DOM timers, by default this options is set to `false`.
		 */
		pageVisibility?: boolean;
		/** Whether to throttle animations and timers when the page is not in focus. */
		backgroundThrottling?: boolean;
	}

	// Includes all options BrowserWindow can take as at v0.35.4.
	// http://electron.atom.io/docs/v0.35.4/api/browser-window/
	interface BrowserWindowOptions {
		/** Window's width in pixels, defaults to 800. */
		width?: number;
		/** Window's height in pixels, defaults to 600. */
		height?: number;
		/** Offset of the window from the left side of the screen, by default the window is centered on screen. */
		x?: number;
		/** Offset of the window from the top of the screen, by default the window is centered on screen. */
		y?: number;
		/**
		 * If set to `true` the [[width]] and [[height]] will be used to set the web page size,
		 * which means that the size of the window itself will be slightly larger as it will
		 * include the window frame. Defaults to `false`.
		 */
		useContentSize?: boolean;
		/** If set to `true` the window will be shown at the center of the screen. */
		center?: boolean;
		/** Window's minimum width, defaults to zero. */
		minWidth?: number;
		/** Window's minimum height, defaults to zero. */
		minHeight?: number;
		/** Window's maximum width, by default no limit is set on the width of the window. */
		maxWidth?: number;
		/** Window's maximum height, by default no limit is set on the height of the window. */
		maxHeight?: number;
		/** If set to `true` the window can be resized, defaults to `true`. */
		resizable?: boolean;
		/** If set to `true` the window will always stay on top of other windows, defaults to `false`. */
		alwaysOnTop?: boolean;
		fullscreen?: boolean;
		/** If set to `true` the window will not appear in the taskbar, defaults to `false`. */
		skipTaskbar?: boolean;
		kiosk?: boolean;
		title?: string;
		icon?: NativeImage|string;
		show?: boolean;
		frame?: boolean;
		acceptFirstMouse?: boolean;
		disableAutoHideCursor?: boolean;
		autoHideMenuBar?: boolean;
		enableLargerThanScreen?: boolean;
		/**
		 * The window's background color as a hexadecimal value (e.g. #66CD00 or #FFF).
		 * This option is only supported on Linux and Windows, and defaults to `#000` (black).
		 */
		backgroundColor?: string;
		/**
		 * Set to `true` to force the use of a dark theme for the window.
		 * This option only works on some GTK+3 desktop environments, and defaults to `false`.
		 */
		darkTheme?: boolean;
		/** Set to `true` to make the window transparent, defaults to `false`. */
		transparent?: boolean;
		type?: 'desktop' | 'dock' | 'toolbar' | 'splash' | 'notification' | 'textured';
		/** Only supported on OS X 10.10 Yosemite or later. */
		titleBarStyle?: 'default' | 'hidden' | 'hidden-inset';
		webPreferences?: WebPreferences;
	}

	interface Rectangle {
		x?: number;
		y?: number;
		width?: number;
		height?: number;
	}

	/**
	 * A WebContents is responsible for rendering and controlling a web page.
	 */
	interface WebContents extends NodeJS.EventEmitter {
		/**
		 * Loads the URL in the window.
		 * @param url Must contain the protocol prefix (e.g., the http:// or file://).
		 * @param options.httpReferrer HTTP referrer url.
		 * @param options.userAgent The user agent the request originated from.
		 * @param options.extraHeaders Extra headers separated by `\n`.
		 */
		loadURL(url: string, options?: {
			httpReferrer?: string;
			userAgent?: string;
			extraHeaders: string;
		}): void;
		/**
		 * Initiate a download of the resource at the given url without navigating.
		 * The `will-download` event of `session` will be triggered.
		 */
		downloadURL(url: string): void;
		/**
		 * @returns The URL of current web page.
		 */
		getUrl(): string;
		/**
		 * @returns The title of web page.
		 */
		getTitle(): string;
		/**
		 * @returns The favicon of the web page.
		 */
		getFavicon(): NativeImage;
		/**
		 * @returns Whether web page is still loading resources.
		 */
		isLoading(): boolean;
		/**
		 * @returns Whether web page is waiting for a first-response for the main
		 * resource of the page.
		 */
		isWaitingForResponse(): boolean;
		/**
		 * Stops any pending navigation.
		 */
		stop(): void;
		/**
		 * Reloads current page.
		 */
		reload(): void;
		/**
		 * Reloads current page and ignores cache.
		 */
		reloadIgnoringCache(): void;
		/**
		 * @returns Whether the web page can go back.
		 */
		canGoBack(): boolean;
		/**
		 * @returns Whether the web page can go forward.
		 */
		canGoForward(): boolean;
		/**
		 * @returns Whether the web page can go to offset.
		 */
		canGoToOffset(offset: number): boolean;
		/**
		 * Makes the web page go back.
		 */
		goBack(): void;
		/**
		 * Makes the web page go forward.
		 */
		goForward(): void;
		/**
		 * Navigates to the specified absolute index.
		 */
		goToIndex(index: number): void;
		/**
		 * Navigates to the specified offset from the "current entry".
		 */
		goToOffset(offset: number): void;
		/**
		 * @returns Whether the renderer process has crashed.
		 */
		isCrashed(): boolean;
		/**
		 * Overrides the user agent for this page.
		 */
		setUserAgent(userAgent: string): void;
		/**
		 * Injects CSS into this page.
		 */
		insertCSS(css: string): void;
		/**
		 * Evaluates code in page.
		 * @param code Code to evaluate.
		 */
		executeJavaScript(code: string): void;
		/**
		 * Executes Edit -> Undo command in page.
		 */
		undo(): void;
		/**
		 * Executes Edit -> Redo command in page.
		 */
		redo(): void;
		/**
		 * Executes Edit -> Cut command in page.
		 */
		cut(): void;
		/**
		 * Executes Edit -> Copy command in page.
		 */
		copy(): void;
		/**
		 * Executes Edit -> Paste command in page.
		 */
		paste(): void;
		/**
		 * Executes Edit -> Delete command in page.
		 */
		delete(): void;
		/**
		 * Executes Edit -> Select All command in page.
		 */
		selectAll(): void;
		/**
		 * Executes Edit -> Unselect command in page.
		 */
		unselect(): void;
		/**
		 * Executes Edit -> Replace command in page.
		 */
		replace(text: string): void;
		/**
		 * Executes Edit -> Replace Misspelling command in page.
		 */
		replaceMisspelling(text: string): void;
		/**
		 * Checks if any serviceworker is registered.
		 */
		hasServiceWorker(callback: (hasServiceWorker: boolean) => void): void;
		/**
		 * Unregisters any serviceworker if present.
		 */
		unregisterServiceWorker(callback:
			/**
			 * @param isFulfilled Whether the JS promise is fulfilled.
			 */
			(isFulfilled: boolean) => void): void;
		/**
		 *
		 * Prints window's web page. When silent is set to false, Electron will pick up system's default printer and default settings for printing.
		 * Calling window.print() in web page is equivalent to call WebContents.print({silent: false, printBackground: false}).
		 * Note:
		 *   On Windows, the print API relies on pdf.dll. If your application doesn't need print feature, you can safely remove pdf.dll in saving binary size.
		 */
		print(options?: {
			/**
			 *  Don't ask user for print settings, defaults to false
			 */
			silent?: boolean;
			/**
			 * Also prints the background color and image of the web page, defaults to false.
			 */
			printBackground: boolean;
		}): void;
		/**
		 * Prints windows' web page as PDF with Chromium's preview printing custom settings.
		 */
		printToPDF(options: {
			/**
			 * Specify the type of margins to use. Default is 0.
			 *   0 - default
			 *   1 - none
			 *   2 - minimum
			 */
			marginsType?: number;
			/**
			 * String - Specify page size of the generated PDF. Default is A4.
			 *   A4
			 *   A3
			 *   Legal
			 *   Letter
			 *   Tabloid
			 */
			pageSize?: string;
			/**
			 * Whether to print CSS backgrounds. Default is false.
			 */
			printBackground?: boolean;
			/**
			 * Whether to print selection only. Default is false.
			 */
			printSelectionOnly?: boolean;
			/**
			 * true for landscape, false for portrait.  Default is false.
			 */
			landscape?: boolean;
		},
		/**
		 * Callback function on completed converting to PDF.
		 *   error Error
		 *   data Buffer - PDF file content
		 */
		callback: (error: Error, data: Buffer) => void): void;

		//---- start v0.34.1 ----//

		/** Add the given path to the developer tools workspace. */
		addWorkSpace(path: string): void;
		/** Remove the given path from the developer tools workspace. */
		removeWorkSpace(path: string): void;
		/**
		 * Opens the developer tools.
		 */
		openDevTools(options?: {
			/**
			 * Opens devtools in a new window.
			 */
			detach?: boolean;
		}): void;
		/**
		 * Closes the developer tools.
		 */
		closeDevTools(): void;
		isDevToolsOpened(): boolean;
		/**
		 * Toggle the developer tools.
		 */
		toggleDevTools(): void;
		isDevToolsFocused(): boolean;
		/** Inspect the element at the given position. */
		inspectElement(x: number, y: number): void;
		/** Open developer tools for the service worker context. */
		inspectServiceWorker(): void;

		//---- end v0.34.1 ----//

		/**
		 * Send args.. to the web page via channel in asynchronous message, the web page
		 * can handle it by listening to the channel event of ipc module.
		 * Note:
		 *   1. The IPC message handler in web pages do not have a event parameter,
		 *      which is different from the handlers on the main process.
		 *   2. There is no way to send synchronous messages from the main process
		 *      to a renderer process, because it would be very easy to cause dead locks.
		 */
		send(channel: string, ...args: any[]): void;
	}

	// current as at v0.35.4
	/**
	 * The Menu class is used to create native menus that can be used as application
	 * menus and context menus. Each menu consists of multiple menu items, and each
	 * menu item can have a submenu.
	 */
	class Menu {
		/**
		 * Creates a new menu.
		 */
		constructor();
		/**
		 * Sets menu as the application menu on OS X. On Windows and Linux, the menu
		 * will be set as each window's top menu.
		 */
		static setApplicationMenu(menu: Menu): void;
		/**
		 * Sends the action to the first responder of application, this is used for
		 * emulating default Cocoa menu behaviors, usually you would just use the
		 * selector property of MenuItem.
		 *
		 * Note: This method is OS X only.
		 */
		static sendActionToFirstResponder(action: string): void;
		/**
		 * @param template Generally, just an array of options for constructing MenuItem.
		 * You can also attach other fields to element of the template, and they will
		 * become properties of the constructed menu items.
		 */
		static buildFromTemplate(template: MenuItemOptions[]): Menu;
		/**
		 * Popups this menu as a context menu in the browserWindow. You can optionally
		 * provide a (x,y) coordinate to place the menu at, otherwise it will be placed
		 * at the current mouse cursor position.
		 * @param x Horizontal coordinate where the menu will be placed.
		 * @param y Vertical coordinate where the menu will be placed.
		 */
		popup(browserWindow: BrowserWindow, x: number, y: number): void;
		popup(browserWindow: BrowserWindow): void;
		/**
		 * Appends the menuItem to the menu.
		 */
		append(menuItem: MenuItem): void;
		/**
		 * Inserts the menuItem to the pos position of the menu.
		 */
		insert(position: number, menuItem: MenuItem): void;
		items: MenuItem[];
	}

	// current as at v0.35.4
	class MenuItem {
		click: (menuItem: MenuItem, browserWindow: BrowserWindow) => void;
		role: MenuItemRole;
		selector: string;
		type: MenuItemType;
		label: string;
		sublabel: string;
		accelerator: string;
		icon: NativeImage | string;
		enabled: boolean;
		visible: boolean;
		checked: boolean;
		submenu: Menu;
		id: string;
		position: string;

		constructor(options?: MenuItemOptions);
	}

	type MenuItemRole = 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'selectall' | 'minimize' |
	  'close' | 'about' | 'hide' | 'hideothers' | 'unhide' | 'front' | 'window' | 'help' | 'services';
	type MenuItemType = 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';

	interface MenuItemOptions {
		/** Callback to invoke when the menu item is clicked. */
		click?: (menuItem: MenuItem, browserWindow: BrowserWindow) => void;
		/**
		 * Defines the action of the menu item, if specified the [[click]] callback will not be invoked.
		 * Note: This option is ignored on OS X.
		 */
		role?: MenuItemRole;
		/**
		 * Call the selector of first responder when clicked (OS X only).
		 */
		selector?: string;
		type?: MenuItemType;
		label?: string;
		sublabel?: string;
		/**
		 * An accelerator is string that represents a keyboard shortcut, it can contain
		 * multiple modifiers and key codes, combined by the + character.
		 *
		 * Examples:
		 *   Command+A
		 *   Ctrl+Shift+Z
		 *
		 * Platform notice: On Linux and Windows, the Command key would not have any effect,
		 * you can use CommandOrControl which represents Command on OS X and Control on
		 * Linux and Windows to define some accelerators.
		 *
		 * Available modifiers:
		 *   Command (or Cmd for short)
		 *   Control (or Ctrl for short)
		 *   CommandOrControl (or CmdOrCtrl for short)
		 *   Alt
		 *   Shift
		 *
		 * Available key codes:
		 *   0 to 9
		 *   A to Z
		 *   F1 to F24
		 *   Punctuations like ~, !, @, #, $, etc.
		 *   Plus
		 *   Space
		 *   Backspace
		 *   Delete
		 *   Insert
		 *   Return (or Enter as alias)
		 *   Up, Down, Left and Right
		 *   Home and End
		 *   PageUp and PageDown
		 *   Escape (or Esc for short)
		 *   VolumeUp, VolumeDown and VolumeMute
		 *   MediaNextTrack, MediaPreviousTrack, MediaStop and MediaPlayPause
		 */
		accelerator?: string;
		/**
		 * In Electron for the APIs that take images, you can pass either file paths
		 * or NativeImage instances. When passing null, an empty image will be used.
		 */
		icon?: NativeImage | string;
		enabled?: boolean;
		visible?: boolean;
		checked?: boolean;
		/**
		 * Should be specified for submenu type menu item, when it's specified the
		 * type: 'submenu' can be omitted for the menu item
		 */
		submenu?: MenuItemOptions[] | Menu;
		/**
		 * Unique within a single menu. If defined then it can be used as a reference
		 * to this item by the position attribute.
		 */
		id?: string;
		/**
		 * This field allows fine-grained definition of the specific location within
		 * a given menu.
		 */
		position?: string;
	}

	// current as at v0.35.4
	/** Objects of this type are returned by `window.open`. */
	interface BrowserWindowProxy {
		/**
		 * Removes focus from the child window.
		 */
		blur(): void;
		/**
		 * Forcefully closes the child window without calling its unload event.
		 */
		close(): void;
		/**
		 * Set to true after the child window gets closed.
		 */
		closed: boolean;
		/**
		 * Evaluates the code in the child window.
		 */
		eval(code: string): void;
		/**
		 * Focuses the child window (brings the window to front).
		 */
		focus(): void;
		/**
		 * Sends a message to the child window with the specified origin or * for no origin preference.
		 * In addition to these methods, the child window implements window.opener object with no
		 * properties and a single method.
		 */
		postMessage(message: string, targetOrigin: string): void;
	}

	// current as at v0.35.4
	/** Controls the application's lifecycle. */
	interface App extends NodeJS.EventEmitter {
		/**
		 * Try to close all windows. The before-quit event will first be emitted.
		 * If all windows are successfully closed, the will-quit event will be emitted
		 * and by default the application would be terminated.
		 *
		 * This method guarantees all beforeunload and unload handlers are correctly
		 * executed. It is possible that a window cancels the quitting by returning
		 * false in beforeunload handler.
		 */
		quit(): void;
		/**
		 * Exits the application immediately with the specified exit code.
		 * All windows will be closed immediately without asking user and the `before-quit` and
		 * `will-quit` events will not be emitted.
		 */
		exit(exitCode: number): void;
		/**
		 * Returns the current application directory.
		 */
		getAppPath(): string;
		/**
		 * Retrieve a path to a special directory or file associated with the given name.
		 * On failure an `Error` will be thrown.
		 * @param name The name of the path to retrieve.
		 * @return The path to a special directory or file associated with name.
		 */
		getPath(name: App.AppPathName): string;
		/**
		 * Overrides the path to a special directory or file associated with name.
		 * If the path specifies a directory that does not exist, the directory will
		 * be created by this method. On failure an `Error` will be thrown.
		 *
		 * By default web pages' cookies and caches will be stored under `userData`
		 * directory, if you want to change this location, you have to override the
		 * `userData` path before the `ready` event of app module gets emitted.
		 */
		setPath(name: App.AppPathName, path: string): void;
		/**
		 * @returns The version of loaded application, if no version is found in
		 * application's package.json, the version of current bundle or executable.
		 */
		getVersion(): string;
		/**
		 * @return The name of the current application, which is the name in the application's
		 *         `package.json` file.
		 */
		getName(): string;
		/** @return The current application locale, e.g. `en-US`. */
		getLocale(): string;
		/**
		 * Adds path to recent documents list (available on Windows and OS X).
		 *
		 * This list is managed by the system, on Windows you can visit the list from
		 * task bar, and on Mac you can visit it from dock menu.
		 */
		addRecentDocument(path: string): void;
		/**
		 * Clears the recent documents list (available on Windows and OS X).
		 */
		clearRecentDocuments(): void;
		/**
		 * Adds tasks to the Tasks category of JumpList on Windows.
		 *
		 * Note: This API is only available on Windows.
		 */
		setUserTasks(tasks: App.Task[]): void;
		allowNTLMCredentialsForAllDomains(allow: boolean): void;
		/**
		 * Ensure that only a single instance of the application is allowed to run.
		 *
		 * @return `false` if the current process is the primary application instance and should
		 *         continue running, and `true` if another instance of the application is already
		 *         running and the current process should exit.
		 */
		makeSingleInstance(callback: (cmdLine: string[], workingDirectory: string) => void): boolean;
		/** Set the Application User Model ID, (only available on Windows). */
		setAppUserModelId(id: string): void;
		commandLine: App.CommandLine;
		/** Only available on OS X. */
		dock: App.Dock;
	}

	// current as at v0.35.4
	namespace App {
		export type AppPathName = 'home' | 'appData' | 'userData' | 'temp' | 'exe' | 'module'
								| 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures'
								| 'videos';

		export interface Task {
			/**
			 * Path of the program to execute, usually you should specify process.execPath
			 * which opens current program.
			 */
			program: string;
			/** The arguments of command line when program is executed. */
			arguments: string;
			/** The string to be displayed in a JumpList. */
			title: string;
			/** Description of this task. */
			description: string;
			/**
			 * The absolute path to an icon to be displayed in a JumpList, it can be
			 * arbitrary resource file that contains an icon, usually you can specify
			 * process.execPath to show the icon of the program.
			 */
			iconPath: string;
			/**
			 * The icon index in the icon file. If an icon file consists of two or more
			 * icons, set this value to identify the icon. If an icon file consists of
			 * one icon, this value is 0.
			 */
			iconIndex: number;
		}

		export interface CommandLine {
			/**
			 * Append a switch with an optional value to Chromium's command line.
			 *
			 * Note: This will not affect process.argv, and is mainly used by developers
			 * to control some low-level Chromium behaviors.
			 */
			appendSwitch(switchName: string, value?: string|number): void;
			/**
			 * Append an argument to Chromium's command line. The argument will quoted properly.
			 *
			 * Note: This will not affect process.argv.
			 */
			appendArgument(value: any): void;
		}

		export type DockBounceType = 'critical' | 'informational';

		/** OS X dock functions. */
		export interface Dock {
			/**
			 * @param type Defaults to `informational`.
			 * @return An ID for the request.
			 */
			bounce(type?: DockBounceType): number;
			cancelBounce(id: number): void;
			setBadge(text: string): void;
			getBadge(): string;
			hide(): void;
			show(): void;
			/** Set the application dock menu. */
			setMenu(menu: Menu): void;
		}
	}

	// current as at v0.35.4
	/** Provides integration with the `Squirrel` auto-updater framework. */
	interface AutoUpdater extends NodeJS.EventEmitter {
		/**
		 * Set the url and initialize the auto updater.
		 * The url cannot be changed once it is set.
		 */
		setFeedURL(url: string): void;
		/**
		 * Ask the server whether there is an update.
		 * Note that [[setFeedURL]] must've be called prior to calling this method.
		 */
		checkForUpdates(): any;
		/**
		 * Restart the app and install the update after it has been downloaded.
		 * This method should only be called after `update-downloaded` has been emitted.
		 */
		quitAndInstall(): void;
	}

	// current as at v0.35.4
	/**
	 * Shows native system dialogs for opening files or alerting.
	 */
	interface Dialog {
		/**
		 * Show a native Open File/Directory dialog.
		 *
		 * @param browserWindow On OS X if this option is set the dialog will be presented as a sheet.
		 * @param callback If supplied, the API call will be asynchronous.
		 * @return An array of file paths chosen by the user (unless [[callback]] was specified),
		 *         and `undefined` if the operation failed (or [[callback]] was specified).
		 */
		showOpenDialog(
			browserWindow?: BrowserWindow,
			options?: Dialog.OpenDialogOptions,
			callback?: (fileNames: string[]) => void
		): string[];
		showOpenDialog(options?: Dialog.OpenDialogOptions, callback?: (fileNames: string[]) => void): string[];
		showOpenDialog(callback?: (fileNames: string[]) => void): string[];
		/**
		 * Show a native Save File dialog.
		 *
		 * @param browserWindow On OS X if this option is set the dialog will be presented as a sheet.
		 * @param options
		 * @param callback If supplied, the API call will be asynchronous.
		 * @return The file path chosen by the user (unless [[callback]] was specified),
		 *         and `undefined` if the operation failed (or [[callback]] was specified).
		 */
		showSaveDialog(browserWindow?: BrowserWindow, options?: {
			title?: string;
			defaultPath?: string;
			/**
			 * File types that can be displayed, see dialog.showOpenDialog for an example.
			 */
			filters?: Dialog.IFilter[];
		}, callback?: (fileName: string) => void): void;
		/**
		 * Show a native message box dialog.
		 *
		 * This function will block until the message box is closed.
		 * @param browserWindow On OS X if this option is set the dialog will be presented as a sheet.
		 * @param callback If supplied, the API call will be asynchronous.
		 * @returns The index of the clicked button.
		 */
		showMessageBox(
			browserWindow?: BrowserWindow,
			options?: Dialog.ShowMessageBoxOptions,
			callback?: (response: number) => void
		): number;
		showMessageBox(
			options: Dialog.ShowMessageBoxOptions,
			callback?: (response: number) => void
		): number;
		/**
		 * Show an error message as a modal dialog.
		 *
		 * This function can be safely called before the `ready` event of the `app` module is emitted,
		 * it is usually used to report errors in early stage of startup.
		 *
		 * NOTE: On Linux if this function is called before the app `ready` event, the message will be
		 * emitted to `stderr`, and no GUI dialog will appear.
		 */
		showErrorBox(title: string, content: string): void;
	}

	// current as at v0.35.4
	namespace Dialog {
		export type OpenDialogProperty = 'openFile' | 'openDirectory' | 'multiSelections' | 'createDirectory';
		export interface IFilter {
			name: string;
			/**
			 * Extensions must be specified without wildcards or dots, e.g. `png` rather than `*.png`.
			 * To show all files this array should contain a single wildcard `*`.
			 */
			extensions: string[];
		}

		export interface OpenDialogOptions {
			title?: string;
			defaultPath?: string;
			/** Filter which file types will be displayed/selected. */
			filters?: IFilter[];
			/** Features that the dialog should use. */
			properties?: OpenDialogProperty[];
		}

		export type MessageBoxType = 'none' | 'info' | 'warning';

		export interface ShowMessageBoxOptions {
			type?: MessageBoxType;
			/** Button titles. */
			buttons?: string[];
			/** Title of the message box (some platforms will not show it). */
			title?: string;
			/** Contents of the message box. */
			message?: string;
			/** Extra information of the message. */
			detail?: string;
			icon?: NativeImage;
			/**
			 * The value that will be returned when the user cancels the dialog instead of clicking the
			 * buttons of the dialog. By default this value will be the index of the buttons that are
			 * labelled "cancel" or "no", or zero if there are no such buttons.
			 */
			cancelId?: number;
			/**
			 * On Windows Electron will try to figure out which of the buttons are common buttons
			 * (e.g. "Cancel" or "Yes"), and show the others as command links in the dialog.
			 * This can make the dialog appear in the style of modern Windows apps, to prevent this
			 * behavior set this option to `true`.
			 */
			noLink?: boolean;
		}
	}

	// current as at v0.35.4
	/**
	 * Represents an icon in the notification area of an operating system,
	 * usually there's also context menu associated with it.
	 */
	class Tray implements NodeJS.EventEmitter {
		addListener(event: string, listener: Function): Tray;
		on(event: string, listener: Function): Tray;
		once(event: string, listener: Function): Tray;
		removeListener(event: string, listener: Function): Tray;
		removeAllListeners(event?: string): Tray;
		setMaxListeners(n: number): void;
		listeners(event: string): Function[];
		emit(event: string, ...args: any[]): boolean;
		/**
		 * Creates a new tray icon associated with the image.
		 */
		constructor(image: NativeImage|string);
		/**
		 * Destroys the tray icon immediately.
		 */
		destroy(): void;
		/**
		 * Sets the image associated with this tray icon.
		 */
		setImage(image: NativeImage|string): void;
		/**
		 * Sets the image associated with this tray icon when pressed.
		 */
		setPressedImage(image: NativeImage): void;
		/**
		 * Sets the hover text for this tray icon.
		 */
		setToolTip(toolTip: string): void;
		/**
		 * Sets the title displayed aside of the tray icon in the status bar.
		 * Note: This is only implemented on OS X.
		 */
		setTitle(title: string): void;
		/**
		 * Sets whether the tray icon is highlighted when it is clicked.
		 * Note: This is only implemented on OS X.
		 */
		setHighlightMode(highlight: boolean): void;
		/**
		 * Displays a tray balloon.
		 * Note: This is only implemented on Windows.
		 */
		displayBalloon(options?: {
			icon?: NativeImage;
			title?: string;
			content?: string;
		}): void;
		/**
		 * Pops up the context menu of the tray icon.
		 * Note: This is only implemented on OS X and Windows.
		 * @param menu If specified this menu will shown instead of the tray's context menu.
		 * @param position Defaults to (0, 0). This option is only supported on Windows.
		 */
		popUpContextMenu(menu?: Menu, position?: IPoint): void;
		/**
		 * Sets the context menu for this icon.
		 */
		setContextMenu(menu: Menu): void;
	}

	/** Performs copy and paste operations. */
	interface Clipboard {
		/**
		 * @returns The contents of the clipboard as plain text.
		 */
		readText(type?: string): string;
		/**
		 * Writes the text into the clipboard as plain text.
		 */
		writeText(text: string, type?: string): void;
		/** @return The contents of the clipboard as markup. */
		readHtml(type?: string): string;
		/** Write markup to the clipboard. */
		writeHtml(markup: string, type?: string): void;
		/**
		 * @returns The contents of the clipboard as a NativeImage.
		 */
		readImage(type?: string): NativeImage;
		/**
		 * Writes the image into the clipboard.
		 */
		writeImage(image: NativeImage, type?: string): void;
		/** Clears the clipboard content. */
		clear(type?: string): void;
		/** @return An array of supported formats for the given clipboard type. */
		availableFormats(type?: string): string[];
		/**
		 * Note: This API is experimental and could be removed in future.
		 * @returns Whether the clipboard has data in the specified format.
		 */
		has(format: string, type?: string): boolean;
		/**
		 * Reads the data in the clipboard of the specified format.
		 * Note: This API is experimental and could be removed in future.
		 */
		read(format: string, type?: string): any;
		/** Write data to the clipboard. */
		write(data: { text?: string, html?: string, image?: NativeImage }, type?: string): void;
	}

	interface CrashReporterStartOptions {
		/**
		* Default: Electron
		*/
		productName?: string;
		/**
		* Default: GitHub, Inc.
		*/
		companyName?: string;
		/**
		* URL that crash reports would be sent to as POST.
		* Default: http://54.249.141.255:1127/post
		*/
		submitUrl?: string;
		/**
		* Send the crash report without user interaction.
		* Default: true.
		*/
		autoSubmit?: boolean;
		/**
		* Default: false.
		*/
		ignoreSystemCrashHandler?: boolean;
		/**
		* An object you can define which content will be send along with the report.
		* Only string properties are send correctly.
		* Nested objects are not supported.
		*/
		extra?: {}
	}

	interface CrashReporterPayload extends Object {
		/**
		* E.g., "electron-crash-service".
		*/
		rept: string;
		/**
		* The version of Electron.
		*/
		ver: string;
		/**
		* E.g., "win32".
		*/
		platform: string;
		/**
		* E.g., "renderer".
		*/
		process_type: string;
		ptime: number;
		/** e.g. '5e1286fc-da97-479e-918b-6bfb0c3d1c72' */
		guid: string;
		/**
		* The version in package.json.
		*/
		_version: string;
		/**
		* The product name in the crashReporter options object.
		*/
		_productName: string;
		/**
		* Name of the underlying product. In this case, Electron.
		*/
		prod: string;
		/**
		* The company name in the crashReporter options object.
		*/
		_companyName: string;
		/**
		* The crashreporter as a file.
		*/
		upload_file_minidump: File;
	}

	/** Sends crash reports. */
	interface CrashReporter {
		start(options?: CrashReporterStartOptions): void;
		/**
		 * @returns The date and ID of the last crash report. When there was no crash report
		 * sent or the crash reporter is not started, null will be returned.
		 */
		getLastCrashReport(): CrashReporterPayload;
		/** @return All uploaded crash reports. Each report contains the date and uploaded ID. */
		getUploadedReports(): CrashReporterPayload[];
	}

	/** Provides desktop integration. */
	interface Shell {
		/**
		 * Show the given file in a file manager. If possible, select the file.
		 */
		showItemInFolder(fullPath: string): void;
		/**
		 * Open the given file in the desktop's default manner.
		 */
		openItem(fullPath: string): void;
		/**
		 * Open the given external protocol URL in the desktop's default manner
		 * (e.g., mailto: URLs in the default mail user agent).
		 */
		openExternal(url: string): void;
		/**
		 * Move the given file to trash and returns boolean status for the operation.
		 */
		moveItemToTrash(fullPath: string): void;
		/**
		 * Play the beep sound.
		 */
		beep(): void;
	}

	/**
	 * Collects tracing data generated by the underlying Chromium content module.
	 */
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

	// current as at v0.35.4
	interface IMainIPCEvent {
		/** The value to return from `ipcRenderer.sendSync()`. */
		returnValue: any;
		/** [[WebContents]] instance that emitted the event. */
		sender: WebContents;
	}

	// current as at v0.35.4
	/**
	 * Receives asynchronous and synchronous messages sent by a renderer process (web page).
	 */
	interface MainIPC extends NodeJS.EventEmitter {
		/**
		 * Add a callback to invoke when an event is emitted by a renderer process.
		 *
		 * To send an asynchronous reply back to the renderer process that emitted the event use
		 * `event.sender.send()` in the [[callback]].
		 *
		 * To send a synchronous reply back to the render process that emitted the event set
		 * `event.returnValue` in the [[callback]].
		 *
		 * @param channel Event name.
		 */
		on(channel: string, callback: (event: IMainIPCEvent, ...args: any[]) => void): this;
		/** Like [[on]], but the callback is automatically removed after its first invocation. */
		once(channel: string, callback: (event: IMainIPCEvent, ...args: any[]) => void): this;
	}

	interface IRendererIPCEvent {
		sender: RendererIPC;
	}

	// current as at v0.35.4
	/**
	 * Sends synchronous and asynchronous messages to the main process, and receives replies from it.
	 */
	interface RendererIPC extends NodeJS.EventEmitter {
		/**
		 * Add a callback to invoke when an event is emitted by the main process.
		 *
		 * @channel Event name.
		 */
		on(channel: string, callback: (event: IRendererIPCEvent, ...args: any[]) => void): this;
		/** Like [[on]], but the callback is automatically removed after its first invocation. */
		once(channel: string, callback: (event: IRendererIPCEvent, ...args: any[]) => void): this;
		/**
		 * Asynchronously send an event to the main process.
		 *
		 * @param channel Event name.
		 * @param args Arbitrary list of arguments to send with the event.
		 */
		send(channel: string, ...args: any[]): void;
		/**
		 * Synchronously send an event to the main process.
		 *
		 * @param channel Event name.
		 * @param args Arbitrary list of arguments to send with the event.
		 * @return The result from the main process.
		 */
		sendSync(channel: string, ...args: any[]): any;
		/**
		 * Asynchronously send an event to the <webview> element in the host page.
		 * @param channel Event name.
		 * @param args Arbitrary list of arguments to send with the event.
		 */
		sendToHost(channel: string, ...args: any[]): void;
	}

	// current as at v0.35.4
	/**
	 * Provides a simple way to do inter-process communication (IPC) between the renderer process
	 * (web page) and the main process.
	 */
	interface Remote {
		// These are the modules that run in the main process
		app: App;
		autoUpdater: AutoUpdater;
		BrowserWindow: typeof BrowserWindow;
		contentTracing: ContentTracing;
		dialog: Dialog;
		globalShortcut: GlobalShortcut;
		ipcMain: NodeJS.EventEmitter;
		Menu: Menu;
		MenuItem: MenuItem;
		powerMonitor: NodeJS.EventEmitter;
		powerSaveBlocker: any;
		protocol: Protocol;
		session: any;
		webContents: WebContents;
		Tray: typeof Tray;

		/**
		 * @returns The object returned by require(module) in the main process.
		 */
		require(module: string): any;
		/**
		 * @returns The BrowserWindow object which this web page belongs to.
		 */
		getCurrentWindow(): BrowserWindow;
		/** @return The WebContents object of the current web page. */
		getCurrentWebContents(): WebContents;
		/**
		 * @returns The global variable of name (e.g. global[name]) in the main process.
		 */
		getGlobal(name: string): any;
		/**
		 * Returns the process object in the main process. This is the same as
		 * remote.getGlobal('process'), but gets cached.
		 */
		process: any;
	}

	interface WebFrame {
		/**
		 * Changes the zoom factor to the specified factor, zoom factor is
		 * zoom percent / 100, so 300% = 3.0.
		 */
		setZoomFactor(factor: number): void;
		/**
		 * @returns The current zoom factor.
		 */
		getZoomFactor(): number;
		/**
		 * Changes the zoom level to the specified level, 0 is "original size", and each
		 * increment above or below represents zooming 20% larger or smaller to default
		 * limits of 300% and 50% of original size, respectively.
		 */
		setZoomLevel(level: number): void;
		/**
		 * @returns The current zoom level.
		 */
		getZoomLevel(): number;
		/**
		 * Sets a provider for spell checking in input fields and text areas.
		 */
		setSpellCheckProvider(language: string, autoCorrectWord: boolean, provider: {
			/**
			 * @returns Whether the word passed is correctly spelled.
			 */
			spellCheck: (text: string) => boolean;
		}): void;
		/**
		 * Sets the scheme as secure scheme. Secure schemes do not trigger mixed content
		 * warnings. For example, https and data are secure schemes because they cannot be
		 * corrupted by active network attackers.
		 */
		registerUrlSchemeAsSecure(scheme: string): void;
	}

	interface Electron {
		clipboard: Clipboard;
		crashReporter: CrashReporter;
		nativeImage: typeof NativeImage;
		screen: Screen;
		shell: Shell;
	}
}

declare module 'electron' {
	var electron: GitHubElectron.Electron;
	export = electron;
}

interface Window {
	/**
	 * Creates a new window.
	 * @returns An instance of BrowserWindowProxy class.
	 */
	open(url: string, frameName?: string, features?: string): GitHubElectron.BrowserWindowProxy;
}

interface File {
	/**
	 * Exposes the real path of the filesystem.
	 */
	path: string;
}

interface NodeRequireFunction {
	(id: 'electron'): GitHubElectron.Electron;
}
