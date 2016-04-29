// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { omitOwnProps } from '../../../common/utils';
import { replaceEventListener } from '../../utils';

const TAP_EVENT = 'tap';

/**
 * React component that wraps a Polymer paper-icon-button custom element.
 */
export class PaperIconButtonComponent extends React.Component<PaperIconButtonComponent.IProps, {}, {}> {
  private button: PolymerElements.PaperIconButton;
  private onSetRef = (ref: PolymerElements.PaperIconButton) => this.button = ref;

  componentDidMount(): void {
    replaceEventListener(this.button, TAP_EVENT, null, this.props.onDidTap);
  }

  componentWillUnmount(): void {
    replaceEventListener(this.button, TAP_EVENT, this.props.onDidTap, null);
  }

  componentWillUpdate(nextProps: PaperIconButtonComponent.IProps): void {
    replaceEventListener(this.button, TAP_EVENT, this.props.onDidTap, nextProps.onDidTap);
  }

  render() {
    const props = omitOwnProps(this.props, ['onDidTap']);
    return (
      <paper-icon-button ref={this.onSetRef} {...props}></paper-icon-button>
    );
  }
}

namespace PaperIconButtonComponent {
  export interface IProps extends React.HTMLAttributes {
    icon?: string;
    /** Callback to invoke after the user taps on the button. */
    onDidTap?: () => void;
  }
}
