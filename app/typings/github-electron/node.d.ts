// Type definitions for NodeJS extensions in Electron 0.34.1
// Project: http://electron.atom.io/
// Definitions by: Vadim Macagon <https://github.com/enlight>

declare namespace NodeJS {
    export interface ProcessVersions {
        electron: string;
        chrome: string;
    }

    export interface Process {
        /**
         * Read-only property that can be used to determine the kind of process this is,
         * the value of this property will be `browser` for the main process, and `renderer`
         * for a renderer process.
         */
        type: string;
        /** Path to the Electron resources directory which contains JavaScript/ASAR files. */
        resourcesPath: string;
        /** Read-only property that will be `true` only for Mac App Store builds. */
        mas?: boolean;

        /** Hang the main thread of the current process. */
        hang(): void;
        /**
         * Set the file descriptor soft or hard limit, whichever is lower for the current process.
         * This method is only implemented on Linux and OS X.
         */
        setFdLimit(maxDescriptors: number): void;
    }
}
