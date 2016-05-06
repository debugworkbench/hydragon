// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// Extensions to JSX.IntrinsicElements to allow TypeScript to recognize and type check
// custom elements in TSX.

declare namespace JSX {
  interface IntrinsicElements {
    'code-mirror-editor': {
      ref?: any;
    };

    'paper-button': any;
    'paper-checkbox': any;
    'paper-dialog': any;
    'paper-dropdown-menu': any;
    'paper-input': any;

    'paper-header-panel': __React.HTMLProps<HTMLElement>;

    'paper-menu': {
      class?: string;
      selected?: string | number;
    };

    'paper-item': __React.HTMLProps<HTMLElement>;
    'paper-toolbar': any;
    'paper-icon-button': any;

    webview: __React.HTMLProps<HTMLElement> & {
      src: string;
      ref?: (element: any) => void;
    };

    template: {
      is?: string;
      items?: string;
    };
  }
}
