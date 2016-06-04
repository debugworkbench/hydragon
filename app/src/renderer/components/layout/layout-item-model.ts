// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subject, Subscription } from '@reactivex/rxjs';
import { observable } from 'mobx';
import { LayoutContainerModel } from './layout-container-model';

/**
 * Base class for layout container and panel models.
 */
export abstract class LayoutItemModel {
  /** Unique identifier. */
  id: string;
  width: string;
  height: string;
  resizable: boolean;
  /**
   * The size of the item along the main axis of its container.
   * The main axis size of an item in a vertical layout container will correspond to the height of
   * the item, whereas the main axis size of an item in a horizontal layout container will
   * correspond to the width of the item. The initial value of this property will be determined
   * by the browser's layout engine.
   */
  @observable
  mainAxisSize: string = null;
  /**
   * Stream that will yield a `null` value whenever the size of the element bound to this model
   * may have changed. Elements that perform some computation based on their actual size should
   * rerun those computations whenever this stream yields a value to account for any change in size.
   */
  didResizeStream: Subject<void>;
  protected didResizeStreamSub: Subscription;

  constructor(id: string) {
    this.id = id;
    this.didResizeStream = new Subject<void>();
  }

  dispose(): void {
    if (this.didResizeStreamSub) {
      this.didResizeStreamSub.unsubscribe();
    }
    this.didResizeStream = null;
  }

  onDidAttachToContainer(container: LayoutContainerModel): void {
    // subscribe to the container's resize stream so that the contained elements are notified when
    // the container resizes the element bound to this model or is resized itself
    this.didResizeStreamSub = container.didResizeStream.subscribe(this.didResizeStream);
  }
}
