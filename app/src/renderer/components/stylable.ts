import * as React from 'react';
import { FreeStyle } from 'react-free-style';

/**
 * The context interface of any component class that is decorated by @stylable should extend
 * this interface.
 */
export interface IStylableContext {
  freeStyle: FreeStyle.FreeStyle;
}

/**
 * Decorator for React component classes that adds a `freeStyle` property to the context of the
 * component.
 */
export function stylable(componentClass: React.ComponentClass<any, any, IStylableContext>) {
  // make sure React doesn't discard the freeStyle property from the context
  componentClass.contextTypes = componentClass.contextTypes || {};
  componentClass.contextTypes['freeStyle'] = React.PropTypes.object.isRequired;
}
