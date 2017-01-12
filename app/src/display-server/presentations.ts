// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import { Observable, Subject, Subscription } from '@reactivex/rxjs';
import { Presentation, Presenter, PresentationOutputNode } from './presenter';
import { WidgetEvent, WidgetEventKind, WidgetKind, IWindow, ILayoutContainer, IPanel, IButton, IDropdown, IDropdownItem, IToolbar } from './widgets';
import { CommandTable, ICommand, ICommand1 } from './command-table';
import { OutputRecord, ValueOutputRecord, ArrayOutputRecord, DynamicArrayRecord, DynamicValueRecord } from './output-record';
import { PatchOperation, WidgetPatch } from './index';

export class WindowPresentation extends Presentation<WindowPresentation, IWindow> {
  readonly appObject = this;
  readonly layout: LayoutContainerPresentation;

  constructor(presenter: Presenter, options: {
    id: string;
    layout: LayoutContainerPresentation;
  }) {
    super(presenter, options.id);
    this.layout = options.layout;
  }

  async render(outputNode: PresentationOutputNode): Promise<[IWindow, Observable<WidgetPatch>]> {
    const [layout, layoutUpdateStream] = await this.layout.render(outputNode.addChild('layout'));
    outputNode.presentation = this;
    return [
      {
        kind: WidgetKind.Window,
        path: outputNode.path,
        id: this.id,
        layout
      },
      layoutUpdateStream
    ];
  }

  async handleEvent(event: WidgetEvent): Promise<void> {
    return Promise.resolve();
  }
}

export type LayoutItemPresentation = LayoutContainerPresentation | PanelPresentation;
export type LayoutDirection = 'vertical' | 'horizontal';

export class LayoutContainerPresentation extends Presentation<LayoutContainerPresentation, ILayoutContainer> {
  readonly appObject = this;
  readonly direction: LayoutDirection;
  width?: string;
  height?: string;
  resizable?: boolean;
  readonly items: LayoutItemPresentation[];

  constructor(presenter: Presenter, options: {
    id: string;
    direction: LayoutDirection;
    width?: string | number;
    height?: string | number;
    resizable?: boolean;
    items: LayoutItemPresentation[];
  }) {
    super(presenter, options.id);
    this.direction = options.direction;
    this.width = Number.isInteger(options.width) ? `${options.width}px` : options.width;
    this.height = Number.isInteger(options.height) ? `${options.height}px` : options.height;
    this.resizable = options.resizable;
    this.items = options.items;
  }

  async render(outputNode: PresentationOutputNode): Promise<[ILayoutContainer, Observable<WidgetPatch>]> {
    const itemsNode = outputNode.addChild('items');
    const renderPromises = [];
    for (let i = 0; i < this.items.length; ++i) {
      const promise = this.items[i].render(itemsNode.addChildAt(i));
      renderPromises.push(promise);
    }
    const renderedOutput = await Promise.all<[ILayoutContainer | IPanel, Observable<WidgetPatch>]>(
      renderPromises
    );
    const updateStream = new Subject<WidgetPatch>();
    const widgets = [];
    for (let [widget, widgetUpdateStream] of renderedOutput) {
      widgets.push(widget);
      if (widgetUpdateStream) {
        widgetUpdateStream.subscribe(updateStream);
      }
    }
    outputNode.presentation = this;
    return [
      {
        kind: WidgetKind.LayoutContainer,
        path: outputNode.path,
        id: this.id,
        direction: this.direction,
        width: this.width,
        height: this.height,
        resizable: this.resizable,
        items: widgets
      },
      updateStream
    ];
  }

  async handleEvent(event: WidgetEvent): Promise<void> {
    return Promise.resolve();
  }
}

export class PanelPresentation extends Presentation<PanelPresentation, IPanel> {
  readonly appObject = this;
  title?: string;
  width?: string;
  height?: string;
  resizable?: boolean;
  showHeader?: boolean;
  items: Presentation<any, any>[];

  constructor(presenter: Presenter, options: {
    id: string;
    title?: string;
    width?: string | number;
    height?: string | number;
    resizable?: boolean;
    showHeader?: boolean;
    items?: Presentation<any, any>[];
  }) {
    super(presenter, options.id);
    this.title = options.title;
    this.width = Number.isInteger(options.width) ? `${options.width}px` : options.width;
    this.height = Number.isInteger(options.height) ? `${options.height}px` : options.height;
    this.resizable = options.resizable;
    this.showHeader = options.showHeader;
    this.items = options.items;
  }

