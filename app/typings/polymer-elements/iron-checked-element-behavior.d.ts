// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />

declare namespace PolymerElements {
  /**
   * Used to implement a custom element that has a `checked` property, which can be used for
   * validation if the element is also `required`. Element instances implementing this behavior
   * will also be registered for use in an `iron-form` element.
   */
  interface IronCheckedElementBehaviorImpl {
    /** Gets or sets the state, `true` is checked and `false` is unchecked. */
    checked: boolean;
    /** If true, the button toggles the active state with each tap or press of the spacebar. */
    toggles: boolean;
    /** Defaults to an empty string. */
    value: string;
  }

  interface IronCheckedElementBehavior
  extends IronFormElementBehavior, IronValidatableBehavior, IronCheckedElementBehaviorImpl {
  }
}

declare namespace polymer {
  interface Global {
    IronCheckedElementBehaviorImpl: PolymerElements.IronCheckedElementBehaviorImpl;
    IronCheckedElementBehavior: PolymerElements.IronCheckedElementBehavior;
  }
}
