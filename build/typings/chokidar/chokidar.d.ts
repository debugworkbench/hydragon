// Type definitions for chokidar 1.4.1
// Project: https://github.com/paulmillr/chokidar
// Definitions by: Stefan Steinhart <https://github.com/reppners/>, Vadim Macagon <https://github.com/enlight/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node/node.d.ts" />

declare module "fs"
{
    import * as fs from "fs";

    /** Keys are directories being watched, values are array of paths within a directory. */
    interface IWatchList {
        [directory: string]: string[];
    }

    interface FSWatcher
    {
        add(fileDirOrGlob:string):void;
        add(filesDirsOrGlobs:Array<string>):void;
        unwatch(fileDirOrGlob:string):void;
        unwatch(filesDirsOrGlobs:Array<string>):void;
        getWatched(): IWatchList;
        on(event: 'add', listener: (path: string, stats: fs.Stats) => void): FSWatcher;
        once(event: 'add', listener: (path: string, stats: fs.Stats) => void): FSWatcher;
        on(event: 'change', listener: (path: string, stats: fs.Stats) => void): FSWatcher;
        once(event: 'change', listener: (path: string, stats: fs.Stats) => void): FSWatcher;
        on(event: 'unlink', listener: (path: string) => void): FSWatcher;
        once(event: 'unlink', listener: (path: string) => void): FSWatcher;
        on(event: 'addDir', listener: (path: string, stats: fs.Stats) => void): FSWatcher;
        once(event: 'addDir', listener: (path: string, stats: fs.Stats) => void): FSWatcher;
        on(event: 'unlinkDir', listener: (path: string) => void): FSWatcher;
        once(event: 'unlinkDir', listener: (path: string) => void): FSWatcher;
        on(event: 'error', listener: (err: Error) => void): FSWatcher;
        once(event: 'error', listener: (err: Error) => void): FSWatcher;
        on(event: 'ready', listener: () => void): FSWatcher;
        once(event: 'ready', listener: () => void): FSWatcher;
        on(event: 'raw', listener: (event: string, path: string, details: any) => void): FSWatcher;
        once(event: 'raw', listener: (event: string, path: string, details: any) => void): FSWatcher;
        on(event: 'all', listener: (event: string, path: string, stats: fs.Stats) => void): FSWatcher;
        once(event: 'all', listener: (event: string, path: string, stats: fs.Stats) => void): FSWatcher;
        on(event: string, listener: Function): FSWatcher;
        once(event: string, listener: Function): FSWatcher;
    }
}

declare module "chokidar"
{
    import * as fs from "fs";

    interface WatchOptions
    {
        persistent?:boolean;
        ignored?: (filePath: string, stats?: fs.Stats) => boolean;
        ignoreInitial?:boolean;
        followSymlinks?:boolean;
        cwd?:string;
        usePolling?:boolean;
        useFsEvents?:boolean;
        alwaysStat?:boolean;
        depth?:number;
        interval?:number;
        binaryInterval?:number;
        ignorePermissionErrors?:boolean;
        atomic?:boolean;
    }

    function watch( fileDirOrGlob:string, options?:WatchOptions ):fs.FSWatcher;
    function watch( filesDirsOrGlobs:Array<string>, options?:WatchOptions ):fs.FSWatcher;
}
