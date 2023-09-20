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
      /**
       * TODO : get Cell width 함수인데 많은 기능이 들어가 있음. 분리 필요
       * 현재 들어가 있는 기능
       * - resize 여부에 따라 현재 컬럼의 너비보다 작을 경우 너비를 변경하지 않음
       * - 컬럼의 최소 너비는 50px
       * 
       * - 변경 될 부분 : 현재 컬럼의 길이를 return 하도록
       * - 분리 될 기능 : 최소 너비, resize 여부에 따른 너비 변경
       */
      getCellWidth: (position: number, width: number, resize: boolean = false) => {
        if (resize) {
          const currentColumnWidth = this.grid.colWidths[position];
          if (currentColumnWidth && width < currentColumnWidth) { // 현재 컬럼의 너비보다 작을 경우
            return;
          }
        }

        this.grid.colWidths[position] = Math.max(50, width);
      },
      setGridColumnSize: (e: CustomEvent) => {
        const col = e.detail.col;
        const width = e.detail.width;
        const cell = e.detail.cell;
        const resize = e.detail.resize;

        this.grid.getCellWidth(col, width, resize);

        if (!this.grid.cols[col]) this.grid.cols[col] = new Set();
        this.grid.cols[col].add(cell);

        this.grid.cols.forEach((col, index) => {
          const width = this.grid.colWidths[index];
          col.forEach(colCell => colCell.style.width = `${width}px`);
        });
      },
      setGridCellDraggable: (e: CustomEvent) => {
        this.style.userSelect = e.detail.draggable ? '' : 'none';
      }
    };
  }

  connectedCallback() {
    (this.shadowRoot as ShadowRoot)?.querySelector('slot')?.addEventListener('slotchange', this.grid.handleSlotChange);
    this.addEventListener(('grid-cell-resize' as any), this.grid.setGridColumnSize);
    this.addEventListener(('grid-cell-draggable' as any), this.grid.setGridCellDraggable);
  }

  disconnectedCallback() {
    (this.shadowRoot as ShadowRoot)?.querySelector('slot')?.removeEventListener('slotchange', this.grid.handleSlotChange);
    this.removeEventListener(('grid-cell-resize' as any), this.grid.setGridColumnSize);
    this.removeEventListener(('grid-cell-draggable' as any), this.grid.setGridCellDraggable);
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