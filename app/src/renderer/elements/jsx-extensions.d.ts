// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// Extensions to JSX.IntrinsicElements to allow TypeScript to recognize and type check
// custom elements in TSX.

declare namespace JSX {
  interface IntrinsicElements {
    'code-mirror-editor': {
      ref?: any;
    };

    'paper-button': __React.HTMLProps<HTMLElement>;

    'paper-dialog': __React.HTMLProps<HTMLElement> & {
      id?: string;
      modal?: boolean;
      ref?: (element: PolymerElements.PaperDialog) => void;
    };

    'paper-dropdown-menu': __React.HTMLProps<HTMLElement> & {
      id?: string;
      label?: string;
      ref?: (element: PolymerElements.PaperDropdownMenu) => void;
    };

    'paper-input': __React.HTMLProps<HTMLElement> & {
      id?: string;
      label?: string;
      ref?: (element: PolymerElements.PaperInput) => void;
    };

    'paper-header-panel': __React.HTMLProps<HTMLElement>;

    'paper-menu': {
      class?: string;
      selected?: string | number;
    };

    'paper-item': __React.HTMLProps<HTMLElement>;
    'paper-toolbar': __React.HTMLProps<HTMLElement>;
    'paper-icon-button': __React.HTMLProps<HTMLElement>;

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
