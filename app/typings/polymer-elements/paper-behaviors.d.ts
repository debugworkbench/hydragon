// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./iron-behaviors.d.ts" />
/// <reference path="./iron-checked-element-behavior.d.ts" />

declare namespace PolymerElements {
    interface PaperButtonBehaviorImpl {
        /**
         * The z-depth of this element, from 0-5, defaults to 1.
         * Setting to 0 will remove the shadow, and each increasing number greater than 0 will be
         * "deeper" than the last.
         */
        elevation: number;
    }

    interface PaperButtonBehavior
    extends IronButtonState, IronControlState, PaperRippleBehavior, PaperButtonBehaviorImpl {
    }

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

    interface PaperRippleBehavior {
        /**
         * If `true`, the element will not produce a ripple effect when interacted
         * with via the pointer.
         */
        noink: boolean;
        /**
         * Ensures this element contains a ripple effect. For startup efficiency
         * the ripple effect is dynamically on demand when needed.
         * @param triggeringEvent Event that triggered the ripple.
         */
        ensureRipple(triggeringEvent?: any): void;
        /**
         * Returns the `<paper-ripple>` element used by this element to create
         * ripple effects. The element's ripple is created on demand, when
         * necessary, and calling this method will force the
         * ripple to be created.
         */
        getRipple(): any; /* PaperRipple */
        /** @return `true` if this element currently contains a ripple effect. */
        hasRipple(): boolean;
    }
}

declare namespace polymer {
    interface Global {
        PaperButtonBehaviorImpl: PolymerElements.PaperButtonBehaviorImpl;
        PaperButtonBehavior: PolymerElements.PaperButtonBehavior;
        PaperCheckedElementBehaviorImpl: PolymerElements.PaperCheckedElementBehaviorImpl;
        PaperCheckedElementBehavior: PolymerElements.PaperCheckedElementBehavior;
        PaperInkyFocusBehaviorImpl: PolymerElements.PaperInkyFocusBehaviorImpl;
        PaperInkyFocusBehavior: PolymerElements.PaperInkyFocusBehavior;
        PaperRippleBehavior: PolymerElements.PaperRippleBehavior;
    }
}
