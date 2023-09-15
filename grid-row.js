const template = document.createElement('template');
template.innerHTML = /* html */`
<style>
:host {
  display: block;
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
};

customElements.define('grid-row', GridRow);
