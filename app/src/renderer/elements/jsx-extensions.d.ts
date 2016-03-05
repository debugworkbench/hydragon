// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// Extensions to JSX.IntrinsicElements to allow TypeScript to recognize and type check
// custom elements in TSX.

declare namespace JSX {
  interface IntrinsicElements {
    'hydragon-debug-toolbar': {};
    'debug-workbench-splitter': {
      orientation?: 'horizontal' | 'vertical';
      key?: number | string;
    };
    'code-mirror-editor': {
      ref?: any;
    };

    'paper-header-panel': {};
    'paper-toolbar': {
      class?: string;
      ref?: (element: PolymerElements.PaperToolbar) => void;
    };
    'paper-icon-button': __React.HTMLProps<HTMLElement> & {
      class?: string;
      icon?: string;
    };

    webview: {
      src: string;
      ref?: (element: any) => void;
    }
  }
}
