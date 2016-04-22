// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';

/**
 * Creates React elements from models.
 */
export class ElementFactory {
  constructors = new Map<any, (model: any) => JSX.Element>();

  /**
   * Create a new element instance from a model instance.
   */
  createElementFrom(model: any, parent: React.Component<any, any, any>): JSX.Element {
    const elementConstructor = this.constructors.get(model.constructor);
    return elementConstructor(model);
  }

  /**
   * Add an element constructor function to the factory.
   *
   * @param modelClass Model class (constructor function) to associate with the element constructor.
   * @param elementConstructor Function that should be invoked to construct a new element instance
   *                           that is bound to a given model instance.
   */
  registerElementConstructor(modelClass: any, elementConstructor: (model: any) => JSX.Element): void {
    this.constructors.set(modelClass, elementConstructor);
  }
}

/**
 * The context interface of any component class that is decorated by @requiresElementFactory should
 * extend this interface.
 */
export interface IRequiresElementFactoryContext {
  elementFactory: ElementFactory;
}

/**
 * Decorator for React component classes that adds an `elementFactory` property to the context of
 * the component.
 */
export function requiresElementFactory(
  componentClass: React.ComponentClass<any, any, IRequiresElementFactoryContext>
) {
  // make sure React doesn't discard the elementFactory property from the context
  componentClass.contextTypes = componentClass.contextTypes || {};
  componentClass.contextTypes['elementFactory'] = React.PropTypes.object.isRequired;
}
