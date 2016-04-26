// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';

export interface IElementConstructorParams<TModel> {
  model: TModel;
  key?: string;
}

/**
 * Creates React elements from models.
 */
export class ElementFactory {
  constructors = new Map<any, (model: any) => JSX.Element>();

  /**
   * Create a new element instance from a model instance.
   *
   * @param model Model instance to bind to the new element.
   * @param key Optional key to assign to the element being constructed, this key is passed directly
   *            to `React.createElement()` so see the React docs for further info on when and why
   *            this parameter should be used.
   */
  createElement<TModel>({ model, key = undefined }: IElementConstructorParams<TModel>): JSX.Element {
    const elementConstructor = this.constructors.get(model.constructor);
    return elementConstructor({ model, key });
  }

  /**
   * Add an element constructor function to the factory.
   *
   * @param modelClass Model class (constructor function) to associate with the element constructor.
   * @param elementConstructor Function that should be invoked to construct a new element instance
   *                           that is bound to a given model instance.
   */
  registerElementConstructor<TModel>(
    modelClass: { new(...args: any[]): TModel },
    elementConstructor: (params: IElementConstructorParams<TModel>) => JSX.Element
  ): void {
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
