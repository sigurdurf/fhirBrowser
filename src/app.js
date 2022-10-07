import "./appBar.js";
import "./appLeftPanel.js";
import { Preferences } from "./appPreferences.js";
import "./fhirBundle.js";
import "./fhirResource.js";
import "./fhirServer.js";

/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
}

const AppTemplate = document.createElement('template');
AppTemplate.innerHTML = `
    <link rel="stylesheet" href="./material.css">
    <style>
        #app {
            display: flex;
            flex-direction: column;
            height: 100vh;
            font-family: Roboto, Arial, monospace;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            background-color: var(--background-color, rgb(255,255,255));
            color: var(--text-color-normal, rgb(0,0,0,87%));
        }
        #header {
            background-color: var(--primary-color, #000);
            color:#FFF;
        }
        h3 {
            margin:0;
        }
        #content {
            flex:1 1 auto;
            overflow: auto;
            height : 0;
        }
        #content > div {
            display:flex;
            flex-direction: row;
            height : 100%;
        }
        #leftPanel {
            border-right:1px solid var(--border-color, gray);
        }
        #bdy {
            overflow: hidden;
            flex: 1 1 auto;
            width: 0;
        }
        @media (max-width:480px){
            #leftPanel {
                height: calc(100% - 56px - 1px);
                position: absolute;
                background-color: var(--background-color, rgb(255,255,255));
            }
        }
    </style>
    <div id="app">
        <app-bar id="header" caption="">
            <app-round-button slot="left" id="navigation" title="Menu" app-icon="menu"></app-round-button>
            <h3 slot="title">FHIR Browser</h3>
            <app-round-button id="colorScheme" title="Theme" app-icon="brightness_auto"></app-round-button>
            <app-round-button id="serverSelectorToggle" title="Server" app-icon="public"></app-round-button>
        </app-bar>
        <div id="content">
            <div>
                <app-left-panel id="leftPanel"></app-left-panel>
                <div id="bdy">
                    <fhir-bundle id="bundle" hidden></fhir-bundle>
                    <fhir-resource id="resource" hidden></fhir-resource>
                </div>
            </div>
        </div>
    </div>
    <fhir-server id="serverSelector" hidden></fhir-server>
`;

customElements.define('fhir-browser', class App extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppTemplate.content.cloneNode(true));
        this._server = null;
    }

    connectedCallback() {
        const leftPanel = this._shadow.getElementById("leftPanel");
        const bundle = this._shadow.getElementById("bundle");
        const resource = this._shadow.getElementById("resource");

        this._shadow.getElementById("navigation").addEventListener('click', () => {
            leftPanel.hidden = !leftPanel.hidden;
        });

        this._shadow.getElementById("leftPanel").addEventListener('resourceTypeSelected', ({ detail }) => {
            if (window.matchMedia("(max-width: 480px)").matches) {
                leftPanel.hidden = true;
            }
            resource.hidden = true;
            bundle.hidden = false;
            bundle.load(this._server, detail.resourceType);
        });

        this._shadow.getElementById("serverSelector").addEventListener('serverchanged', ({ detail }) => {
            this._server = detail.server;
            leftPanel.server = detail.server;
            leftPanel.hidden = false;
            bundle.hidden = true;
            resource.hidden = true;
        });

        resource.addEventListener('back', () => {
            resource.hidden = true;
            bundle.hidden = false;
        });

        bundle.addEventListener('resourceSelected', ({ detail }) => {
            bundle.hidden = true;
            resource.hidden = false;
            resource.load({
                "server": this._server,
                "resourceType": detail.resourceType,
                "resourceId": detail.resourceId
            });
        });

        this.setColorScheme(Preferences.get("colorScheme", "auto"));

        this._shadow.getElementById("colorScheme").addEventListener('click', () => {
            let colorScheme = Preferences.get("colorScheme", "auto");
            switch (colorScheme) {
                case "dark":
                    colorScheme = "auto";
                    break;
                case "light":
                    colorScheme = "dark";
                    break;
                case "auto":
                default:
                    colorScheme = "light";
                    break;
            }
            Preferences.set("colorScheme", colorScheme);
            this.setColorScheme(colorScheme);
        });

        this._shadow.getElementById('serverSelectorToggle').addEventListener("click", () => {
            this._shadow.getElementById('serverSelector').hidden = false;
        });
    }

    setColorScheme(colorScheme) {
        let colorSchemeIcon = "";
        let scheme = colorScheme;
        switch (colorScheme) {
            case "dark":
                colorSchemeIcon = "brightness_4";
                break;
            case "light":
                colorSchemeIcon = "light_mode";
                break;
            case "auto":
            default:
                if ("auto" === colorScheme) {
                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        scheme = "dark";
                    } else {
                        scheme = "light";
                    }
                }
                colorSchemeIcon = "brightness_auto";
                break;
        }
        const themeButton = this._shadow.getElementById("colorScheme");
        themeButton.setAttribute("app-icon", colorSchemeIcon);
        themeButton.title = `Theme ${colorScheme}`;
        document.body.setAttribute("color-scheme", scheme);
    }

});
