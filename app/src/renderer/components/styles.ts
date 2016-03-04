// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/**
 * Style mixins for flex-box layouts based on https://github.com/PolymerElements/iron-flex-layout/
 * The naming should remain consistent with Polymer's implementation, but cross-browser support is
 * irrelevant, these just need to work in Electron.
 */
export var IronFlexLayout = {
  /** Flex container with a horizontal main-axis. */
  horizontal: {
    display: 'flex',
    'flex-direction': 'row'
  },
  /** Flex container with a vertical main-axis. */
  vertical: {
    display: 'flex',
    'flex-direction': 'column'
  },
  /**
   * Shorthand for specifying how a flex item should alter its dimensions to fill available space
   * in a flex container.
   */
  flex: {
    /** flex: 1 1 auto */
    auto: {
      flex: '1 1 auto'
    },
    /** flex: none */
    none: {
      flex: 'none'
    }
  },

  /* alignment in cross axis */

  start: {
    'align-items': 'flex-start'
  },
  center: {
    'align-items': 'center'
  },
  end: {
    'align-items': 'flex-end'
  },

  fit: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
};

/**
 * Style mixins based on https://github.com/PolymerElements/paper-styles/
 */
export var PaperStyles = {
  /* Typography */
  PaperFont: {
    /* Shared styles */
    Common: {
      Base: {
        'font-family': "'Roboto', 'Noto', sans-serif",
        '-webkit-font-smoothing': 'antialiased'
      }
    }
  }
};
