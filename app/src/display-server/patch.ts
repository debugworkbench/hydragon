// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { IWidget, WidgetPath } from './widgets';

export const enum PatchOperation {
  ReplaceWidget = 0,
  ReplaceValue,
  SpliceWidgetArray,
  SpliceValueArray
}

export interface IReplaceValue {
  op: PatchOperation.ReplaceValue;
  path: WidgetPath;
  value: any;
}

export interface IReplaceWidget {
  op: PatchOperation.ReplaceWidget;
  path: WidgetPath;
  value: IWidget;
}

export interface ISpliceValueArray {
  op: PatchOperation.SpliceValueArray;
  path: WidgetPath;
  start: number;
  deleteCount?: number;
  added: any[];
}

export interface ISpliceWidgetArray {
  op: PatchOperation.SpliceWidgetArray;
  path: WidgetPath;
  start: number;
  deleteCount?: number;
  added?: IWidget[];
}


/**
 * A widget patch is an ordered list of changes to be applied to a generic widget description.
 */
export type WidgetChange = IReplaceWidget | IReplaceValue | ISpliceWidgetArray | ISpliceValueArray;
export type WidgetPatch = WidgetChange[];

/**
 * Modifies an object by applying a patch operation to it.
 *
 * @param obj Object to modify.
 * @param change Operation to apply.
 * @param createWidget Function that converts generic widget descriptions to application specific
 *                     objects representing concrete widgets.
 */
export function applyWidgetPatchOpToObject<T>(
  obj: T, change: WidgetChange, createWidget: (widget: IWidget) => T
): void {
  let target: any = obj;
  for (let i = 0; i < change.path.length - 1; ++i) {
    target = target[change.path[i]];
      // TODO: if target is undefined throw an error
  }
  const key = change.path[change.path.length - 1];

  switch (change.op) {
    case PatchOperation.ReplaceWidget:
      target[key] = createWidget(change.value);
      break;
    case PatchOperation.ReplaceValue:
      target[key] = change.value;
      break;
    case PatchOperation.SpliceWidgetArray:
      if (change.added) {
        const added = change.added.map(widget => createWidget(widget));
        target[key].splice(change.start, change.deleteCount, ...added);
      } else {
        target[key].splice(change.start, change.deleteCount);
      }
      break;
    case PatchOperation.SpliceValueArray:
      if (change.added) {
        target[key].splice(change.start, change.deleteCount, ...change.added);
      } else {
        target[key].splice(change.start, change.deleteCount);
      }
      break;
  }
}
