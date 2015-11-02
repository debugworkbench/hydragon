// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />

declare namespace PolymerElements {
	/** Enables a custom element to be included in an `iron-form`. */
    interface IronFormElementBehavior {
		name: string;
		value: string;
		/** Set to `true` to mark the input as required, defaults to `false`. */
		required: boolean;
	}
}

declare namespace polymer {
	interface Global {
		IronFormElementBehavior: PolymerElements.IronFormElementBehavior;
	}
}
