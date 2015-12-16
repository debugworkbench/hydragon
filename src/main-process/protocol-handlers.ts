// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as ProtocolModule from 'protocol';
import * as url from 'url';
import * as path from 'path';
import UriPathResolver from '../common/uri-path-resolver';

type URLRequest = GitHubElectron.URLRequest;
type FileProtocolHandlerCallback = GitHubElectron.FileProtocolHandlerCallback;

/**
 * Resolves URLs with the `app://` scheme to file paths.
 *
 * The `app` protocol is used to retrieve files from the application's root directory.
 */
export class AppProtocolHandler {
  static scheme = 'app';

  constructor(private uriPathResolver: UriPathResolver) {
    // NOTE: The protocol module is lazy loaded because it can only be loaded after Electron
    // has emitted the app.ready event, and using TypeScript's standard top-level imports
    // makes it very easy to violate this requirement.
    const protocol: typeof ProtocolModule = require('protocol');
    protocol.registerFileProtocol(
      AppProtocolHandler.scheme,
      (request, callback) => callback(this.uriPathResolver.resolve(request.url)),
      (error: string) => {
        if (error) {
          console.log(error);
        } else {
          protocol.registerStandardSchemes([AppProtocolHandler.scheme]);
        }
      }
    );
  }
}
