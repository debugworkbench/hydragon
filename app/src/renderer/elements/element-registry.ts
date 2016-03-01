// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as fs from 'fs-promisified';
import { importHref } from '../utils';
import UriPathResolver from '../../common/uri-path-resolver';

export interface IElementBundleEntry {
  /** The name the element will be registered under. */
  tag: string;
  /** Path to the .html file containing the element template, relative to the bundle's `baseUri`. */
  template: string;
  /**
   * Path to the .js file containing the element template (extension should generally be omitted),
   * relative to the bundle's `baseUri`.
   */
  script: string;
}

export interface IElementBundle {
  baseUri: string;
  elements: IElementBundleEntry[];
}

export interface IElementManifest {
  bundles: IElementBundle[];
}

/** Loads an element manifest from disk. */
export class ElementManifestLoader {
  constructor(private uriPathResolver: UriPathResolver) {
  }

  async loadFromUri(uri: string): Promise<IElementManifest> {
    const fileContents = await fs.readFile(this.uriPathResolver.resolve(uri), 'utf8');
    return JSON.parse(fileContents);
  }
}

function importElementPrototype(basePath: string, entry: IElementBundleEntry): Object {
  const modulePath = path.join(basePath, entry.script);
  const elementClass = require(modulePath).default;
  // sanity check
  if (elementClass.prototype.is !== entry.tag) {
    throw new Error(
      `Tag <${entry.tag}> doesn't match the value of the element 'is' property in '${modulePath}'!`
    );
  }
  return elementClass.prototype;
}

/**
 * Imports and registers custom elements.
 *
 * NOTE: In order to be compatible with the registry an element class must be the default export
 *       of the script/module it's implemented in.
 */
export default class ElementRegistry {
  private _elements = new Map</* tagName: */string, /* constructor: */Function>();

  constructor(private uriPathResolver: UriPathResolver, private manifestLoader: ElementManifestLoader) {
  }

  /**
   * Import and register all the elements in the given bundle.
   *
   * @return A promise that will be resolved when all elements in the bundle are registered.
   */
  importBundle(bundle: IElementBundle): Promise<void> {
    const basePath = this.uriPathResolver.resolve(bundle.baseUri);
    const promises: Promise<any>[] = [];
    for (const entry of bundle.elements) {
      const promise = Promise.resolve()
      .then(() => importHref(path.join(basePath, entry.template)))
      .then(() => {
        const elementConstructor = Polymer<any>(importElementPrototype(basePath, entry));
        this._elements.set(entry.tag, elementConstructor);
      });
      promises.push(promise);
    }
    return Promise.all(promises).then(() => Promise.resolve());
  }

  /**
   * Import and register all the elements in the given manifest.
   *
   * @return A promise that will be resolved when all elements in the manifest are registered.
   */
  importManifest(manifest: IElementManifest): Promise<void> {
    const promises = manifest.bundles.map(bundle => this.importBundle(bundle));
    return Promise.all(promises).then(() => Promise.resolve());
  }

  /**
   * Import and register all the elements in the given manifest file.
   *
   * @return A promise that will be resolved when all elements in the manifest are registered.
   */
  importManifestFromUri(uri: string): Promise<void> {
    return this.manifestLoader.loadFromUri(uri)
    .then(manifest => this.importManifest(manifest));
  }

  /**
   * Find the constructor for the given element.
   *
   * @param tagName The name the element was registered under.
   * @return A constructor that can be used to create a new instance of the element identified
   *         by [[tagName]].
   */
  getElementConstructor(tagName: string): Function {
    return this._elements.get(tagName);
  }
}
