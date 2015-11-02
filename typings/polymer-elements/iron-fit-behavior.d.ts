// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />

declare namespace PolymerElements {
    interface IronFitBehavior {
        sizingTarget: HTMLElement;
        fitInto: HTMLElement;
        autoFitOnAttach: boolean;
        
        /** Fit and optionally center the element in the window, or `fitInfo` (if specified). */
        fit(): void;
        /** Reset the target element position and size constraints. */
        resetFit(): void;
        /** Equivalent to calling [[resetFit]] and [[fit]]. */
        refit(): void;
        /** Constrain the size of the element to the window, or `fitInfo` (if specified). */
        constrain(): void;
        /** Center horizontally and vertically if not already positioned, also set `position:fixed`. */
        center(): void;
    }
}

declare namespace polymer {
    interface Global {
        IronFitBehavior: PolymerElements.IronFitBehavior;
    }
}
