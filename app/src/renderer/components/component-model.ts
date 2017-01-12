// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import {
  WidgetPath, IWidget, WidgetChange, applyWidgetPatchOpToObject
} from '../../display-server';

/**
 * Base class of all React component model classes.
 */
export class ComponentModel {
  readonly id: string;
  /** Widget path taken from the generic widget description this model was created from. */
  readonly widgetPath: WidgetPath;

  constructor(id: string, widgetPath: WidgetPath) {
    this.id = id;
    this.widgetPath = widgetPath;
  }

  /**
   * Modifies a property of the component model.
   * Subclasses can override this method.
   *
   * @param change A change to the generic widget description this component model was created
   *               from.
   * @param createModel Function that creates a React component model from a generic widget
   *                    description.
   */
  applyWidgetChange(change: WidgetChange, createModel: (widget: IWidget) => ComponentModel): void {
    if (change.path.length > this.widgetPath.length) {
      const property = (<any>this)[change.path[this.widgetPath.length]];
      if (property instanceof ComponentModel) {
        return property.applyWidgetChange(change, createModel);
      } else if (mobx.isObservableArray(property) || Array.isArray(property)) {
        if (change.path.length > (this.widgetPath.length + 1)) {
          const idx = change.path[this.widgetPath.length + 1];
          if (Number.isSafeInteger(idx)) {
            const element = property[idx];
            if (element instanceof ComponentModel) {
              return element.applyWidgetChange(change, createModel);
            }
          }
        }
      }
      const relPath = change.path.slice(this.widgetPath.length);
      applyWidgetPatchOpToObject(this, { ...<any>change, path: relPath }, createModel);
    } else {
      throw new Error('Widget path mismatch.');
    }
  }
}
