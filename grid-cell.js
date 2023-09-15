const template = document.createElement('template');
template.innerHTML = /* html */`
<style>
:host {

}
</style>
<slot></slot>
`;

class GridCell extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
};

customElements.define('grid-cell', GridCell);