// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./iron-overlay-behavior.d.ts" />

declare namespace PolymerElements {
    // NOTE: This interface gets merged with the one in iron-overlay-behavior.
    interface IClosingReason {
        /**
         * `true` if the user closed the dialog using an element that has a `dialog-confirm` attribute,
         * `false` if the user closed the dialog using an element that has a `dialog-dismiss` attribute,
         * otherwise `undefined`.
         */
        confirmed: boolean;
    }
    interface PaperDialogBehaviorImpl {
        modal: boolean;
        /** The reason the dialog last closed. */
        closingReason: IClosingReason;
    }
    interface PaperDialogBehavior extends IronOverlayBehavior, PaperDialogBehaviorImpl {
    }
}

declare namespace polymer {
    interface Global {
        PaperDialogBehaviorImpl: PolymerElements.PaperDialogBehaviorImpl;
        PaperDialogBehavior: PolymerElements.PaperDialogBehavior;
    }
}
