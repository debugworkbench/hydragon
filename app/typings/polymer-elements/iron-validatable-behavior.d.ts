// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />

declare namespace PolymerElements {
	/** Used to implement an element that validates user input. */
    interface IronValidatableBehavior {
		// Properties that can be bound to
		
		/** Defaults to `validator`. */
		validatorType: string;
		/** Name of validator to use. */
		validator: string;
		/** `true` if the last call to [[validate]] returned `false`. */
		invalid: boolean;
		
		/** @return `true` if the [[validator]] is exists. */
		hasValidator(): boolean;
		/** @return `true` if the given value is valid, or `false` otherwise. */
		validate(value: any): boolean;
    }
}

declare namespace polymer {
    interface Global {
        IronValidatableBehavior: PolymerElements.IronValidatableBehavior;
    }
}
