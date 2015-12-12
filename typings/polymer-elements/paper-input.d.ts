// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./iron-behaviors.d.ts" />
/// <reference path="./iron-form-element-behavior.d.ts" />
/// <reference path="./iron-input.d.ts" />

declare namespace PolymerElements {
	interface PaperInputBehaviorImpl {
		/** Label for the input. */
		label: string;
		/** Value the input contains. */
		value: string;
		/** Set to `true` to disable the input. */
		disabled: boolean;
		/** `true` when the value is invalid. */
		invalid: boolean;
		/** Set to `true` to prevent the user from entering invalid input. */
		preventInvalidInput: boolean;
		/** Pattern for valid input to be used when [[preventInvalidInput]] is `true`. */
		allowedPattern: string;
		/** Supported types: `text`, `number`, `password`. */
		type: string;
		/** Datalist of the input (if any). */
		list: string;
		/** Pattern to validate the input against. */
		pattern: string;
		/** Set to `true` to mark the input as required. */
		required: boolean;
		/** Message to display when the input is invalid. */
		errorMessage: string;
		/** Set to `true` to display the character counter, defaults to `false`. */
		charCounter: boolean;
		/** Set to `true` to disable the floating label, defaults to `false`. */
		noLabelFloat: boolean;
		/** Set to `true` to always float the label, defaults to `false`. */
		alwaysFloatLabel: boolean;
		/** Set to `true` to auto-validate the input value, defaults to `false`. */
		autoValidate: boolean;
		/** Name of validator to use. */
		validator: string;
		
		// HTMLInputElement attributes that can be bound to
		
		/** Defaults to `off`. */
		autocomplete: string;
		autofocus: boolean;
		inputmode: string;
		minlength: number;
		maxlength: number;
		min: string;
		max: string;
		step: string;
		name: string;
		/** Placeholder string in addition to the label. If set, the label will always float. */
		placeholder: string;
		/** Defaults to `false`. */
		readonly: boolean;
		size: number;
		
		// Non-standard attributes that can be bound to
		
		/** Defaults to `none`. */
		autocapitalize: string;
		/** Defaults to `off`. */
		autocorrect: string;
		
		/** Reference to the underlying input element (can't be bound to). */
		inputElement: PolymerElements.IronInput;
		
		/** Validate the input and set an error style if needed. */
		validate(): void;
		updateValueAndPreserveCaret(newValue: string): void;
	}
	interface PaperInputBehavior extends IronControlState, PaperInputBehaviorImpl {
	}
    interface PaperInput extends polymer.Base<any>, IronFormElementBehavior, PaperInputBehavior, IronControlState {
	}
}

declare namespace polymer {
	interface Global {
		PaperInputBehaviorImpl: PolymerElements.PaperInputBehaviorImpl;
		PaperInputBehavior: PolymerElements.PaperInputBehavior;
	}
}