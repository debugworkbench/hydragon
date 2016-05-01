// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { observable } from 'mobx';
import { CompositeDisposable, Disposable } from 'event-kit';
import {
  IDebugSession, IInferiorDidExitEvent, DebugEngineError, ConnectionError
} from 'debug-engine';
import { IPanelItem, PanelModel } from './layout/panel';
import { DebugConfigManager } from '../../debug-config-manager';
import { DebugConfigPresenter } from '../../debug-config-presenter';

export class DebugToolbarModel implements IPanelItem {
  id: string;

  @observable
  selectedDebugConfig: string = null;

  @observable
  debugConfigs: string[] = [];

  @observable
  canStopDebugging = false;

  private debugSession: IDebugSession;
  private debugConfigManager: DebugConfigManager;
  private debugConfigPresenter: DebugConfigPresenter;
  private subscriptions = new CompositeDisposable();

  constructor({ id, debugConfigManager, debugConfigPresenter }: DebugToolbarModel.IConstructorParams) {
    this.id = id;
    this.debugConfigManager = debugConfigManager;
    this.debugConfigPresenter = debugConfigPresenter;

    this.debugConfigs = debugConfigManager.getAll().map(config => config.name);
    this.subscriptions.add(debugConfigManager.onDidAddConfig(
      addedConfig => this.debugConfigs.push(addedConfig.name)
    ));
    this.subscriptions.add(debugConfigManager.onDidRemoveConfig(
      removedConfig => {
        const idx = this.debugConfigs.indexOf(removedConfig.name);
        if (idx > -1) {
          this.debugConfigs.splice(idx, 1);
        }
      }
    ));
    this.subscriptions.add(debugConfigManager.onDidRenameConfig(
      ({ newName, oldName }) => {
        const idx = this.debugConfigs.indexOf(oldName);
        if (idx > -1) {
          this.debugConfigs[idx] = newName;
        }
      }
    ));
  }

  onDidAttachToPanel(panel: PanelModel): void {
    // noop
  }

  openDebugConfig(configName?: string): void {
    this.debugConfigPresenter.openDebugConfig(configName);
  }

  startDebugging(): void {
    // TODO: factor this out into a start-debugging <configuration> command that can be dispatched
    // from here or from a yet to be implemented command terminal window.
    //Promise.resolve().then(() => {
      const debugConfig = this.debugConfigManager.get(this.selectedDebugConfig);
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

  async stopDebugging(): Promise<void> {
    if (this.debugSession) {
      try {
        await this.debugSession.end();
        this.debugSession = null;
      } catch (err) {
        handleError(err);
      }
    }
  }
}

namespace DebugToolbarModel {
  export interface IConstructorParams {
    id: string;
    debugConfigManager: DebugConfigManager;
    debugConfigPresenter: DebugConfigPresenter;
  }
}


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
