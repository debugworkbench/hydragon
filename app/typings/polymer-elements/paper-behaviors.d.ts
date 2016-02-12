// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./iron-behaviors.d.ts" />

declare namespace PolymerElements {
    interface PaperInkyFocusBehaviorImpl {
    }
	interface PaperInkyFocusBehavior extends IronButtonState, IronControlState, PaperInkyFocusBehaviorImpl {
	}
}

declare namespace polymer {
    interface Global {
        PaperInkyFocusBehaviorImpl: PolymerElements.PaperInkyFocusBehaviorImpl;
        PaperInkyFocusBehavior: PolymerElements.PaperInkyFocusBehavior;
    }
}