  async render(outputNode: PresentationOutputNode): Promise<[IPanel, Observable<WidgetPatch>]> {
    const itemsNode = outputNode.addChild('items');
    const renderPromises = [];
    for (let i = 0; i < this.items.length; ++i) {
      const promise = this.items[i].render(itemsNode.addChildAt(i));
      renderPromises.push(promise);
    }
    const renderedOutput = await Promise.all(renderPromises);
    const updateStream = new Subject<WidgetPatch>();
    const widgets = [];
    for (let [widget, widgetUpdateStream] of renderedOutput) {
      widgets.push(widget);
      if (widgetUpdateStream) {
        widgetUpdateStream.subscribe(updateStream);
      }
    }
    outputNode.presentation = this;
    return [
      {
        kind: WidgetKind.Panel,
        path: outputNode.path,
        id: this.id,
        title: this.title,
        width: this.width,
        height: this.height,
        resizable: this.resizable,
        showHeader: this.showHeader,
        items: widgets
      },
      updateStream
    ];
  }

  async handleEvent(event: WidgetEvent): Promise<any> {
    return Promise.resolve();
  }
}

export class CommandTableToolbarPresentation extends Presentation<CommandTable, IToolbar> {
  readonly appObject: CommandTable;
  readonly items: Presentation<any, any>[];

  constructor(presenter: Presenter, cmdTable: CommandTable, options?: {
    id?: string;
    items?: Presentation<any, any>[];
  }) {
    super(presenter, options ? options.id : undefined);
    this.appObject = cmdTable;
    if (options) {
      this.items = options.items;
    }
  }

  async render(outputNode: PresentationOutputNode): Promise<[IToolbar, Observable<WidgetPatch>]> {
    const itemsNode = outputNode.addChild('items');
    const renderPromises = [];
    for (let i = 0; i < this.items.length; ++i) {
      const promise = this.items[i].render(itemsNode.addChildAt(i));
      renderPromises.push(promise);
    }
    const renderedOutput = await Promise.all(renderPromises);
    const updateStream = new Subject<WidgetPatch>();
    const widgets = [];
    for (let [widget, widgetUpdateStream] of renderedOutput) {
      widgets.push(widget);
      if (widgetUpdateStream) {
        widgetUpdateStream.subscribe(updateStream);
      }
    }
    outputNode.presentation = this;
    return [
      {
        kind: WidgetKind.Toolbar,
        path: outputNode.path,
        id: this.id,
        items: widgets
      },
      updateStream
    ];
  }

  async handleEvent(event: WidgetEvent): Promise<void> {
    return Promise.resolve();
  }
}

export class CommandButtonPresentation extends Presentation<ICommand<any>, IButton> {
  readonly appObject: ICommand<any>;

  constructor(presenter: Presenter, cmd: ICommand<any>, options?: { id?: string }) {
    super(presenter, options ? options.id : undefined);
    this.appObject = cmd;
  }

  async render(outputNode: PresentationOutputNode): Promise<[IButton, Observable<WidgetPatch>]> {
    // TODO: track changes to command state
    outputNode.presentation = this;
    return [
      {
        kind: WidgetKind.Button,
        path: outputNode.path,
        id: this.id
      },
      null
    ];
  }

  async handleEvent(event: WidgetEvent): Promise<void> {
    await this.appObject.execute();
  }
}

/**
 * A presentation of a command as a generic dropdown widget.
 *
 * The command being presented must output an array of items.
 */
export class CommandDropdownPresentation<TItem> extends Presentation<ICommand<ArrayOutputRecord<TItem>>, IDropdown> {
  readonly appObject: ICommand<ArrayOutputRecord<TItem>>;
  readonly label: string;
  readonly listCmd: ICommand<ArrayOutputRecord<TItem>>;
  readonly selectCmd: ICommand1<void, TItem>;
  readonly getCurrentSelectionCmd: ICommand<ValueOutputRecord<TItem>>;

  private _listItemPresentations: Presentation<TItem, IDropdownItem>[] = null;

  constructor(presenter: Presenter, listCmd: ICommand<ArrayOutputRecord<TItem>>, options: {
    id?: string,
    selectCmd: ICommand1<void, TItem>;
    getCurrentSelectionCmd: ICommand<ValueOutputRecord<TItem>>;
    label?: string;
  }) {
    super(presenter, options.id);
    this.appObject = listCmd;
    this.listCmd = listCmd;
    this.selectCmd = options.selectCmd;
    this.getCurrentSelectionCmd = options.getCurrentSelectionCmd;
    this.label = options.label;
  }

