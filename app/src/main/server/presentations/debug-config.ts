// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Observable } from '@reactivex/rxjs';
import {
  Presenter, Presentation, IDropdownItem, PresentationOutputNode, WidgetEvent, WidgetPatch,
  WidgetKind
} from '../../../display-server';
import { DebugConfigManager, IDebugConfig } from '../debug-config-manager';

export class DebugConfigDropdownItemPresentation extends Presentation<IDebugConfig, IDropdownItem> {
  readonly appObject: IDebugConfig;

  constructor(presenter: Presenter, debugConfig: IDebugConfig) {
    super(presenter, debugConfig.name);
    this.appObject = debugConfig;
  }

  async render(outputNode: PresentationOutputNode): Promise<[IDropdownItem, Observable<WidgetPatch>]> {
    outputNode.presentation = this;
    return [
      {
        kind: WidgetKind.DropdownItem,
        path: outputNode.path,
        id: this.id,
        label: this.appObject.name
      },
      // TODO: emit change events
      null
    ];
  }

  handleEvent(event: WidgetEvent): Promise<void> {
    return Promise.resolve();
  }
}
