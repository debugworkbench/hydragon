// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./paper-behaviors.d.ts" />

declare namespace PolymerElements {
  interface PaperButton extends polymer.Base<any>, PaperButtonBehavior {
    /** If set to `true` the button should be styled with a shadow. */
    raised: boolean;
  }
}
