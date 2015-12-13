// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import { register as registerRegisterElement } from './register-element/register-element';
import { importHref } from '../utils';

interface IElementMapEntry {
  /** Absolute path to the element's main .html file. */
  documentPath?: string;
  /** Element constructor (for Polymer-based elements this is the function returned by `Polymer()`). */
  elementConstructor?: Function;
}

/**
 * Imports and registers custom elements.
 *
 * Elements can be added to the registry in two ways. Directly, by specifying a path to the
 * element's main `.html` file (@see [[addElementPath]]). Or, indirectly, by being
 * referenced in an HTML import. Either way, the element is registered with the document
 * by the `register-element` custom element, and the element constructor is stored in the
 * factory.
 */
export default class ElementRegistry {
  private elements = new Map</* tagName: */string, IElementMapEntry>();

  /**
   * Initialize the factory.
   *
   * All registered custom elements will be imported.
   * @return A promise that will be resolved when initialization completes.
   */
  async initialize(): Promise<void> {
    await importHref(this.resolvePath('register-element'));
    registerRegisterElement();
    await this._importAllElements();
  }

  private async _importAllElements(): Promise<any[]> {
    const promises: Promise<any>[] = [];
    for (const elementTag of this.elements.keys()) {
      promises.push(this.importElement(elementTag));
    }
    return Promise.all(promises);
  }

  resolvePath(tagName: string, relativePath?: string): string {
    if (relativePath) {
      return 'app://' + path.posix.normalize(relativePath);
    } else {
      return `app://lib/renderer-process/elements/${tagName}/${tagName}.html`;
    }
  }

  /**
   * Set the path to an element's main `.html` file.
   *
   * @param tagName The name under which the custom element will be registered with the document.
   * @param relativePath TODO
   */
  addElementPath(tagName: string, relativePath?: string): void {
    if (!this.elements.has(tagName)) {
      this.elements.set(tagName, { documentPath: this.resolvePath(tagName, relativePath) });
    } else {
      throw new Error(`The path for element <${tagName}> has already been specified.`);
    }
  }

  setElementConstructor(tagName: string, elementConstructor: Function): void {
    const elementEntry = this.elements.get(tagName);
    if (elementEntry) {
      elementEntry.elementConstructor = elementConstructor;
    } else {
      this.elements.set(tagName, { elementConstructor });
    }
  }

  getElementConstructor(tagName: string): Function {
    return this.elements.get(tagName).elementConstructor;
  }

  /**
   * Import a custom element from a previously specified location.
   *
   * @param tagName The name of known custom element previously added to the factory via
   *                [[addElementPath]].
   * @return A promise that will be resolved with a custom element constructor function.
   */
  importElement(tagName: string): Promise<Function> {
    return Promise.resolve().then(() => {
      const elementEntry = this.elements.get(tagName);
      if (!elementEntry) {
        throw new Error(`Can't import <${tagName}> element because no path was specified.`);
      } else {
        return importHref(elementEntry.documentPath).then(() => {
          // note: the <register-element> in the imported document will add the element constructor
          // to this.elements
          return this.elements.get(tagName).elementConstructor;
        });
      }
    });
  }
}
