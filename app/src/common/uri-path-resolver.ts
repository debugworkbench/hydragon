// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as url from 'url';
import * as path from 'path';

/**
 * Resolves application URIs to absolute file system paths.
 */
export default class UriPathResolver {
  constructor(private rootPath: string) {
  }

  /**
   * Resolve a URI to an absolute path on disk.
   *
   * @return The absolute path that corresponds to the given URI.
   */
  resolve(uri: string): string {
    let { protocol, hostname, pathname } = url.parse(uri, false);
    if (protocol === 'file:' || protocol === 'app:') {
      if (pathname && (pathname.length > 0) && (pathname[0] === '/')) {
        pathname = pathname.slice(1);
      }
    } else {
      throw new Error(`Scheme '${protocol} is not supported.`);
    }
    // the hostname if present is actually the first component of the path because
    // the file: and app: schemes are only used for local files
    if (hostname) {
      pathname = path.join(hostname, pathname);
    }
    return path.join(this.rootPath, pathname);
  }
}
