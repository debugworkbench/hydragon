// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext, Cursor } from '../../renderer-context';

function base(element: SplitterElement): polymer.Base {
  return <any> element;
}

class MouseEventHandler {
  constructor(
    private node: Node, private eventName: string, private callback: (event: MouseEvent) => void
  ) {}

  attach(): void {
    this.node.addEventListener(this.eventName, this.callback);
  }

  detach(): void {
    this.node.removeEventListener(this.eventName, this.callback);
  }
}

@pd.is('debug-workbench-splitter')
export class SplitterElement {
  @pd.property({ type: String, value: 'horizontal', reflectToAttribute: true })
  orientation: string; // horizontal or vertical

  private _mouseMoveEventHandler: MouseEventHandler;
  private _mouseUpEventHandler: MouseEventHandler;
  private _lastPageCoord: number;

  static createSync(vertical?: boolean): ISplitterElement {
    return RendererContext.get().elementFactory.createElementSync<ISplitterElement>(
      (<any> SplitterElement.prototype).is,
      vertical
    );
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(vertical?: boolean): void {
    this.orientation = vertical ? 'vertical' : 'horizontal';
  }

  @pd.listener('mousedown')
  private _onMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.orientation === 'vertical') {
      RendererContext.get().overrideCursor(Cursor.HorizontalResize);
      this._lastPageCoord = event.pageX;
    } else {
      RendererContext.get().overrideCursor(Cursor.VerticalResize);
      this._lastPageCoord = event.pageY;
    }

    if (!this._mouseMoveEventHandler) {
      this._mouseMoveEventHandler = new MouseEventHandler(document, 'mousemove', this._onMouseMove.bind(this));
    }
    if (!this._mouseUpEventHandler) {
      this._mouseUpEventHandler = new MouseEventHandler(document, 'mouseup', this._onMouseUp.bind(this));
    }

    this._mouseMoveEventHandler.attach();
    this._mouseUpEventHandler.attach();
  }

  private _onMouseMove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    const prevSibling: ILayoutContainer = <any> Polymer.dom(<any> this).previousElementSibling;

    if (this.orientation === 'vertical') {
      const delta = event.pageX - this._lastPageCoord;
      this._lastPageCoord = event.pageX;
      prevSibling.adjustWidth(delta);
    } else {
      // TODO
    }

    const parent: ILayoutContainer = <any> Polymer.dom(<any> this).parentNode;
    parent.updateStyle();
  }

  private _onMouseUp(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this._mouseMoveEventHandler.detach();
    this._mouseUpEventHandler.detach();
    RendererContext.get().resetCursor();
  }
}

export interface ISplitterElement extends SplitterElement, HTMLElement {
}

export function register(): typeof SplitterElement {
  return Polymer<typeof SplitterElement>(SplitterElement.prototype);
}
