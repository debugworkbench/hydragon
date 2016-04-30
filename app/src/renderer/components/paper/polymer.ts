// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { omitOwnProps } from '../../../common/utils';
import { replaceEventListener } from '../../utils';
import { updatePolymerCSSVars } from '../../elements/utils';

/**
 * Base class for React components that wrap Polymer custom elements.
 *
 * Subclasses must implement [[eventBindings]] and [[renderElement]].
 */
export abstract class PolymerComponent<
                        TPolymerElement extends polymer.Base<any>,
                        TComponentProps extends PolymerComponent.IProps>
                extends React.Component<TComponentProps, {}, {}> {

  /** The underlying Polymer custom element instance. */
  protected element: TPolymerElement;
  /** Names of all currently bound event listeners. */
  private listeners: string[] = [];

  private onSetRef = (ref: TPolymerElement) => {
    this.element = ref;
    if (ref) {
      updatePolymerCSSVars(ref, this.props.cssVars || {});
    }
  }

  protected abstract get eventBindings(): Array<{ event: string; listener: string }>;

  componentDidMount(): void {
    this.eventBindings.forEach(binding => {
      const listener = (<any> this.props)[binding.listener];
      if (listener) {
        replaceEventListener(this.element, binding.event, null, listener);
        this.listeners.push(binding.listener);
      }
    });
  }

  componentWillUnmount(): void {
    this.eventBindings.forEach(binding =>
      replaceEventListener(this.element, binding.event, (<any> this.props)[binding.listener], null)
    );
    this.listeners = [];
  }

  componentWillUpdate(nextProps: PolymerComponent.IProps): void {
    this.listeners = [];
    if (this.element) {
      this.eventBindings.forEach(binding => {
        const newListener = (<any> nextProps)[binding.listener];
        replaceEventListener(
          this.element, binding.event,
          (<any> this.props)[binding.listener], newListener
        );
        if (newListener) {
          this.listeners.push(binding.listener);
        }
      });
      updatePolymerCSSVars(this.element, this.props.cssVars || {});
    }
  }

  protected abstract renderElement(props: TComponentProps): JSX.Element;

  render() {
    return this.renderElement(Object.assign(
      // `cssVars` is handled by this component so there's no need to pass it through,
      // `className` needs to be renamed to `class` before being passed through because React won't
      // do so when rendering custom elements,
      // listeners are bound by this component so there's no need to pass them through either
      omitOwnProps(this.props, ['cssVars', 'className'].concat(this.listeners)),
      {
        ref: this.onSetRef,
        class: this.props.className
      }
    ));
  }
}

export namespace PolymerComponent {
  export interface IProps extends React.HTMLAttributes {
    /**
     * Object containing properties that represent custom CSS variables that should be passed
     * through to the underlying custom element.
     * Example: { '--paper-icon-button': { width: '30px', height: '30px', padding: '5px' }}
     */
    cssVars?: any;
  }
}