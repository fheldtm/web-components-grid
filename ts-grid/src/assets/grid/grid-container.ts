import { GridContainerProperty, GridEventType } from './grid';

const gridContainerTemplate = document.createElement('template');
gridContainerTemplate.innerHTML = /* html */`
  <style>
  :host {
    display: block;
    border: var(--grid-border, 1px solid #aaaaaa);
    border-top: var(--grid-border-top, 1px solid var(--grid-border-color, #aaaaaa));
    border-bottom: var(--grid-border-bottom, 1px solid var(--grid-border-color, #aaaaaa));
    border-left: var(--grid-border-left, 1px solid var(--grid-border-color, #aaaaaa));
    border-right: var(--grid-border-right, 1px solid var(--grid-border-color, #aaaaaa));
    border-radius: var(--grid-border-radius, 5px);
    background: var(--grid-background, #ffffff);
    position: relative;
    overflow: hidden;
    overflow-x: auto;
  }
  :host([column-head-event]) {
    --grid-column-head-cursor: pointer;
  }
  :host([cell-event]) {
    --grid-cell-cursor: pointer;
  }
  :host([row-event]) {
    --grid-row-cursor: pointer;
  }
  .grid-wrap {
    display: inline-block;
    min-width: 100%;
  }
  </style>
  <div class="grid-wrap">
    <slot></slot>
  </div>
`;

class GridContainer extends HTMLElement {
  initialized: boolean = false;
  grid: GridContainerProperty = {
    colOriginWidths: [],
    colWidths: [],
    cols: [],
    handleSlotChange: () => {},
    getCellWidth: () => {},
    setGridColumnSize: () => {},
    setGridCellDraggable: () => {},
    connectCell: () => {},
    disconnectCell: () => {}
  };
  gridEvents: { [key in GridEventType]?: EventListener } = {};

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    (this.shadowRoot as ShadowRoot).appendChild(gridContainerTemplate.content.cloneNode(true));

    this.grid = {
      colOriginWidths: [],
      colWidths: [],
      cols: [],
      handleSlotChange: (e: Event) => {
        if (!this.initialized) {
          this.grid.colWidths = this.grid.cols.map(col => {
            const widths = [...col].map(cell => {
              const width = cell.shadowRoot?.querySelector('.grid-cell__content')?.clientWidth;
              const computedStyle = getComputedStyle(cell);
              const paddingLeft = parseInt(computedStyle.paddingLeft || '0');
              const paddingRight = parseInt(computedStyle.paddingRight || '0');
              return (width ? width : 0) + paddingLeft + paddingRight;
            });
            return Math.max(...widths);
          });

          const maxColWidth = this.grid.colWidths.reduce((a, b) => a + b, 0);
          const widthRatio = this.grid.colWidths.map(width => width / maxColWidth);

          const maintainWidth = this.clientWidth - this.grid.colWidths.reduce((a, b) => a + b, 0);
          this.grid.colWidths = this.grid.colWidths.map((width, i) => width + Math.floor(maintainWidth * widthRatio[i]));

          const lastMargin = this.clientWidth - this.grid.colWidths.reduce((a, b) => a + b, 0);

          this.grid.cols.forEach((col, index) => {
            const width = this.grid.colWidths[index] + (index === this.grid.colWidths.length - 1 ? lastMargin : 0);
            col.forEach(colCell => colCell.style.width = `${width}px`);
          });
        }

        this.initialized = true;
      },
      getCellWidth: (position: number, width: number) => {
        this.grid.colWidths[position] = Math.max(50, width);
      },
      setGridColumnSize: (e: CustomEvent) => {
        const col = e.detail.col;
        const width = e.detail.width;
        const cell = e.detail.cell;

        this.grid.getCellWidth(col, width);

        if (!this.grid.cols[col]) this.grid.cols[col] = new Set();
        this.grid.cols[col].add(cell);

        this.grid.cols.forEach((col, index) => {
          const width = this.grid.colWidths[index];
          col.forEach(colCell => colCell.style.width = `${width}px`);
        });
      },
      setGridCellDraggable: (e: CustomEvent) => {
        this.style.userSelect = e.detail.draggable ? '' : 'none';
      },
      connectCell: (e: CustomEvent) => {
        const cell = e.detail.cell;
        const col = e.detail.col;

        if (!this.grid.cols[col]) this.grid.cols[col] = new Set();
        this.grid.cols[col].add(cell);

        cell.style.width = `${this.grid.colWidths[col]}px`;
      },
      disconnectCell: (e: CustomEvent) => {
        const col = e.detail.col;
        const cell = e.detail.cell;

        this.grid.cols[col].delete(cell);
      },
    };
  }

  connectedCallback() {
    this.shadowRoot!.querySelector('slot')?.addEventListener('slotchange', this.grid.handleSlotChange);
    this.addEventListener(('grid-cell-resize' as any), this.grid.setGridColumnSize);
    this.addEventListener(('grid-cell-draggable' as any), this.grid.setGridCellDraggable);
    this.addEventListener(('grid-cell-connect' as any), this.grid.connectCell);
    this.addEventListener(('grid-cell-disconnect' as any), this.grid.disconnectCell);
  }

  disconnectedCallback() {
    this.shadowRoot!.querySelector('slot')?.removeEventListener('slotchange', this.grid.handleSlotChange);
    this.removeEventListener(('grid-cell-resize' as any), this.grid.setGridColumnSize);
    this.removeEventListener(('grid-cell-draggable' as any), this.grid.setGridCellDraggable);
    this.removeEventListener(('grid-cell-connect' as any), this.grid.connectCell);
    this.removeEventListener(('grid-cell-disconnect' as any), this.grid.disconnectCell);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
  }

  static get observedAttributes() {
    return [];
  }

  adoptedCallback() {
  }

  set on(events: { [key in GridEventType]: Function }) {
    // 기존 이벤트 제거
    Object.entries(this.gridEvents)
      .forEach(([event, callback]: any) => {
        this.removeEventListener((event as GridEventType), callback);
        this.gridEvents[event as GridEventType] = undefined;
      });

    // 새 이벤트 추가
    Object.entries(events)
      .forEach(([event, callback]: any) => {
        this.addEventListener((event as GridEventType), callback);
        this.gridEvents[event as GridEventType] = callback;
      });

    // event 별로 cursor 변경
    this.gridEvents['grid-cell-click'] ? this.setAttribute('cell-event', '') : this.removeAttribute('cell-event');
    this.gridEvents['grid-column-head-click'] ? this.setAttribute('column-head-event', '') : this.removeAttribute('column-head-event');
    this.gridEvents['grid-row-click'] ? this.setAttribute('row-event', '') : this.removeAttribute('row-event');
  }
}

customElements.define('grid-container', GridContainer);