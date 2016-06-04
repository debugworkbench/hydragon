// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

export interface IWorkspaceTheme {
  primaryTextColor: string;
  primaryBackgroundColor: string;
  secondaryTextColor: string;
  /*
  disabledTextColor: string;
  */
  primaryColor: string;
  /*
  lightPrimaryColor: string;
  darkPrimaryColor: string;

  accentColor: string;
  lightAccentColor: string;
  darkAccentColor: string;
  */
}

export const darkWorkspaceTheme: IWorkspaceTheme = {
  primaryTextColor: 'rgb(204, 204, 204)',
  primaryBackgroundColor: 'rgb(37, 37, 38)',
  secondaryTextColor: '#bcbcbc',
  primaryColor: '#3f51b5' //--paper-indigo-500
};
