// Copyright (c) 2015 Vadim Macagon
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
