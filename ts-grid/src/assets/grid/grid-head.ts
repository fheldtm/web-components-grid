const gridHeadTemplate = document.createElement('template');
gridHeadTemplate.innerHTML = /* html */`
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
    (this.shadowRoot as ShadowRoot).appendChild(gridHeadTemplate.content.cloneNode(true));

    if (!this.closest('grid-container')) {
      (this.shadowRoot as ShadowRoot).innerHTML = '';
    };
  }

  connectedCallback() {
    this.addEventListener(('grid-head-check' as any), this.#gridHeadCheck);
  }

  disconnectedCallback() {
    this.removeEventListener(('grid-head-check' as any), this.#gridHeadCheck);
  }

  #gridHeadCheck(e: CustomEvent) {
    e.detail.check(true);
  }
};

customElements.define('grid-head', GridHead);
