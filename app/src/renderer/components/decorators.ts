// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { FreeStyle } from 'react-free-style';
import { IWorkspaceTheme } from './workspace/workspace-theme';

/**
 * Decorator for React component classes that adds a `freeStyle` property to the context of the
 * component.
 */
export function stylable(componentClass: React.ComponentClass<any>): void {
  // make sure React doesn't discard the freeStyle property from the context
  componentClass.contextTypes = Object.assign(
    componentClass.contextTypes || {}, { freeStyle: React.PropTypes.object.isRequired }
  );
}

export namespace stylable {
  /**
   * The context interface of any component class that is decorated by @stylable should extend
   * this interface.
   */
  export interface IContext {
    freeStyle: FreeStyle.FreeStyle;
  }
}

/**
 * Decorator for React component classes that adds a `theme` property to the context of the
 * component.
 */
export function themable(componentClass: React.ComponentClass<any>) {
  // make sure React doesn't discard the theme property from the context
  componentClass.contextTypes = Object.assign(
    componentClass.contextTypes || {}, { theme: React.PropTypes.object.isRequired }
  );
}

export namespace themable {
  /**
  * The context interface of any component class that is decorated by @themable should extend
  * this interface.
  */
  export interface IContext {
    theme: IWorkspaceTheme;
  }
}
