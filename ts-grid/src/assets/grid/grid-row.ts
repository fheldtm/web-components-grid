const gridRowTemplate = document.createElement('template');
gridRowTemplate.innerHTML = /* html */`
<style>
:host {
  display: flex;
  align-items: center;
  background: var(--grid-row-background, #fff);
}
:host(:nth-of-type(2n)) {
  background: var(--grid-row-background-even, #f9f9f9);
}
</style>
<slot></slot>
`;

class GridRow extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    (this.shadowRoot as ShadowRoot).appendChild(gridRowTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this.addEventListener(('grid-head-check' as any), this.#gridHeadCheck);
  }

  disconnectedCallback() {
    this.removeEventListener(('grid-head-check' as any), this.#gridHeadCheck);
  }

  #gridHeadCheck(e: CustomEvent) {
    e.detail.check(false);
  }
};

customElements.define('grid-row', GridRow);
