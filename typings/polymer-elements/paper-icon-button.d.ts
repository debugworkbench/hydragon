// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./paper-behaviors.d.ts" />

declare namespace PolymerElements {
    interface PaperIconButton extends polymer.Base<any>, PaperInkyFocusBehavior {
		/**
		 * URL of an image for the icon.
		 * If the `src` property is set the `icon` property should not be.
		 */
		src: string;
		/** 
		 * Icon name or index in the set of icons available in the icon's icon set.
		 * If the `icon` property is set the `src` property should not be.
		 */
		icon: string;
		/** Alternate text for the button, for accessibility. */
		alt: string;
    }
}
