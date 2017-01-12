// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Observable, Observer } from '@reactivex/rxjs';
import * as mobx from 'mobx';

/**
 * Output record that contains a static value.
 */
export class StaticValueRecord<TValue> {
  /** Application object type of the value stored in the record. */
  readonly type: string;
  /** Value stored in the record. */
  readonly value: TValue;

  constructor(type: string, value: TValue) {
    this.type = type;
    this.value = value;
  }
}

/**
 * Output record that contains a dynamic value that may change over time.
 */
export class DynamicValueRecord<TValue> {
  /** Application object type of the value stored in the record. */
  readonly type: string;
  /** Stream of changes of the value stored in the record. */
  readonly observable: Observable<TValue>;

  private _object: { [index: string]: TValue };
  private _propertyName: string;

  /** @return The current value. */
  get value(): TValue {
    return this._object[this._propertyName];
  }

  /**
   * Construct a new dynamic value record from an observable object property.
   *
   * @param type The application object type of the dynamic value.
   */
  static fromProperty<T, K extends keyof T>(
    type: string, observableObj: T, propertyName: K
  ): DynamicValueRecord<T[K]> {
    return new DynamicValueRecord<T[K]>(type, observableObj, <any>propertyName);
  }

  private constructor(type: string, observableObj: any, propertyName: string) {
    this.type = type;
    this._object = observableObj;
    this._propertyName = propertyName;

    if (mobx.isObservableObject(observableObj)) {
      this.observable = Observable.create((observer: Observer<TValue>) =>
        mobx.observe(<Object>observableObj, propertyName, newValue => observer.next(newValue))
      );
    } else {
      throw new Error('Object is not observable.');
    }
  }
}

/**
 * Output record that contains a static array.
 */
export class StaticArrayRecord<TValue> {
  /** Application object type of the elements in the array stored in the record. */
  readonly type: string;
  /** Array stored in the record. */
  readonly value: ReadonlyArray<TValue>;

  constructor(type: string, value: TValue[]) {
    this.type = type;
    this.value = value;
  }
}

export type DynamicArrayRecordChange<T> = mobx.IArrayChange<T> | mobx.IArraySplice<T>;

/**
 * Output record that contains a dynamic array that may change over time.
 */
export class DynamicArrayRecord<TValue> {
  readonly type: string;
  readonly observable: Observable<DynamicArrayRecordChange<TValue>>;

  private _object: any;
  private _propertyName: string;

  get value(): TValue[] {
    return (this._propertyName !== undefined)
      ? this._object[this._propertyName]
      : this._object;
  }

  static fromProperty<TValue>(
    type: string, observableObj: any, propertyName: string
  ): DynamicArrayRecord<TValue> {
    return new DynamicArrayRecord<TValue>(type, observableObj, propertyName);
  }

  static fromArray<TValue>(
    type: string, observableArray: TValue[]
  ): DynamicArrayRecord<TValue> {
    return new DynamicArrayRecord<TValue>(type, observableArray);
  }

  private constructor(type: string, observableObj: any, propertyName?: string) {
    this.type = type;
    this._object = observableObj;
    this._propertyName = propertyName;

    if (mobx.isObservableArray(observableObj)) {
      this.observable = Observable.create(
        (observer: Observer<DynamicArrayRecordChange<TValue>>) =>
          mobx.observe(observableObj, (change: DynamicArrayRecordChange<TValue>) =>
            observer.next(change)
          )
      );
    } else if (mobx.isObservableObject(observableObj)) {
      this.observable = Observable.create(
        (observer: Observer<DynamicArrayRecordChange<TValue>>) => {
          // observe array for changes (not deeply)
          let disposeArrayObserver = (<mobx.IObservableArray<TValue>>(observableObj[propertyName]))
            .observe(change => observer.next(change));
          mobx.observe<mobx.IObservableArray<TValue>>(observableObj, propertyName,
            (newValue, oldValue) => {
              observer.next({
                type: 'splice',
                object: oldValue,
                index: 0,
                added: mobx.toJS(newValue),
                addedCount: newValue.length,
                removed: mobx.toJS(oldValue),
                removedCount: oldValue.length
              });
              // since the array was swapped out we need to stop observing the old one and start
              // observing the new one
              disposeArrayObserver();
              disposeArrayObserver = newValue.observe(change => observer.next(change));
            }
          )
        }
      );
    } else {
      throw new Error('Object is not observable.');
    }
  }
}

export type ArrayOutputRecord<T> = StaticArrayRecord<T> | DynamicArrayRecord<T>;
export type ValueOutputRecord<T> = StaticValueRecord<T> | DynamicValueRecord<T>;
export type OutputRecord<T> = ValueOutputRecord<T> | ArrayOutputRecord<T>;
