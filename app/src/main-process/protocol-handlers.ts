// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as electron from 'electron';
import * as url from 'url';
import * as path from 'path';
import UriPathResolver from '../common/uri-path-resolver';

/**
 * Resolves URLs with the `app://` scheme to file paths.
 *
 * The `app` protocol is used to retrieve files from the application's root directory.
 */
export class AppProtocolHandler {
  static scheme = 'app';

  constructor(private uriPathResolver: UriPathResolver) {
    const protocol = electron.protocol;
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
