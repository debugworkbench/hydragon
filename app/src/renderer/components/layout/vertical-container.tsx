// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { FreeStyle } from 'react-free-style';
import { IronFlexLayout } from '../styles';

export interface IProps extends React.Props<VerticalContainerComponent> {
  width?: string;
  height?: string;
  flex?: string;
  resizable?: boolean;
}

export interface IState {
  children: React.ReactElement<any>[];
}

export interface IContext {
  freeStyle: FreeStyle.FreeStyle;
}

/**
 * Container component that lays out its children along the vertical axis using flex-box.
 *
 * The container's children must either be containers or panels, splitter elements will be
 * automatically injected between resizable children.
 */
export default class VerticalContainerComponent extends React.Component<IProps, IState, IContext> {
  inlineStyle: {
    width?: string;
    height?: string;
    flex?: string;
  } = {};

  styleId: string;
  className: string;

  state: IState = {
    children: []
  };

  static contextTypes: React.ValidationMap<IContext> = {
    freeStyle: React.PropTypes.object.isRequired
  };

  private createSplitters() {
    const children = React.Children
      .toArray(this.props.children)
      .reduce((elements: React.ReactElement<any>[], child: React.ReactChild) => {
        if (React.isValidElement(child)) {
          elements.push(child);
        }
        return elements;
      }, []);

    const allChildren: React.ReactElement<any>[] = [];
    if (children.length) {
      let child = children[0];
      if (child.props.height !== undefined) {
        child = React.cloneElement(child, { key: allChildren.length, flex: `0 0 ${ child.props.height }` });
      }
      allChildren.push(child);
      for (let i = 1; i < children.length; ++i) {
        child = children[i];
        if (child.props.height !== undefined) {
          child = React.cloneElement(child, { key: allChildren.length, flex: `0 0 ${ child.props.height }` });
        }
        // A splitter will explicitely resize the previous sibling, and the browser will resize
        // the following siblings using Flexbox. In order for a splitter to actually work the
        // previous sibling must be resizable, and at least one of the following siblings must
        // be resizable, if this is not the case there's no point in creating the splitter.
        if (children[i - 1].props.resizable && containsResizableElement(children, i)) {
          allChildren.push(<debug-workbench-splitter orientation="horizontal" key={allChildren.length}></debug-workbench-splitter>);
        }
        allChildren.push(child);
      }
    }
    return allChildren;
  }

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        overflow: 'hidden'
      },
      IronFlexLayout.vertical,
      {
        '> *': IronFlexLayout.flex.auto,
        '> debug-workbench-splitter': IronFlexLayout.flex.none
      }
    ));
    this.className = `hydragon-vertical-container ${this.styleId}`;

    if (this.props.width !== undefined) {
      this.inlineStyle.width = this.props.width;
    }
    if (this.props.height !== undefined) {
      this.inlineStyle.height = this.props.height;
    }
    if (this.props.flex !== undefined) {
      this.inlineStyle.flex = this.props.flex;
    }
  }

  render() {
    return <div className={this.className} style={this.inlineStyle}>{this.createSplitters()}</div>;
  }
}

/** @return `true` iff at least one of the elements in the given array has the resizable attribute set. */
function containsResizableElement<T extends { resizable?: boolean }>(
  elements: React.ReactElement<T>[], startIndex: number
): boolean {
  for (let i = startIndex; i < elements.length; ++i) {
    if (elements[i].props.resizable) {
      return true;
    }
  }
  return false;
}
