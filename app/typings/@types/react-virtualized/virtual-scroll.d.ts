// Type definitions for react-virtualized 7.2.0
// Project: https://github.com/bvaughn/react-virtualized
// Definitions by: Vadim Macagon <https://github.com/enlight/>

import * as React from 'react';

/**
 * Renders a virtualized list of elements with either fixed or dynamic heights.
 */
export class VirtualScroll extends React.Component<VirtualScroll.IProps, {}> {
  /**
   * Pre-measure all rows.
   * Typically rows are only measured as needed and estimated heights are used for cells that have
   * not yet been measured. This method ensures that the next call to `getTotalSize()` returns an
   * exact size (as opposed to just an estimated one).
   */
  measureAllRows(): void;

  /**
   * Recompute row heights and offsets.
   * VirtualScroll has no way of knowing when its underlying list data has changed since it only
   * receives a `rowHeight` property. If the rowHeight is a number it can compare before and after
   * values but if it is a function that comparison is error prone. In the event that a dynamic
   * `rowHeight` function is in use and the row heights have changed this function should be
   * manually called by the "smart" container parent.
   */
  recomputeRowHeights(): void;
}

export namespace VirtualScroll {
  export interface IProps {
    /** Optional custom CSS class name to attach to root VirtualScroll element. */
    className?: string;
    /**
     * Used to estimate the total height of a VirtualScroll before all of its rows have actually
     * been measured. The estimated total height is adjusted as rows are rendered.
     */
    estimatedRowSize?: number;
    /** Width of the list. */
    width: number;
    /** Height constraint of the list (determines how many actual rows are rendered). */
    height: number;
    /** Callback used to render placeholder content when rowCount is zero. */
    noRowsRenderer?: () => React.ReactNode;
    /** Callback invoked with information about the slice of rows that were just rendered. */
    onRowsRendered?: (params: { overscanStartIndex: number; overscanStopIndex: number; startIndex: number; stopIndex: number }) => void;
    /** Callback invoked whenever the scroll offset changes within the inner scrollable region. */
    onScroll?: (params: { clientHeight: number; scrollHeight: number; scrollTop: number }) => void;
    /**
     * Number of rows to render above/below the visible bounds of the list. This can help reduce
     * flickering during scrolling on certain browers/devices.
     */
    overscanRowCount?: number;
    /**
     * Either a fixed row height (number) or a function that returns the height of a row given
     * its index.
     */
    rowHeight: number | ((params: { index: number }) => number);
    /** Responsbile for rendering a row given an index. */
    rowRenderer: (params: { index: number; isScrolling: boolean }) => React.ReactNode;
    /** Number of rows in list. */
    rowCount: number;
    /**
     * Controls the alignment scrolled-to-rows. The default ("auto") scrolls the least amount
     * possible to ensure that the specified row is fully visible. Use "start" to always align rows
     * to the top of the list and "end" to align them bottom. Use "center" to align them in the
     * middle of container.
     */
    scrollToAlignment?: 'auto' | 'start' | 'center' | 'end';
    /** Row index to ensure visible (by forcefully scrolling if necessary). */
    scrollToIndex?: number;
    /** Forced vertical scroll offset; can be used to synchronize scrolling between components. */
    scrollTop?: number;
    /** Optional custom inline style to attach to root VirtualScroll element. */
    style?: React.CSSProperties;
  }
}
