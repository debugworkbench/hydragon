import SplitterElement from '../splitter/splitter';
import ElementFactory from '../element-factory';

/** @return `true` iff at least one of the elements in the given array has the resizable attribute set. */
function containsResizableElement(elements: HTMLElement[], startIndex: number): boolean {
  for (let i = startIndex; i < elements.length; ++i) {
    if (elements[i].hasAttribute('resizable')) {
      return true;
    }
  }
  return false;
}

export type ISplittableBehavior = SplittableBehavior;

/**
 * A behavior that can be used to add splitter elements between an element's children.
 */
export class SplittableBehavior extends Polymer.BaseClass() {
  createSplitters(elementFactory: ElementFactory, vertical?: boolean): void {
    // insert splitters between child elements in the light DOM
    const lightDom = Polymer.dom(<any> this);
    const children = lightDom.children;
    if (children.length > 1) {
      for (let i = 1; i < children.length; ++i) {
        // A splitter will explicitely resize the previous sibling, and the browser will resize
        // the following siblings using Flexbox. In order for a splitter to actually work the
        // previous sibling must be resizable, and at least one of the following siblings must
        // be resizable, if this is not the case there's no point in creating the splitter.
        if (children[i - 1].hasAttribute('resizable') && containsResizableElement(children, i)) {
          lightDom.insertBefore(elementFactory.createSplitter(vertical), children[i]);
          ++i; // adjust the iterator to account for the newly inserted splitter element
        }
      }
    }
  }
}
