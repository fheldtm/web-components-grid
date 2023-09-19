const template = document.createElement('template');
template.innerHTML = /* html */`
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
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.addEventListener('grid-head-check', this.#gridHeadCheck);
  }

  disconnectedCallback() {
    this.removeEventListener('grid-head-check', this.#gridHeadCheck);
  }

  #gridHeadCheck(e) {
    e.detail.check(false);
  }
};

customElements.define('grid-row', GridRow);
