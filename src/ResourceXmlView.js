import template from "./templates/ResourceXmlView.html";

import "./components/AppSwitch"

import { FhirService } from "./services/Fhir"
import { PreferencesService } from "./services/Preferences"
import { SnackbarsService } from "./services/Snackbars"

class ResourceXmlView extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;

        this._resource = null;

        this._content = this._shadow.getElementById("content");
        this._content.onclick = this.contentClick;

        this._preferences = PreferencesService.get('xmlView', { 'sorted': false });

        this._sort = this._preferences.sorted;
        this._sortToggle = this._shadow.getElementById('sort-toggle');
        this._sortToggle.onclick = this.sortToggleClick;

        this._shadow.getElementById('download').onclick = this.downloadClick;

        this._shadow.getElementById('copy').onclick = this.copyClick;

        this._shadow.getElementById('share').onclick = this.shareClick;

    }

    connectedCallback() {
        this.sortChange();
    }

    sortToggleClick = () => {
        this._sort = !this._sort;
        PreferencesService.set('xmlView', { 'sorted': this._sort });
        this.sortChange();
    }
    sortChange = () => {
        this._sortToggle.style.color = this._sort ? 'var(--primary-color)' : 'unset';
        if (this._resource) this.source = this._resource;
    }

    contentClick = ({ target, offsetX, offsetY, ctrlKey }) => {
        if (target.classList.contains("object")) {
            const key = target.childNodes[0];
            if (key && offsetX < key.offsetLeft && offsetY < key.offsetHeight) {
                target.classList.toggle("collapsed");
                if (ctrlKey) {
                    const collapsed = target.classList.contains("collapsed");
                    Array.from(target.querySelectorAll('dt'))
                        .filter(e => e.classList.contains('object'))
                        .forEach(e => {
                            if (collapsed) {
                                e.classList.add("collapsed");
                            } else {
                                e.classList.remove("collapsed");
                            }
                        });
                }
            }
        }
    };

    clear = () => {
        const content = this._shadow.getElementById("content");
        content.scrollTo(0, 0);
        content.innerHTML = "Loading...";
        content.style.cursor = "wait";
        this._resource = null;
    }

    get resourceType() {
        return this._resource?.documentElement?.nodeName;
    }
    get resourceId() {
        return this._resource?.documentElement?.querySelector('id[value]')?.getAttribute('value');
    }
    get source() {
        return this._resource;
    }
    /**
     * @param {object} resource
     */
    set source(resource) {
        const content = this._shadow.getElementById("content");
        content.scrollTo(0, 0);
        content.innerHTML = this.parse(resource).outerHTML;
        content.style.cursor = "default";
        this._resource = resource;
    }

    parse = (obj) => {
        let dl = document.createElement('dl');
        let entries = Array.from(obj.children);
        if (this._sort) entries.sort((n1, n2) => {
            return n1.nodeName.localeCompare(n2.nodeName);
        });
        entries.forEach(e => {
            const dt = document.createElement('dt');

            let keyElm = document.createElement('span');
            keyElm.className = "key";
            keyElm.innerText = e.nodeName;
            dt.appendChild(keyElm);

            if (e.attributes.length) {
                Array.from(e.attributes).forEach(a => {
                    let atb = document.createElement('span');
                    atb.className = "attributes";
                    atb.innerText = ` ${a.nodeName}=`;
                    keyElm.appendChild(atb);
                    let val = document.createElement('span');
                    val.className = "values";
                    if ("reference" === e.nodeName && "value" === a.nodeName) {
                        let url = a.nodeValue.replace(`${FhirService.server.url}`, '')
                        if (!url.startsWith('/') && !url.startsWith('?')) url = `/${url}`;
                        let link = document.createElement('a');
                        link.setAttribute("href", `#${url}`);
                        link.appendChild(document.createTextNode(`"${a.nodeValue}"`));
                        val.appendChild(link);
                    } else {
                        val.innerText = `"${a.nodeValue}"`;
                    }
                    atb.appendChild(val);
                });
            }

            const valueElm = document.createElement('span');
            valueElm.classList.add("value");
            if (e.children.length) {
                dt.classList.add("object");
                valueElm.innerHTML = this.parse(e).outerHTML;
                dt.appendChild(valueElm);

                keyElm = document.createElement('span');
                keyElm.className = "key end";
                keyElm.innerText = `/${e.nodeName}`;
                dt.appendChild(keyElm);
            } else {
                keyElm.innerHTML += '/';
            }

            dl.appendChild(dt);
        });
        return dl;
    }

    downloadClick = () => {
        const content = new XMLSerializer().serializeToString(this._resource);
        const file = new File([content], this.resourceId, {
            'type': 'data:text/xml;charset=utf-8'
        });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.resourceType}#${file.name}.xml`;
        this._shadow.appendChild(link);
        link.click();
        this._shadow.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    copyClick = () => {
        const content = new XMLSerializer().serializeToString(this._resource);
        navigator.clipboard.writeText(content).then(function () {
            SnackbarsService.show("Copying to clipboard was successful");
        }, function (err) {
            SnackbarsService.error("Could not copy text");
        });
    };

    shareClick = () => {
        const content = new XMLSerializer().serializeToString(this._resource);
        const fileName = `${this.resourceType}.${this.resourceId}.txt`;
        const file = new File([content], fileName, { type: 'text/plain' });
        navigator.share({
            "title": fileName,
            "files": [file]
        });
    };
};
customElements.define('resource-xml-view', ResourceXmlView);
