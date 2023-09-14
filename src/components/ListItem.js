(function () {

    class ListItem extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }

        static get observedAttributes() { return ["data-primary", "data-secondary"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case "data-primary":
                    const label = document.createElement('span');
                    label.innerText = newValue;
                    this._shadow.getElementById("primary").appendChild(label);
                    break;
                case "data-secondary":
                    this._shadow.getElementById("secondary").innerText = newValue;
                    break;
                default:
                    break;
            }
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main {
                background-color: inherit;
            }
            #primary {
                display: flex;
                align-items: center;
                gap: 0.2em;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                text-transform: capitalize;
                color: var(--text-color-normal, black);
            }
            #secondary {
                font-size: smaller;
                color: var(--text-color-disabled);
                overflow-wrap: break-word;
            }
            icon {
                display: flex;
                order: -1;
            }
            app-badge {
                display: flex;
                margin-left: auto;
                order: 2;
            }

        </style>
        <main>
            <span id="primary"></span>
            <span id="secondary"></span>
        </main>
    `;

    window.customElements.define('list-item', ListItem);
})();
