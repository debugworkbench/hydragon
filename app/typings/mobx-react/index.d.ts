// The post-install NPM task will replace the typings that are distributed in the mobx-react
// package with the ones here, these ones have been tweaked to work with the customized React
// typings.

/**
 * Turns a React component or stateless render function into a reactive component.
 */
import React = require('react');

export function observer<P>(clazz: React.StatelessComponent<P>): React.ClassicComponentClass<P>;
export function observer<P>(renderFunction: (props: P) => React.ReactElement<any>): React.ClassicComponentClass<P>;
export function observer<P>(clazz: React.ClassicComponentClass<P>): React.ClassicComponentClass<P>;
export function observer<P, S, C>(clazz: React.ComponentClass<P, S, C>): React.ComponentClass<P, S, C>;
export function observer<TFunction extends React.ComponentClass<any, any, any>>(target: TFunction): TFunction; // decorator signature
