const template = document.createElement('template');
template.innerHTML = /* html */`
<style>
:host {
  position: relative;
  display: flex;
  justify-content: var(--grid-cell-justify-content, flex-start);
  align-items: center;
  min-width: 50px;
  margin: 0;
  padding: var(--grid-cell-padding, 5px 10px);
  box-sizing: border-box;
}
:host div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  width: 1px;
  height: 100%;
  background: var(--grid-cell-border-color, #eee);
}
</style>
<div>
  <slot></slot>
</div>
`;

class GridCell extends HTMLElement {
  #handle;
  #isResizeActive = false;
  #startX = 0;
  #startWidth = 0;
  #resizeEvent = null;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.col = -1;
  }

  async connectedCallback() {
    // check if this is a head cell
    new Promise((resolve) => {
      const checkHeadCellEvent = new CustomEvent('grid-head-check', {
        bubbles: true,
        composed: true,
        detail: {
          check: resolve,
        },
      });
      this.dispatchEvent(checkHeadCellEvent);
    }).then((isHead) => {
      // if this is a head cell, add the handle
      if (isHead) {
        this.#handle = document.createElement('span');
        this.#handle.setAttribute('data-cell-handle', '');
        this.shadowRoot.appendChild(this.#handle);

        // add handle event listeners
        this.#handle.addEventListener('mousedown', this.#handleMouseDown);
        this.#handle.addEventListener('dblclick', this.#handleDblClick);
      }
    });

    // set the initial width
    const width = this.clientWidth + 1;
    this.#getColPosition();
    this.dispatchEvent(this.#resizeCell(width));
  }

  #getColPosition() {
    const parent = this.parentNode;
    if (parent) {
      const siblings = Array.from(parent.querySelectorAll('grid-cell'));
      const position = siblings.indexOf(this);
      this.col = position;
    }
  }

  #resizeCell(width) {
    this.#resizeEvent = null; // 메모리 누수 방지
    this.#resizeEvent = new CustomEvent('grid-cell-resize', {
      bubbles: true,
      composed: true,
      detail: {
        col: this.col,
        width: width,
        cell: this
      }
    });
    return this.#resizeEvent;
  }

  #setDraggable(draggable) {
    return new CustomEvent('grid-cell-draggable', {
      bubbles: true,
      composed: true,
      detail: { draggable }
    });
  }

  #handleMouseDown = async (e) => {
    this.#isResizeActive = true;
    this.#startX = e.clientX;
    this.#startWidth = this.clientWidth;

    this.dispatchEvent(this.#setDraggable(false));

    window.addEventListener('mousemove', this.#handleMouseMove);
    window.addEventListener('mouseup', this.#handleMouseUp);
  }

  #handleMouseMove = (e) => {
    if (!this.#isResizeActive) return;

    const moved = e.clientX - this.#startX;
    const width = this.#startWidth + moved;
    this.style.width = width;

    this.dispatchEvent(this.#resizeCell(width));
  }

  #handleMouseUp = (e) => {
    this.#isResizeActive = false;

    this.dispatchEvent(this.#setDraggable(true));
  }

  #dblClick = (e) => {
    return new CustomEvent('grid-cell-dblclick', {
      bubbles: true,
      composed: true,
      detail: {
        col: this.col,
      }
    })
  }

  #handleDblClick = (e) => {
    this.dispatchEvent(this.#dblClick());
  }
};

customElements.define('grid-cell', GridCell);