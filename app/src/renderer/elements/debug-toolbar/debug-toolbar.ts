// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { CompositeDisposable, Disposable } from 'event-kit';
import { DebugConfigManager } from '../../debug-config-manager';
import { DebugConfigPresenter } from '../../debug-config-presenter';
import {
  IDebugSession, IInferiorDidExitEvent, DebugEngineError, ConnectionError
} from 'debug-engine';

interface ILocalDOM {
  startButton: PolymerElements.PaperIconButton;
  stopButton: PolymerElements.PaperIconButton;
  settingsButton: PolymerElements.PaperIconButton;
  configs: PolymerElements.PaperDropdownMenu;
  newConfigItem: PolymerElements.PaperItem;
}

const INVISIBLE_CLASS = 'invisible';

function handleError(err: any): void {
  // FIXME: uncomment when a notification system is in place
  /*
  if (err instanceof DebugEngineError) {
    debugWorkbench.notifications.error(err.message, { stack: err.stack, detail: err.detail });
  } else if (err instanceof Error) {
    debugWorkbench.notifications.error(err.message, { stack: err.stack });
  } else {
    debugWorkbench.notifications.error(err.toString());
  }
  */
}

export type IDebugToolbarElement = DebugToolbarElement;

@pd.is('hydragon-debug-toolbar')
export default class DebugToolbarElement extends Polymer.BaseClass<ILocalDOM>() {
  private subscriptions: CompositeDisposable;
  private debugSession: IDebugSession;
  private _debugConfigManager: DebugConfigManager;
  private _debugConfigPresenter: DebugConfigPresenter;

  private get debugConfigManager(): DebugConfigManager {
    return this._debugConfigManager;
  }

  private set debugConfigManager(manager: DebugConfigManager) {
    this._debugConfigManager = manager;
    this.set('debugConfigs', this._debugConfigManager.getAll().map(config => config.name));
    // FIXME: remove previous subs?
    this.subscriptions.add(manager.onDidAddConfig(
      addedConfig => this.push('debugConfigs', addedConfig.name)
    ));
    this.subscriptions.add(manager.onDidRemoveConfig(
      removedConfig => {
        const idx = this.debugConfigs.indexOf(removedConfig.name);
        if (idx > -1) {
          this.splice('debugConfigs', idx, 1);
        }
      }
    ));
    this.subscriptions.add(manager.onDidRenameConfig(
      ({ newName, oldName }) => {
        const idx = this.debugConfigs.indexOf(oldName);
        if (idx > -1) {
          this.set(['debugConfigs', idx], newName);
        }
      }
    ));
  }

  @pd.property({ type: Array, value: [] })
  private debugConfigs: string[];

  created(): void {
    this.subscriptions = new CompositeDisposable();
  }

  factoryImpl(debugConfigManager: DebugConfigManager, debugConfigPresenter: DebugConfigPresenter): void {
    this.debugConfigManager = debugConfigManager;
    this._debugConfigPresenter = debugConfigPresenter;
  }

  destroy(): void {
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
  }

  @pd.listener('startButton.tap')
  private startDebugging(): void {
    // TODO: factor this out into a start-debugging <configuration> command that can be dispatched
    // from here or from a yet to be implemented command terminal window.
    //Promise.resolve().then(() => {
      this._showStartButton(false);
      const debugConfig = this.debugConfigManager.get(this.$.configs.selectedItemLabel);
      //const debugEngine = debugWorkbench.getDebugEngine(debugConfig.engine);
      //return debugEngine.startDebugSession(debugConfig/*, { console }*/);
    //})
    //.then((debugSession) => {
    //  this.debugSession = debugSession;
    //  const inferior = debugSession.inferior;
    //  if (inferior) {
    //    this.subscriptions.add(inferior.onDidExit(e => this._onInferiorDidExit(e)));
    //    return inferior.started ? inferior.resume() : inferior.start();
    //  }
      // TODO: enable the restart, step in/out/over buttons
    //})
    //.catch((err) => {
    //  handleError(err);
    //  this.stopDebugging();
    //});
  }

  @pd.listener('stopButton.tap')
  private async stopDebugging(): Promise<void> {
    if (this.debugSession) {
      // TODO: disable the restart, step in/out/over buttons
      try {
        await this.debugSession.end();
        this.debugSession = null;
        this._showStartButton(true);
      } catch (err) {
        handleError(err);
      }
    }
  }

  @pd.listener('settingsButton.tap')
  private openSettings(): void {
    if (this.$.configs.selectedItemLabel) {
      this._debugConfigPresenter.openDebugConfig(this.$.configs.selectedItemLabel);
    }
  }

  @pd.listener('configs.iron-activate')
  private willSelectDebugConfig(e: PolymerElements.IronActivateEvent): void {
    // when the user selects the 'New...' item in the configurations dropdown display a dialog
    // that lets them create a new configuration
    if (this.$.newConfigItem === e.detail.item) {
      // skip default selection logic so that 'New...' doesn't show up in the input element
      e.preventDefault();
      this.$.configs.close();
      // when the config name is omitted the user will be prompted to create a new config
      this._debugConfigPresenter.openDebugConfig();
    }
  }

  @pd.listener('configs.selected-item-changed')
  private didSelectDebugConfig(): void {
    // TODO: notify anyone that cares that the current debug config changed
  }

  private _onInferiorDidExit(e: IInferiorDidExitEvent): void {
    this.stopDebugging();
  }

  private _showStartButton(show: boolean): void {
    this.$.startButton.toggleClass(INVISIBLE_CLASS, !show);
    this.$.stopButton.toggleClass(INVISIBLE_CLASS, show);
  }
}
