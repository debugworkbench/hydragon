// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/**
 * Common interface for layout container and panel models.
 */
export interface ILayoutItemModel {
  readonly id: string;
  width?: string;
  height?: string;
  resizable?: boolean;
}
