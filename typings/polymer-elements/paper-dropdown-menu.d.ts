// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./iron-behaviors.d.ts" />

declare namespace PolymerElements {
    interface PaperDropdownMenu extends polymer.Base<any>, IronControlState, IronButtonState {
		/**
		 * Derived "label" of the currently selected item, which is either the value
		 * of the `label` property on the selected item, or the trimmed text content of
		 * the selected item.
		 */
		selectedItemLabel: string;
		/** Currently selected item. */
		selectedItem: HTMLElement;
		/** Label for the dropdown. */
		label: string;
		/** Placeholder text for the dropdown. */
		placeholder: string;
		/** `true` when the dropdown is open. */
		opened: boolean;
		/** Set to `true` to disable the floating label for the dropdown, defaults to `false`. */
		noLabelFloat: boolean;
		/** Set to `true` to always float the label for the dropdown, defaults to `false`. */
		alwaysFloatLabel: boolean;
		/** Set to `true` to disable animation of the opening and closing of the dropdown. */
		noAnimations: boolean;

		/** @return Content element that is contained by the dropdown menu, if any. */
		contentElement(): HTMLElement;
		/** Show the dropdown content. */
		open(): void;
		/** Hide the dropdown content. */
		close(): void;
    }
}
