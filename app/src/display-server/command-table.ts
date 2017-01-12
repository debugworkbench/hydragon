// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { OutputRecord } from './output-record';

export type CommandOutputType = OutputRecord<any> | void;

/** A command that takes no arguments. */
export interface ICommand<TOutput extends CommandOutputType> {
  /** Execute the command. */
  execute(): Promise<TOutput>;
}

/** A command that takes one argument. */
export interface ICommand1<TOutput extends CommandOutputType, TInput> {
  execute(arg: TInput): Promise<TOutput>;
}

export type Command<TOutput extends CommandOutputType> = ICommand<TOutput>
  | ICommand1<TOutput, any>;

/**
 * Information about a command in a command table.
 */
export interface ICommandTableEntry {
  /** Name of a command. This is used for command line entry. */
  name: string;
  /** The underlying command that can be executed. */
  command: Command<any>//ICommand<any>;
}

/**
 * A group of related commands.
 *
 * Command tables are a way of grouping a set of related command
 * objects and providing user interfaces to the commands.
 *
 * Command tables can be interacted with via menus, toolbars,
 * keystrokes, gestures and more.
 */
export class CommandTable {
  /** The name of the command table. */
  private _name: string;
  /** Tables inherited by this table. */
  private _inherit: CommandTable[] = [];
  /** Commands in this table. */
  commands: ICommandTableEntry[] = [];

  constructor(name: string, inherit?: CommandTable[]) {
    this._name = name;
    this._inherit = inherit;
  }
}
