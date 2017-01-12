// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import { IDebugConfig } from './debug-config-manager';

export class Project {
  @mobx.observable
  currentDebugConfig: IDebugConfig = null;
}
