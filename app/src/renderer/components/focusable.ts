// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface IFocusableState {
  /** `true` when the component has focus, `false` otherwise. */
  isFocused: boolean;
}

/**
 * Creates a new focus-aware component class based on an existing component class.
 *
 * Instances of the returned component class can look at the `isFocused` property in their state
 * to determine whether they have focus or not.
 */
export function makeFocusable<P, S extends IFocusableState, C>(
  InputClass: React.ComponentClass<P>
): typeof InputClass {
  return class extends InputClass {
    state: {
      isFocused?: boolean;
    };

    private element: Element;

    private onFocusOrBlur = (e: FocusEvent) => {
      if (e.target === this.element) {
        this.setState({ isFocused: e.type === 'focus' });
      }
    };

    constructor(props: P, context: C) {
      super(props, context);
      this.state = this.state || {};
      this.state.isFocused = false;
    }

    componentDidMount(): void {
      this.element = ReactDOM.findDOMNode(this);
      this.element.addEventListener('focus', this.onFocusOrBlur, true);
      this.element.addEventListener('blur', this.onFocusOrBlur, true);
      if (InputClass.prototype.componentDidMount) {
        InputClass.prototype.componentDidMount.call(this);
      }
    }

    componentWillUnmount(): void {
      if (InputClass.prototype.componentWillUnmount) {
        InputClass.prototype.componentWillUnmount.call(this);
      }
      this.element.removeEventListener('focus', this.onFocusOrBlur);
      this.element.removeEventListener('blur', this.onFocusOrBlur);
      this.element = null;
    }
  };
}
