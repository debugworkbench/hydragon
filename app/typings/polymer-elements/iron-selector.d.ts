// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// iron-selector v1.0.2 <https://github.com/PolymerElements/iron-selector>

/// <reference path="../polymer/polymer.d.ts" />

declare namespace PolymerElements {
	/** Interface for CustomEvent.detail when CustomEvent.type is `iron-activate`. */
	interface IronActivateEventDetail {
		/** Identifier of the item that will be activated. */
  		selected: string;
		/** The item that will be activated. */
  		item: HTMLElement;
	}
	
	/**
	 * Custom event that's emitted by [[IronSelectableBehavior]] before an item is selected.
	 * To prevent an item from being selected call `preventDefault()` on the event.
	 */
	interface IronActivateEvent extends CustomEvent {
		detail: IronActivateEventDetail;
	}
	
	/** Custom event that's emitted by [[IronSelectableBehavior]] after an item is selected. */
	interface IronSelectEvent extends CustomEvent {
		detail: {
			/** The item that was selected. */
			item: HTMLElement;
		};
	}

	/** Custom event that's emitted by [[IronSelectableBehavior]] after an item is deselected. */
	interface IronDeselectEvent extends CustomEvent {
		detail: {
			/** The item that was deselected. */
			item: HTMLElement;
		};
	}

	interface IronSelectableBehavior {
		// Properties that can be bound to
		
		/**
		 * Name of the attribute on menu items whose value should be used as the item identifier,
		 * defaults to the item index.
		 */
		attrForSelected: string;
		/** 
		 * Identifier of the currently selected item,
		 * by default the index of the item is used as the identifier, this can be changed by
		 * setting [[attrForSelected]].
		 */
		selected: string | number;
		/** Currently selected item (read-only). */
		selectedItem: HTMLElement;
		/** 
		 * Name of the event that should fire when items are selected,
		 * defaults to `tap`.
		 */
		activateEvent: string;
		/**
		 * CSS selector used to match selectable items, items that don't match the selector can't
		 * be selected. By default no selector is set so all items can be selected. 
		 */
		selectable: string;
		/** CSS class to set on items that are selected, defaults to `iron-selected`. */
		selectedClass: string;
		/** Name of attribute to set on items that are selected. */
		selectedAttribute: string;
		
		// Properties that can't be bound to
		
		/** Selectable items (read-only). */
		items: HTMLElement[];
		
		/** @return Index of the given item. */
		indexOf(item: HTMLElement): number;
		/** Select the given value. */
		select(value: string | number): void;
		/** Select the item in [[items]] before the currently selected item. */
		selectPrevious(): void;
		/** Select the item in [[items]] after the currently selected item. */
		selectNext(): void;
	}
	
	interface IronMultiSelectableBehaviorImpl {
		// Properties that can be bound to
		
		/** Set to `true` to allow multiple selections. */
		multi: boolean;
		/** Currently selected values. */
		selectedValues: string[];
		/** Currently selected items (read-only). */
		selectedItems: HTMLElement[];
		
		/** Select the given value, or if [[multi]] is `true` toggle the selected state of the value. */
		select(value: string | number): void;
		/** Observe change in value of [[multi]] property. */
		multiChanged(multi: boolean): void;
	}
	
	interface IronMultiSelectableBehavior extends IronSelectableBehavior, IronMultiSelectableBehaviorImpl {
	}
}

declare namespace polymer {
    interface Global {
		IronSelectableBehavior: PolymerElements.IronSelectableBehavior;
        IronMultiSelectableBehaviorImpl: PolymerElements.IronMultiSelectableBehaviorImpl;
		IronMultiSelectableBehavior: PolymerElements.IronMultiSelectableBehavior;
    }
}
