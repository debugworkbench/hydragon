// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./iron-validatable-behavior.d.ts" />

declare namespace PolymerElements {
	interface IronInput extends polymer.Base<any>, IronValidatableBehavior {
		/** Used instead of `value` when doing two-way data binding. */
		bindValue: string;
		/** Set to `true` to prevent entry of invalid input */
		preventInvalidInput: boolean;
		/** Regexp to match valid input characters. */
		allowedPattern: string;

		/** @return `true` if the current input value is valid, or `false` otherwise. */
		validate(): boolean;
	}
}
