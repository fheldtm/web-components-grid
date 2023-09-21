import type { GridHeadProperty } from './grid';

const gridHeadTemplate = document.createElement('template');
gridHeadTemplate.innerHTML = /* html */`
<style>
:host {
  display: flex;
  align-items: center;
  overflow: hidden;
  font-size: var(--grid-head-font-size, var(--grid-font-size, 14px));
  background: var(--grid-head-background, #f9f9f9);
  border-bottom: var(--grid-head-border-bottom, 1px solid #ccc);
  cursor: var(--grid-head-cursor);
  --grid-cell-min-width: var(--grid-head-min-width, 50px);
  --grid-cell-padding: var(--grid-head-cell-padding);
  --grid-cell-border-color: var(--grid-head-cell-border-color, #eee);
  --grid-cell-justify-content: var(--grid-head-cell-justify-content, center);
  --grid-cell-divider-width: var(--grid-head-cell-divider-width);
  --grid-cell-divider-height: var(--grid-head-cell-divider-height);
  --grid-cell-divider-color: var(--grid-head-cell-divider-color);
  --grid-cell-cursor: var(--grid-column-head-cursor);
}
</style>
<slot></slot>
`;

class GridHead extends HTMLElement {
  grid: GridHeadProperty = {
    gridHeadCheck: () => {}
  };

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    (this.shadowRoot as ShadowRoot).appendChild(gridHeadTemplate.content.cloneNode(true));

    this.grid = {
      gridHeadCheck: (e: CustomEvent) => {
        e.detail.check(true);
      }
    };
  }

  connectedCallback() {
    this.addEventListener(('grid-head-check' as any), this.grid.gridHeadCheck);
  }

  disconnectedCallback() {
    this.removeEventListener(('grid-head-check' as any), this.grid.gridHeadCheck);
  }
}

customElements.define('grid-head', GridHead);
