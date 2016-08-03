// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';

/** Interface for the static side of the BaseComponent class. */
export interface ContextComponentClass<P, S, C> {
  new(props?: P, context?: C): ContextComponent<P, S, C>;
  propTypes?: React.ValidationMap<P>;
  contextTypes?: React.ValidationMap<any>;
  childContextTypes?: React.ValidationMap<any>;
  defaultProps?: P;
  displayName?: string;
}

/**
 * Base class for React components that rely on context, this class only exists to provide a
 * properly typed context since the context type parameter was removed from the React typings in
 * DefinitelyTyped.
 */
export class ContextComponent<TProps, TState, TContext> extends React.Component<TProps, TState> {
  context: TContext;
}
