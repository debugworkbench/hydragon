// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// Various Utility Functions

/**
 * Creates a new object that contains all the properties of the [[source]] object except the ones
 * given in [[propsToOmit]]. Note that this function only takes into account own properties of the
 * source object.
 *
 * @param source The object from which properties should be copied.
 * @param propsToOmit The names of properties that should not be copied from the source object.
 * @return A new object that contains the properties that were copied from the source object.
 */
export function omitOwnProps(source: any, propsToOmit: string[]): any {
  const result: any = {};
  Object.getOwnPropertyNames(source).forEach(propertyName => {
    if (propsToOmit.indexOf(propertyName) < 0) {
      result[propertyName] = source[propertyName];
    }
  });
  return result;
}
