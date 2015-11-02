// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./iron-selector.d.ts" />
/// <reference path="./iron-a11y-keys-behavior.d.ts" />

declare namespace PolymerElements {
    interface IronMenuBehaviorImpl {
        // Properties that can be bound to
        
        /** Currently focused item (read-only). */
        focusedItem: Object;
        /**
         * Name of the attribute on menu items that contains the item title (to display in the menu),
         * defaults to the `textContent` of a menu item.
         */
        attrForItemTitle: string;
        
        select(value: string | number): void;
    }
    interface IronMenuBehavior extends IronMultiSelectableBehavior, IronA11yKeysBehavior, IronMenuBehaviorImpl {
    }
}

declare namespace polymer {
    interface Global {
        IronMenuBehaviorImpl: PolymerElements.IronMenuBehaviorImpl;
        IronMenuBehavior: PolymerElements.IronMenuBehavior;
    }
}
