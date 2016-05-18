// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// TypeScript type definitions for `preprocess` v3.1.0 (https://github.com/jsoverson/preprocess)

declare module 'preprocess' {
  /**
   * Preprocess a string.
   *
   * @param source The string to preprocess.
   * @param context The context that contains the variables that are used in the source, defaults to
   *                `process.env`.
   * @return The preprocessed source.
   */
  export function preprocess(
    source: string, context?: any, options?: preprocess.IOptions
  ): string;

  export namespace preprocess {
    interface IOptions {
      /**
       * When using @include variants and @extend, preprocess will by default throw an exception in
       * case an included file can't be found. Set this option to `true` to instruct preprocess to
       * fail silently and instead of throwing to write a message inside of the preprocessed file
       * that an included file could not be found.
       * Defaults to `false`.
       */
      fileNotFoundSilentFail?: boolean;
      /**
       * The directory where to look for files included via @include variants and @extend.
       * Defaults to `process.cwd()`.
       */
      srcDir?: string;
      /**
       * The end of line (EOL) character to use for the preprocessed result.
       * Defaults to EOL of source string or `os.EOL` if source string contains multiple different
       * or no EOLs.
       */
      srcEol?: string;
      /**
       * The syntax type of source string to preprocess, defaults to `html`.
       * There are 3 main syntax variants:
       * - html, aliases: xml
       * - js, aliases: javascript, jsx, c, cc, cpp, cs, csharp, java, less, sass, scss, css, php,
       *   ts, tsx, peg, pegjs, jade, styl
       * - coffee, aliases: bash, shell, sh
       */
      type?: string;
    }
  }

  /**
   * Preprocess a file and write the result to disk asynchronously.
   *
   * This function uses `fs.readFile()` and `fs.writeFile()` to read/write the files.
   *
   * @param srcFile The path to the source file to preprocess.
   * @param destFile The path to the destination file where the preprocessed result shall be saved.
   * @param context See `context` parameter description of `preprocess()` function.
   * @param callback Function to be called upon error or completion, receives an error if something
   *                 goes wrong.
   * @param options The default `srcDir` value is set to the path of the provided source file instead
   *                of `process.cwd()`, and the default `type` is derived from source file extension.
   */
  export function preprocessFile(
    srcFile: string, destFile: string, context: any, callback?: (e?: Error) => void,
    options?: preprocess.IOptions
  ): void;

  /**
   * Preprocess a file and write the result to disk synchronously.
   *
   * This function uses `fs.readFileSync()` and `fs.writeFileSync()` to read/write the files.
   *
   * @param srcFile The path to the source file to preprocess.
   * @param destFile The path to the destination file where the preprocessed result shall be saved.
   * @param context See `context` parameter description of `preprocess()` function.
   * @param options The default `srcDir` value is set to the path of the provided source file instead
   *                of `process.cwd()`, and the default `type` is derived from source file extension.
   */
  export function preprocessFileSync(
    srcFile: string, destFile: string, context: any, options?: preprocess.IOptions
  ): void;
}
