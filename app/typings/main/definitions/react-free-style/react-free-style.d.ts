// Compiled using typings@0.6.8
// Source: node_modules\free-style\dist\free-style.d.ts
declare module 'react-free-style~free-style' {
/**
 * Valid CSS property names.
 */
export type PropertyName = string;
/**
 * Valid CSS property values.
 */
export type PropertyValue = void | number | string | string[] | number[];
/**
 * User styles object.
 */
export type UserStyles = any;
/**
 * Cacheable interface.
 */
export interface ICacheable<T> {
    id: string;
    clone(): T;
}
/**
 * Common interface all style classes conform to.
 */
export interface IStyle<T> extends ICacheable<T> {
    getStyles(): string;
}
/**
 * Change listeners are registered to react to CSS changes.
 */
export interface ChangeListenerFunction {
    (type?: string, style?: ICacheable<any>[], parent?: any): any;
}
/**
 * Implement a cache/event emitter.
 */
export class Cache<T extends ICacheable<any>> {
    private _children;
    private _keys;
    private _counts;
    private _listeners;
    private _mergeListener;
    private _childListener;
    constructor();
    values(): T[];
    empty(): void;
    add<U extends T>(style: U): U;
    get(style: T): T;
    count(style: T): number;
    remove(style: T): void;
    addChangeListener(fn: ChangeListenerFunction): void;
    removeChangeListener(fn: ChangeListenerFunction): void;
    emitChange(type: string, path: ICacheable<any>[]): void;
    merge<U extends Cache<T>>(style: U): void;
    unmerge<U extends Cache<T>>(style: U): void;
}
/**
 * Selector is a dumb class made to represent nested CSS selectors.
 */
export class Selector implements ICacheable<Selector> {
    selector: string;
    id: string;
    constructor(selector: string, id?: string);
    clone(): Selector;
}
/**
 * The style container registers a style string with selectors.
 */
export class Style extends Cache<Selector> implements IStyle<Style> {
    style: string;
    id: string;
    constructor(style: string, id?: string);
    getStyles(): string;
    clone(): Style;
}
/**
 * Implement rule logic for style output.
 */
export class Rule extends Cache<Rule | Style> implements IStyle<Rule> {
    rule: string;
    style: string;
    id: string;
    constructor(rule: string, style?: string, id?: string);
    getStyles(): string;
    clone(): Rule;
}
/**
 * The FreeStyle class implements the API for everything else.
 */
export class FreeStyle extends Cache<Rule | Style> implements IStyle<FreeStyle> {
    id: string;
    constructor(id?: string);
    url(url: string): string;
    join(...classList: Array<string | Object | void | string[]>): string;
    registerStyle(styles: UserStyles): string;
    registerRule(rule: string, styles: UserStyles): void;
    registerKeyframes(keyframes: UserStyles): string;
    inject(target?: HTMLElement): HTMLElement;
    getStyles(): string;
    clone(): FreeStyle;
}
/**
 * Exports a simple function to create a new instance.
 */
export function create(): FreeStyle;
}

// Compiled using typings@0.6.8
// Source: node_modules\react-free-style\dist\react-free-style.d.ts
declare module 'react-free-style/dist/react-free-style' {
import React = require('react');
export import FreeStyle = require('react-free-style~free-style');
/**
 * Create a specialized free style instance.
 */
export class ReactFreeStyle extends FreeStyle.FreeStyle {
    /**
     * Expose the `StyleElement` for use.
     */
    Element: typeof StyleElement;
    /**
     * Create a React component that inherits from a user component. This is
     * required for methods on the user component to continue working once
     * wrapped with the style functionality.
     */
    component(Component: React.ComponentClass<any>): React.ComponentClass<any>;
}
/**
 * Create the <style /> element.
 */
export class StyleElement extends React.Component<{}, {}> {
    static displayName: string;
    static contextTypes: React.ValidationMap<any>;
    onChange: () => void;
    componentWillMount(): void;
    componentWillUnmount(): void;
    render(): React.DOMElement<{
        dangerouslySetInnerHTML: {
            __html: any;
        };
    }>;
}
/**
 * Create a React Free Style instance.
 */
export function create(): ReactFreeStyle;
}
declare module 'react-free-style' {
export * from 'react-free-style/dist/react-free-style';
}