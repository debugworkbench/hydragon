// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// Extensions to JSX.IntrinsicElements to allow TypeScript to recognize and type check
// custom elements in TSX.

//import { IPageSetElement } from './pages/page-set';

declare namespace JSX {
  interface IntrinsicElements {
    'hydragon-debug-toolbar': {};
    'debug-workbench-splitter': {
      orientation?: 'horizontal' | 'vertical';
      key?: number | string;
    };
    'debug-workbench-page-set': {
      style?: any;
      ref?: (element: any/*IPageSetElement*/) => void;
    };
    'debug-workbench-page-tree': {
      style?: any;
      ref?: (element: any/*IPageTreeElement*/) => void;
    };

    'paper-header-panel': {};
    'paper-toolbar': {
      ref?: (element: PolymerElements.PaperToolbar) => void;
    };
  }
}
