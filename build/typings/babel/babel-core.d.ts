// Type definitions for babel-core v6.3.26
// Project: https://github.com/babel/babel/
// Definitions by: Vadim Macagon <https://github.com/enlight/>

declare module 'babel-core' {
  interface IOptions {
    /** Filename for use in errors etc. */
    filename?: string;
    /** Filename relative to [[sourceRoot]], defaults to [[filename]]. */
    filenameRelative?: string;
    /** List of presets (a set of plugins) to load and use, defaults to `[]`. */
    presets?: string[];
    /** List of plugins to load and use. */
    plugins?: string[];
    /** ANSI highlight syntax error code frames, defaults to `true`. */
    highlightCode?: boolean;
    /**
     * A glob, regex, or mixed array of both, matching paths to compile. Can also be an array
     * of arrays containing paths to explicitly match. When attempting to compile a non-matching
     * file it's returned verbatim.
     */
    only?: string | RegExp | Array<string> | Array<RegExp> | Array<string | RegExp>;
    /** Works opposite to the [[only]] option. */
    ignore?: string | RegExp | Array<string> | Array<RegExp> | Array<string | RegExp>;
    /** Comment to insert into compiled code before all non-user injected code. */
    auxiliaryCommentBefore?: string;
    /** Comment to insert into compiled code after all non-user injected code. */
    auxiliaryCommentAfter?: string;
    /**
     * If truthy, adds a map property to returned output, defaults to `false`.
     * If set to `inline`, a comment with a `sourceMappingURL` directive is
     * added to the bottom of the returned code. If set to `both` then a map
     * property is returned as well as a source map comment appended.
     */
    sourceMaps?: boolean | 'inline' | 'both';
    /**
     * A source map object that the output source map will be based on.
     */
    inputSourceMap?: any;
    /** Set file on returned source map, defaults to [[filenameRelative]]. */
    sourceMapTarget?: string;
    /** Set sources[0] on returned source map, defaults to [[filenameRelative]]. */
    sourceFileName?: string;
    /** The root from which all sources are relative, defaults to [[moduleRoot]]. */
    sourceRoot?: string;
    /**
     * Prefix for the AMD module formatter that will be prepend to the filename on module definitions,
     * defaults to [[sourceRoot]].
     */
    moduleRoot?: string;
    /**
     * If truthy, insert an explicit id for modules. By default, all modules are anonymous.
     * (Not available for CommonJS modules).
     */
    moduleIds?: boolean;
    /** Specify a custom name for module ids. */
    moduleId?: string;
    /** Specify a custom callback to generate a module id with. */
    getModuleId?: (moduleName: string) => string;
    /** Resolve a module source i.e. `import "SOURCE";` to a custom value. */
    resolveModuleSource?: (source: string, filename: string) => string;
    /** Enable code generation, defaults to `true`. */
    code?: boolean;
    /** Specify whether or not to use `.babelrc` and `.babelignore` files, defaults to `true`. */
    babelrc?: boolean;
    /** Include the AST in the returned object, defaults to `true`. */
    ast?: boolean;
    /**
     * Set to exclude superfluous whitespace characters and line terminators, defaults to `auto`.
     * When set to `auto` compact is set to true on input sizes of >100KB.
     */
    compact?: boolean | 'auto';
    /** Output comments in generated output, defaults to `true`. */
    comments?: boolean;
    /**
     * Callback that controls whether a comment should be output or not.
     * NOTE: If set this option overrides the [[comments]] option.
     */
    shouldPrintComment?: (commentContents: string) => boolean;
    /**
     * This is an object of keys that represent different environments.
     * For example, you may have `{ env: { production: { sourceRoot: 'blah' } } }`, in which case
     * Babel will use those options when the enviroment variable `BABEL_ENV` is set to `production`.
     * If `BABEL_ENV` isn't set then `NODE_ENV` will be used, if it's not set then it defaults to
     * `development`.
     */
    env?: any;
    /**
     * Retain line numbers, defaults to `false`.
     * This will lead to wacky code but is handy for scenarios where you can't use source maps.
     * NOTE: This will obviously not retain the columns.
     */
    retainLines?: boolean;
    /** Path to an `.babelrc` file to extend. */
    extends?: string;
  }

  interface IResult {
    /** The generated code. */
    code: string;
    /** The source map. */
    map?: any;
    /** The AST. */
    ast?: any;
  }

  function transform(code: string, options: IOptions): IResult;
  function transformFile(filename: string, options: IOptions, callback: (err: Error, result: IResult) => void): void;
  function transformFileSync(filename: string, options: IOptions): IResult;
}
