// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { LayoutItemModel } from './layout-item';

export type SplitterOrientation = 'vertical' | 'horizontal';

export interface ISplitterParams {
  id: string;
  orientation: SplitterOrientation;
  resizee: LayoutItemModel;
}

export class SplitterModel extends LayoutItemModel {
  orientation: SplitterOrientation;
  /** The item the splitter will be resizing. */
  resizee: LayoutItemModel;

  constructor({ id, orientation, resizee }: ISplitterParams) {
    super(id);
    this.orientation = orientation;
    this.resizee = resizee;
    this.resizable = false;
  }
}
