// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

export type CSSVarMap = { [index: string]: any };

/**
 * Set/update CSS variables on a Polymer-based custom element.
 *
 * @param element Custom element to update CSS variables on.
 * @param vars CSS variables to set, this should be an object in the following format:
 *             {
 *               '--my-css-var': 'rgb(0, 0, 0)',
 *               '--my-css-mixin-var': {
 *                 '--my-nested-css-var': '10px',
 *                 '--my-other-nested-css-var': 'none'
 *               }
 *             }
 * @note Currently only one level of nesting is supported in CSS variables.
 */
export function updatePolymerCSSVars(element: polymer.Base<any>, vars: CSSVarMap): void {
  element.updateStyles(flattenNestedCSSVars(vars));
}

/**
 * Flatten nested CSS variables, for example given an object in this format:
 * {
 *   '--my-css-var': 'rgb(0, 0, 0)',
 *   '--my-css-mixin-var': {
 *     '--my-nested-css-var': '10px',
 *     '--my-other-nested-css-var': 'none'
 *   }
 * }
 *
 * this function will return an object in this format:
 * {
 *   '--my-css-var': 'rgb(0, 0, 0)',
 *   '--my-css-mixin-var': '--my-nested-css-var:10px;--my-other-nested-css-var:none;'
 *   }
 * }
 *
 * @note Currently only one level of nesting is supported.
 */
function flattenNestedCSSVars(vars: CSSVarMap): { [index: string]: string } {
  const flattenedVars: { [index: string]: string } = {};
  for (const varName of Object.keys(vars)) {
    const value = vars[varName];
    if (typeof value === 'string') {
      flattenedVars[varName] = value;
    } else if (typeof value === 'object') {
      let flatValue = '';
      for (const nestedVarName of Object.keys(value)) {
        flatValue += `${nestedVarName}:${value[nestedVarName]};`;
      }
      flattenedVars[varName] = flatValue;
    }
  }
  return flattenedVars;
}
