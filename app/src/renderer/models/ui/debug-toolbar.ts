// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { IPanelItem, PanelModel } from './layout/panel';

export interface IDebugToolbarParams {
  id: string;
}

export class DebugToolbarModel implements IPanelItem {
  id: string;

  constructor({ id }: IDebugToolbarParams) {
    this.id = id;
  }

  onDidAttachToPanel(panel: PanelModel): void {
    // noop
  }
}
