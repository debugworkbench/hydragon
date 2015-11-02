// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

declare namespace PolymerElements {
    interface IronResizableBehavior {
        /** Notify a resizable and its descendant resizables of a resize change. */
        notifyResize(): void;
        /** Assign the closest resizable ancestor to this resizable. */
        assignParentResizable(parentResizable: HTMLElement): void;
        /** Remove a resizable from the list of resizables that are notified of resize changes. */
        stopResizeNotificationsFor(target: HTMLElement): void;
        /** Overridde to filter nested elements that should or should not be notified. */
        resizerShouldNotify(element: HTMLElement): boolean;
    }
}

declare namespace polymer {
    interface Global {
        IronResizableBehavior: PolymerElements.IronResizableBehavior;
    }
}