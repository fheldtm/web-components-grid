export interface GridContainerProperty {
  colOriginWidths: number[];
  colWidths: number[];
  cols: Set<HTMLElement>[];
  handleSlotChange: (e: Event) => void;
  getCellWidth: (position: number, width: number, resize: boolean = false) => void;
  setGridColumnSize: (e: CustomEvent) => void;
  setGridCellDraggable: (e: CustomEvent) => void;
  connectCell: (e: CustomEvent) => void;
  disconnectCell: (e: CustomEvent) => void;
}

export interface GridHeadProperty {
  gridHeadCheck: (e: CustomEvent) => void;
}

export interface GridRowProperty {
  gridHeadCheck: (e: CustomEvent) => void;
  gridRowClick: (e: MouseEvent) => void;
}

export interface GridCellProperty {
  handle: HTMLElement | null;
  isResizeActive: booleanl
  startX: number;
  startWidth: number;
  resizeEvent: CustomEvent | null;
  col: number;
  container: HTMLElement | null;
  getColPosition: () => void;
  resizeCell: (width: number, resize: boolean = false) => CustomEvent;
  setDraggable: (draggable: boolean) => CustomEvent;
  handleMouseDown: (e: MouseEvent) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: (e: MouseEvent) => void;
  gridCellClick: (e: MouseEvent) => void;
  gridColumnHeadClick: (e: MouseEvent) => void;
}

export type GridEventType = 'grid-row-click' | 'grid-cell-click' | 'grid-column-head-click';

export interface GridElement extends HTMLElement {
  on: { [key in GridEventType]?: Function; }
};