// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import * as mobxReact from 'mobx-react';
import { stylable } from 'app/renderer/components/decorators';
import { IronFlexLayout } from 'app/renderer/components/styles';
import { ReportModel, TestRun, Suite, Test } from './report-model';

@mobxReact.observer
export class ReportView extends React.Component<ReportView.IProps, {}, {}> {
  render() {
    const report = this.props.report;

    return (
      <div>{
        report.testRuns.map(testRun =>
          <TestRunView key={testRun.id} testRun={testRun} />
        )
      }</div>
    );
  }
}

export namespace ReportView {
  export interface IProps {
    report: ReportModel;
  }
}

@mobxReact.observer
export class TestRunView extends React.Component<TestRunView.IProps, {}, {}> {
  render() {
    const suites = this.props.testRun.suites;

    return (
      <div>
        <TestRunSummaryView testRun={this.props.testRun} />
        {
          suites.map(suite =>
            <SuiteView key={suite.id} suite={suite} indent={10} />
          )
        }
      </div>
    );
  }
}

export namespace TestRunView {
  export interface IProps {
    testRun: TestRun;
  }
}

@stylable
@mobxReact.observer
export class SuiteView extends React.Component<SuiteView.IProps, {}, stylable.IContext> {
  private static _style = Object.assign(
    {
      boxSizing: 'border-box',
      position: 'relative',
      outline: 'none',
      overflow: 'hidden'
    },
    IronFlexLayout.vertical,
    {
      '> div:first-child': Object.assign(
        {
          flex: '1 0 auto',
          '.title': {
            flex: '1 0 auto'
          }
        },
        IronFlexLayout.horizontal,
        IronFlexLayout.center
      ),
      '> div:last-child': Object.assign(
        {
          flex: '1 0 auto'
        },
        IronFlexLayout.vertical
      )
    }
  );

  private _classList: string;

  componentWillMount(): void {
    const clazz = this.constructor as typeof SuiteView;
    const styleId = this.context.freeStyle.registerStyle(clazz._style);
    this._classList = `suite ${styleId}`;
  }

  render() {
    const { suite, indent } = this.props;
    const innerSuites: JSX.Element[] = suite.suites.map(s =>
      <SuiteView key={s.id} suite={s} indent={indent} />
    );
    const tests = suite.tests.map(t =>
      <TestView key={t.id} test={t} indent={indent} />
    );

    return (
      <div className={this._classList} style={{ paddingLeft: `${indent}px` }}>
        <div>
          <span className="title">{suite.title}</span>
        </div>
        <div>{ (innerSuites.length > 0) ? innerSuites : tests }</div>
      </div>
    );
  }
}

export namespace SuiteView {
  export interface IProps {
    suite: Suite;
    indent: number;
  }
}

@stylable
@mobxReact.observer
export class TestView extends React.Component<TestView.IProps, {}, stylable.IContext> {
  private static _style = Object.assign(
    {
      boxSizing: 'border-box',
      position: 'relative',
      outline: 'none',
      overflow: 'hidden'
    },
    IronFlexLayout.vertical,
    {
      '> div:first-child': Object.assign(
        {
          flex: '1 0 auto',
          '.title': {
            flex: '1 0 auto'
          }
        },
        IronFlexLayout.horizontal,
        IronFlexLayout.center
      ),
      '> div:last-child': Object.assign(
        {
          flex: '1 0 auto'
        },
        IronFlexLayout.vertical
      )
    }
  );

  private _classList: string;

  componentWillMount(): void {
    const clazz = (this.constructor as typeof TestView);
    const styleId = this.context.freeStyle.registerStyle(clazz._style);
    this._classList = `suite ${styleId}`;
  }

  render(): JSX.Element {
    const { test, indent } = this.props;
    // nested tested may come from disparate suites so they might have the same id,
    // but React will complain if the children of a component have duplicate keys
    // so instead of using the ids as keys just use the index
    let idx = 0;
    const innerTests = test.tests.map(innerTest =>
      <TestView key={idx++} test={innerTest} indent={indent} />
    );

    return (
      <div className={this._classList} style={{ paddingLeft: `${indent}px` }}>
        <div>
          <span className="title">{test.title}</span>
        </div>
        <div>{ (innerTests.length > 0) ? innerTests : null }</div>
      </div>
    );
  }
}

export namespace TestView {
  export interface IProps {
    test: Test;
    indent: number;
  }
}

@mobxReact.observer
export class TestRunSummaryView extends React.Component<TestRunSummaryView.IProps, {}, {}> {
  render() {
    const testRun = this.props.testRun;

    return (
      <div>
        <div>Pending: {testRun.pendingTestCount}</div>
        <div>Passed: {testRun.passedTestCount}</div>
        <div>Failed: {testRun.failedTestCount}</div>
      </div>
    );
  }
}

export namespace TestRunSummaryView {
  export interface IProps {
    testRun: TestRun;
  }
}
