// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

declare module 'walkdir' {
  interface IOptions {
    /** Defaults to `false`. */
    follow_symlinks?: boolean,
    /** Defaults to `false`. */
    no_recurse?: boolean,
    /** Defaults to `undefined`. */
    max_depth?: number
  }

  interface ISyncOptions extends IOptions {
    /**
     * If `true` the sync return will be in `{ path: stat }` format instead of `[path, path, ...]`,
     * defaults to `false`.
     */
    return_object?: boolean,
    /**
     * If `true` then `null` will be returned and no array or object will be created with found
     * paths, useful for large listings.
     */
    no_return?: boolean
  }

  type PathCallback = (path: string, stat: any) => void;
  type SyncReturnType = { [path: string]: any } | string[];

  import { EventEmitter } from 'events';

  function walkdir(path: string, options: IOptions, callback: PathCallback): EventEmitter;
  function walkdir(path: string, options: IOptions): EventEmitter;
  function walkdir(path: string, callback: PathCallback): EventEmitter;
  function walkdir(path: string): EventEmitter;

  namespace walkdir {
    function sync(path: string, options: ISyncOptions, callback: PathCallback): SyncReturnType;
    function sync(path: string, options: ISyncOptions): SyncReturnType;
    function sync(path: string, callback: PathCallback): SyncReturnType;
    function sync(path: string): SyncReturnType;
  }

  export = walkdir;
}
