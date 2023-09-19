const template = document.createElement('template');
template.innerHTML = /* html */`
<style>
:host {
  display: flex;
  align-items: center;
  overflow: hidden;
  border-bottom: var(--grid-head-border-bottom, 1px solid #ccc);
  --grid-cell-border-color: #eee;
  --grid-cell-justify-content: center;
}
</style>
<slot></slot>
`;

class GridHead extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    if (!this.closest('grid-container')) {
      this.shadowRoot.innerHTML = null;
    };
  }

  connectedCallback() {
    this.addEventListener('grid-head-check', this.#gridHeadCheck);
  }

  disconnectedCallback() {
    this.removeEventListener('grid-head-check', this.#gridHeadCheck);
  }

  #gridHeadCheck(e) {
    e.detail.check(true);
  }
};

customElements.define('grid-head', GridHead);
