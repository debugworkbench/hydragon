// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { DebugToolbarModel } from '../models/ui';

export interface IProps extends React.Props<DebugToolbarComponent> {
  model: DebugToolbarModel;
}

/**
 * Currently this component is just a simple wrapper for a custom element.
 */
export class DebugToolbarComponent extends React.Component<IProps, {}, {}> {
  render() {
    return (
      <hydragon-debug-toolbar></hydragon-debug-toolbar>
    );
  }
}
