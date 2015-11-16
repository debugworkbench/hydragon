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
 * Creates new instances of custom elements.
 *
 * Elements can be added to the factory in two ways. Directly, by specifying a path to the
 * element's main `.html` file (@see [[addElementPath]]). Or, indirectly, by being
 * referenced in an HTML import. Either way, the element is registered with the document
 * by the `register-element` custom element, and the element constructor is stored in the
 * factory.
 */
export class ElementFactory {
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
   * @param relativePath The path to the element's `.html` file relative to the
   *                     `debug-workbench-core-components` package directory. If omitted this
   *                      path will be deduced from the [[tagName]].
   */
  addElementPath(tagName: string, relativePath?: string): void {
    this.elements.set(tagName, { documentPath: this.resolvePath(tagName, relativePath) });
  }

  setElementConstructor(tagName: string, elementConstructor: Function): void {
    const elementEntry = this.elements.get(tagName);
    if (elementEntry) {
      elementEntry.elementConstructor = elementConstructor;
    } else {
      this.elements.set(tagName, { elementConstructor });
    }
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

  /**
   * Create a new instance of a custom element.
   *
   * If the element hasn't been imported yet it will be automatically imported.
   * @param tagName The name of a known custom element.
   * @return A promise that will be resolved with a new custom element instance.
   */
  async createElement<T extends HTMLElement>(tagName: string, ...args: any[]): Promise<T> {
    let element = this.createElementSync.apply(this, arguments);
    if (element === null) {
      const elementConstructor = await this.importElement(tagName);
      element = new (Function.prototype.bind.apply(elementConstructor, [null].concat(args)));
    }
    return element;
  }

  createElementSync<T extends HTMLElement>(tagName: string, ...args: any[]): T {
    let element: T = null;
    const elementConstructor = this.elements.get(tagName).elementConstructor;
    if (elementConstructor) {
      // invoke the constructor with the given args
      // TODO: in ES6 this can be simplified to Reflect.construct(elementConstructor, args),
      //       but have to wait for Chrome and Electron to support it.
      element = new (Function.prototype.bind.apply(elementConstructor, [null].concat(args)));
    }
    return element;
  }

  createCoreElement(tagName: string, ...args: any[]): Promise<HTMLElement> {
    return this.createElement('debug-workbench-' + tagName, args);
  }
}
