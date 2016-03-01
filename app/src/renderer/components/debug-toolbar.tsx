// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';

/**
 * Currently this component is just a simple wrapper for a custom element.
 */
export default class DebugToolbarComponent extends React.Component<{}, {}, {}> {
  render() {
    return (
      <hydragon-debug-toolbar></hydragon-debug-toolbar>
    );
  }
}
