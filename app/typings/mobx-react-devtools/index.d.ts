// These type definitions are meant to replace the typings that are distributed in the
// mobx-react-devtools package, these type definitions have been adjusted to be compatible with the
// customized React type definitions used in the Hydragon project.

/**
 * Turns a React component or stateless render function into a reactive component.
 */
import React = require('react');

export interface IDevToolProps {
    hightlightTimeout?: number;
    position?: {
        top?:    number | string;
        right?:  number | string;
        bottom?: number | string;
        left?:   number | string;
    }
}

export default class DevTools extends React.Component<IDevToolProps, {}, {}> { }
