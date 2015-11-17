export interface ILayoutContainer {
  curWidth: number;
  curHeight: number;

  calculateSize(): void;
  adjustWidth(delta: number): void;
  adjustHeight(delta: number): void;
  updateStyle(): void;
}
