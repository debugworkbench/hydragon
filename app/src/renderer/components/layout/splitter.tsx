// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { Observable, Subscription } from '@reactivex/rxjs';
import { IronFlexLayout } from '../styles';
import { stylable } from '../decorators';
import { SplitterModel } from '../../models/ui';

/**
 * Component that resizes its sibling elements when the user drags it with the primary mouse button.
 */
@stylable
export class SplitterComponent
       extends React.Component<SplitterComponent.IProps, void, SplitterComponent.IContext> {

  private styleId: string;
  private className: string;
  private divElement: HTMLDivElement;
  private mouseDragSub: Subscription;

  private onSetElementRef = (ref: HTMLDivElement) => {
    this.divElement = ref;
    if (!ref && this.mouseDragSub) {
      this.mouseDragSub.unsubscribe();
    }
  }

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
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
    this.className = `hydragon-${this.props.model.orientation}-splitter ${this.styleId}`;
  }

  componentDidMount(): void {
    type Pair = { x: number, y: number };
    const mouseDragStream = Observable.fromEvent<MouseEvent>(this.divElement, 'mousedown')
      // ignore everything but the primary mouse button
      .filter(mouseDownEvent => (mouseDownEvent.button === 0))
      .flatMap<Pair>(mouseDownEvent => {
        mouseDownEvent.stopPropagation();
        mouseDownEvent.preventDefault();

        this.props.onBeginSplitterResize();

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

    this.mouseDragSub = mouseDragStream.subscribe(delta =>
      this.props.adjustSiblingSize(this.props.model, { width: delta.x, height: delta.y })
    );
  }

  componentWillUnmount(): void {
    this.mouseDragSub.unsubscribe();
  }

  render() {
    return <div className={this.className} ref={this.onSetElementRef} />;
  }
}

export namespace SplitterComponent {
  export interface IProps extends React.Props<SplitterComponent> {
    model: SplitterModel;

    adjustSiblingSize(splitter: SplitterModel, delta: { width?: number; height?: number }): void;
    onBeginSplitterResize(): void;
    onEndSplitterResize(): void;
  }

  export interface IContext extends stylable.IContext {
  }
}