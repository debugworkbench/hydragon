// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Observable, Subscription } from '@reactivex/rxjs';
import { WidgetPath, WidgetEvent, WidgetKind, IWidget } from './widgets';
import { WidgetPatch } from './index';

export class PresentationOutputNode {
  readonly parent: PresentationOutputNode;
  readonly path: WidgetPath;
  children: Map<string | number, PresentationOutputNode>;

  private _presentation: Presentation<any, any>;

  set presentation(value: Presentation<any, any>) {
    this._presentation = value;
  }

  get presentation(): Presentation<any, any> {
    return this._presentation || this.parent.presentation;
  }

  constructor(parent: PresentationOutputNode, path: WidgetPath) {
    this.parent = parent;
    this.path = path;
  }

  addChild(key: string): PresentationOutputNode {
    const childNode = new PresentationOutputNode(this, [...this.path, key]);
    if (!this.children) {
      this.children = new Map<string | number, PresentationOutputNode>();
    }
    this.children.set(key, childNode);
    return childNode;
  }

  getChild(key: string): PresentationOutputNode {
    if (this.children) {
      return this.children.get(key);
    }
    return undefined;
  }

  addChildAt(index: number): PresentationOutputNode {
    const childNode = new PresentationOutputNode(this, [...this.path, index]);
    if (!this.children) {
      this.children = new Map<string | number, PresentationOutputNode>();
    }
    this.children.set(index, childNode);
    return childNode;
  }

  getChildAt(index: number): PresentationOutputNode {
    if (this.children) {
      return this.children.get(index);
    }
    return undefined;
  }

  getNodeAtPath(nodePath: Array<string | number>): PresentationOutputNode {
    let node: PresentationOutputNode = this;
    for (let i = 0; i < nodePath.length; ++i) {
      node = node.children.get(nodePath[i])
    }
    return node;
  }
}

/**
 * A presentation constructs a generic UI description (i.e. a widget) of an application object.
 * An application object may have multiple different presentations.
 */
export abstract class Presentation<TAppObject, TWidget extends IWidget> {
  /** The application object this presentation associated with this presentation. */
  abstract readonly appObject: TAppObject;

  constructor(readonly presenter: Presenter, readonly id?: string) {
    // TODO: If an id wasn't provided generate a UUID
  }
  /**
   * Constructs a generic UI description of [[appObject]].
   * @return Plain object that describes a generic widget, and an observable stream that emits
   *         changes to the generic widget. The generic widget object can be directly serialized to
   *         a JSON string.
   */
  abstract render(outputNode: PresentationOutputNode): Promise<[TWidget, Observable<WidgetPatch>]>;
  /**
   * Handles an event generated via user input.
   */
  abstract handleEvent(event: WidgetEvent): Promise<void>;
}

export type ConstructorType<T> = { new(...args: any[]): T };
interface IWidgetPresentationMapping {
  widgetKind: WidgetKind;
  presentationType: ConstructorType<Presentation<any, any>>;
}

export class Presenter {
  private _appObjTypeToWidgetPresentationTypeMap =
    new Map<string, IWidgetPresentationMapping[]>();

  register<TAppObject, TWidget extends IWidget>(
    presentationType: ConstructorType<Presentation<TAppObject, TWidget>>,
    appObjType: string,
    widgetKind: WidgetKind
  ): this {
    const mappings = this._appObjTypeToWidgetPresentationTypeMap.get(appObjType);
    if (mappings) {
      mappings.push({ widgetKind, presentationType });
    } else {
      this._appObjTypeToWidgetPresentationTypeMap.set(
        appObjType, [{ widgetKind, presentationType }]
      );
    }
    return this;
  }

  present<TAppObject, TWidget extends IWidget>(
    appObject: any, appObjectType: string, widgetKind: WidgetKind, options?: any
  ): Presentation<TAppObject, TWidget> {
    // FIXME: If no mapping is found for appObjType should also check for mappings for ancestors
    // of appObjType.
    const mappings = this._appObjTypeToWidgetPresentationTypeMap.get(appObjectType);
    const mapping = mappings.find(mapping => mapping.widgetKind === widgetKind);
    return new mapping.presentationType(this, appObject, options);
  }
}
