// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// TODO: This should probably be handled by https://github.com/debugworkbench/workbench-commands
//       but for the time being it's easier to experiment here.

// TODO: Eventually this all needs to work with users typing in commands, but that's a problem for
//       another day.

export interface ICommand {
  execute(...args: any[]): void;
}

export class CommandTable {
  private _commands = new Map</*id:*/string, ICommand>();

  add(cmdId: string, cmd: ICommand): void {
    this._commands.set(cmdId, cmd);
  }

  findCommandById(cmdId: string): ICommand {
    return this._commands.get(cmdId);
  }
}
