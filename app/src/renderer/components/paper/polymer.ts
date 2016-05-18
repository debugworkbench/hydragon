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
                        TComponentProps extends PolymerComponent.IProps,
                        TComponentContext>
                extends React.Component<TComponentProps, {}, TComponentContext> {

  /** The underlying Polymer custom element instance. */
  protected element: TPolymerElement;
  /** Names of all event listeners that can be bound. */
  private listeners: string[];

  private onSetRef = (ref: TPolymerElement) => {
    this.element = ref;
    if (ref) {
      // Sometimes a Polymer element doesn't consider itself attached at this point, which
      // means it will ignore any attempt to update its style, delaying the operation a little bit
      // using `setImmediate` seems to work around the issue. Not all Polymer elements behave the
      // same way, paper-icon-button seems to work without delay, but paper-toolbar doesn't.
      setImmediate(() =>
        updatePolymerCSSVars(ref, Object.assign({}, this.props.cssVars, this.cssVars))
      );
    }
    this.elementRefDidChange(ref);
  }

  /**
   * Subclasses can override this getter to return additional custom CSS vars that will be merged
   * with the ones passed via props.
   */
  protected get cssVars(): any {
    return undefined;
  }

  /**
   * Subclasses can override this method to perform additional processing when the reference to
   * the underlying custom element changes.
   *
   * @param ref The new custom element reference, may be `null`.
   */
  protected elementRefDidChange(ref: TPolymerElement): void {
    // override in subclass if needed
  }

  /**
   * Subclasses must implement this method to return the event bindings for the underlying
   * custom element.
   */
  protected abstract get eventBindings(): PolymerComponent.IEventBinding[];

  componentDidMount(): void {
    this.eventBindings.forEach(binding => {
      const listener = (typeof binding.listener === 'string')
        ? (<any> this.props)[binding.listener]
        : binding.listener;

      replaceEventListener(this.element, binding.event, null, listener);
    });
  }

  componentWillUnmount(): void {
    this.eventBindings.forEach(binding => {
      const listener = (typeof binding.listener === 'string')
        ? (<any> this.props)[binding.listener]
        : binding.listener;

      replaceEventListener(this.element, binding.event, listener, null);
    });
  }

  componentWillUpdate(nextProps: PolymerComponent.IProps): void {
    if (this.element) {
      this.eventBindings.forEach(binding => {
        const oldListener = (typeof binding.listener === 'string')
          ? (<any> this.props)[binding.listener]
          : binding.listener;
        const newListener = (typeof binding.listener === 'string')
          ? (<any> nextProps)[binding.listener]
          : binding.listener;

        replaceEventListener(this.element, binding.event, oldListener, newListener);
      });
      updatePolymerCSSVars(this.element, Object.assign({}, this.props.cssVars, this.cssVars));
    }
  }

  /**
   * Subclasses must implement this method to return a React element representing the underlying
   * custom element.
   */
  protected abstract renderElement(props: TComponentProps): JSX.Element;

  render() {
    if (!this.listeners) {
      this.listeners = [];
      this.eventBindings.forEach(binding => {
        if (typeof binding.listener === 'string') {
          this.listeners.push(binding.listener);
        }
      });
    }
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
  export interface IProps {
    // Standard HTML Attributes
    alt?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
    label?: string;

    /**
     * Set to `true` to indicate that the component should serve as the prefix of a `paper-input`
     * element.
     */
    prefix?: boolean;
    /**
     * Set to `true` to indicate that the component should serve as the suffix of a `paper-input`
     * element.
     */
    suffix?: boolean;
    /**
     * Object containing properties that represent custom CSS variables that should be passed
     * through to the underlying custom element.
     * Example: { '--paper-icon-button': { width: '30px', height: '30px', padding: '5px' }}
     */
    cssVars?: any;
  }

  export interface IEventBinding {
    event: string;
    /**
     * Either the name of a listener function passed to the React component via props, or an actual
     * function that will be directly bound to an element.
     */
    listener: string | Function;
  }
}
