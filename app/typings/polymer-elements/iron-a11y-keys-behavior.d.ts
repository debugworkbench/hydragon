// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />

declare namespace PolymerElements {
    interface IronA11yKeysBehavior {
		/** Element that will fire the relevant KeyboardEvents, defaults to `this`. */
		keyEventTarget: HTMLElement;
		
		addOwnKeyBinding(eventString: string, handlerName: string): void;
		removeOwnKeyBindings(): void;
		keyboardEventMatchesKeys(event: KeyboardEvent, eventString: string): boolean;
    }
}

declare namespace polymer {
    interface Global {
        IronA11yKeysBehavior: PolymerElements.IronA11yKeysBehavior;
    }
}
