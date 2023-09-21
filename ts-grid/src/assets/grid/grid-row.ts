import type { GridRowProperty } from './grid';

const gridRowTemplate = document.createElement('template');
gridRowTemplate.innerHTML = /* html */`
<style>
:host {
  display: flex;
  align-items: center;
  background: var(--grid-row-background, #fff);
  font-size: var(--grid-row-font-size, var(--grid-font-size, 14px));
  cursor: var(--grid-row-cursor);
  --grid-cell-divider-width: var(--grid-row-cell-divider-width);
  --grid-cell-divider-height: var(--grid-row-cell-divider-height);
  --grid-cell-divider-color: var(--grid-row-cell-divider-color);
  --grid-cell-padding: var(--grid-row-cell-padding);
  --grid-cell-justify-content: var(--grid-row-cell-justify-content);
  --grid-cell-font-weight: var(--grid-row-font-weight);
}
:host(:not(:last-of-type)) {
  border-bottom: var(--grid-row-border-bottom, none);
}
:host(:nth-of-type(2n)) {
  background: var(--grid-row-background-even, #f9f9f9);
}
:host(:hover) {
  background: var(--grid-row-background-hover, #f0f0f0);
}
</style>
<slot></slot>
`;

class GridRow extends HTMLElement {
  grid: GridRowProperty = {
    gridHeadCheck: () => {},
    gridRowClick: () => {}
  };

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    (this.shadowRoot as ShadowRoot).appendChild(gridRowTemplate.content.cloneNode(true));

    const rowClickEvent = new CustomEvent('grid-row-click', {
      bubbles: true,
      composed: true,
      detail: {
        cells: Array.from(this.querySelectorAll('grid-cell'))
      }
    });

    this.grid = {
      gridHeadCheck: (e: CustomEvent) => {
        e.detail.check(false);
      },
      gridRowClick: (e: MouseEvent) => {
        this.dispatchEvent(rowClickEvent);
      }
    };
  }

  connectedCallback() {
    this.addEventListener(('grid-head-check' as any), this.grid.gridHeadCheck);
    this.addEventListener('click', this.grid.gridRowClick);
  }

  disconnectedCallback() {
    this.removeEventListener(('grid-head-check' as any), this.grid.gridHeadCheck);
    this.removeEventListener('click', this.grid.gridRowClick);
  }
}

customElements.define('grid-row', GridRow);
