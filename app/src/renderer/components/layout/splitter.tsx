// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { Observable, Subscription } from '@reactivex/rxjs';
import { IronFlexLayout } from '../styles';
import { stylable } from '../decorators';
import { SplitterModel } from './splitter-model';
import { ContextComponent } from '../context';

/**
 * A splitter directly resizes the sibling element that precedes it when the user drags the
 * splitter with the primary mouse button. Splitters can only be placed in layout containers
 * between layout containers and panels.
 */
@stylable
export class SplitterComponent
       extends ContextComponent<SplitterComponent.IProps, void, SplitterComponent.IContext> {

  private _styleId: string;
  private _className: string;
  private _divElement: HTMLDivElement;
  private _mouseDragSub: Subscription;

  private onSetElementRef = (ref: HTMLDivElement) => {
    this._divElement = ref;
    if (!ref && this._mouseDragSub) {
      this._mouseDragSub.unsubscribe();
    }
  }

  componentWillMount(): void {
    this._styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        backgroundColor: 'transparent',
        zIndex: '1000'
      },
      IronFlexLayout.flex.none,
      {
        '&.hydragon-horizontal-splitter': {
          width: 'auto',
          height: '4px',
          marginLeft: '0px',
          marginRight: '0px',
          marginTop: '-2px',
          marginBottom: '-2px'
        },
        '&.hydragon-vertical-splitter': {
          width: '4px',
          height: 'auto',
          marginLeft: '-2px',
          marginRight: '-2px',
          marginTop: '0px',
          marginBottom: '0px'
        },
        '&.hydragon-horizontal-splitter:hover': {
          cursor: 'ns-resize'
        },
        '&.hydragon-vertical-splitter:hover': {
          cursor: 'ew-resize'
        }
      }
    ));
    this._className = `hydragon-${this.props.model.orientation}-splitter ${this._styleId}`;
  }

  componentDidMount(): void {
    type Pair = { x: number, y: number };
    const mouseDragStream = Observable.fromEvent<MouseEvent>(this._divElement, 'mousedown')
      // ignore everything but the primary mouse button
      .filter(mouseDownEvent => (mouseDownEvent.button === 0))
      .flatMap<Pair>(mouseDownEvent => {
        mouseDownEvent.stopPropagation();
        mouseDownEvent.preventDefault();

        this.props.onBeginSplitterResize(
          (this.props.model.orientation === 'vertical') ? 'horizontal' : 'vertical'
        );

        const mouseUpStream = Observable.fromEvent<MouseEvent>(document, 'mouseup')
          .take(1)
          .map(mouseUpEvent => this.props.onEndSplitterResize());

        let prevPos = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };
        return Observable.fromEvent<MouseEvent>(document, 'mousemove')
          .map(mouseMoveEvent => {
            const delta = {
              x: mouseMoveEvent.pageX - prevPos.x,
              y: mouseMoveEvent.pageY - prevPos.y
            };
            prevPos = { x: mouseMoveEvent.pageX, y: mouseMoveEvent.y };
            return delta;
          })
          .takeUntil(mouseUpStream);
      });

    this._mouseDragSub = mouseDragStream.subscribe(delta =>
      this.props.adjustElementSize(this.props.model.resizeeId, { width: delta.x, height: delta.y })
    );
  }

  componentWillUnmount(): void {
    this._mouseDragSub.unsubscribe();
  }

  render() {
    return <div className={this._className} ref={this.onSetElementRef} />;
  }
}

export namespace SplitterComponent {
  export interface IProps extends React.Props<SplitterComponent> {
    model: SplitterModel;
    adjustElementSize(id: string, delta: { width?: number; height?: number }): void;
    onBeginSplitterResize(direction: 'vertical' | 'horizontal'): void;
    onEndSplitterResize(): void;
  }

  export interface IContext extends stylable.IContext {
  }
}
