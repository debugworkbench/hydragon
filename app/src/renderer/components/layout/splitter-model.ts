// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ComponentModel } from '../component-model';

export type SplitterOrientation = 'vertical' | 'horizontal';

export class SplitterModel extends ComponentModel {
  orientation: 'vertical' | 'horizontal';
  /** Identifier of the component this splitter will resize. */
  resizeeId: string;

  constructor({ id, orientation, resizeeId }: {
    id: string;
    orientation: SplitterOrientation;
    resizeeId: string;
  }) {
    super(id, null);
    this.orientation = orientation;
    this.resizeeId = resizeeId;
  }
}
