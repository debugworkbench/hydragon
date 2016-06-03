// Type definitions for react-virtualized 7.2.0
// Project: https://github.com/bvaughn/react-virtualized
// Definitions by: Vadim Macagon <https://github.com/enlight/>

import * as React from 'react';

export class AutoSizer extends React.Component<AutoSizer.IProps, {}, {}> {
}

export namespace AutoSizer {
  export interface IProps /*extends React.HTMLProps<AutoSizer>*/ {
    /** Responsible for rendering children. */
    //children: (params: { height: number; width: number }) => React.ReactNode;
    /** Fixed height; if specified, the child's height property will not be managed. */
    disableHeight?: boolean;
    /** Fixed width; if specified, the child's width property will not be managed. */
    disableWidth?: boolean;
    /** Callback to be invoked on-resize. */
    onResize?: (params: { height: number; width: number }) => void;
  }
}
