import * as fs from 'fs';

export type Stats = fs.Stats;

export type StringEncoding = 'ascii' | 'utf8' | 'utf16le' | 'ucs2' | 'base64' | 'hex';

export function readdir(path: string): Promise<Array<string>>;
export function stat(path: string): Promise<Stats>;
/**
 * Asynchronously read the entire contents of a file.
 *
 * @return A promise that will be resolved with the contents of the file (as a string).
 */
export function readFile(filename: string, encoding: StringEncoding): Promise<string>;
/**
 * Asynchronously read the entire contents of a file.
 *
 * @param options.encoding If specified the file contents are returned as a string with the specified encoding,
 *                         if omitted or `null` (the default) then the file contents are returned as a raw buffer.
 * @return A promise that will be resolved with the contents of the file.
 */
export function readFile(filename: string, options: { encoding?: StringEncoding; flag?: string }): Promise<string|Buffer>;
/**
 * Asynchronously read the entire contents of a file.
 *
 * @return A promise that will be resolved with the contents of the file (as a buffer).
 */
export function readFile(filename: string): Promise<Buffer>;
