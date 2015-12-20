// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

export class EventSubscription {
  private _unsubscribe: () => void;

  constructor(unsubscribe: () => void) {
    this._unsubscribe = unsubscribe;
  }

  destroy(): void {
    this._unsubscribe();
    this._unsubscribe = null;
  }
}

export class EventSubscriptionSet {
  private _subscriptions = new Set<EventSubscription>();

  destroy(): void {
    this.clear();
    this._subscriptions = null;
  }

  add(subscription: EventSubscription): void {
    this._subscriptions.add(subscription);
  }

  clear(): void {
    this._subscriptions.forEach((subscription) => {
      subscription.destroy();
    });
    this._subscriptions.clear();
  }
}

export class EventEmitter<T> {
  private _handlersMap = new Map<T, Array<(event: any) => void>>();

  destroy(): void {
    this.clear();
    this._handlersMap = null;
  }

  clear(): void {
    this._handlersMap.clear();
  }

  on(eventId: T, handler: (event: any) => void): EventSubscription {
    let handlers = this._handlersMap.get(eventId);
    if (handlers) {
      handlers.push(handler);
    } else {
      handlers = [handler];
      this._handlersMap.set(eventId, handlers);
    }

    return new EventSubscription(() => {
      const handlers = this._handlersMap.get(eventId);
      if (handlers) {
        handlers.splice(handlers.indexOf(handler), 1);
      }
    });
  }

  emit(eventId: T, event: any): void {
    const handlers = this._handlersMap.get(eventId);
    if (handlers) {
      handlers.forEach((handler) => {
        handler(event);
      });
    }
  }
}
