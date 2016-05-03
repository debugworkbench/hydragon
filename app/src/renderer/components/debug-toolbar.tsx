// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { DebugToolbarModel } from '../models/ui';
import {
  PaperDropdownMenuComponent, PaperIconButtonComponent, PaperToolbarComponent, PaperMenuComponent
} from './paper';
import { stylable, themable } from './decorators';
import { updatePolymerCSSVars } from '../elements/utils';

/**
 * Toolbar component that provides access to frequently used debugging features.
 */
@observer
@stylable
@themable
export class DebugToolbarComponent
       extends React.Component<DebugToolbarComponent.IProps, {}, DebugToolbarComponent.IContext> {

  private className: string;
  private debugConfigDropdown: PaperDropdownMenuComponent;
  private newDebugConfigDropdownItem: PolymerElements.PaperItem;

  private onSetDebugConfigDropdownRef = (ref: PaperDropdownMenuComponent) => {
    this.debugConfigDropdown = ref;
  }
  private onSetNewDebugConfigDropdownItemRef = (ref: PolymerElements.PaperItem) => {
    this.newDebugConfigDropdownItem = ref;
  }

  private onWillSelectDebugConfig = (e: PolymerElements.IronActivateEvent): void => {
    // when the user selects the 'New...' item in the configurations dropdown display a dialog
    // that lets them create a new configuration
    if (this.newDebugConfigDropdownItem === e.detail.item) {
      // skip default selection logic so that 'New...' doesn't show up in the input element
      e.preventDefault();
      this.debugConfigDropdown.close();
      // when the config name is omitted the user will be prompted to create a new config
      this.props.model.openDebugConfig();
    } else {
      this.props.model.selectedDebugConfig = this.debugConfigDropdown.selectedItemLabel;
    }
  }

  private onDidTapSettingsButton = (): void => {
    if (this.debugConfigDropdown && this.debugConfigDropdown.selectedItemLabel) {
      this.props.model.openDebugConfig(this.debugConfigDropdown.selectedItemLabel);
    }
  }

  private onDidTapStartButton = () => this.props.model.startDebugging();
  private onDidTapStopButton = () => this.props.model.stopDebugging();

  componentWillMount(): void {
    this.className = this.context.freeStyle.registerStyle(TOOLBAR_STYLE);
  }

  render() {
    const theme = this.context.theme;
    const model = this.props.model;
    let selectedDebugConfigIdx = model.debugConfigs.indexOf(model.selectedDebugConfig);
    selectedDebugConfigIdx = (selectedDebugConfigIdx !== -1) ? (selectedDebugConfigIdx + 1) : null;
    const startButtonClass = model.canStopDebugging ? 'invisible' : '';
    const stopButtonClass = [
      'stopButton',
      (model.canStopDebugging ? '' : 'invisible')
    ].join(' ');

    return (
      <PaperToolbarComponent className={this.className}
        cssVars={{
          '--paper-toolbar-background': theme.primaryBackgroundColor,
          '--paper-toolbar-color': theme.primaryTextColor,
          '--paper-toolbar-height': '48px'
        }}>
        <PaperIconButtonComponent icon="refresh" alt="Restart Debugging" disabled />
        <div className="startStopButtons">
          <PaperIconButtonComponent className={startButtonClass}
            icon="av:play-arrow" alt="Start Debugging"
            onDidTap={this.onDidTapStartButton} />
          <PaperIconButtonComponent className={stopButtonClass}
            icon="av:stop" alt="Stop Debugging"
            onDidTap={this.onDidTapStopButton} />
        </div>
        <PaperDropdownMenuComponent ref={this.onSetDebugConfigDropdownRef}
          label="Configuration" no-label-float
          onWillSelectItem={this.onWillSelectDebugConfig}
          cssVars={{
            '--paper-input-container-input-color': theme.primaryTextColor
          }}>
          <PaperMenuComponent className="dropdown-content"
            selected={selectedDebugConfigIdx}
            cssVars={{
              '--paper-menu-background-color': theme.primaryBackgroundColor,
              '--paper-menu-color': theme.primaryTextColor
            }}>
            <paper-item ref={this.onSetNewDebugConfigDropdownItemRef}>New...</paper-item>
            {
              model.debugConfigs.map(configName =>
                <paper-item key={configName}>{configName}</paper-item>
              )
            }
          </PaperMenuComponent>
        </PaperDropdownMenuComponent>
        <PaperIconButtonComponent icon="av:pause" alt="Pause Debugging" disabled />
        <PaperIconButtonComponent
          icon="settings" alt="Edit Debug Configuration"
          onDidTap={this.onDidTapSettingsButton}
        />
      </PaperToolbarComponent>
    );
  }
}

namespace DebugToolbarComponent {
  export interface IProps extends React.Props<DebugToolbarComponent> {
    model: DebugToolbarModel;
  }

  export interface IContext extends stylable.IContext, themable.IContext {
  }
}

const TOOLBAR_STYLE = {
  /* The start and stop buttons overlap, only one is visible at any one time. */
  '& .startStopButtons': {
    display: 'inline-block',
    position: 'relative'
  },
  '& .stopButton': {
    position: 'absolute',
    left: '0px',
    top: '0px'
  },
  '& .invisible': {
    visibility: 'hidden'
  }
};
