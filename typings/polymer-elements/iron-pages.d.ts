// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// iron-pages v1.0.4 <https://github.com/PolymerElements/iron-pages>

/// <reference path="../polymer/polymer.d.ts" />
/// <reference path="./iron-resizable-behavior.d.ts" />
/// <reference path="./iron-selector.d.ts" />

declare namespace PolymerElements {
	interface IronPages extends polymer.Base, IronResizableBehavior, IronSelectableBehavior {
    // NOTE: activateEvent property is explicitely set to null to disable the corresponding event
	}
}
