// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import * as mobxReact from 'mobx-react';
import { ButtonModel } from './button-model';
import { ContextComponent } from './context';
import { PaperIconButtonComponent } from './paper';

export interface IButtonProps {
  model: ButtonModel;
}

@mobxReact.observer
export class ButtonComponent extends ContextComponent<IButtonProps, {}, {}> {
  render(): JSX.Element {
    const model = this.props.model;
    const props = {
      alt: model.description,
      icon: model.icon,
      disabled: model.enabled === false
    };
    return <PaperIconButtonComponent {...props} />;
  }
}