  async render(outputNode: PresentationOutputNode): Promise<[IDropdown, Observable<WidgetPatch>]> {
    const listCmdOutput = await this.listCmd.execute();
    const listItems = listCmdOutput.value;
    // TODO: map the selectCmd to the 'select' gesture and associate it with the item presentations?
    this._listItemPresentations = listItems.map(
      item => this.presenter.present<TItem, IDropdownItem>(
        item, listCmdOutput.type, WidgetKind.DropdownItem
      )
    );
    const itemsNode = outputNode.addChild('items');
    const renderPromises = [];
    for (let i = 0; i < this._listItemPresentations.length; ++i) {
      const promise = this._listItemPresentations[i].render(itemsNode.addChildAt(i));
      renderPromises.push(promise);
    }
    const renderedOutput = await Promise.all(renderPromises);
    outputNode.presentation = this;
    // setup change tracking
    const updateStream = new Subject<WidgetPatch>();
    const widgets = [];
    const childSubs: Subscription[] = [];
    for (let [widget, widgetUpdateStream] of renderedOutput) {
      widgets.push(widget);
      childSubs.push(widgetUpdateStream ? widgetUpdateStream.subscribe(updateStream) : null);
    }
    const selectionCmdOutput = await this.getCurrentSelectionCmd.execute();
    this._trackListCmdOutput(listCmdOutput, itemsNode, updateStream, childSubs);
    // TODO: sanity check listCmdOutput.type === selectionCmdOutput.type
    if (selectionCmdOutput instanceof DynamicValueRecord) {
      selectionCmdOutput.observable.subscribe(newSelection => {
        updateStream.next([{
          op: PatchOperation.ReplaceValue,
          path: [...outputNode.path, 'selectionIndex'],
          value: listItems.indexOf(newSelection)
        }]);
      });
    }
    return [
      {
        kind: WidgetKind.Dropdown,
        path: outputNode.path,
        id: this.id, label: this.label, items: widgets,
        selectionIndex: listItems.indexOf(selectionCmdOutput.value)
      },
      updateStream
    ];
  }

  async handleEvent(event: WidgetEvent): Promise<void> {
    if (event.kind === WidgetEventKind.DidSelectDropdownItem) {
      if (Number.isSafeInteger(event.itemIndex)) {
        const presentation = this._listItemPresentations[event.itemIndex];
        if ((event.itemId !== undefined) && (event.itemId !== presentation.id)) {
          // TODO: should probably log a warning
          return;
        }
        await this.selectCmd.execute(presentation.appObject);
      } else {
        throw new Error(`${event.itemIndex} is not a valid array index.`);
      }
    }
  }

  private _trackListCmdOutput(
    listCmdOutput: ArrayOutputRecord<TItem>, outputNode: PresentationOutputNode,
    updateStream: Subject<WidgetPatch>, childSubs: Subscription[]): void {
    // emit updates for the current selection or new/removed list items
    if (!(listCmdOutput instanceof DynamicArrayRecord)) {
      return;
    }
    // process each change one at a time, in sequence
    listCmdOutput.observable
    .concatMap<WidgetPatch>(change => Observable.defer(
      async (): Promise<WidgetPatch> => {
        if (change.type === 'update') {
          if (childSubs[change.index]) {
            childSubs[change.index].unsubscribe();
            childSubs[change.index] = null;
          }
          const presentation = this.presenter.present<TItem, IDropdownItem>(
            change.newValue, listCmdOutput.type, WidgetKind.DropdownItem
          );
          const [widget, widgetUpdateStream] = await presentation.render(
            outputNode.getChildAt(change.index)
          );
          this._listItemPresentations[change.index] = presentation;
          if (widgetUpdateStream) {
            childSubs[change.index] = widgetUpdateStream.subscribe(updateStream);
          }
          return [{
            op: PatchOperation.ReplaceWidget,
            path: [...outputNode.path, change.index],
            value: widget
          }];
        } else if (change.type === 'splice') {
          if (change.removedCount > 0) {
            for (let i = change.index; i < change.removedCount; ++i) {
              if (childSubs[i]) {
                childSubs[i].unsubscribe();
                childSubs[i] = null;
              }
            }
          }
          if (change.addedCount > 0) {
            const presentations = change.added.map(
              item => this.presenter.present<TItem, IDropdownItem>(
                item, listCmdOutput.type, WidgetKind.DropdownItem
              )
            );
            this._listItemPresentations.splice(
              change.index, change.removedCount, ...presentations
            );
            const renderPromises = [];
            for (let i = 0; i < presentations.length; ++i) {
              const promise = presentations[i].render(outputNode.addChildAt(change.index + i));
              renderPromises.push(promise);
            }
            const renderedOutput = await Promise.all(renderPromises);
            const widgets = [];
            for (let i = 0; i < renderedOutput.length; ++i) {
              const [widget, widgetUpdateStream] = renderedOutput[i];
              widgets.push(widget);
              childSubs[change.index + i] = widgetUpdateStream
                ? widgetUpdateStream.subscribe(updateStream) : null;
            }
            return [{
              op: PatchOperation.SpliceWidgetArray,
              path: outputNode.path,
              start: change.index,
              deleteCount: change.removedCount,
              added: widgets
            }];
          } else {
            this._listItemPresentations.splice(change.index, change.removedCount);
            return [{
              op: PatchOperation.SpliceWidgetArray,
              path: outputNode.path,
              start: change.index,
              deleteCount: change.removedCount
            }];
          }
        }
      }
    ))
    .subscribe(patch => updateStream.next(patch));
  }
}
