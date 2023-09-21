import type { GridCellProperty } from './grid';

const gridCellTemplate = document.createElement('template');
gridCellTemplate.innerHTML = /* html */`
<style>
:host {
  position: relative;
  display: flex;
  justify-content: var(--grid-cell-justify-content, flex-start);
  align-items: center;
  min-width: var(--grid-cell-min-width, 50px);
  min-height: var(--grid-cell-min-height, 30px);
  margin: 0;
  padding: var(--grid-cell-padding, 5px 10px);
  box-sizing: border-box;
  cursor: var(--grid-cell-cursor);
  font-weight: var(--grid-cell-font-weight, normal);
  overflow: hidden;
}
:host div {
  white-space: nowrap;
  text-align: left;
}
:host span {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  right: 0px;
  display: block;
  width: 21px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  z-index: 9;
}
:host::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0px;
  display: block;
  width: var(--grid-cell-divider-width, 1px);
  height: var(--grid-cell-divider-height, 100%);
  background: var(--grid-cell-divider-color, #eee);
}
:host(.grid-cell__content) {
  display: inline-block;
}
</style>
<div class="grid-cell__content">
  <slot></slot>
</div>
`;

class GridCell extends HTMLElement {
  grid: GridCellProperty = {
    handle: null,
    isResizeActive: false,
    startX: 0,
    startWidth: 0,
    resizeEvent: null,
    col: 0,
    container: null,
    getColPosition: () => {},
    resizeCell: () => new CustomEvent('grid-cell-resize'),
    setDraggable: () => new CustomEvent('grid-cell-draggable'),
    handleMouseDown: () => {},
    handleMouseMove: () => {},
    handleMouseUp: () => {},
    gridCellClick: () => {},
    gridColumnHeadClick: () => {}
  };

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    (this.shadowRoot as ShadowRoot).appendChild(gridCellTemplate.content.cloneNode(true));

    const cellClickEvent = new CustomEvent('grid-cell-click', {
      bubbles: true,
      composed: true,
      detail: {
        cell: this
      }
    });

    const columnHeadClickEvent = new CustomEvent('grid-column-head-click', {
      bubbles: true,
      composed: true,
      detail: {
        cell: this
      }
    });

    this.grid = {
      handle: null,
      isResizeActive: false,
      startX: 0,
      startWidth: 0,
      resizeEvent: null,
      col: 0,
      container: this.closest('grid-container'),
      getColPosition: () => {
        const parent = this.parentNode;
        if (parent) {
          const siblings = Array.from(parent.querySelectorAll('grid-cell'));
          const position = siblings.indexOf(this);
          this.grid.col = position;
        }
      },
      resizeCell: (width: number) => {
        this.grid.resizeEvent = null; // 메모리 누수 방지
        this.grid.resizeEvent = new CustomEvent('grid-cell-resize', {
          bubbles: true,
          composed: true,
          detail: {
            col: this.grid.col,
            width: width,
            cell: this
          }
        });
        return this.grid.resizeEvent;
      },
      setDraggable: (draggable: boolean) => {
        return new CustomEvent('grid-cell-draggable', {
          bubbles: true,
          composed: true,
          detail: { draggable }
        });
      },
      handleMouseDown: async (e: MouseEvent) => {
        this.grid.isResizeActive = true;
        this.grid.startX = e.clientX;
        this.grid.startWidth = this.clientWidth;

        this.dispatchEvent(this.grid.setDraggable(false));

        window.addEventListener('mousemove', this.grid.handleMouseMove);
        window.addEventListener('mouseup', this.grid.handleMouseUp);
      },
      handleMouseMove: (e: MouseEvent) => {
        if (!this.grid.isResizeActive) return;

        const moved = e.clientX - this.grid.startX;
        const width = this.grid.startWidth + moved;
        this.style.width = `${width}`;

        this.dispatchEvent(this.grid.resizeCell(width));
      },
      handleMouseUp: (e: MouseEvent) => {
        this.grid.isResizeActive = false;

        this.dispatchEvent(this.grid.setDraggable(true));
      },
      gridCellClick: (e: MouseEvent) => {
        this.dispatchEvent(cellClickEvent);
      },
      gridColumnHeadClick: (e: MouseEvent) => {
        this.dispatchEvent(columnHeadClickEvent);
      }
    };
  }

  async connectedCallback() {
    // check if this is a head cell
    new Promise((resolve) => {
      const checkHeadCellEvent = new CustomEvent('grid-head-check', {
        bubbles: true,
        composed: true,
        detail: {
          check: resolve
        }
      });
      this.dispatchEvent(checkHeadCellEvent);
    }).then((isHead) => {
      // if this is a head cell, add the handle
      if (isHead) {
        this.grid.handle = document.createElement('span');
        this.grid.handle.setAttribute('data-cell-handle', '');
        (this.shadowRoot as ShadowRoot).appendChild(this.grid.handle);

        // add handle event listeners
        this.grid.handle.addEventListener('mousedown', this.grid.handleMouseDown);
        this.addEventListener('click', this.grid.gridColumnHeadClick);
      } else {
        this.addEventListener('click', this.grid.gridCellClick);
      }
    });

    // set the initial width
    this.grid.getColPosition();
    const cellConnectEvent = new CustomEvent('grid-cell-connect', {
      bubbles: true,
      composed: true,
      detail: { col: this.grid.col, cell: this }
    });
    this.dispatchEvent(cellConnectEvent);
  }

  disconnectedCallback() {
    const cellDisconnectEvent = new CustomEvent('grid-cell-disconnect', {
      bubbles: true,
      composed: true,
      detail: { col: this.grid.col, cell: this }
    });
    this.grid.container?.dispatchEvent(cellDisconnectEvent);
    
    this.removeEventListener('click', this.grid.gridColumnHeadClick);
    this.removeEventListener('click', this.grid.gridCellClick);
  }
}

customElements.define('grid-cell', GridCell);