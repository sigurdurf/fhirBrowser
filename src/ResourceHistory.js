import template from "./templates/ResourceHistory.html";

import { FhirService } from "./services/Fhir"

class ResourceHistory extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._resourceId = null;

        this._shadow.getElementById('help').onclick = this.helpClick;

        this._list = this._shadow.querySelector('app-list');
        this._list.onclick = this.appListClick;

        this._progress = this._shadow.querySelector('linear-progress');

        this._shadow.getElementById('close').onclick = this.sidePanelClose;
    }

    appListClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = event.target.closest("list-row");
        if (item) {
            if (item.hasAttribute('selected')) return;
            this._shadow.querySelector("list-row[selected]")?.removeAttribute("selected");
            item.setAttribute("selected", "")
            location.hash = `#/${this._resourceType}/${this._resourceId}/_history/${item.dataset.versionid}`;
        } else {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    helpClick = (event) => {
        window.open(`https://hl7.org/fhir/${FhirService.release}/http.html#history`, "FhirBrowserHelp");
        event.preventDefault();
        event.stopPropagation();
    }

    sidePanelClose = (event) => {
        this.hidden = true;
        event.preventDefault();
        event.stopPropagation();
    }

    load(resourceType, resourceId) {
        if (!resourceType.interaction.find(({ code }) => 'vread' == code)) return;
        if (resourceType.type == this._resourceType && resourceId == this._resourceId) return

        this._progress.hidden = false;
        this._list.clear();

        FhirService.read(resourceType.type, resourceId).then(resource => {
            this._resourceType = resourceType.type;
            this._resourceId = resource.id;
            const resourceVersionId = resource.meta?.versionId;
            FhirService.readHistory(resourceType.type, resource.id).then(response => {
                if ('Bundle' == response.resourceType && 'history' == response.type && response.total > 0) {
                    response.entry
                        .filter(element => element?.resource?.meta)
                        .sort((e1, e2) => {
                            const d1 = new Date(e1.resource.meta.lastUpdated);
                            const d2 = new Date(e2.resource.meta.lastUpdated);
                            return d2 - d1;
                        }).forEach(element => {
                            const row = document.createElement('list-row');
                            row.setAttribute("data-versionid", element.resource.meta.versionId);
                            if (resourceVersionId == element.resource.meta.versionId) {
                                row.setAttribute("selected", "");
                            }
                            const date = new Date(element.resource.meta.lastUpdated);
                            const item = document.createElement('list-item');
                            item.setAttribute("data-icon", "history");
                            item.setAttribute("data-primary", `${date.toLocaleString(undefined, {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit"
                            })}`);
                            item.setAttribute("data-secondary", `${date.toLocaleString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                timeZoneName: "short"
                            })}`);
                            row.appendChild(item);
                            this._list.appendChild(row);
                        });
                }
                this._progress.hidden = true;
            });
        });
    }
};

customElements.define('resource-history', ResourceHistory)
