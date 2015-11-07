// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as ProtocolModule from 'protocol';
import * as url from 'url';
import * as path from 'path';

type URLRequest = GitHubElectron.URLRequest;
type FileProtocolHandlerCallback = GitHubElectron.FileProtocolHandlerCallback;

/**
 * Resolves URLs with the `app://` scheme to file paths.
 *
 * The `app` protocol is used to retrieve files from the application's root directory.
 */
export class AppProtocolHandler {
  static scheme = 'app';

  constructor(private rootPath: string) {
    // NOTE: The protocol module is lazy loaded because it can only be loaded after Electron
    // has emitted the app.ready event, and using TypeScript's standard top-level imports
    // makes it very easy to violate this requirement.
    const protocol: typeof ProtocolModule = require('protocol');
    protocol.registerFileProtocol(AppProtocolHandler.scheme, this.resolve.bind(this), (error: string) => {
      if (error) {
        console.log(error);
      } else {
        protocol.registerStandardSchemes([AppProtocolHandler.scheme]);
      }
    });
  }

  resolve(request: URLRequest, callback: FileProtocolHandlerCallback): void {
    // strip 'scheme://' from the URL leaving just the path
    const relativePath = request.url.substr(AppProtocolHandler.scheme.length + 3);
    const filePath = path.join(this.rootPath, relativePath);
    callback(filePath);
  }
}
