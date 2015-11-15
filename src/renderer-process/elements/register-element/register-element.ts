// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import * as url from 'url';
import * as path from 'path';
import { RendererContext } from '../../renderer-context';

// TODO: Consider eliminating the dependency on Polymer, this element is very simple and doesn't
//       really need any of the features Polymer provides.

function base(element: RegisterElementElement): polymer.Base {
  return <any> element;
}

/** Custom element that loads and registers a custom element from a CommonJS module. */
@pd.is('register-element')
export class RegisterElementElement {
  /** The returned object will only be valid after the element has been upgraded to a custom element. */
  get base(): polymer.Base {
    return <any> this;
  }

  @pd.property({ type: String })
  path: string;

  ready(): void {
    if (this.path) {
      // get the absolute path of the document this tag was found in
      let { protocol, hostname, pathname } = url.parse(base(this).root.baseURI);
      if (pathname && (pathname.length > 0) && (pathname[0] === '/')) {
        if ((protocol === 'file:') || (protocol === 'app:')) {
          pathname = pathname.slice(1);
        }
      }
      // the hostname if present is actually the first component of the path because the app:
      // scheme is only used for local files
      if (hostname) {
        pathname = path.posix.join(hostname, pathname);
      }
      // if the script path is relative to the document path (should generally be the case)
      // make it absolute
      const scriptPath =
        path.isAbsolute(this.path) ? this.path : path.resolve(path.dirname(pathname), this.path);

      const elementConstructor = require(scriptPath).register();
      RendererContext.get().elementFactory.setElementConstructor(
        elementConstructor.prototype.is, elementConstructor
      );
    }
  }
}

export function register(): typeof RegisterElementElement {
  return Polymer<typeof RegisterElementElement>(RegisterElementElement.prototype);
}
