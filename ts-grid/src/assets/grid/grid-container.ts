const gridContainerTemplate = document.createElement('template');
gridContainerTemplate.innerHTML = /* html */`
  <style>
  :host {
    display: block;
    border-top: 1px solid #aaaaaa;
    border-bottom: 1px solid #eeeeee;
    position: relative;
    overflow-x: auto;
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
  #cols: Set<any>[] = [];
  #colWidths: number[] = [];
  #colInitWidths: number[] = [];
  #isInit = false;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    (this.shadowRoot as ShadowRoot).appendChild(gridContainerTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    (this.shadowRoot as ShadowRoot)?.querySelector('slot')?.addEventListener('slotchange', this.#handleSlotChange);
    this.addEventListener(('grid-cell-resize' as any), this.#setGridColumnSize);
    this.addEventListener(('grid-cell-draggable' as any), this.#setGridCellDraggable);
    this.addEventListener(('grid-cell-dblclick' as any), this.#onCellDblClick);
  }

  disconnectedCallback() {
    (this.shadowRoot as ShadowRoot)?.querySelector('slot')?.removeEventListener('slotchange', this.#handleSlotChange);
    this.removeEventListener(('grid-cell-resize' as any), this.#setGridColumnSize);
    this.removeEventListener(('grid-cell-draggable' as any), this.#setGridCellDraggable);
    this.removeEventListener(('grid-cell-dblclick' as any), this.#onCellDblClick);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
  }

  static get observedAttributes() {
    return [];
  }

  adoptedCallback() {
  }

  #handleSlotChange = (e: Event) => {
    if (!this.#isInit) {
      this.#colInitWidths = JSON.parse(JSON.stringify(this.#colWidths));
    }

    const maxColWidth = this.#colInitWidths.reduce((a, b) => a + b, 0);
    const widthRatio = this.#colInitWidths.map(width => width / maxColWidth);

    const maintainWidth = this.clientWidth - this.#colInitWidths.reduce((a, b) => a + b, 0);
    this.#colWidths = this.#colInitWidths.map((width, i) => width + Math.floor(maintainWidth * widthRatio[i]));

    this.#cols.forEach((col, index) => {
      const width = this.#colWidths[index];
      col.forEach(colCell => colCell.style.width = `${width}px`);
    });

    this.#isInit = true;
  }

  #getCellWidth(position: number, width: number) {
    if (!this.#isInit) {
      const currentMax = this.#colWidths[position];
      if (currentMax && width < currentMax) {
        return;
      }
    }

    this.#colWidths[position] = Math.max(50, width);
  }

  #setGridColumnSize = (e: CustomEvent) => {
    const col = e.detail.col;
    const width = e.detail.width;
    const cell = e.detail.cell;

    this.#getCellWidth(col, width);

    if (!this.#cols[col]) this.#cols[col] = new Set();
    this.#cols[col].add(cell);

    this.#cols.forEach((col, index) => {
      const width = this.#colWidths[index];
      col.forEach(colCell => colCell.style.width = `${width}px`);
    });
  }

  #setGridCellDraggable = (e: CustomEvent) => {
    this.style.userSelect = e.detail.draggable ? '' : 'none';
  }

  #onCellDblClick = (e: CustomEvent) => {
    const col = e.detail.col;

    const column = this.#cols[col];
    column.forEach(colCell => {
      colCell.style.width = `${this.#colInitWidths[col]}px`;
    });

    this.#colWidths[col] = JSON.parse(JSON.stringify(this.#colInitWidths[col]));
  }
};

customElements.define('grid-container', GridContainer);