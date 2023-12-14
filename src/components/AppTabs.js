import template from "./templates/AppTabs.html";

class AppTabs extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._slot = null;
        this._header = null;
    }

    connectedCallback() {
        this._shadow.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
        }
        this._header = this._shadow.querySelector('header');
        this._header.onclick = this.headerClick;
        this._slot = this._shadow.querySelector('slot');
        this._slot.addEventListener('slotchange', this.slotChanged);
    }

    clear = () => {
        while (this._header.firstChild) this._header.removeChild(this._header.lastChild);
    }

    slotChanged = () => {
        this.clear();
        this._slot.assignedElements()
            .forEach((slotted) => {
                slotted.hidden = true;
                const appTab = document.createElement('section');
                appTab.dataset.caption = slotted.dataset.caption;
                appTab.innerText = slotted.dataset.caption;
                this._header.appendChild(appTab);
            });
        if (!this.value) {
            this.value = this._header.querySelector(`section:nth-child(1)`)?.dataset.caption;
        }
    }

    headerClick = ({ target }) => {
        this.value = target.dataset.caption;
    }

    get value() {
        return this._header.querySelector('section[selected]')?.dataset?.caption;
    }

    set value(caption) {
        this._header.querySelector('section[selected]')?.removeAttribute('selected');
        this._slot.assignedElements().forEach((slotted, index) => {
            if (slotted.dataset.caption == caption) {
                slotted.hidden = false;
                this._header.querySelector(`section:nth-child(${index + 1})`)?.setAttribute('selected', '');
            } else {
                slotted.hidden = true;
            }
        })
        this.dispatchEvent(new CustomEvent("select", {
            bubbles: false,
            cancelable: false,
            'detail': {
                'caption': caption
            }
        }));
    }

};

customElements.define('app-tabs', AppTabs)

