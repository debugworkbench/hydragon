// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import { ComponentModel } from './component-model';
import { WidgetPath } from '../../display-server/widgets';

export class ButtonModel extends ComponentModel {
  @mobx.observable
  description: string;

  @mobx.observable
  icon: string;

  @mobx.observable
  enabled: boolean;

  constructor(params: {
    id: string;
    widgetPath: WidgetPath;
    description?: string;
    icon?: string;
    enabled?: boolean;
  }) {
    super(params.id, params.widgetPath);
    this.description = params.description || null;
    this.icon = params.icon || null;
    this.enabled = (params.enabled !== false);
  }
}
