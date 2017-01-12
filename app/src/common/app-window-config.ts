export interface IAppWindowConfig {
  rootPath: string;
  layout: any;
}

export function encodeToUriComponent(config: IAppWindowConfig): string {
  return encodeURIComponent(JSON.stringify(config));
}

export function decodeFromUriComponent(uriComponent: string): IAppWindowConfig {
  return JSON.parse(decodeURIComponent(uriComponent));
}
