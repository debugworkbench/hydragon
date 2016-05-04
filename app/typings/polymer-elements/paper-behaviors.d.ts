// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./iron-behaviors.d.ts" />
/// <reference path="./iron-checked-element-behavior.d.ts" />

declare namespace PolymerElements {
    interface PaperCheckedElementBehaviorImpl {
        /** Defaults to `'aria-checked'`. */
        ariaActiveAttribute: string;
    }

    interface PaperCheckedElementBehavior
    extends PaperInkyFocusBehavior, IronCheckedElementBehavior, PaperCheckedElementBehaviorImpl {
    }

    interface PaperInkyFocusBehaviorImpl {
    }

	interface PaperInkyFocusBehavior extends IronButtonState, IronControlState, PaperInkyFocusBehaviorImpl {
	}
}

declare namespace polymer {
    interface Global {
        PaperCheckedElementBehaviorImpl: PolymerElements.PaperCheckedElementBehaviorImpl;
        PaperCheckedElementBehavior: PolymerElements.PaperCheckedElementBehavior;
        PaperInkyFocusBehaviorImpl: PolymerElements.PaperInkyFocusBehaviorImpl;
        PaperInkyFocusBehavior: PolymerElements.PaperInkyFocusBehavior;
    }
}
