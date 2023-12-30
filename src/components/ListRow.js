import template from "./templates/ListRow.html";

class ListRow extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this._main = shadow.querySelector('main');
    }

    static get observedAttributes() { return ["selected"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('selected' === name) {
            if (null === newValue) {
                this._main.removeAttribute('selected');
            } else {
                this._main.setAttribute('selected', '');
            }
        }
    }
};
customElements.define('list-row', ListRow);

