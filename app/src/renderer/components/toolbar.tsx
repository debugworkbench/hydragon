// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import * as mobxReact from 'mobx-react';
import { ContextComponent } from './context';
import { PaperToolbarComponent } from './paper';

export interface IToolbarProps {
  model: {
    items?: Array<{ id: string }>;
  }
}

export interface IToolbarContext {
  renderChild(model: any, props: any): React.ReactElement<any>;
}

@mobxReact.observer
export class ToolbarComponent extends ContextComponent<IToolbarProps, {}, IToolbarContext> {
  static contextTypes = {
    renderChild: React.PropTypes.func.isRequired
  };

  render(): JSX.Element {
    const model = this.props.model;
    const items = model.items
      ? model.items.map(item => this.context.renderChild(item, { key: item.id }))
      : null;

    return (
      <PaperToolbarComponent styles={{ height: '48px' }}>
        { items }
      </PaperToolbarComponent>
    );
  }
}
