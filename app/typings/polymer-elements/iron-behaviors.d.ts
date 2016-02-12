// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./iron-a11y-keys-behavior.d.ts" />

declare namespace PolymerElements {
    interface IronButtonStateImpl {
		/** `true` while the button is being held down. */
		pressed: boolean;
		/** 
		 * `true` if the button toggles the active state every time it's pressed,
		 * defaults to `false`.
		 */
		toggles: boolean;
		/** `true` if the button is a toggle and is currently in the active state. */
		active: boolean;
		/** 
		 * `true` when the element is being held down by a pointer.
		 * A pointer is loosely defined as mouse/touch input, but not keyboard input.
		 */
		pointerDown: boolean;
		/** `true` if the button received focus via keyboard input. */
		receivedFocusFromKeyboard: boolean;
		/** The aria attribute set if the button is a toggle and enters the active state. */
		ariaActiveAttribute: string;
    }
	interface IronButtonState extends IronA11yKeysBehavior, IronButtonStateImpl {
	}
	interface IronControlState {
		/** `true` if the element has input focus, defaults to `false`. */
		focused: boolean;
		/** `true` if the user can't interact with the element, defaults to `false`. */
		disabled: boolean;
	}
}

declare namespace polymer {
    interface Global {
        IronButtonStateImpl: PolymerElements.IronButtonStateImpl;
        IronButtonState: PolymerElements.IronButtonState;
		IronControlState: PolymerElements.IronControlState;
    }
}
