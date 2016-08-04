// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import * as mobxReact from 'mobx-react';
import { Card, Progress, ProgressStatus } from 'antd';
import { stylable } from 'app/renderer/components/decorators';
import { IronFlexLayout } from 'app/renderer/components/styles';
import { ReportModel, TestRun, Suite, Test, TestStatus } from './report-model';
import { ContextComponent } from 'app/renderer/components/context';

@mobxReact.observer
export class ReportView extends React.Component<ReportView.IProps, void> {
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

@stylable
@mobxReact.observer
export class TestRunView extends ContextComponent<TestRunView.IProps, void, stylable.IContext> {
  private static _style = {
    boxSizing: 'border-box',
    position: 'relative',
    outline: 'none',
    overflow: 'hidden',
    '.test-run-summary': {
      marginBottom: '10px'
    }
  };

  private _classList: string;

  componentWillMount(): void {
    const clazz = this.constructor as typeof TestRunView;
    const styleId = this.context.freeStyle.registerStyle(clazz._style);
    this._classList = `test-run ${styleId}`;
  }

  render() {
    const testRun = this.props.testRun;
    const suites = testRun.suites;

    return (
      <div className={this._classList}>
        <Card title={testRun.title}>
          <TestRunSummaryView testRun={this.props.testRun} />
          {
            suites.map(suite =>
              <SuiteView key={suite.id} suite={suite} indent={10} />
            )
          }
        </Card>
      </div>
    );
  }
}

export namespace TestRunView {
  export interface IProps {
    testRun: TestRun;
  }
}

const symbols = {
  OK: '✓',
  ERR: '✖'
};

function getTestStatusSymbol(status: TestStatus): string {
  switch (status) {
    case 'failed':
      return symbols.ERR;

    case 'passed':
      return symbols.OK;
  }

  return '';
}

@stylable
@mobxReact.observer
export class SuiteView extends ContextComponent<SuiteView.IProps, void, stylable.IContext> {
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

    const status: TestStatus = (suite.failedTestCount > 0) ? 'failed' : null;

    return (
      <div className={this._classList} style={{ paddingLeft: `${indent}px` }}>
        <div>
          <span className="title">{`${getTestStatusSymbol(status)}${suite.title}`}</span>
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
export class TestView extends ContextComponent<TestView.IProps, void, stylable.IContext> {
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
          <span className="title">{`${getTestStatusSymbol(test.status)}${test.title}`}</span>
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

@stylable
@mobxReact.observer
export class TestRunSummaryView
       extends ContextComponent<TestRunSummaryView.IProps, void, stylable.IContext> {

  private static _style = Object.assign(
    {
      boxSizing: 'border-box',
      position: 'relative',
      outline: 'none',
      overflow: 'hidden'
    },
    IronFlexLayout.horizontal,
    {
      '> ul': {
        paddingLeft: '10px'
      }
    }
  );

  private _classList: string;

  componentWillMount(): void {
    const clazz = (this.constructor as typeof TestRunSummaryView);
    const styleId = this.context.freeStyle.registerStyle(clazz._style);
    this._classList = `test-run-summary ${styleId}`;
  }

  render() {
    const testRun = this.props.testRun;
    const progress = (testRun.passedTestCount / testRun.totalTestCount) * 100;
    let status: ProgressStatus;
    if (testRun.failedTestCount > 0) {
      status = 'exception';
    } else if (progress === 100) {
      status = 'success';
    } else {
      status = 'active';
    }

    return (
      <div className={this._classList}>
        <Progress type="circle" percent={progress} status={status} width={50}></Progress>
        <ul>
          <li>Pending: {testRun.pendingTestCount} / {testRun.totalTestCount}</li>
          <li>Passed: {testRun.passedTestCount} / {testRun.totalTestCount}</li>
          <li>Failed: {testRun.failedTestCount} / {testRun.totalTestCount}</li>
        </ul>
      </div>
    );
  }
}

export namespace TestRunSummaryView {
  export interface IProps {
    testRun: TestRun;
  }
}
