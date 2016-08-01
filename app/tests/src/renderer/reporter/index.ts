// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as ReactDOM from 'react-dom';
import * as React from 'react';
import MobxDevToolsComponent from 'mobx-react-devtools';
import * as ReactFreeStyle from 'react-free-style';
import installDevToolsExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { ReportGenerator } from './report-generator';
import { ReportView } from './report-view';

installDevToolsExtension(REACT_DEVELOPER_TOOLS);

const reportGenerator = new ReportGenerator();

const styleRegistry = ReactFreeStyle.create();
const rootContainer = document.createElement('div');
rootContainer.className = 'root-container';
const rootComponent = styleRegistry.component(React.createClass({
  render: () => React.createElement(
    'div', null,
    React.createElement(ReportView, { report: reportGenerator.report }),
    React.createElement(styleRegistry.Element),
    React.createElement(MobxDevToolsComponent)
  )
}));
ReactDOM.render(React.createElement(rootComponent), rootContainer);
document.body.appendChild(rootContainer);
