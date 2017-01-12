// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as mobx from 'mobx';
import { Observable, Observer } from '@reactivex/rxjs';
import {
  Presenter, Presentation, PresentationOutputNode, WidgetEvent, WidgetKind, IWidget, IWindow,
  IDropdownItem, IDropdown, WindowPresentation, LayoutContainerPresentation, PanelPresentation,
  CommandDropdownPresentation, ICommand, ICommand1, DynamicArrayRecord, DynamicValueRecord,
  WidgetPatch
} from 'app/display-server';
import { ComponentModelFactory } from 'app/renderer/component-model-factory';
import { WindowModel, PanelModel, DropdownModel } from 'app/renderer/components/models';

chai.use(chaiAsPromised);
const expect = chai.expect;

interface IListItem {
  label: string;
}

class SingleSelectionList {
  @mobx.observable
  items: IListItem[];

  @mobx.observable
  selectedItem: IListItem;

  constructor() {
    this.items = [];
    this.selectedItem = null;
  }
}

class ListItemPresentation extends Presentation<IListItem, IDropdownItem> {
  @mobx.observable
  readonly appObject: IListItem;

  constructor(presenter: Presenter, item: IListItem) {
    super(presenter, null);
    this.appObject = item;
  }

  async render(outputNode: PresentationOutputNode): Promise<[IDropdownItem, Observable<WidgetPatch>]> {
    const updateStream = Observable.create(
      (observer: Observer<any>) =>
        mobx.observe(this.appObject, 'label', (newValue: string) => observer.next(newValue)
      )
    );
    outputNode.presentation = this;
    return [
      {
        kind: WidgetKind.DropdownItem,
        path: outputNode.path,
        id: this.id,
        label: this.appObject.label
      },
      updateStream
    ];
  }

  handleEvent(event: WidgetEvent): Promise<void> {
    return Promise.resolve();
  }
}

const listItemTypeName = 'ListItem';

class ListCmd implements ICommand<DynamicArrayRecord<IListItem>> {
  constructor(private _list: SingleSelectionList) {}

  async execute(): Promise<DynamicArrayRecord<IListItem>> {
    return DynamicArrayRecord.fromProperty<IListItem>(listItemTypeName, this._list, 'items');
  }
}

class SelectCmd implements ICommand1<void, IListItem> {
  constructor(private _list: SingleSelectionList) {}

  async execute(item: IListItem): Promise<void> {
    this._list.selectedItem = item;
  }
}

class GetSelectionCmd implements ICommand<DynamicValueRecord<IListItem>> {
  constructor(private _list: SingleSelectionList) {}

  async execute(): Promise<DynamicValueRecord<IListItem>> {
    return DynamicValueRecord.fromProperty(listItemTypeName, this._list, 'selectedItem');
  }
}

function compareDropdownItemsToSourceList(
  dropdown: DropdownModel, sourceList: SingleSelectionList
): void {
  expect(dropdown.items).to.have.lengthOf(sourceList.items.length);
  for (let i = 0; i < dropdown.items.length; ++i) {
    expect(dropdown.items[i].label).to.equal(sourceList.items[i].label);
  }
}

describe('CommandDropdownPresentation', function () {
  this.timeout(0);

  const presenter = new Presenter();
  presenter
    .register(CommandDropdownPresentation, 'Command', WidgetKind.Dropdown)
    .register(ListItemPresentation, listItemTypeName, WidgetKind.DropdownItem);
  const testList = new SingleSelectionList();
  const listCmd = new ListCmd(testList);
  const selectCmd = new SelectCmd(testList);
  const getCurrentSelectionCmd = new GetSelectionCmd(testList);
  const commandDropdown = new CommandDropdownPresentation<IListItem>(presenter, listCmd, {
    id: 'test-dropdown',
    label: 'Dropdown',
    selectCmd,
    getCurrentSelectionCmd
  });
  const testWindow = new WindowPresentation(presenter, {
    id: 'test-window',
    layout: new LayoutContainerPresentation(presenter, {
      id: 'root-layout',
      direction: 'vertical',
      items: [
        new PanelPresentation(presenter, {
          id: 'test-panel',
          items: [commandDropdown]
        })
      ]
    })
  });
  let rootOutputNode: PresentationOutputNode = new PresentationOutputNode(null, []);
  let windowModel: WindowModel = null;

  before(async () => {
    const [renderedWindow, windowUpdateStream] = await testWindow.render(
      rootOutputNode.addChild('test-window')
    );
    const modelFactory = new ComponentModelFactory(event => {});
    windowModel = <WindowModel>modelFactory.createModel(
      JSON.parse(JSON.stringify(renderedWindow))
    );
    windowUpdateStream.subscribe(patch =>
      patch.forEach(change => {
        //debugger;
        windowModel.applyWidgetChange(change, modelFactory.createModel);
      })
    );
  });

  function waitForDropdownItemsToChangeThenVerify(done: () => void): void {
    const dropdown: DropdownModel = (<any>windowModel).layout.items[0].items[0];
    if (mobx.isObservableArray(dropdown.items)) {
      const dispose = dropdown.items.observe(() => {
        compareDropdownItemsToSourceList(dropdown, testList);
        dispose();
        done();
      });
    }
  }

  describe('Effects of changes in list command output', () => {
    it('adds a new item at the bottom of the dropdown @unit', (done: () => void) => {
      waitForDropdownItemsToChangeThenVerify(done);
      testList.items.push({ label: 'Item 1' });
    });

    it('adds multiple items at the bottom of the dropdown @unit', (done: () => void) => {
      waitForDropdownItemsToChangeThenVerify(done);
      testList.items.push({ label: 'Item 2' }, { label: 'Item 3' });
    });

    it('removes an item from the bottom of the dropdown @unit', (done: () => void) => {
      waitForDropdownItemsToChangeThenVerify(done);
      testList.items.pop();
    });

    it('splices items into the dropdown @unit', (done: () => void) => {
      waitForDropdownItemsToChangeThenVerify(done);
      testList.items.splice(1, 1, { label: 'Item 2a' }, { label: 'Item 2b' });
    });

    it('replaces an item in the dropdown @unit', (done: () => void) => {
      waitForDropdownItemsToChangeThenVerify(done);
      testList.items[0] = { label: 'Item 1a' };
    });
  });

  describe('Effects of changes in get current selection command output', () => {
    it('changes the dropdown selection @unit', (done: () => void) => {
      const dropdown: DropdownModel = (<any>windowModel).layout.items[0].items[0];
      const dispose = mobx.observe(dropdown, 'selectedItemIndex', () => {
        expect(dropdown.selectedItemIndex).to.equal(testList.items.indexOf(testList.selectedItem));
        dispose();
        done();
      });
      testList.selectedItem = testList.items[1];
    })
  });

  describe('User input event handling', () => {

  });
});
