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
    'paper-button': __React.HTMLProps<HTMLElement>;

    'paper-dialog': __React.HTMLProps<HTMLElement> & {
      id?: string;
      modal?: boolean;
      ref?: (element: PolymerElements.PaperDialog) => void;
    };

    'paper-menu': {
      class?: string;
      selected?: string | number;
    };

    'paper-item': __React.HTMLProps<HTMLElement>;

    'paper-toolbar': __React.HTMLProps<HTMLElement> & {
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
