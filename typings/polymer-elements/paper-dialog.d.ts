// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./paper-dialog-behavior.d.ts" />
/// <reference path="./neon-animation.d.ts" />

declare namespace PolymerElements {
    interface PaperDialog extends polymer.Base, PaperDialogBehavior, NeonAnimationRunnerBehavior {
    }
}
