// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as DebugEngineProvider from 'debug-engine';
import { GdbMiDebugEngineProvider } from 'gdb-mi-debug-engine';
import { Observable } from '@reactivex/rxjs';
import { LayoutDirection } from './widgets';
import { DebugConfigManager, DebugConfigFileLoader, IDebugConfig } from './debug-config-manager';
import { Project } from './project';
import {
  IDisplayServer, WidgetKind, Presenter, PresentationOutputNode, WindowPresentation,
  PanelPresentation, LayoutContainerPresentation, CommandTableToolbarPresentation,
  CommandButtonPresentation, CommandDropdownPresentation, CommandTable
} from '../../display-server';
import {
  ListDebugConfigsCommand, SelectDebugConfigCommand, GetCurrentDebugConfigCommand,
  EditDebugConfigCommand
} from './commands/debug-config';
import { DebugConfigDropdownItemPresentation } from './presentations/debug-config';

/**
 * The back-end for a debugger front-end, drives the UI on the front-end via a display server.
 * The back-end and front-end may run in the same process or in separate processes, provided the
 * display server supports that process model.
 */
export class Application {
  private _project: Project;
  private _debugConfigManager: DebugConfigManager;
  private _windows: WindowPresentation[] = [];
  private _cmdTable: CommandTable;
  private _cmds: {
    listDebugConfigs: ListDebugConfigsCommand;
    selectDebugConfig: SelectDebugConfigCommand;
    getCurrentDebugConfig: GetCurrentDebugConfigCommand;
    editDebugConfig: EditDebugConfigCommand;
  };
  private _presenter = new Presenter();

  constructor() {
    this._presenter
    .register(CommandTableToolbarPresentation, 'CommandTable', WidgetKind.Toolbar)
    .register(CommandButtonPresentation, 'Command', WidgetKind.Button)
    .register(CommandDropdownPresentation, 'Command', WidgetKind.Dropdown)
    .register(DebugConfigDropdownItemPresentation, 'DebugConfig', WidgetKind.DropdownItem);
  }

  async run(userDataDir: string, displayServer: IDisplayServer): Promise<void> {
    this._project = new Project();
    const debugConfigsPath = path.join(userDataDir, 'HydragonDebugConfigs.json');
    const debugConfigLoader = new DebugConfigFileLoader(debugConfigsPath);
    this._debugConfigManager = new DebugConfigManager(debugConfigLoader);
    DebugEngineProvider.register(new GdbMiDebugEngineProvider());
    await this._debugConfigManager.load();

    this._cmdTable = this._buildCmdTable();
    // TODO: load previously persisted state if it's available
    this._createDefaultLayout();
    // send initial ui representation to display server
    const rootOutputNode = new PresentationOutputNode(null, []);
    this._windows.forEach(async win => {
      const [widget, updateStream] = await win.render(rootOutputNode.addChild(win.id));
      displayServer.createWindow(widget);
      // notify the display server whenever the window is updated
      updateStream.subscribe(update => displayServer.updateWindow(widget, update));
    });
    // forward user input events to the corresponding presentations
    // and wait for each presentation to process its event before moving on to the next event
    displayServer.eventStream
    .concatMap(event => Observable.defer(async () => {
      const node = rootOutputNode.getNodeAtPath(event.path);
      if (node) {
        await node.presentation.handleEvent(event);
      }
    }))
    .subscribe();
  }

  private _buildCmdTable(): CommandTable {
    const cmdTable = new CommandTable('appCmds');
    this._cmds = {
      listDebugConfigs: new ListDebugConfigsCommand(this._debugConfigManager),
      selectDebugConfig: new SelectDebugConfigCommand(this._project),
      getCurrentDebugConfig: new GetCurrentDebugConfigCommand(this._project),
      editDebugConfig: new EditDebugConfigCommand()
    };
    cmdTable.commands.push(
      //{ 'start session', newDebugSessionCmd },
      { name: 'list debug-config', command: this._cmds.listDebugConfigs },
      { name: 'select debug-config', command: this._cmds.selectDebugConfig },
      { name: 'get debug-config', command: this._cmds.getCurrentDebugConfig },
      { name: 'edit debug-config', command: this._cmds.editDebugConfig }
    );
    return cmdTable;
  }

  private _createDefaultLayout(): void {
    const leftLayout = new LayoutContainerPresentation(this._presenter, {
      id: 'left-layout',
      direction: 'vertical',
      width: 300,
      resizable: true,
      items: [
        new PanelPresentation(this._presenter, {
          id: 'open-pages-panel',
          title: 'Open Pages',
          height: 300,
          showHeader: true,
          resizable: true,
          items: []
        }),
        new PanelPresentation(this._presenter, {
          id: 'explorer-panel',
          title: 'Explorer',
          showHeader: true,
          resizable: true,
          items: []
        })
      ]
    });
    const rightLayout = new LayoutContainerPresentation(this._presenter, {
      id: 'right-layout',
      direction: 'vertical',
      resizable: true,
      items: [
        new PanelPresentation(this._presenter, {
          id: 'page-set-panel',
          resizable: true,
          items: [/*
            new PageSet({
              id: 'main-page-set',
              height: '100%'
            })*/
          ]
        }),
        new PanelPresentation(this._presenter, {
          id: 'status-panel',
          height: 20,
          items: []
        })
      ]
    });
    const appToolbarPanel = new PanelPresentation(this._presenter, {
      id: 'toolbar-panel',
      height: 48,
      items: [
        new CommandTableToolbarPresentation(this._presenter, this._cmdTable, {
          id: 'debug-toolbar',
          items: [
            //newDebugSessionCmd,
            new CommandDropdownPresentation<IDebugConfig>(
              this._presenter, this._cmds.listDebugConfigs, {
                selectCmd: this._cmds.selectDebugConfig,
                getCurrentSelectionCmd: this._cmds.getCurrentDebugConfig,
                label: 'Configuration',
                id: 'debug-config-dropdown'
              }
            ),
            this._presenter.present(
              this._cmds.editDebugConfig, 'Command', WidgetKind.Button,
              { id: 'edit-debug-config' }
            )
          ]
        })
      ]
    });
    const windowLayout = new LayoutContainerPresentation(this._presenter, {
      id: 'root-layout',
      direction: 'vertical',
      items: [
        appToolbarPanel,
        new LayoutContainerPresentation(this._presenter, {
          id: 'main-layout',
          direction: 'horizontal',
          items: [leftLayout, rightLayout]
        })
      ]
    });
    const mainWindow = new WindowPresentation(this._presenter, {
      id: 'main-window',
      layout: windowLayout
    });
    this._windows.push(mainWindow);
  }
}
