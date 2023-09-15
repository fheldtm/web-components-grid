const template = document.createElement('template');
template.innerHTML = /* html */`
<style>
:host {
  display: block;
}
</style>
<slot></slot>
`;

class GridHead extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.__components = {
      name: 'grid-head',
    };

    if (!this.closest('grid-container')) {
      this.shadowRoot.innerHTML = null;
    };
  }
};

customElements.define('grid-head', GridHead);
