const template = document.createElement('template');
template.innerHTML = /* html */`
  <style>
  :host {
    display: block;
  }
  </style>
  <slot></slot>
`;

class GridContainer extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.__components = {
      name: 'grid-container',
    }
  }

  connectedCallback() {
    console.log('Connected!');
  }

  disconnectedCallback() {
    console.log('Disconnected!');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} changed!`);
  }

  static get observedAttributes() {
    return ['some-attribute'];
  }

  adoptedCallback() {
    console.log('Adopted!');
  }
};

customElements.define('grid-container', GridContainer);