// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

export function importHref(href: string): Promise<void> {
  // TODO: Check if the browser will dedupe imports or if we need to keep track of all previously
  //       loaded elements to ensure each element is only loaded once.
  return new Promise<void>((resolve, reject) => {
    // TODO: Could probably just replace with the stuff below with this line, it does almost the
    // same thing (though it'll call resolve(event) instead of just resolve()).
    //Polymer.Base.importHref(href, resolve, reject);
    let link = document.createElement('link');
    link.href = href;
    link.rel = 'import';
    link.onload = (event: Event) => resolve();
    link.onerror = (event: Event) => reject(event);
    document.head.appendChild(link);
  });
}

/**
 * Replace an event listener on a DOM element.
 *
 * @param element The DOM element to replace the event listener on.
 * @param event The event to replace the event listener for.
 * @param oldListener The event listener to replace, may be `null` or `undefined`.
 * @param newListener The event listener to replace [[oldListener]] with, may be `null` or
 *                    `undefined`. If [[oldListener]] and [[newListener]] are equivalent no changes
 *                    will be made.
 */
export function replaceEventListener(
  element: HTMLElement, event: string, oldListener: EventListener, newListener: EventListener
): void {
  if (newListener != oldListener) {
    if (oldListener) {
      element.removeEventListener(event, oldListener);
    }
    if (newListener) {
      element.addEventListener(event, newListener);
    }
  }
}
